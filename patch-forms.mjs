import fs from 'fs';

let content = fs.readFileSync('packages/core/src/form-hooks.svelte.ts', 'utf8');

// 1. autoSaveTimer cleanup and non-null assertion removal
content = content.replace(
  "  function triggerAutoSave() {",
  `  $effect(() => {
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  });

  function triggerAutoSave() {`
);

content = content.replace(
  /if \(!autoSaveOpts\?\.enabled \|\| currentAction === 'create' \|\| currentAction === 'clone'\) return;\n\s*if \(autoSaveTimer\) clearTimeout\(autoSaveTimer\);/g,
  `if (!autoSaveOpts?.enabled || currentAction === 'create' || currentAction === 'clone' || currentId == null) return;
    if (autoSaveTimer) clearTimeout(autoSaveTimer);`
);

content = content.replace(
  /await provider\.update<TData, TVariables>\(\{ resource, id: currentId!, variables: finalValues, meta: mutationMeta \}\);/g,
  `await provider.update<TData, TVariables>({ resource, id: currentId, variables: finalValues, meta: mutationMeta });`
);

fs.writeFileSync('packages/core/src/form-hooks.svelte.ts', content);

