// Theme — dark/light/system mode + color theme management (Svelte 5 runes)

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorTheme = 'blue' | 'green' | 'rose' | 'orange' | 'violet' | 'zinc';

const STORAGE_KEY = 'svadmin-theme';
const COLOR_STORAGE_KEY = 'svadmin-color-theme';

// ── Color themes (display metadata) ──────────────────────
export const colorThemes: { id: ColorTheme; label: string; color: string }[] = [
  { id: 'blue',   label: 'Blue',   color: '#3b82f6' },
  { id: 'green',  label: 'Green',  color: '#22c55e' },
  { id: 'rose',   label: 'Rose',   color: '#f43f5e' },
  { id: 'orange', label: 'Orange', color: '#f97316' },
  { id: 'violet', label: 'Violet', color: '#8b5cf6' },
  { id: 'zinc',   label: 'Zinc',   color: '#71717a' },
];

// ── Dark/Light mode ──────────────────────────────────────

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

// ── Color theme ──────────────────────────────────────────

function getStoredColorTheme(): ColorTheme {
  if (typeof localStorage === 'undefined') return 'blue';
  return (localStorage.getItem(COLOR_STORAGE_KEY) as ColorTheme) ?? 'blue';
}

let colorTheme = $state<ColorTheme>(getStoredColorTheme());

function applyColorTheme(ct: ColorTheme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', ct);
  }
}

// Apply on init
applyColorTheme(colorTheme);

export function getColorTheme(): ColorTheme {
  return colorTheme;
}

export function setColorTheme(ct: ColorTheme): void {
  colorTheme = ct;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(COLOR_STORAGE_KEY, ct);
  }
  applyColorTheme(ct);
}
