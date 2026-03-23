# Theme System / 主题系统

> Dark mode + multi-color theme management

## Dark Mode / 暗色模式

```typescript
import { setTheme, toggleTheme, getTheme, getResolvedTheme } from '@svadmin/core';

setTheme('dark');     // 'light' | 'dark' | 'system'
toggleTheme();        // toggle light ↔ dark
getTheme();           // current setting ('light' | 'dark' | 'system')
getResolvedTheme();   // resolved to 'light' or 'dark'
```

AdminApp `defaultTheme` prop sets the initial mode. Persisted to `localStorage`.

AdminApp 的 `defaultTheme` 属性设定初始模式，自动持久化到 `localStorage`。

## Color Themes / 多色主题

6 built-in color palettes, switchable via sidebar picker or API:

6 种内置配色，通过侧边栏选色器或 API 切换：

```typescript
import { getColorTheme, setColorTheme, colorThemes } from '@svadmin/core';
import type { ColorTheme } from '@svadmin/core';

setColorTheme('rose');    // set active color theme
getColorTheme();          // current color theme id

// Available themes
colorThemes.forEach(ct => {
  console.log(ct.id, ct.label, ct.color);
});
```

| Theme | ID | Hex |
|-------|----|-----|
| Blue (default) | `blue` | `#3b82f6` |
| Green | `green` | `#22c55e` |
| Rose | `rose` | `#f43f5e` |
| Orange | `orange` | `#f97316` |
| Violet | `violet` | `#8b5cf6` |
| Zinc | `zinc` | `#71717a` |

### How It Works / 工作原理

- Color theme sets `data-theme` attribute on `<html>` element
- CSS variables in your theme CSS respond to `[data-theme="..."]` selectors
- Persisted to `localStorage` under `svadmin-color-theme` key

颜色主题在 `<html>` 上设置 `data-theme` 属性，CSS 变量根据 `[data-theme="..."]` 选择器响应。持久化到 `localStorage`（key: `svadmin-color-theme`）。

## Sidebar Controls / 侧边栏控制

The built-in sidebar provides:

内置侧边栏提供：

- 🎨 **Color picker** — Colored dots at sidebar footer to switch themes / 选色器圆点
- 🌓 **Dark mode toggle** — Sun/Moon icon button / 日月图标按钮
- 🌐 **Locale toggle** — Click to cycle through available locales / 点击切换语言
