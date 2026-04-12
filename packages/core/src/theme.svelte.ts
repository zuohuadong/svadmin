// Theme — dark/light/system mode + color theme management (Svelte 5 runes)
//
// Supports two class strategies:
//   - 'standard' (default): adds 'dark' class for dark mode (light-first)
//   - 'dark-first': adds 'light' class for light mode (dark-first)

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorTheme = 'blue' | 'green' | 'rose' | 'orange' | 'violet' | 'neutral';

/** Controls how the theme class is applied to <html> */
export type ThemeStrategy = 'standard' | 'dark-first';

// ── Color Preset System ──────────────────────────────────

/** A color preset defines CSS variable overrides for light and dark modes. */
export interface ColorPreset {
  /** Unique name (e.g. 'indigo', 'blue') */
  name: string;
  /** Display label (e.g. 'Indigo', 'Blue') */
  label: string;
  /** Preview swatch color (hex) for UI pickers */
  color: string;
  /** CSS variable overrides for light mode */
  light: Record<string, string>;
  /** CSS variable overrides for dark mode */
  dark: Record<string, string>;
}

/** Built-in color presets — consumers can extend via registerColorPreset(). */
export const builtinPresets: Record<string, ColorPreset> = $state({
  neutral: {
    name: 'neutral',
    label: 'Neutral',
    color: '#71717a',
    light: {
      '--primary': 'oklch(0.205 0.006 286)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.205 0.006 286)',
      '--sidebar-primary': 'oklch(0.205 0.006 286)',
      '--sidebar-primary-foreground': 'oklch(0.985 0 0)',
      '--sidebar-ring': 'oklch(0.205 0.006 286)',
      '--chart-1': 'oklch(0.488 0.243 264.376)',
    },
    dark: {
      '--primary': 'oklch(0.922 0.004 286)',
      '--primary-foreground': 'oklch(0.205 0.006 286)',
      '--ring': 'oklch(0.556 0.004 286)',
      '--sidebar-primary': 'oklch(0.922 0.004 286)',
      '--sidebar-primary-foreground': 'oklch(0.205 0.006 286)',
      '--sidebar-ring': 'oklch(0.556 0.004 286)',
      '--chart-1': 'oklch(0.585 0.233 264)',
    },
  },
  indigo: {
    name: 'indigo',
    label: 'Indigo',
    color: '#4f46e5',
    light: {
      '--primary': 'oklch(0.488 0.243 264.376)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.488 0.243 264.376)',
      '--sidebar-primary': 'oklch(0.488 0.243 264.376)',
      '--sidebar-primary-foreground': 'oklch(0.985 0 0)',
      '--sidebar-ring': 'oklch(0.488 0.243 264.376)',
      '--chart-1': 'oklch(0.488 0.243 264.376)',
    },
    dark: {
      '--primary': 'oklch(0.585 0.233 264)',
      '--primary-foreground': 'oklch(0.15 0.04 265)',
      '--ring': 'oklch(0.55 0.18 264)',
      '--sidebar-primary': 'oklch(0.585 0.233 264)',
      '--sidebar-primary-foreground': 'oklch(0.985 0 0)',
      '--sidebar-ring': 'oklch(0.55 0.18 264)',
      '--chart-1': 'oklch(0.585 0.233 264)',
    },
  },
  blue: {
    name: 'blue',
    label: 'Blue',
    color: '#3b82f6',
    light: {
      '--primary': 'oklch(0.546 0.245 262.881)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.546 0.245 262.881)',
      '--sidebar-primary': 'oklch(0.546 0.245 262.881)',
      '--sidebar-primary-foreground': 'oklch(0.985 0 0)',
      '--sidebar-ring': 'oklch(0.546 0.245 262.881)',
      '--chart-1': 'oklch(0.546 0.245 262.881)',
    },
    dark: {
      '--primary': 'oklch(0.623 0.214 259.815)',
      '--primary-foreground': 'oklch(0.15 0.04 265)',
      '--ring': 'oklch(0.546 0.245 262.881)',
      '--sidebar-primary': 'oklch(0.623 0.214 259.815)',
      '--sidebar-primary-foreground': 'oklch(0.985 0 0)',
      '--sidebar-ring': 'oklch(0.546 0.245 262.881)',
      '--chart-1': 'oklch(0.623 0.214 259.815)',
    },
  },
  green: {
    name: 'green',
    label: 'Green',
    color: '#22c55e',
    light: {
      '--primary': 'oklch(0.527 0.185 150.069)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.527 0.185 150.069)',
      '--sidebar-primary': 'oklch(0.527 0.185 150.069)',
      '--sidebar-primary-foreground': 'oklch(0.985 0 0)',
      '--sidebar-ring': 'oklch(0.527 0.185 150.069)',
      '--chart-1': 'oklch(0.527 0.185 150.069)',
    },
    dark: {
      '--primary': 'oklch(0.627 0.194 149.214)',
      '--primary-foreground': 'oklch(0.15 0.05 150)',
      '--ring': 'oklch(0.527 0.185 150.069)',
      '--sidebar-primary': 'oklch(0.627 0.194 149.214)',
      '--sidebar-primary-foreground': 'oklch(0.985 0 0)',
      '--sidebar-ring': 'oklch(0.527 0.185 150.069)',
      '--chart-1': 'oklch(0.627 0.194 149.214)',
    },
  },
  rose: {
    name: 'rose',
    label: 'Rose',
    color: '#f43f5e',
    light: {
      '--primary': 'oklch(0.577 0.245 27.325)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.577 0.245 27.325)',
      '--sidebar-primary': 'oklch(0.577 0.245 27.325)',
      '--sidebar-primary-foreground': 'oklch(0.985 0 0)',
      '--sidebar-ring': 'oklch(0.577 0.245 27.325)',
      '--chart-1': 'oklch(0.577 0.245 27.325)',
    },
    dark: {
      '--primary': 'oklch(0.577 0.245 27.325)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.577 0.245 27.325)',
      '--sidebar-primary': 'oklch(0.577 0.245 27.325)',
      '--sidebar-primary-foreground': 'oklch(0.985 0 0)',
      '--sidebar-ring': 'oklch(0.577 0.245 27.325)',
      '--chart-1': 'oklch(0.577 0.245 27.325)',
    },
  },
  orange: {
    name: 'orange',
    label: 'Orange',
    color: '#f97316',
    light: {
      '--primary': 'oklch(0.646 0.222 41.116)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.646 0.222 41.116)',
      '--sidebar-primary': 'oklch(0.646 0.222 41.116)',
      '--sidebar-primary-foreground': 'oklch(0.985 0 0)',
      '--sidebar-ring': 'oklch(0.646 0.222 41.116)',
      '--chart-1': 'oklch(0.646 0.222 41.116)',
    },
    dark: {
      '--primary': 'oklch(0.646 0.222 41.116)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.646 0.222 41.116)',
      '--sidebar-primary': 'oklch(0.646 0.222 41.116)',
      '--sidebar-primary-foreground': 'oklch(0.985 0 0)',
      '--sidebar-ring': 'oklch(0.646 0.222 41.116)',
      '--chart-1': 'oklch(0.646 0.222 41.116)',
    },
  },
  violet: {
    name: 'violet',
    label: 'Violet',
    color: '#8b5cf6',
    light: {
      '--primary': 'oklch(0.541 0.281 293.009)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.541 0.281 293.009)',
      '--sidebar-primary': 'oklch(0.541 0.281 293.009)',
      '--sidebar-primary-foreground': 'oklch(0.985 0 0)',
      '--sidebar-ring': 'oklch(0.541 0.281 293.009)',
      '--chart-1': 'oklch(0.541 0.281 293.009)',
    },
    dark: {
      '--primary': 'oklch(0.541 0.281 293.009)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.541 0.281 293.009)',
      '--sidebar-primary': 'oklch(0.541 0.281 293.009)',
      '--sidebar-primary-foreground': 'oklch(0.985 0 0)',
      '--sidebar-ring': 'oklch(0.541 0.281 293.009)',
      '--chart-1': 'oklch(0.541 0.281 293.009)',
    },
  },
});

