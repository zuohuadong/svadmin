#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prompts from 'prompts';
import pc from 'picocolors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function init() {
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
      validate: (value) => {
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
  ]);

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
  const templateDir = path.join(__dirname, 'template');

  function copyDir(src, dest) {
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
  const packageJson = {
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
      '@svadmin/core': '^0.0.6',
      '@svadmin/ui': '^0.0.6',
      '@tanstack/svelte-query': '^6.0.0',
      'lucide-svelte': '^0.475.0',
    },
    devDependencies: {
      '@sveltejs/vite-plugin-svelte': '^5.0.0',
      'svelte': '^5.20.0',
      'svelte-check': '^4.0.0',
      'tailwindcss': '^3.4.17',
      'typescript': '^5.7.0',
      'vite': '^6.1.0',
    }
  };

  // Add data provider dependency
  const dpMap = {
    'simple-rest': { '@svadmin/simple-rest': '^0.0.6' },
    'supabase': { '@svadmin/supabase': '^0.0.6', '@supabase/supabase-js': '^2.0.0' },
    'graphql': { '@svadmin/graphql': '^0.0.6', 'graphql-request': '^7.1.0', 'graphql': '^16.8.0' },
  };
  if (dpMap[response.dataProvider]) {
    Object.assign(packageJson.dependencies, dpMap[response.dataProvider]);
  }

  // Add auth provider dependency
  if (response.authProvider === 'supabase' && response.dataProvider !== 'supabase') {
    packageJson.dependencies['@svadmin/supabase'] = '^0.0.6';
    packageJson.dependencies['@supabase/supabase-js'] = '^2.0.0';
  }
  if (response.authProvider === 'jwt' && response.dataProvider !== 'simple-rest') {
    packageJson.dependencies['@svadmin/simple-rest'] = '^0.0.6';
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
  fs.writeFileSync(path.join(projectDir, 'README.md'), `# ${response.projectName}

Built with [svadmin](https://github.com/zuohuadong/svadmin) — Headless Admin Framework for Svelte 5.

## Getting Started

\`\`\`bash
bun install
bun run dev
\`\`\`

## Stack

- **UI**: Svelte 5 + Shadcn Svelte + TailwindCSS
- **Data**: ${response.dataProvider === 'simple-rest' ? 'Simple REST' : response.dataProvider === 'supabase' ? 'Supabase' : response.dataProvider === 'graphql' ? 'GraphQL' : 'Custom'} DataProvider
- **Auth**: ${response.authProvider === 'mock' ? 'Mock (demo)' : response.authProvider === 'jwt' ? 'JWT' : response.authProvider === 'supabase' ? 'Supabase Auth' : 'None'}
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

init().catch(console.error);
