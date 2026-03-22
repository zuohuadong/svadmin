---
title: Live Provider
description: Real-time data subscriptions via WebSocket and SSE
---

LiveProvider enables real-time data updates through WebSocket or Server-Sent Events.

## Interface

```typescript
interface LiveProvider {
  subscribe(params: { resource: string; callback: (event: LiveEvent) => void }): () => void;
  unsubscribe?(params: { resource: string }): void;
  publish?(event: LiveEvent): void;
}

interface LiveEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  resource: string;
  payload: Record<string, unknown>;
}
```

## Built-in Providers

### WebSocket

```typescript
import { createWebSocketLiveProvider } from '@svadmin/core';
const liveProvider = createWebSocketLiveProvider({ url: 'ws://localhost:3001' });
```

### Server-Sent Events (SSE)

```typescript
import { createSSELiveProvider } from '@svadmin/core';
const liveProvider = createSSELiveProvider({ url: 'http://localhost:3001/events' });
```

## Hooks

### `useLive` — Auto-invalidate queries

```typescript
useLive(liveProvider, 'posts', {
  liveMode: 'auto',           // 'auto' | 'manual' | 'off'
  onLiveEvent: (event) => {}, // optional callback
});
```

### `useSubscription` — Manual channel subscription

```typescript
useSubscription({
  resource: 'notifications',
  liveProvider,
  onLiveEvent: (event) => console.log(event),
});
```

### `usePublish` — Publish custom events

```typescript
const publish = usePublish(liveProvider);
publish({ type: 'UPDATE', resource: 'posts', payload: { id: 1 } });
```

## Live Modes

| Mode | Behavior |
|------|----------|
| `auto` | Automatically invalidates queries on events (default) |
| `manual` | Calls `onLiveEvent` but doesn't invalidate — you decide |
| `off` | No subscription |
