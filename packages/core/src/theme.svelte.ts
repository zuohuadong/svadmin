// Theme — dark/light/system mode management (Svelte 5 runes)

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'svadmin-theme';

function getStoredTheme(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'system';
  return (localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? 'system';
}

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

let mode = $state<ThemeMode>(getStoredTheme());

function applyTheme(m: ThemeMode): void {
  const resolved = m === 'system' ? getSystemPreference() : m;
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }
}

// Apply on init
applyTheme(mode);

// Listen for system preference changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (mode === 'system') applyTheme('system');
  });
}

export function getTheme(): ThemeMode {
  return mode;
}

export function setTheme(newMode: ThemeMode): void {
  mode = newMode;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, newMode);
  }
  applyTheme(newMode);
}

export function toggleTheme(): void {
  const resolved = mode === 'system' ? getSystemPreference() : mode;
  setTheme(resolved === 'dark' ? 'light' : 'dark');
}

/** Resolved theme (always 'light' or 'dark', never 'system') */
export function getResolvedTheme(): 'light' | 'dark' {
  return mode === 'system' ? getSystemPreference() : mode;
}
