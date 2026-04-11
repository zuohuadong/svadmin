import fs from 'fs';

let content = fs.readFileSync('packages/core/src/mutation-hooks.svelte.ts', 'utf8');

// 1. Remove manual `isMutating` state
content = content.replace(/let isMutating = \$state\(false\);\n\s*const overtime = createOvertimeTracker\(\(\) => isMutating, options\.overtimeOptions \?\? adminOptions\.overtime\);/g, "const overtime = createOvertimeTracker(() => mutation.isPending, options.overtimeOptions ?? adminOptions.overtime);");

// Remove isMutating = true and isMutating = false wrappers inside mutationFn
// Because they vary, I'll use regex.
content = content.replace(/isMutating = true;\n\s*(const resName = [^;]+;)/g, "$1");
content = content.replace(/isMutating = true;\n\s*(const provider = [^;]+;)/g, "$1");

content = content.replace(/try {\n\s*return await provider\.create<([^>]+)>\(\{\n\s*resource: resName,\n\s*variables: params\.variables,\n\s*meta: params\.meta,\n\s*\}\);\n\s*\} finally \{\n\s*isMutating = false;\n\s*\}/g, "return await provider.create<$1>({\n          resource: resName,\n          variables: params.variables,\n          meta: params.meta,\n        });");

content = content.replace(/try {\n\s*return await provider\.update<([^>]+)>\(\{\n\s*resource: resName,\n\s*id: targetId,\n\s*variables: params\.variables,\n\s*meta: params\.meta,\n\s*\}\);\n\s*\} finally \{\n\s*isMutating = false;\n\s*\}/g, "return await provider.update<$1>({\n          resource: resName,\n          id: targetId,\n          variables: params.variables,\n          meta: params.meta,\n        });");

content = content.replace(/try {\n\s*return await provider\.deleteOne<([^>]+)>\(\{\n\s*resource: resName,\n\s*id: targetId,\n\s*variables: params\.variables,\n\s*meta: params\.meta,\n\s*\}\);\n\s*\} finally \{\n\s*isMutating = false;\n\s*\}/g, "return await provider.deleteOne<$1>({\n          resource: resName,\n          id: targetId,\n          variables: params.variables,\n          meta: params.meta,\n        });");

// Also there is another isMutating = true inside delete
content = content.replace(/isMutating = true;\n\s*(const targetId = [^;]+;)/g, "$1");


// 2. Add deepMerge helper and use it in useUpdate
const deepMergeCode = `function deepMerge(target: any, source: any): any {
  if (!target || typeof target !== 'object') return source;
  if (!source || typeof source !== 'object') return source;
  if (Array.isArray(source) || source instanceof Date) return source;
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && !(source[key] instanceof Date)) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

`;

if (!content.includes('function deepMerge')) {
  content = content.replace('// ─── useCreate', deepMergeCode + '// ─── useCreate');
}

content = content.replace(
  "queryClient.setQueryData([resName, 'one', targetId], (old: Record<string, unknown> | undefined) => old ? { ...old, data: { ...(old as any).data, ...params.variables } } : old);",
  "queryClient.setQueryData([resName, 'one', targetId], (old: Record<string, unknown> | undefined) => old ? { ...old, data: deepMerge((old as any).data || {}, params.variables) } : old);"
);

// 3. Add useDelete optimistic scrub
content = content.replace(
  "// Optimistic remove from list queries",
  `// Optimistic scrub from detail queries\n      if (targetId != null) queryClient.removeQueries({ queryKey: [resName, 'one', targetId] });\n\n      // Optimistic remove from list queries`
);

fs.writeFileSync('packages/core/src/mutation-hooks.svelte.ts', content);

