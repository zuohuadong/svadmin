#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import prompts from 'prompts';
import pc from 'picocolors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Types ─────────────────────────────────────────────────────
interface InitResponse {
  projectName: string;
  dataProvider: 'simple-rest' | 'supabase' | 'graphql' | 'none';
  authProvider: 'mock' | 'jwt' | 'supabase' | 'none';
  installDeps: boolean;
}

interface PackageJson {
  name: string;
  version: string;
  private: boolean;
  type: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

// ─── Scaffold (init) ───────────────────────────────────────────
async function init(): Promise<void> {
  console.log();
  console.log(pc.cyan('  ╔═══════════════════════════════════╗'));
  console.log(pc.cyan('  ║  ') + pc.bold('create-svadmin') + pc.cyan('                    ║'));
  console.log(pc.cyan('  ║  ') + pc.dim('Headless Admin for Svelte 5') + pc.cyan('    ║'));
  console.log(pc.cyan('  ╚═══════════════════════════════════╝'));
  console.log();

  const response = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'svadmin-app',
      validate: (value: string) => {
        if (!value.trim()) return 'Project name is required';
        if (fs.existsSync(value.trim()) && fs.readdirSync(value.trim()).length > 0) {
          return 'Directory already exists and is not empty';
        }
        return true;
      }
    },
    {
      type: 'select',
      name: 'dataProvider',
      message: 'Data Provider:',
      choices: [
        { title: 'Simple REST', value: 'simple-rest', description: 'Standard JSON APIs / JSON Server' },
        { title: 'Supabase', value: 'supabase', description: 'PostgreSQL Backend-as-a-Service' },
        { title: 'GraphQL', value: 'graphql', description: 'Generic GraphQL endpoints' },
        { title: 'Custom', value: 'none', description: 'Implement your own DataProvider' }
      ],
      initial: 0
    },
    {
      type: 'select',
      name: 'authProvider',
      message: 'Auth Provider:',
      choices: [
        { title: 'Mock (Demo)', value: 'mock', description: 'Built-in mock for development' },
        { title: 'Simple REST JWT', value: 'jwt', description: 'JWT-based auth via REST API' },
        { title: 'Supabase Auth', value: 'supabase', description: 'Supabase authentication' },
        { title: 'None', value: 'none', description: 'No authentication' }
      ],
      initial: 0
    },
    {
      type: 'confirm',
      name: 'installDeps',
      message: 'Install dependencies now?',
      initial: true
    }
  ]) as InitResponse;

  if (!response.projectName) {
    console.log(pc.red('\nOperation cancelled.\n'));
    return;
  }

  const projectDir = path.resolve(process.cwd(), response.projectName.trim());

  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  console.log(`\n${pc.bold('Scaffolding')} project in ${pc.green(projectDir)}...\n`);

  // 1. Copy template files
  const templateDir = path.join(__dirname, '..', 'template');

  function copyDir(src: string, dest: string): void {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name === '_gitignore' ? '.gitignore' : entry.name);
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  if (fs.existsSync(templateDir)) {
    copyDir(templateDir, projectDir);
    console.log(pc.green('  ✔') + ' Template files copied');
  }

  // 2. Generate package.json
  const packageJson: PackageJson = {
    name: response.projectName,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
      check: 'svelte-check --tsconfig ./tsconfig.json'
    },
    dependencies: {
      '@svadmin/core': '^0.19.3',
      '@svadmin/ui': '^0.25.0',
      '@tanstack/svelte-query': '^6.0.0',
      'highlight.js': '^11.11.1',
      '@lucide/svelte': '^0.475.0',
    },
    devDependencies: {
      '@sveltejs/vite-plugin-svelte': '^5.0.0',
      '@tailwindcss/vite': '^4.0.0',
      'svelte': '^5.20.0',
      'svelte-check': '^4.0.0',
      'tailwindcss': '^4.0.0',
      'tw-animate-css': '^1.0.0',
      'typescript': '^5.7.0',
      'vite': '^6.1.0',
    }
  };

  // Add data provider dependency
  const dpMap: Record<string, Record<string, string>> = {
    'simple-rest': { '@svadmin/simple-rest': '^0.9.0' },
    'supabase': { '@svadmin/supabase': '^0.9.0', '@supabase/supabase-js': '^2.0.0' },
    'graphql': { '@svadmin/graphql': '^0.9.0', 'graphql-request': '^7.1.0', 'graphql': '^16.8.0' },
  };
  if (dpMap[response.dataProvider]) {
    Object.assign(packageJson.dependencies, dpMap[response.dataProvider]);
  }

  // Add auth provider dependency
  if (response.authProvider === 'supabase' && response.dataProvider !== 'supabase') {
    packageJson.dependencies['@svadmin/supabase'] = '^0.9.0';
    packageJson.dependencies['@supabase/supabase-js'] = '^2.0.0';
  }
  if (response.authProvider === 'jwt' && response.dataProvider !== 'simple-rest') {
    packageJson.dependencies['@svadmin/simple-rest'] = '^0.9.0';
  }

  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  console.log(pc.green('  ✔') + ' package.json generated');

  // 3. Generate .gitignore
  fs.writeFileSync(path.join(projectDir, '.gitignore'), `node_modules
dist
.svelte-kit
.env
.env.local
*.local
`);
  console.log(pc.green('  ✔') + ' .gitignore generated');

  // 4. Generate README
  const dpLabel = response.dataProvider === 'simple-rest' ? 'Simple REST'
    : response.dataProvider === 'supabase' ? 'Supabase'
    : response.dataProvider === 'graphql' ? 'GraphQL' : 'Custom';
  const authLabel = response.authProvider === 'mock' ? 'Mock (demo)'
    : response.authProvider === 'jwt' ? 'JWT'
    : response.authProvider === 'supabase' ? 'Supabase Auth' : 'None';

  fs.writeFileSync(path.join(projectDir, 'README.md'), `# ${response.projectName}

Built with [svadmin](https://github.com/zuohuadong/svadmin) — Headless Admin Framework for Svelte 5.

## Getting Started

\`\`\`bash
bun install
bun run dev
\`\`\`

## Stack

- **UI**: Svelte 5 + Shadcn Svelte + TailwindCSS
- **Data**: ${dpLabel} DataProvider
- **Auth**: ${authLabel}
- **State**: TanStack Query v6
`);
  console.log(pc.green('  ✔') + ' README.md generated');

  // 5. Install dependencies
  if (response.installDeps) {
    console.log(`\n${pc.bold('Installing dependencies...')}\n`);
    const { execSync } = await import('child_process');
    try {
      execSync('bun install', { cwd: projectDir, stdio: 'inherit' });
    } catch {
      try {
        execSync('npm install', { cwd: projectDir, stdio: 'inherit' });
      } catch {
        console.log(pc.yellow('\n  ⚠ Auto-install failed. Run `bun install` or `npm install` manually.'));
      }
    }
  }

  // 6. Done!
  console.log();
  console.log(pc.green(pc.bold('  ✔ Project ready!')));
  console.log();
  console.log('  Next steps:');
  console.log(`    ${pc.cyan(`cd ${response.projectName}`)}`);
  if (!response.installDeps) {
    console.log(`    ${pc.cyan('bun install')}`);
  }
  console.log(`    ${pc.cyan('bun run dev')}`);
  console.log();
  console.log(`  Docs: ${pc.blue('https://github.com/zuohuadong/svadmin')}`);
  console.log();
}

