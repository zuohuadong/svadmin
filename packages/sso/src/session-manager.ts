import { isTerminalSessionError, SSOAuthError } from './errors';

const AUTO_REFRESH_RETRY_DELAY_MS = 30_000;

const processRefreshLockTails = new WeakMap<
  TokenStorageLike,
  Map<string, Promise<void>>
>();

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
  /** Serialize every context that shares the same token storage. */
  request<T>(name: string, operation: () => Promise<T>): Promise<T>;
}

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
  getAuthGeneration: () => number;
  saveSession: (session: SSOSession, event?: AuthStateChangeEvent) => void;
  clearSession: () => void;
  beginAuthAttempt: () => void;
  beginSignOut: () => void;
  setLoginState: (verifier: string, state: string) => void;
  getPKCEVerifier: () => string | null;
  getLoginState: () => string | null;
  clearLoginState: (expectedState?: string) => void;
  runAuthMutation: <T>(operation: () => Promise<T>) => Promise<T>;
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

function clearStorageValue(storage: TokenStorageLike, key: string): unknown | null {
  try {
    storage.removeItem(key);
    return null;
  } catch (removeError) {
    try {
      storage.setItem(key, '');
      return null;
    } catch {
      return removeError;
    }
  }
}

function createProcessRefreshLock(storage: TokenStorageLike): RefreshLock {
  return {
    async request<T>(name: string, operation: () => Promise<T>): Promise<T> {
      const tails = processRefreshLockTails.get(storage) ?? new Map<string, Promise<void>>();
      processRefreshLockTails.set(storage, tails);
      const previous = tails.get(name) ?? Promise.resolve();
      let release!: () => void;
      const current = new Promise<void>((resolve) => { release = resolve; });
      tails.set(name, current);
      await previous.catch(() => undefined);
      try {
        return await operation();
      } finally {
        release();
        if (tails.get(name) === current) tails.delete(name);
      }
    },
  };
}

function createUnavailableBrowserRefreshLock(): RefreshLock {
  return {
    request<T>(): Promise<T> {
      return Promise.reject(new Error(
        'This browser does not provide Web Locks; configure an atomic cross-context refreshLock',
      ));
    },
  };
}

