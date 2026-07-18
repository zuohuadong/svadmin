import { isTerminalSessionError, SSOAuthError } from './errors';

const AUTO_REFRESH_RETRY_DELAY_MS = 30_000;
const processLockTails = new Map<string, Promise<unknown>>();

export interface SSOSession {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_at?: number;
  token_type: string;
}

export interface GetAccessTokenOptions {
  minValiditySeconds?: number;
  forceRefresh?: boolean;
}

export type AuthStateChangeEvent = 'TOKEN_REFRESHED' | 'SIGNED_OUT';
export type AuthStateChangeCallback = (
  event: AuthStateChangeEvent,
  session: SSOSession | null,
) => void | Promise<void>;

export interface RefreshLock {
  request<T>(name: string, operation: () => Promise<T>): Promise<T>;
}

const PROCESS_LOCAL_REFRESH_LOCK: RefreshLock = {
  async request<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const previous = processLockTails.get(name) ?? Promise.resolve();
    const current = previous.catch(() => undefined).then(operation);
    processLockTails.set(name, current);

    try {
      return await current;
    } finally {
      if (processLockTails.get(name) === current) processLockTails.delete(name);
    }
  },
};

interface SessionManagerOptions {
  storage: TokenStorageLike;
  storageKey: string;
  autoRefresh: boolean;
  refreshBuffer: number;
  refreshLock?: RefreshLock;
  refresh: (session: SSOSession) => Promise<SSOSession>;
  legacyStorageKey?: string;
}

export interface TokenStorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

interface SessionBroadcastMessage {
  storageKey: string;
  event: AuthStateChangeEvent;
}

interface StorageKeys {
  tokens: string;
  pkceVerifier: string;
  state: string;
}

type RefreshRaceResolution =
  | { changed: false }
  | { changed: true; session: SSOSession | null };

export interface SessionManager {
  getSession: () => SSOSession | null;
  saveSession: (session: SSOSession, event?: AuthStateChangeEvent) => void;
  clearSession: () => void;
  setLoginState: (verifier: string, state: string) => void;
  getPKCEVerifier: () => string | null;
  getLoginState: () => string | null;
  clearLoginState: () => void;
  refreshSession: () => Promise<SSOSession | null>;
  getAccessToken: (options?: GetAccessTokenOptions) => Promise<string | null>;
  onAuthStateChange: (callback: AuthStateChangeCallback) => () => void;
  destroy: () => void;
}

function createStorageKeys(storageKey: string): StorageKeys {
  return {
    tokens: `${storageKey}_tokens`,
    pkceVerifier: `${storageKey}_pkce_verifier`,
    state: `${storageKey}_state`,
  };
}

function parseSession(raw: string | null): SSOSession | null {
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as Partial<SSOSession>;
    if (
      typeof value.access_token !== 'string'
      || !value.access_token
      || typeof value.token_type !== 'string'
      || !value.token_type
      || (value.id_token !== undefined && typeof value.id_token !== 'string')
      || (value.refresh_token !== undefined && typeof value.refresh_token !== 'string')
      || (value.expires_at !== undefined
        && (typeof value.expires_at !== 'number' || !Number.isFinite(value.expires_at)))
    ) {
      return null;
    }
    return value as SSOSession;
  } catch {
    return null;
  }
}

function isTerminalRefreshError(error: unknown): boolean {
  if (isTerminalSessionError(error)) return true;
  return error instanceof SSOAuthError
    && error.statusCode >= 400
    && error.statusCode < 500
    && !error.retryable;
}

function normalizeTerminalRefreshError(error: unknown): unknown {
  if (!(error instanceof SSOAuthError) || isTerminalSessionError(error)) return error;
  return new SSOAuthError(error.message, error.statusCode, {
    code: 'session_refresh_failed',
    details: error.details,
    body: error.body,
    retryable: false,
    cause: error,
  });
}

function getBrowserRefreshLock(): RefreshLock | undefined {
  if (typeof window === 'undefined' || !window.navigator?.locks) return undefined;

  return {
    request<T>(name: string, operation: () => Promise<T>): Promise<T> {
      return window.navigator.locks.request(name, operation);
    },
  };
}

function getBroadcastChannel(name: string): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof window.BroadcastChannel !== 'function') {
    return null;
  }

  try {
    return new window.BroadcastChannel(name);
  } catch {
    return null;
  }
}

function hasStorageEvents(): boolean {
  return typeof window !== 'undefined'
    && typeof window.addEventListener === 'function'
    && typeof window.removeEventListener === 'function';
}