// ─── Eject subcommand ──────────────────────────────────────────
const EJECT_COMPONENTS = [
  'Layout', 'Sidebar', 'Header', 'LoginPage',
  'AutoTable', 'AutoForm', 'ShowPage', 'ProfilePage',
  'StatsCard', 'AuditLogDrawer', 'LiveIndicator',
  'CommandPalette', 'AICommandBar', 'ChatDialog',
  'PasswordInput', 'BooleanField', 'FieldRenderer',
  'MarkdownRenderer', 'AnomalyBadge', 'Toast',
  'ConfirmDialog', 'TooltipButton', 'Breadcrumbs',
  'ConfigErrorScreen', 'DevTools',
] as const;

async function eject(args: string[]): Promise<void> {
  console.log();
  console.log(pc.cyan('  svadmin eject') + pc.dim(' — copy internal components for deep customization'));
  console.log();

  // Resolve which components to eject
  const requested = args.filter(a => !a.startsWith('-'));
  const toEject = requested.length > 0
    ? requested.filter(name => {
        if (!(EJECT_COMPONENTS as readonly string[]).includes(name)) {
          console.log(pc.yellow(`  ⚠ Unknown component: ${name} (skipped)`));
          return false;
        }
        return true;
      })
    : [...EJECT_COMPONENTS];

  if (toEject.length === 0) {
    console.log(pc.red('  No valid components to eject.'));
    console.log(`  Available: ${EJECT_COMPONENTS.join(', ')}`);
    return;
  }

  // Find @svadmin/ui source
  let uiSrcDir: string | undefined;
  try {
    const require = createRequire(import.meta.url);
    const uiPkg = path.dirname(require.resolve('@svadmin/ui/package.json'));
    uiSrcDir = path.join(uiPkg, 'src', 'components');
  } catch {
    // Fallback: look in node_modules
    const nm = path.join(process.cwd(), 'node_modules', '@svadmin', 'ui', 'src', 'components');
    if (fs.existsSync(nm)) {
      uiSrcDir = nm;
    } else {
      console.log(pc.red('  ✗ Cannot find @svadmin/ui. Run `bun install` first.'));
      return;
    }
  }

  const destDir = path.join(process.cwd(), 'src', 'components', 'svadmin');
  fs.mkdirSync(destDir, { recursive: true });

  let copied = 0;
  for (const name of toEject) {
    const srcFile = path.join(uiSrcDir, `${name}.svelte`);
    // Also try fields/ subdirectory
    const srcFileAlt = path.join(uiSrcDir, 'fields', `${name}.svelte`);
    const src = fs.existsSync(srcFile) ? srcFile : fs.existsSync(srcFileAlt) ? srcFileAlt : null;

    if (!src) {
      console.log(pc.yellow(`  ⚠ ${name}.svelte not found in @svadmin/ui (skipped)`));
      continue;
    }

    let content = fs.readFileSync(src, 'utf-8');
    // Rewrite relative ./ui/ imports to use @svadmin/ui path (shadcn primitives stay in node_modules)
    content = content.replace(
      /from\s+['"]\.\/ui\//g,
      "from '@svadmin/ui/components/ui/"
    );
    // Rewrite relative ./ sibling imports to local directory
    content = content.replace(
      /from\s+['"]\.\/((?!ui\/)[^'"]+)['"]/g,
      "from './$1'"
    );

    const destFile = path.join(destDir, `${name}.svelte`);
    fs.writeFileSync(destFile, content);
    console.log(pc.green('  ✔') + ` ${name}.svelte → src/components/svadmin/`);
    copied++;
  }

  console.log();
  if (copied > 0) {
    console.log(pc.green(pc.bold(`  ✔ Ejected ${copied} component(s)`)));
    console.log();
    console.log('  Usage: import overrides in your AdminApp and pass via `components` prop:');
    console.log();
    console.log(pc.dim('    import CustomLayout from "./components/svadmin/Layout.svelte";'));
    console.log(pc.dim('    <AdminApp components={{ Layout: CustomLayout }} ... />'));
  } else {
    console.log(pc.yellow('  No components were ejected.'));
  }
  console.log();
}

// ─── CLI dispatch ──────────────────────────────────────────────
const [,, subcommand, ...rest] = process.argv;
if (subcommand === 'eject') {
  eject(rest).catch(console.error);
} else {
  init().catch(console.error);
}
