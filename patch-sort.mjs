import fs from 'fs';

let content = fs.readFileSync('packages/core/src/table-hooks.svelte.ts', 'utf8');

const oldSort = `        const { field, order } = activeSorters[0];
        sorted.sort((a, b) => {
          const va = (a as Record<string, unknown>)[field];
          const vb = (b as Record<string, unknown>)[field];
          if (va == null) return 1;
          if (vb == null) return -1;
          const cmp = va < vb ? -1 : va > vb ? 1 : 0;
          return order === 'desc' ? -cmp : cmp;
        });`;

const newSort = `        sorted.sort((a, b) => {
          for (const { field, order } of activeSorters) {
            const va = (a as Record<string, unknown>)[field];
            const vb = (b as Record<string, unknown>)[field];
            if (va == null && vb != null) return 1;
            if (vb == null && va != null) return -1;
            if (va == null && vb == null) continue;
            
            let cmp = 0;
            if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
            else if (va instanceof Date && vb instanceof Date) cmp = va.getTime() - vb.getTime();
            else if (typeof va === 'string' && typeof vb === 'string' && !isNaN(Number(va)) && !isNaN(Number(vb))) cmp = Number(va) - Number(vb);
            else cmp = String(va).localeCompare(String(vb));
            
            if (cmp !== 0) return order === 'desc' ? -cmp : cmp;
          }
          return 0;
        });`;

content = content.replace(oldSort, newSort);

fs.writeFileSync('packages/core/src/table-hooks.svelte.ts', content);

