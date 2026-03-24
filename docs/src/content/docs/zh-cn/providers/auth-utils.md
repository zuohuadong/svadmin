---
title: 认证工具包
description: 密码哈希、会话管理、TOTP 多因素认证 — 零依赖
---

`@svadmin/auth-utils` 提供基于 Web Crypto API 的服务端认证工具。零依赖，支持 Bun、Node.js、Deno、Cloudflare Workers。

## 安装

```bash
bun add @svadmin/auth-utils
```

## 密码哈希

Bun 环境使用原生 Argon2id，其他运行时回退到 PBKDF2-SHA256。

```typescript
import { hashPassword, verifyPassword } from '@svadmin/auth-utils';

// 哈希密码
const hash = await hashPassword('my-password');

// 验证
const valid = await verifyPassword('my-password', hash); // true
const wrong = await verifyPassword('wrong', hash);       // false
```

### 算法选择

```typescript
await hashPassword('password', { algorithm: 'argon2id' }); // 仅 Bun
await hashPassword('password', { algorithm: 'bcrypt' });    // 仅 Bun
await hashPassword('password', { algorithm: 'pbkdf2' });    // 全平台
await hashPassword('password', { algorithm: 'auto' });      // 自动选最优（默认）
```

## 会话管理

HMAC-SHA256 签名的会话令牌 — 无状态，无需数据库。

```typescript
import { createSessionManager } from '@svadmin/auth-utils';

const sessions = createSessionManager('your-secret-key-at-least-32-chars');

// 创建会话令牌
const token = await sessions.create({ userId: '123', role: 'admin' });

// 验证并解码
const payload = await sessions.verify(token);
if (payload) {
  console.log(payload.sub);  // '123'
  console.log(payload.role); // 'admin'
  console.log(payload.exp);  // 过期时间戳
}

// 生成随机会话 ID
const id = sessions.generateId(); // 64 位十六进制字符串
```

### 配置

```typescript
const sessions = createSessionManager('secret', {
  ttl: 3600,                  // 1 小时（默认 86400 = 24 小时）
  cookieName: 'my_session',   // 默认 'svadmin_session'
});
```

### 配合 Elysia 使用

```typescript
import { Elysia } from 'elysia';
import { createSessionManager } from '@svadmin/auth-utils';

const sessions = createSessionManager(process.env.SESSION_SECRET!);

const app = new Elysia()
  .post('/login', async ({ body, set }) => {
    const user = await authenticate(body.email, body.password);
    const token = await sessions.create({ userId: user.id, role: user.role });
    set.headers['Set-Cookie'] = `session=${token}; HttpOnly; Path=/; SameSite=Lax`;
    return { success: true };
  })
  .get('/me', async ({ headers }) => {
    const token = headers.cookie?.split('session=')[1];
    const payload = token ? await sessions.verify(token) : null;
    if (!payload) throw new Error('Unauthorized');
    return { userId: payload.sub, role: payload.role };
  });
```

## TOTP 多因素认证

RFC 6238 实现 — 兼容 Google Authenticator、Authy、1Password 等。

```typescript
import { generateSecret, verifyTOTP, generateQRUri } from '@svadmin/auth-utils';

// 1. 为用户生成密钥（存入数据库）
const secret = generateSecret();

// 2. 生成 QR 码 URI（展示给用户）
const qrUri = generateQRUri(secret, 'user@example.com', 'MyApp');

// 3. 验证用户输入的验证码
const valid = await verifyTOTP('123456', secret);
```

### TOTP 配置

```typescript
await verifyTOTP('123456', secret, {
  digits: 6,          // 验证码长度（默认 6）
  period: 30,         // 时间步长秒数（默认 30）
  algorithm: 'SHA-1', // HMAC 算法（默认 'SHA-1'）
  window: 1,          // 检查 ±1 个时间步长（默认 1）
});
```

## 安全说明

- **时序安全比较** — 所有令牌和 TOTP 验证使用常量时间比较，防止时序攻击
- **OWASP 推荐迭代** — PBKDF2 使用 310,000 次 SHA-256 迭代
- **安全随机数** — 所有密钥和盐值使用 `crypto.getRandomValues()`
