import fs from 'fs';
let file = 'packages/ui/src/app.css';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '[data-slot="input"]:focus-visible,\n[data-slot="textarea"]:focus-visible,\n[data-slot="select-trigger"]:focus-visible {',
  '[data-slot="button"]:focus-visible,\n[data-slot="input"]:focus-visible,\n[data-slot="textarea"]:focus-visible,\n[data-slot="select-trigger"]:focus-visible {'
);

fs.writeFileSync(file, content);
