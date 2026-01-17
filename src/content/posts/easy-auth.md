---
title: Easy Auth
description: Easy Auth 使用指南
pubDate: 2026-01-07
---

![banner](https://blog-cdn.jaze.top/2026/01/a698368ee0accb0d8928b028990020a3.avif)

## 简介

Easy Auth 是基于Better Auth的OIDC & SSO provider，开源可自行部署，类似于Auth0、Okta等商业化身份认证服务。

- 地址：https://account.jaze.top
- 仓库：https://github.com/Jazee6/easy-auth

多个 Web 应用和 小程序 可以使用 Easy Auth 作为统一的身份认证服务，用户只需注册一个账号即可登录所有接入的应用。

## 使用

按`README`部署并设置为管理员

进入Apps页面，创建一个新的应用

![](https://blog-cdn.jaze.top/2026/01/90b3ae9b5f9ccd180674200b5abe3b41.avif)

可以填写多个回调地址，用于不同环境。请注意回调地址需要完全匹配

![](https://blog-cdn.jaze.top/2026/01/91087b97dbf162f923e7996f53290f83.avif)

在Client App配置`Better Auth`的`genericOAuth`插件

```typescript
export const authConfig: BetterAuthOptions = {
    database: drizzleAdapter(env.web_chat, {
        provider: "sqlite",
    }),
    plugins: [
        genericOAuth({
            config: [
                {
                    providerId: "easy-auth",
                    clientId: process.env.EASY_AUTH_CLIENT_ID,
                    clientSecret: process.env.EASY_AUTH_CLIENT_SECRET,
                    discoveryUrl:
                        process.env.NODE_ENV === "production"
                            ? "https://account.jaze.top/api/auth/.well-known/openid-configuration"
                            : "http://localhost:3000/api/auth/.well-known/openid-configuration",
                    pkce: true,
                    scopes: ["openid", "profile", "email", "offline_access"],
                    overrideUserInfo: true,
                },
            ],
        }),
    ],
    trustedOrigins: [process.env.SITE_URL],
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
        },
    },
    advanced: {
        cookiePrefix: "wc",
    },
};
```

支持[Stateless Mode](https://www.better-auth.com/docs/concepts/session-management#stateless-session-management)
，无需数据库存储session，你可以添加以下配置固定User ID

```typescript
export const authConfig: BetterAuthOptions = {
    // database: drizzleAdapter(env.web_chat, {
    //     provider: "sqlite",
    // }),
    databaseHooks: {
        user: {
            create: {
                // @ts-ignore
                before: (user) => {
                    return {
                        data: {
                            ...user,
                            id: user.sub,
                        },
                    };
                },
            },
        },
    },
};
```

支持[SSO](https://www.better-auth.com/docs/plugins/sso)插件，回调地址填写`/api/auth/sso/callback/easy-auth`

完整示例应用仓库：[Web Chat](https://github.com/Jazee6/web-chat)，使用Cloudflare生态构建的多功能聊天应用