/** Register a custom color preset. Overwrites any built-in preset with the same name. */
export function registerColorPreset(preset: ColorPreset): void {
  builtinPresets[preset.name] = preset;
}

/** Resolve a preset by name or return the preset object directly. */
function resolvePreset(preset: ColorPreset | string): ColorPreset | undefined {
  if (typeof preset === 'string') return builtinPresets[preset];
  return preset;
}

/** Apply a color preset's CSS variables based on current resolved theme. */
function applyColorPreset(preset: ColorPreset): void {
  if (typeof document === 'undefined') return;
  const resolved = mode === 'system' ? getSystemPreference() : mode;
  const vars = resolved === 'dark' ? preset.dark : preset.light;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(vars)) {
    const cssVar = key.startsWith('--') ? key : `--${key}`;
    root.style.setProperty(cssVar, value);
  }
}

/** Get all available color presets (built-in + registered). */
export function getColorPresets(): ColorPreset[] {
  return Object.values(builtinPresets);
}

export interface ThemeConfig {
  /** Class strategy: 'standard' toggles '.dark', 'dark-first' toggles '.light' */
  strategy?: ThemeStrategy;
  /** Custom CSS variables to inject as overrides on <html> */
  cssOverrides?: Record<string, string>;
  /** Whether to disable the built-in color-scheme attribute */
  disableColorScheme?: boolean;
  /** Built-in color preset name (e.g. 'indigo', 'blue') or a custom ColorPreset object */
  colorPreset?: ColorPreset | string;
}

