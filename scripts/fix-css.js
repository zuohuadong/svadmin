const fs = require('fs');

const files = [
  'd:/workspace/headless-admin-svelte/packages/create-svadmin/template/src/app.css',
  'd:/workspace/headless-admin-svelte/example/src/app.css'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Insert @import "@svadmin/ui/app.css" at the top just after Tailwind imports
  if (!content.includes('@import "@svadmin/ui/app.css"')) {
    content = content.replace(
      /@import "tw-animate-css";/,
      '@import "tw-animate-css";\n\n/* Base New York styles & mappings from UI package */\n@import "@svadmin/ui/app.css";'
    );
  }

  // Remove the `@theme inline { ... }` block
  content = content.replace(/\/\* ── Tailwind theme bridge.*?\*\/[\s\S]*?@theme inline \{[\s\S]*?\}/, '');

  // Remove the `:root` and `.dark` base blocks (since @svadmin/ui/app.css provides them)
  content = content.replace(/\/\* ── Shared light base[^]*?:root\s*\{[^}]+\}/, '');
  content = content.replace(/\/\* ── Shared dark base[^]*?\.dark\s*\{[^}]+\}/, '');

  // Wrap all space-separated HSL values in var(--xxx) overrides with hsl(...)
  // We match `--[a-z-]+: [numbers and percentages];` inside the theme presets.
  content = content.replace(/(--[a-z0-9-]+):\s*([0-9.]+\s+[0-9.]+%?\s+[0-9.]+[%\s]*);/g, '$1: hsl($2);');

  // Remove hsl() wrapper from border-color, background-color, color in base layer
  content = content.replace(/border-color:\s*hsl\(var\(--border\)\);/g, 'border-color: var(--border);');
  content = content.replace(/background-color:\s*hsl\(var\(--background\)\);/g, 'background-color: var(--background);');
  content = content.replace(/color:\s*hsl\(var\(--foreground\)\);/g, 'color: var(--foreground);');

  // Remove any remaining `hsl(var(--...))` just in case
  content = content.replace(/hsl\(var\((--[a-z0-9-]+)\)\)/g, 'var($1)');

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
