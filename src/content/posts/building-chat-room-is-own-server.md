---
title: "我构建了一个每个房间都是独立服务器的聊天应用（运行在 Cloudflare 边缘网络）"
description: "如何利用 Durable Objects 把每个聊天房间当作一个隔离的有状态微服务，拥有自己的数据库、WebSocket 连接和 WebRTC 协调，全部无需传统后端。"
pubDate: 2026-06-06
author: "Jazee"
tags: ["Cloudflare", "WebSocket", "WebRTC", "React"]
---

大多数实时聊天应用都采用相同的架构：一组无状态 API 服务器、一层用于 WebSocket 扇出的 Redis pub/sub，以及位于连接池之后的 PostgreSQL 数据库。这套方案能用，但对于"用户发消息、其他人看到消息"这件本质上的小事来说，基础设施未免太重了。

我想试试能不能做出不一样的东西。结果就是 [web-chat](https://chat.jaze.top)，一个实时文字和语音通话应用，其中每一个聊天房间都作为独立隔离的服务器运行，拥有自己的数据库，全部跑在 Cloudflare 的边缘网络上。没有虚拟机、容器，也没有 Redis。它基于 Durable Objects、D1、R2 和 RealtimeKit 构建。

下面是它的工作原理以及我在构建过程中学到的东西。

## 无状态服务器处理有状态房间的问题

聊天房间天然是有状态的。在任何时刻，你都需要知道谁在线、他们发了什么消息、是否在语音通话中。传统做法把这种状态分散到多个服务中：Redis 维护在线状态，数据库存储消息，可能还有另一个服务处理 WebRTC 信令。

这些服务各自都会引入延迟。用户 A 的消息要先经过 API 服务器、进入 Redis，再通过用户 B 的 WebSocket 连接推送出去。如果 API 服务器崩溃，你就会丢失连接状态。如果 Redis 抖动，消息就会丢失。

如果房间本身就能持有自己的状态呢？

## 每个房间都是一个 Durable Object

Cloudflare Durable Objects 解决了这个问题——它提供了一种有状态、单线程的计算单元，可以在本地持久化数据。在我的实现中，每个聊天房间映射到唯一的 Durable Object 实例。创建房间时，系统会生成一个唯一的 DO ID：

```typescript
const roomId = c.env.ROOM.newUniqueId();
```

当用户打开聊天页面时，Worker 上的 Hono 路由会在 D1（全局关系数据库）中查找房间，找到对应的 DO stub，然后把 WebSocket 升级请求直接代理给它：

```typescript
app.get('/room/:id/ws', authMiddleware, async (c) => {
  const roomId = c.req.param('id');
  const stub = c.env.ROOM.get(roomIdFromName);
  return stub.fetch(c.req.raw.url, c.req.raw);
});
```

在 Durable Object 内部，所有 WebSocket 连接都保存在一个 `Map<WebSocket, WsSession>` 里。当用户发送消息时，DO 会把它广播给每一个已连接的客户端。这里没有 pub/sub，也没有消息队列，只是对 Map 做一次循环遍历。

```typescript
for (const [ws, session] of this.sessions) {
  ws.send(JSON.stringify({ type: 'message', data: message }));
}
```

这比传统架构简单得多。房间自己维护在线状态、消息路由和持久化。如果 DO 从内存中被驱逐（Cloudflare 会休眠空闲的对象），它会在下次唤醒时通过反序列化的 WebSocket attachment 重新恢复 session map：

```typescript
constructor(ctx, env) {
  this.sessions = new Map();
  // WebSockets 在休眠后依然存活。重新恢复 sessions。
  for (const ws of this.ctx.getWebSockets()) {
    const session = ws.deserializeAttachment();
    this.sessions.set(ws, session);
  }
}
```

## 两套数据库，一个 ORM

最有意思的架构决策在于如何存储消息。我本可以把所有东西都塞进 D1（Cloudflare 边缘分布的 SQLite），但那样每条消息的写入都要走网络到 D1，给热路径增加延迟。

所以我把存储拆成了两层：

**D1** 存储关系型元数据：用户、房间、收藏、认证会话。这些是需要跨域查询的内容（比如"用户加入的所有房间"或"收藏的房间"）。

**Durable SQLite** 存储每个房间的消息。每个 Room DO 都拥有自己内嵌的 SQLite 数据库，就位于处理该房间 WebSocket 连接的计算资源旁边。

两者都用 Drizzle ORM，但配置独立：

```typescript
// D1 配置：用户、房间、认证
export default defineConfig({
  dialect: 'sqlite',
  driver: d1Http(migrationsFolder),
  schema: './server/src/lib/schema.ts',
  out: './server/drizzle/d1',
});

// Durable SQLite 配置：每个房间的消息
export default defineConfig({
  dialect: 'sqlite',
  driver: durableSqlite(migrationsFolder),
  schema: './server/src/lib/do-schema.ts',
  out: './server/drizzle/room',
});
```

权衡很明确：我没法轻松跑跨房间查询，比如"用户 X 在所有房间里的全部消息"。但对于聊天应用来说，你几乎从不需要这种查询。你真正需要的是快速、可靠的按房间消息历史，配合基于游标的分页：

```typescript
const messages = await db
  .select()
  .from(messagesTable)
  .where(lt(messagesTable.createdAt, before))
  .orderBy(desc(messagesTable.createdAt))
  .limit(25);
```

每页 25 条消息，用户上滑时加载下一页。通过 `IntersectionObserver` 监听哨兵元素触发下一页加载，并保留滚动位置，确保阅读流不会跳动。

这种双数据库模式我会再用到任何数据天然按实体分区的应用中。房间消息归房间所有，用户元数据归共享存储。

## 无需信令服务器的语音通话

给聊天应用加语音通话通常意味着要搭建一个 WebRTC 信令服务器。但当每个房间本身就是一个有状态服务器、与每个参与者保持持久 WebSocket 连接时，你已经有信令通道了。

我用 Cloudflare RealtimeKit 作为 SFU（选择性转发单元），并用 [partytracks](https://github.com/nickstenning/partytracks) 把 SFU 协议封装成基于 RxJS 的 API。Peer 之间的协调全部通过现有的聊天 WebSocket 完成。

流程是这样的：

1. 用户点击"加入通话" -> 客户端通过聊天 WebSocket 发送 `realtimeJoin`
2. Durable Object 向所有已连接客户端广播 `realtimeStatus`
3. 每个客户端的 `PartyTracks` 实例把它的音频轨道推送到 SFU
4. 当轨道就绪时，客户端发送 `realtimeUpdate`，附带 session ID 和轨道名
5. 其他客户端收到更新后拉取对应的音频轨道

```typescript
// 客户端在音频轨道就绪时发送
ws.send(JSON.stringify({
  type: 'realtimeUpdate',
  sessionId: session.id,
  trackName: track.name,
}));
```

没有单独的信令服务器，也没有 SIP，聊天房间的 WebSocket 连接同时充当了 WebRTC 信令通道。Durable Object 协调整个过程，因为它本来就知道谁在线。

### 真正有效的降噪

浏览器里原始的麦克风音频听起来很糟糕。键盘敲击声、风扇噪声、背景人声。我集成了 Jitsi 基于 RNNoise 的 AudioWorklet 处理器，在音频流送到 SFU 之前先做净化：

```typescript
const noiseSuppressedStream = await applyNoiseSuppression(mediaStream);
const audioTrack = noiseSuppressedStream.getAudioTracks()[0];
await partyTracks.push(of(audioTrack));
```

Safari 不支持基于 AudioWorklet 的变换，所以会回退到浏览器内建的 `noiseSuppression`、`echoCancellation` 和 `autoGainControl` 约束。效果不如 RNNoise，但聊胜于无。

## 内容寻址的图片上传

聊天应用里的图片上传通常遵循这样的模式：上传到服务器、服务器存到对象存储、服务器返回 URL。这是三次跳转，服务器会沦为处理大图片的瓶颈。

我构建了一条内容寻址的流水线，在存储层对图片做去重：

1. 客户端用 Canvas API 把图片转成 WebP（更小的文件、统一的格式）
2. 客户端用 `crypto.subtle.digest` 计算文件的 SHA-256 哈希
3. 客户端把哈希列表发给服务器，请求预签名上传 URL
4. 服务器按哈希键在 R2 中检查是否已有对象。如果完全相同的图片已存在，就返回 `url: null`，无需上传
5. 如果是新图，服务器用 `aws4fetch`（AWS Signature V4 签名）生成预签名 PUT URL
6. 客户端直接上传到 R2

```typescript
// 服务器在签发预签名 URL 前检查重复
const existing = await env.R2.head(hash);
if (existing) {
  return { hash, url: null }; // 已存储
}
const presignedUrl = await signRequest({
  method: 'PUT',
  bucket: env.R2_BUCKET,
  key: hash,
});
```

图片通过 `/room/images/:key` 提供，附带 `public, max-age=31536000, immutable` 缓存头。因为键是内容哈希，同一张图片始终映射到同一个 URL，CDN 可以永久缓存。

消息本身只存储 SHA-256 哈希的 JSON 数组。客户端在渲染时把它们解析成图片 URL。这意味着即使消息包含多张图片，消息体依然很小。

## 用 Idle Detection API 实现用户在线状态

绿/灰在线指示器是聊天应用的标配，但大多数都不准。多数实现只检查"WebSocket 是否连接"，这意味着即使你离开电脑，也会显示在线。

我用 [Idle Detection API](https://developer.mozilla.org/en-US/docs/Web/API/Idle_Detection_API)（目前仅 Chrome 和 Edge 支持）来检测真实的用户活动：

```typescript
const controller = new IdleDetector();
controller.addEventListener('change', () => {
  ws.send(JSON.stringify({
    type: 'status',
    userIdleStatus: controller.userState,    // 'active' 或 'idle'
    screenIdleStatus: controller.screenState, // 'locked' 或 'unlocked'
  }));
});
await controller.start({ threshold: 60000 }); // 60 秒
```

头像徽章在活跃时显示绿色、空闲时黄色、锁屏时灰色。这是个细节，但它让在线状态指示器真正有用，而不只是装饰。

## 用 Document Picture-in-Picture 实现多任务

[Document Picture-in-Picture API](https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API) 可以把整个网页弹出到一个浮动窗口里，而不只是视频元素。我用它让用户在其他标签页工作时，依然能看到聊天房间：

```typescript
const pipWindow = await documentPictureInPicture.requestWindow({
  width: 400,
  height: 600,
});
// 把样式复制到 PiP 窗口
for (const sheet of document.styleSheets) {
  const style = document.createElement('style');
  style.textContent = Array.from(sheet.cssRules)
    .map(rule => rule.cssText)
    .join('');
  pipWindow.document.head.appendChild(style);
}
// 把 React 组件渲染到 PiP 窗口
const root = createRoot(pipWindow.document.body);
root.render(<Room {...props} />);
```

这仍是实验特性（仅 Chrome 支持），但对聊天应用来说是杀手级功能。你能得到一个功能完整的浮动聊天窗口，而不是缩水版的小视图。

## 前端技术栈

客户端是 React 19，通过 `babel-plugin-react-compiler` 启用了 React Compiler。这带来了自动 memoization，无需手动用 `useMemo` 和 `useCallback` 包裹组件。开发时少一件事要操心，性能也始终不错。

状态管理上，服务端状态用 TanStack Query v5（用无限查询做分页房间列表），实时连接用 `ahooks/useWebSocket` 并自动重连。`ky` HTTP 客户端透明地处理认证跳转。

样式是 Tailwind CSS 4 配合 Shadcn 风格的组件原语。整个项目用 Vite 8 构建，作为静态站点部署。

## 如果重来我会怎么做

**跨房间搜索很难。** 因为消息分散在每个房间的 Durable SQLite 实例里，没有单一的数据库可以做全文搜索。如果需要全局搜索，要么逐个房间查询（代价高），要么维护一个独立的搜索索引（复杂）。目前按房间历史搜索已经够用。

**WebSocket 状态恢复很微妙。** 当 Durable Object 休眠又唤醒时，WebSocket 连接会存活，但你需要小心地从 `deserializeAttachment()` 恢复 session 状态。我在这方面调试的时间比预期长得多。文档是有的，但边界情况文档不足。

**partytracks 的补丁。** 我不得不给 `partytracks@0.0.55` 打补丁，给它的内部 fetch 调用加上 `credentials: 'include'`。这个库默认不发送 cookie，当通过自己的服务器代理时会破坏认证。Bun 的 patch 系统让这件事很简单，但这是个依赖上的小瑕疵。

**浏览器兼容性是真实的约束。** Idle Detection、Document PiP 和 AudioWorklet 降噪都是 Chrome 独占。Safari 和 Firefox 用户会得到降级的体验。这就是活在最前沿的代价。

## 技术栈一览

| 层级 | 技术 |
|-------|-----------|
| 计算 | Cloudflare Workers + Hono |
| 房间状态 | Durable Objects + Durable SQLite |
| 全局数据 | Cloudflare D1 |
| 文件存储 | Cloudflare R2 |
| 语音 | Cloudflare RealtimeKit (SFU) |
| 认证 | better-auth + OAuth PKCE |
| 前端 | React 19、React Compiler、Vite 8、Tailwind CSS 4 |
| ORM | Drizzle（同时用于 D1 和 Durable SQLite） |

所有东西都跑在 Cloudflare 的边缘网络上，并启用了 smart placement，所以 Worker 会自动与它通信的 D1 数据库和 Durable Objects 协同部署在同一区域。

## 试用或自建

源码位于 [github.com/Jazee6/web-chat](https://github.com/Jazee6/web-chat)，在线演示在 [chat.jaze.top](https://chat.jaze.top)。

如果你正在构建实时功能、考虑 Cloudflare 平台，关键洞察是：Durable Objects 不只是带 WebSocket 的键值存储。它们是真正的有状态服务器，能持有复杂数据结构、运行内嵌数据库、协调多方实时会话。从"无状态 API + 外部状态"到"房间即服务器"的心智模型转变需要一些适应，但一旦想通，所有东西都会简化。
