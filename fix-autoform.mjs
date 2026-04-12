import fs from 'fs';
let file = 'packages/ui/src/components/AutoForm.svelte';
let content = fs.readFileSync(file, 'utf8');

if (!content.startsWith('<script lang="ts">')) {
  content = '<script lang="ts">\n' + content;
}

fs.writeFileSync(file, content);
