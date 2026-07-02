/**
 * 构建后处理：
 * 1. 保留 dist/app.theme.css（含 @theme，供 Tailwind v4 消费者生成工具类）
 * 2. 将 dist/app.css 中的 @theme 块转换为标准 CSS :root + .svadmin-theme
 *    （供非 Tailwind 环境直接消费，避免 Lightning CSS 报错）
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const cssPath = join(distDir, 'app.css');
const themePath = join(distDir, 'app.theme.css');

if (!existsSync(cssPath)) {
  console.warn('[postbuild-css] dist/app.css not found, skipping');
  process.exit(0);
}

const original = readFileSync(cssPath, 'utf8');

// 1. 保留含 @theme 的副本
writeFileSync(themePath, original, 'utf8');
console.log('[postbuild-css] wrote dist/app.theme.css (Tailwind source with @theme)');

// 2. 如果没有 @theme 则无需转换
if (!original.includes('@theme')) {
  console.log('[postbuild-css] no @theme block in dist/app.css, skipping conversion');
  process.exit(0);
}

let css = original;
const themeStart = css.indexOf('@theme');

// 找到 @theme 后的匹配大括号
let depth = 0;
let braceStart = -1;
let braceEnd = -1;
for (let i = themeStart; i < css.length; i++) {
  if (css[i] === '{') {
    if (depth === 0) braceStart = i;
    depth++;
  } else if (css[i] === '}') {
    depth--;
    if (depth === 0) {
      braceEnd = i;
      break;
    }
  }
}

if (braceStart === -1 || braceEnd === -1) {
  console.warn('[postbuild-css] could not parse @theme block, skipping conversion');
  process.exit(0);
}

const declarations = css.slice(braceStart + 1, braceEnd);

// 用 :root + .svadmin-theme 替换 @theme 块
const replacement = `:root,\n.svadmin-theme {${declarations}}`;
css = css.slice(0, themeStart) + replacement + css.slice(braceEnd + 1);

writeFileSync(cssPath, css, 'utf8');
console.log('[postbuild-css] converted @theme to standard CSS in dist/app.css');