const STORAGE_KEY = 'svadmin-theme';
const COLOR_STORAGE_KEY = 'svadmin-color-theme';

// ── Theme configuration ──────────────────────────────────
let themeConfig: ThemeConfig = {};

/**
 * Configure the theme system. Must be called before setTheme() or
 * automatically via AdminApp's themeConfig prop.
 */
export function configureTheme(config: ThemeConfig): void {
  themeConfig = { ...config };
  // Re-apply the current theme with new strategy
  applyTheme(mode);
  // Apply color preset first (lower priority)
  if (config.colorPreset) {
    const preset = resolvePreset(config.colorPreset);
    if (preset) applyColorPreset(preset);
  }
  // Then apply manual CSS overrides (higher priority)
  if (config.cssOverrides) {
    applyCssOverrides(config.cssOverrides);
  }
}

/** Get current theme configuration */
export function getThemeConfig(): ThemeConfig {
  return { ...themeConfig };
}

function applyCssOverrides(overrides: Record<string, string>): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(overrides)) {
    const cssVar = key.startsWith('--') ? key : `--${key}`;
    root.style.setProperty(cssVar, value);
  }
}

/** Remove previously applied CSS overrides */
export function clearCssOverrides(keys?: string[]): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (keys) {
    for (const key of keys) {
      const cssVar = key.startsWith('--') ? key : `--${key}`;
      root.style.removeProperty(cssVar);
    }
  } else if (themeConfig.cssOverrides) {
    for (const key of Object.keys(themeConfig.cssOverrides)) {
      const cssVar = key.startsWith('--') ? key : `--${key}`;
      root.style.removeProperty(cssVar);
    }
  }
}

// ── Color themes (display metadata, derived from presets) ──
export const colorThemes: { id: ColorTheme | string; label: string; color: string }[] = $derived(Object.values(builtinPresets).map(p => ({
  id: p.name as ColorTheme,
  label: p.label,
  color: p.color,
})));

// ── Dark/Light mode ──────────────────────────────────────

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try { return (localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? 'system'; } catch { return 'system'; }
}

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

let mode = $state<ThemeMode>(getStoredTheme());

function applyTheme(m: ThemeMode): void {
  const resolved = m === 'system' ? getSystemPreference() : m;
  if (typeof document === 'undefined') return;

  const strategy = themeConfig.strategy ?? 'standard';
  const el = document.documentElement;

  if (strategy === 'dark-first') {
    // Dark-first: default is dark, add 'light' class for light mode
    el.classList.toggle('light', resolved === 'light');
    el.classList.remove('dark'); // ensure no conflict
  } else {
    // Standard: default is light, add 'dark' class for dark mode
    el.classList.toggle('dark', resolved === 'dark');
    el.classList.remove('light'); // ensure no conflict
  }

  // Set color-scheme attribute unless disabled
  if (!themeConfig.disableColorScheme) {
    el.style.colorScheme = resolved;
  }
}

// Apply on init (browser only)
if (typeof window !== 'undefined') {
  applyTheme(getStoredTheme());
}

// Listen for system preference changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (mode === 'system') {
      applyTheme('system');
      // Re-apply color preset for new resolved mode (light/dark values differ)
      const preset = builtinPresets[colorTheme];
      if (preset) applyColorPreset(preset);
    }
  });
}

export function getTheme(): ThemeMode {
  return mode;
}

export function setTheme(newMode: ThemeMode): void {
  mode = newMode;
  if (typeof window !== 'undefined') {
    try { localStorage.setItem(STORAGE_KEY, newMode); } catch {}
  }
  applyTheme(newMode);
  // Re-apply color preset — light/dark CSS variable overrides differ
  const preset = builtinPresets[colorTheme];
  if (preset) applyColorPreset(preset);
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
  if (typeof window === 'undefined') return 'blue';
  try { return (localStorage.getItem(COLOR_STORAGE_KEY) as ColorTheme) ?? 'blue'; } catch { return 'blue'; }
}

let colorTheme = $state<ColorTheme>(getStoredColorTheme());

function applyColorTheme(ct: ColorTheme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', ct);
  }
}

// Apply on init (browser only)
if (typeof window !== 'undefined') {
  applyColorTheme(getStoredColorTheme());
  const initPreset = builtinPresets[getStoredColorTheme()];
  if (initPreset) applyColorPreset(initPreset);
}

export function getColorTheme(): ColorTheme {
  return colorTheme;
}

export function setColorTheme(ct: ColorTheme): void {
  colorTheme = ct;
  if (typeof window !== 'undefined') {
    try { localStorage.setItem(COLOR_STORAGE_KEY, ct); } catch {}
  }
  applyColorTheme(ct);
  // Apply the preset's CSS variable overrides for the current resolved theme
  const preset = builtinPresets[ct];
  if (preset) applyColorPreset(preset);
}