function isBrowserRuntime(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

export function createSessionManager(options: SessionManagerOptions): SessionManager {
  const keys = createStorageKeys(options.storageKey);
  const legacyKeys = options.legacyStorageKey && options.legacyStorageKey !== options.storageKey
    ? createStorageKeys(options.legacyStorageKey)
    : null;
  const refreshLockName = `${options.storageKey}:refresh`;
  const authLockName = `${options.storageKey}:auth`;
  const lock = options.refreshLock
    ?? getBrowserRefreshLock()
    ?? (isBrowserRuntime()
      ? createUnavailableBrowserRefreshLock()
      : createProcessRefreshLock(options.storage));
  const listeners = new Set<AuthStateChangeCallback>();
  const channel = getBroadcastChannel(`${options.storageKey}:auth`);

  let refreshTimer: ReturnType<typeof setTimeout> | null = null;
  let refreshingPromise: Promise<SSOSession | null> | null = null;
  let destroyed = false;
  let locallySignedOut = false;
  let authGeneration = 0;
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
    if (locallySignedOut) return null;
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
      clearStorageValue(options.storage, keys.tokens);
      authGeneration += 1;
      locallySignedOut = true;
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
    if (event !== 'TOKEN_REFRESHED') authGeneration += 1;
    locallySignedOut = false;
    lastObservedRaw = raw;
    scheduleRefresh(session);

    if (event) {
      emit(event, session);
      broadcast(event);
    }
  }

  function clearSession(): void {
    const failures = [keys.tokens, keys.pkceVerifier, keys.state]
      .map((key) => clearStorageValue(options.storage, key));
    const persistenceFailure = failures.find((error) => error !== null);
    authGeneration += 1;
    locallySignedOut = true;
    lastObservedRaw = null;
    clearRefreshTimer();
    emit('SIGNED_OUT', null);
    broadcast('SIGNED_OUT');
    if (persistenceFailure !== undefined && persistenceFailure !== null) {
      throw new SSOAuthError('Session could not be cleared', 0, {
        code: 'session_persistence_failed',
        retryable: false,
        cause: persistenceFailure,
      });
    }
  }

  function resolveRefreshRace(expectedRaw: string): RefreshRaceResolution {
    const currentRaw = locallySignedOut ? null : options.storage.getItem(keys.tokens);
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
    authGeneration += 1;
  }

  function beginAuthAttempt(): void {
    authGeneration += 1;
  }

  function beginSignOut(): void {
    authGeneration += 1;
    locallySignedOut = true;
    clearRefreshTimer();
  }

  function clearLoginState(expectedState?: string): void {
    if (expectedState !== undefined && options.storage.getItem(keys.state) !== expectedState) {
      return;
    }
    options.storage.removeItem(keys.pkceVerifier);
    options.storage.removeItem(keys.state);
  }

  async function runWithLock<T>(
    name: string,
    operation: () => Promise<T>,
    createLockError: (cause: unknown) => SSOAuthError,
  ): Promise<T> {
    let operationStarted = false;
    try {
      return await lock.request(name, async () => {
        operationStarted = true;
        return operation();
      });
    } catch (error) {
      if (operationStarted) throw error;
      throw createLockError(error);
    }
  }

  function runWithRefreshLock<T>(operation: () => Promise<T>): Promise<T> {
    return runWithLock(refreshLockName, operation, (cause) => new SSOAuthError(
      'Token refresh lock could not be acquired',
      0,
      {
        code: 'refresh_lock_failed',
        retryable: true,
        cause,
      },
    ));
  }

  function runAuthMutation<T>(operation: () => Promise<T>): Promise<T> {
    return runWithLock(authLockName, operation, (cause) => new SSOAuthError(
      'Authentication coordination lock could not be acquired',
      0,
      {
        code: 'auth_lock_failed',
        retryable: false,
        cause,
      },
    ));
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

    const initialRaw = locallySignedOut ? null : options.storage.getItem(keys.tokens);
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

  function syncRemoteChange(
    event: AuthStateChangeEvent,
    raw: string | null,
    force = false,
  ): void {
    if (!force && raw === lastObservedRaw) return;

    if (raw === null) {
      authGeneration += 1;
      locallySignedOut = true;
      lastObservedRaw = null;
      clearRefreshTimer();
      emit('SIGNED_OUT', null);
      return;
    }

    const session = parseSession(raw);
    if (!session) {
      syncRemoteChange('SIGNED_OUT', null);
      return;
    }

    // 一次明确的本地登出只有当前上下文的新登录才能撤销；远端刷新不能复活它。
    if (locallySignedOut) return;

    authGeneration += 1;
    lastObservedRaw = raw;
    scheduleRefresh(session);
    emit(event, session);
  }

  function onBroadcastMessage(message: MessageEvent<SessionBroadcastMessage>): void {
    const data = message.data;
    if (!data || data.storageKey !== options.storageKey) return;
    const currentRaw = options.storage.getItem(keys.tokens);
    if (data.event === 'SIGNED_OUT') {
      if (parseSession(currentRaw)) return;
      syncRemoteChange('SIGNED_OUT', null, true);
      return;
    }
    if (data.event === 'TOKEN_REFRESHED' && currentRaw === null) return;
    syncRemoteChange(data.event, currentRaw);
  }

  function onStorage(event: StorageEvent): void {
    if (event.key !== keys.tokens) return;
    const remoteSession = parseSession(event.newValue);
    syncRemoteChange(
      remoteSession ? 'TOKEN_REFRESHED' : 'SIGNED_OUT',
      remoteSession ? event.newValue : null,
      !remoteSession,
    );
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
    getAuthGeneration: () => authGeneration,
    saveSession,
    clearSession,
    beginAuthAttempt,
    beginSignOut,
    setLoginState,
    getPKCEVerifier: () => options.storage.getItem(keys.pkceVerifier),
    getLoginState: () => options.storage.getItem(keys.state),
    clearLoginState,
    runAuthMutation,
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