export function createSessionManager(options: SessionManagerOptions): SessionManager {
  const keys = createStorageKeys(options.storageKey);
  const legacyKeys = options.legacyStorageKey && options.legacyStorageKey !== options.storageKey
    ? createStorageKeys(options.legacyStorageKey)
    : null;
  const listeners = new Set<AuthStateChangeCallback>();
  const lock = options.refreshLock ?? getBrowserRefreshLock() ?? PROCESS_LOCAL_REFRESH_LOCK;
  const lockName = `${options.storageKey}:refresh`;
  const channel = getBroadcastChannel(`${options.storageKey}:auth`);

  let refreshTimer: ReturnType<typeof setTimeout> | null = null;
  let refreshingPromise: Promise<SSOSession | null> | null = null;
  let destroyed = false;
  function migrateLegacyStorage(): void {
    if (!legacyKeys || options.storage.getItem(keys.tokens)) return;

    const legacySession = options.storage.getItem(legacyKeys.tokens);
    if (legacySession && parseSession(legacySession)) {
      options.storage.setItem(keys.tokens, legacySession);
      options.storage.removeItem(legacyKeys.tokens);
    }
    const legacyVerifier = options.storage.getItem(legacyKeys.pkceVerifier);
    if (legacyVerifier && !options.storage.getItem(keys.pkceVerifier)) {
      options.storage.setItem(keys.pkceVerifier, legacyVerifier);
      options.storage.removeItem(legacyKeys.pkceVerifier);
    }
    const legacyState = options.storage.getItem(legacyKeys.state);
    if (legacyState && !options.storage.getItem(keys.state)) {
      options.storage.setItem(keys.state, legacyState);
      options.storage.removeItem(legacyKeys.state);
    }
  }

  migrateLegacyStorage();
  let lastObservedRaw = options.storage.getItem(keys.tokens);

  function getSession(): SSOSession | null {
    return parseSession(options.storage.getItem(keys.tokens));
  }

  function emit(event: AuthStateChangeEvent, session: SSOSession | null): void {
    if (destroyed) return;
    for (const listener of listeners) {
      try {
        const result = listener(event, session);
        if (result && typeof result.then === 'function') {
          void Promise.resolve(result).catch((error: unknown) => {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(`[svadmin/sso] async auth state listener failed: ${message}`);
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[svadmin/sso] auth state listener failed: ${message}`);
      }
    }
  }

  function broadcast(event: AuthStateChangeEvent): void {
    if (destroyed) return;
    try {
      channel?.postMessage({
        storageKey: options.storageKey,
        event,
      } satisfies SessionBroadcastMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[svadmin/sso] auth state broadcast failed: ${message}`);
    }
  }

  function clearRefreshTimer(): void {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
  }

  function scheduleRefresh(session: SSOSession | null): void {
    clearRefreshTimer();
    if (
      destroyed
      || !options.autoRefresh
      || !session?.refresh_token
      || session.expires_at === undefined
    ) {
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const delay = Math.max(0, session.expires_at - now - options.refreshBuffer) * 1000;
    refreshTimer = setTimeout(runScheduledRefresh, delay);
  }

  function runScheduledRefresh(): void {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = null;
    void refreshSession().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[svadmin/sso] automatic token refresh failed; session retained: ${message}`);

      if (
        !destroyed
        && error instanceof SSOAuthError
        && error.retryable
        && getSession()?.refresh_token
      ) {
        refreshTimer = setTimeout(runScheduledRefresh, AUTO_REFRESH_RETRY_DELAY_MS);
      }
    });
  }

  function saveSession(session: SSOSession, event?: AuthStateChangeEvent): void {
    const raw = JSON.stringify(session);
    try {
      // 单次 setItem 写入完整 token set，避免轮换只落盘一半。
      options.storage.setItem(keys.tokens, raw);
    } catch (error) {
      try {
        options.storage.removeItem(keys.tokens);
      } catch {
        // 尽力清理；原始持久化错误仍需返回给调用方。
      }
      lastObservedRaw = null;
      clearRefreshTimer();
      emit('SIGNED_OUT', null);
      broadcast('SIGNED_OUT');
      throw new SSOAuthError('Session could not be persisted', 0, {
        code: 'session_persistence_failed',
        retryable: false,
        cause: error,
      });
    }
    lastObservedRaw = raw;
    scheduleRefresh(session);

    if (event) {
      emit(event, session);
      broadcast(event);
    }
  }

  function clearSession(): void {
    options.storage.removeItem(keys.tokens);
    options.storage.removeItem(keys.pkceVerifier);
    options.storage.removeItem(keys.state);
    lastObservedRaw = null;
    clearRefreshTimer();
    emit('SIGNED_OUT', null);
    broadcast('SIGNED_OUT');
  }

  function resolveRefreshRace(expectedRaw: string): RefreshRaceResolution {
    const currentRaw = options.storage.getItem(keys.tokens);
    if (currentRaw === expectedRaw) return { changed: false };
    if (currentRaw === null) return { changed: true, session: null };

    const currentSession = parseSession(currentRaw);
    if (!currentSession) {
      clearSession();
      throw new SSOAuthError('Stored session became invalid during token refresh', 0, {
        code: 'session_refresh_failed',
        retryable: false,
      });
    }

    scheduleRefresh(currentSession);
    return { changed: true, session: currentSession };
  }

  function setLoginState(verifier: string, state: string): void {
    options.storage.setItem(keys.pkceVerifier, verifier);
    options.storage.setItem(keys.state, state);
  }

  function clearLoginState(): void {
    options.storage.removeItem(keys.pkceVerifier);
    options.storage.removeItem(keys.state);
  }

  async function runWithRefreshLock<T>(operation: () => Promise<T>): Promise<T> {
    let operationStarted = false;
    try {
      return await lock.request(lockName, async () => {
        operationStarted = true;
        return operation();
      });
    } catch (error) {
      if (operationStarted) throw error;
      throw new SSOAuthError('Token refresh lock could not be acquired', 0, {
        code: 'refresh_lock_failed',
        retryable: true,
        cause: error,
      });
    }
  }

  function resolveTerminalRefreshFailure(
    expectedRaw: string,
    error: unknown,
  ): SSOSession {
    const race = resolveRefreshRace(expectedRaw);
    if (race.changed && race.session) return race.session;
    if (!race.changed) clearSession();
    throw normalizeTerminalRefreshError(error);
  }

  async function executeRefresh(initialRaw: string): Promise<SSOSession | null> {
    return runWithRefreshLock(async () => {
      const lockRace = resolveRefreshRace(initialRaw);
      if (lockRace.changed) return lockRace.session;

      const latestSession = parseSession(initialRaw);
      if (!latestSession?.refresh_token) return null;

      let refreshedSession: SSOSession;
      try {
        refreshedSession = await options.refresh(latestSession);
      } catch (error) {
        if (isTerminalRefreshError(error)) {
          return resolveTerminalRefreshFailure(initialRaw, error);
        }
        throw error;
      }

      // 刷新请求在锁内也可能与登出或新登录并发，写入前必须再次比较原始会话。
      const writeRace = resolveRefreshRace(initialRaw);
      if (writeRace.changed) return writeRace.session;

      saveSession(refreshedSession, 'TOKEN_REFRESHED');
      return refreshedSession;
    });
  }

  function refreshSession(): Promise<SSOSession | null> {
    if (refreshingPromise) return refreshingPromise;

    const initialRaw = options.storage.getItem(keys.tokens);
    const initialSession = parseSession(initialRaw);
    if (!initialRaw || !initialSession?.refresh_token) {
      return Promise.resolve(null);
    }

    refreshingPromise = executeRefresh(initialRaw).finally(() => {
      refreshingPromise = null;
    });
    return refreshingPromise;
  }

  async function getAccessToken(
    accessOptions: GetAccessTokenOptions = {},
  ): Promise<string | null> {
    const session = getSession();
    if (!session) return null;

    const minValiditySeconds = Math.max(0, accessOptions.minValiditySeconds ?? 0);
    const now = Math.floor(Date.now() / 1000);
    const expiresSoon = session.expires_at !== undefined
      && session.expires_at <= now + minValiditySeconds;

    if (!accessOptions.forceRefresh && !expiresSoon) {
      return session.access_token;
    }

    if (!session.refresh_token) {
      if (expiresSoon) clearSession();
      return null;
    }

    return (await refreshSession())?.access_token ?? null;
  }

  function syncRemoteChange(event: AuthStateChangeEvent, raw: string | null): void {
    if (raw === lastObservedRaw) return;

    if (raw === null) {
      lastObservedRaw = null;
      clearRefreshTimer();
      emit('SIGNED_OUT', null);
      return;
    }

    const session = parseSession(raw);
    if (!session) return;

    lastObservedRaw = raw;
    scheduleRefresh(session);
    emit(event, session);
  }

  function onBroadcastMessage(message: MessageEvent<SessionBroadcastMessage>): void {
    const data = message.data;
    if (!data || data.storageKey !== options.storageKey) return;
    const currentRaw = options.storage.getItem(keys.tokens);
    if (data.event === 'SIGNED_OUT' && currentRaw !== null) return;
    if (data.event === 'TOKEN_REFRESHED' && currentRaw === null) return;
    syncRemoteChange(data.event, currentRaw);
  }

  function onStorage(event: StorageEvent): void {
    if (event.key !== keys.tokens) return;
    syncRemoteChange(event.newValue === null ? 'SIGNED_OUT' : 'TOKEN_REFRESHED', event.newValue);
  }

  function onVisibilityChange(): void {
    if (!options.autoRefresh || document.visibilityState !== 'visible') return;

    const session = getSession();
    if (!session?.refresh_token || session.expires_at === undefined) return;
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at <= now + options.refreshBuffer) {
      runScheduledRefresh();
    } else {
      scheduleRefresh(session);
    }
  }

  channel?.addEventListener('message', onBroadcastMessage);
  if (hasStorageEvents()) window.addEventListener('storage', onStorage);
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', onVisibilityChange);
  }
  scheduleRefresh(parseSession(lastObservedRaw));

  return {
    getSession,
    saveSession,
    clearSession,
    setLoginState,
    getPKCEVerifier: () => options.storage.getItem(keys.pkceVerifier),
    getLoginState: () => options.storage.getItem(keys.state),
    clearLoginState,
    refreshSession,
    getAccessToken,
    onAuthStateChange(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      clearRefreshTimer();
      listeners.clear();
      channel?.removeEventListener('message', onBroadcastMessage);
      channel?.close();
      if (hasStorageEvents()) window.removeEventListener('storage', onStorage);
      if (typeof document !== 'undefined' && typeof document.removeEventListener === 'function') {
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
    },
  };
}
