import fs from 'fs';
let file = 'packages/ui/src/app.css';
let content = fs.readFileSync(file, 'utf8');

// Phase 1: Tokens
content = content.replace('--radius: 0.5rem;', '--radius: 0.75rem;');
content = content.replace('--background: oklch(0.98 0.002 264);', '--background: oklch(0.975 0.005 264);'); // slightly darker light grey
content = content.replace('--card: oklch(1 0 0);', '--card: oklch(1 0 0);');

// Shadows & Radii overrides
content = content.replace(
  'box-shadow: 0 2px 8px -2px rgb(0 0 0 / 0.05), 0 4px 16px -4px rgb(0 0 0 / 0.02);',
  'box-shadow: 0 2px 5px -1px rgb(0 0 0 / 0.04), 0 1px 1px -1px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(0 0 0 / 0.02);'
); // More realistic stripe card shadow

content = content.replace(
  'transform: scale(0.97);',
  'transform: scale(0.98);'
);

content = content.replace(
  'box-shadow: 0 0 0 1px var(--color-background), 0 0 0 3px color-mix(in oklch, var(--color-primary) 30%, transparent) !important;',
  'box-shadow: 0 0 0 1px var(--color-background), 0 0 0 3px color-mix(in oklch, var(--color-primary) 20%, transparent) !important;'
);

content = content.replace(
  'box-shadow: 0 4px 12px -2px rgb(0 0 0 / 0.08), 0 8px 24px -6px rgb(0 0 0 / 0.04);',
  'box-shadow: 0 6px 16px -4px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(0 0 0 / 0.02);'
); // Hover elevation lift

fs.writeFileSync(file, content);
