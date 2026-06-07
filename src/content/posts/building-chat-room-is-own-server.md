---
title: "I built a chat app where every room is its own server (on Cloudflare's edge)"
description: "How Durable Objects let you treat each chat room as an isolated stateful microservice with its own database, WebSocket connections, and WebRTC coordination, all without a traditional backend."
pubDate: 2026-06-06
author: "Jazee"
tags: ["Cloudflare", "WebSocket", "WebRTC", "React"]
---

Most real-time chat apps share the same architecture: a fleet of stateless API servers, a Redis pub/sub layer for WebSocket fanout, and a PostgreSQL database sitting behind a connection pooler. It works, but it's a lot of infrastructure for what is essentially "user sends message, other users see message."

I wanted to see if I could build something different. The result is [web-chat](https://chat.jaze.top), a real-time text and voice calling application where every single chat room runs as its own isolated server, with its own database, on Cloudflare's edge network. No VMs, containers, or Redis involved. It runs on Durable Objects, D1, R2, and RealtimeKit.

Here's how it works and what I learned building it.

## The problem with stateless servers for stateful rooms

A chat room is inherently stateful. At any given moment, you need to know who's connected, what messages they've sent, and whether they're in a voice call. The traditional approach spreads this state across multiple services: Redis for presence, a database for messages, and maybe another service for WebRTC signaling.

Each of these services introduces latency. A message from User A bounces through the API server, into Redis, back out to the WebSocket connection of User B. If your API server crashes, you lose track of who's connected. If Redis blips, messages get dropped.

What if the room itself could hold its own state?

## Each room as a Durable Object

Cloudflare Durable Objects solve this by giving you a stateful, single-threaded compute unit that can persist data locally. In my implementation, each chat room maps to exactly one Durable Object instance. When you create a room, the system generates a unique DO ID:

```typescript
const roomId = c.env.ROOM.newUniqueId();
```

When a user opens the chat page, the Hono router on the Worker looks up the room in D1 (the global relational database), finds the corresponding DO stub, and proxies the WebSocket upgrade directly to it:

```typescript
app.get('/room/:id/ws', authMiddleware, async (c) => {
  const roomId = c.req.param('id');
  const stub = c.env.ROOM.get(roomIdFromName);
  return stub.fetch(c.req.raw.url, c.req.raw);
});
```

Inside the Durable Object, all WebSocket connections live in a `Map<WebSocket, WsSession>`. When a user sends a message, the DO broadcasts it to every connected client. There's no pub/sub or message queue involved, just a loop over a Map.

```typescript
for (const [ws, session] of this.sessions) {
  ws.send(JSON.stringify({ type: 'message', data: message }));
}
```

This is dramatically simpler than the traditional architecture. The room handles its own presence, its own message routing, and its own persistence. If the DO gets evicted from memory (Cloudflare can hibernate idle objects), it rehydrates its session map from serialized WebSocket attachments on the next wake-up:

```typescript
constructor(ctx, env) {
  this.sessions = new Map();
  // WebSockets survive hibernation. Rehydrate sessions.
  for (const ws of this.ctx.getWebSockets()) {
    const session = ws.deserializeAttachment();
    this.sessions.set(ws, session);
  }
}
```

## Two databases, one ORM

The most interesting architectural decision was how to store messages. I could have put everything in D1 (Cloudflare's edge-distributed SQLite). But that would mean every message write goes over the network to D1, adding latency to the hot path.

Instead, I split the storage into two layers:

**D1** stores relational metadata: users, rooms, favorites, auth sessions. Things you need to query across (like "all rooms a user has joined" or "favorite rooms").

**Durable SQLite** stores per-room messages. Each Room DO gets its own embedded SQLite database that lives right next to the compute handling that room's WebSocket connections.

Both use Drizzle ORM, but with separate configurations:

```typescript
// D1 config: users, rooms, auth
export default defineConfig({
  dialect: 'sqlite',
  driver: d1Http(migrationsFolder),
  schema: './server/src/lib/schema.ts',
  out: './server/drizzle/d1',
});

// Durable SQLite config: messages per room
export default defineConfig({
  dialect: 'sqlite',
  driver: durableSqlite(migrationsFolder),
  schema: './server/src/lib/do-schema.ts',
  out: './server/drizzle/room',
});
```

The trade-off is clear: I can't easily run cross-room queries like "all messages by user X across all rooms." But for a chat app, you almost never need that. What you do need is fast, reliable per-room message history with cursor-based pagination:

```typescript
const messages = await db
  .select()
  .from(messagesTable)
  .where(lt(messagesTable.createdAt, before))
  .orderBy(desc(messagesTable.createdAt))
  .limit(25);
```

Twenty-five messages per page, loaded when the user scrolls up. The `IntersectionObserver` on a sentinel element triggers the next page load, and scroll position is preserved so the reading flow doesn't jump.

This dual-database pattern is something I'd use again for any application where data naturally partitions by entity. Room messages belong with the room. User metadata belongs in a shared store.

## Voice calls without a signaling server

Adding voice calling to a chat app usually means standing up a WebRTC signaling server. But when each room is already a stateful server with persistent WebSocket connections to every participant, you already have a signaling channel.

I used Cloudflare RealtimeKit as the SFU (Selective Forwarding Unit) and [partytracks](https://github.com/nickstenning/partytracks) to wrap the SFU protocol with an RxJS-based API. The coordination between peers happens entirely through the existing chat WebSocket.

The flow works like this:

1. User clicks "join call" → client sends `realtimeJoin` over the chat WebSocket
2. The Durable Object broadcasts `realtimeStatus` to all connected clients
3. Each client's `PartyTracks` instance pushes its audio track to the SFU
4. When a track is ready, the client sends `realtimeUpdate` with the session ID and track name
5. Other clients receive the update and pull the corresponding audio track

```typescript
// Client sends when their audio track is ready
ws.send(JSON.stringify({
  type: 'realtimeUpdate',
  sessionId: session.id,
  trackName: track.name,
}));
```

Without a separate signaling server or SIP, the chat room's WebSocket connection doubles as the WebRTC signaling channel. The Durable Object coordinates the whole thing because it already knows who's connected.

### Noise suppression that actually works

Raw microphone audio in a browser sounds terrible. Keyboard typing, fan noise, background chatter. I integrated Jitsi's RNNoise-based AudioWorklet processor to clean up the audio stream before it hits the SFU:

```typescript
const noiseSuppressedStream = await applyNoiseSuppression(mediaStream);
const audioTrack = noiseSuppressedStream.getAudioTracks()[0];
await partyTracks.push(of(audioTrack));
```

Safari doesn't support AudioWorklet-based transforms, so it falls back to the browser's built-in `noiseSuppression`, `echoCancellation`, and `autoGainControl` constraints. Not as effective as RNNoise, but better than nothing.

## Content-addressable image uploads

Image uploads in chat apps usually follow this pattern: upload to server, server stores in object storage, server returns URL. That's three hops and the server becomes a bottleneck for large images.

I built a content-addressable pipeline that deduplicates images at the storage level:

1. Client converts the image to WebP using the Canvas API (smaller files, consistent format)
2. Client computes SHA-256 hash of the file using `crypto.subtle.digest`
3. Client sends the hash list to the server requesting presigned upload URLs
4. Server checks R2 for existing objects by hash key. If the exact same image already exists, it returns `url: null`. No upload needed.
5. If it's new, server generates a presigned PUT URL using `aws4fetch` (AWS Signature V4 signing)
6. Client uploads directly to R2

```typescript
// Server checks for duplicates before issuing presigned URLs
const existing = await env.R2.head(hash);
if (existing) {
  return { hash, url: null }; // already stored
}
const presignedUrl = await signRequest({
  method: 'PUT',
  bucket: env.R2_BUCKET,
  key: hash,
});
```

Images are served via `/room/images/:key` with `public, max-age=31536000, immutable` caching headers. Since the key is a content hash, the same image always maps to the same URL, and the CDN caches it forever.

The message itself just stores the JSON array of SHA-256 hashes. The client resolves them to image URLs at render time. This means messages are small even when they contain multiple images.

## User presence with the Idle Detection API

Green/gray online indicators are table stakes for chat apps, but they're usually wrong. Most implementations just check "is the WebSocket connected?" which means you show as online even if you've walked away from your computer.

I used the [Idle Detection API](https://developer.mozilla.org/en-US/docs/Web/API/Idle_Detection_API) (Chrome and Edge only, for now) to detect actual user activity:

```typescript
const controller = new IdleDetector();
controller.addEventListener('change', () => {
  ws.send(JSON.stringify({
    type: 'status',
    userIdleStatus: controller.userState,    // 'active' or 'idle'
    screenIdleStatus: controller.screenState, // 'locked' or 'unlocked'
  }));
});
await controller.start({ threshold: 60000 }); // 60 seconds
```

The avatar badge shows green for active, yellow for idle, and gray for locked screen. It's a small detail, but it makes the presence indicators actually useful instead of just decorative.

## Document Picture-in-Picture for multitasking

The [Document Picture-in-Picture API](https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API) lets you pop out an entire web page into a floating window, not just a video element. I used it to let users keep the chat room visible while working in other tabs:

```typescript
const pipWindow = await documentPictureInPicture.requestWindow({
  width: 400,
  height: 600,
});
// Copy styles into the PiP window
for (const sheet of document.styleSheets) {
  const style = document.createElement('style');
  style.textContent = Array.from(sheet.cssRules)
    .map(rule => rule.cssText)
    .join('');
  pipWindow.document.head.appendChild(style);
}
// Render React components into the PiP window
const root = createRoot(pipWindow.document.body);
root.render(<Room {...props} />);
```

This is still experimental (Chrome-only), but it's a killer feature for a chat app. You get a full-featured floating chat window, not a stripped-down mini view.

## The frontend stack

The client is React 19 with the React Compiler enabled via `babel-plugin-react-compiler`. This gives automatic memoization without manually wrapping components in `useMemo` and `useCallback`. It's one less thing to think about during development, and the performance is consistently good.

State management uses TanStack Query v5 for server state (with infinite queries for paginated room lists) and `ahooks/useWebSocket` for the real-time connection with automatic reconnection. The `ky` HTTP client handles auth redirects transparently.

Styling is Tailwind CSS 4 with Shadcn-style component primitives. The whole thing builds with Vite 8 and deploys as a static site.

## What I'd do differently

**Cross-room search is hard.** Because messages live in per-room Durable SQLite instances, there's no single database to run a full-text search across. If I needed global search, I'd have to either query each room individually (expensive) or maintain a separate search index (complex). For now, per-room history search is sufficient.

**WebSocket state recovery is subtle.** When a Durable Object hibernates and wakes up, the WebSocket connections survive but you need to carefully rehydrate your session state from `deserializeAttachment()`. I spent more time debugging this than I expected. The documentation exists but the edge cases are under-documented.

**The partytracks patch.** I had to patch `partytracks@0.0.55` to add `credentials: 'include'` to its internal fetch calls. The library doesn't send cookies by default, which breaks authentication when proxying through your own server. Bun's patch system made this easy, but it's a dependency wart.

**Browser compatibility is a real constraint.** Idle Detection, Document PiP, and AudioWorklet noise suppression are all Chrome-only. Safari and Firefox users get a degraded experience. This is the cost of living on the bleeding edge.

## The stack, summarized

| Layer | Technology |
|-------|-----------|
| Compute | Cloudflare Workers + Hono |
| Room state | Durable Objects with Durable SQLite |
| Global data | Cloudflare D1 |
| File storage | Cloudflare R2 |
| Voice | Cloudflare RealtimeKit (SFU) |
| Auth | better-auth with OAuth PKCE |
| Frontend | React 19, React Compiler, Vite 8, Tailwind CSS 4 |
| ORM | Drizzle (for both D1 and Durable SQLite) |

Everything runs on Cloudflare's edge network with smart placement enabled, so the Worker is automatically co-located near the D1 database and Durable Objects it talks to.

## Try it or build your own

The source code is at [github.com/Jazee6/web-chat](https://github.com/Jazee6/web-chat). The live demo runs at [chat.jaze.top](https://chat.jaze.top).

If you're building real-time features and considering Cloudflare's platform, the key insight is this: Durable Objects aren't just key-value stores with a WebSocket. They're genuinely stateful servers that can hold complex data structures, run embedded databases, and coordinate multi-party real-time sessions. The mental model shift from "stateless API + external state" to "the room is the server" takes some getting used to, but once it clicks, it simplifies everything.