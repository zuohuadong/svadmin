// Minimal hash router for Svelte 5 runes mode

interface RouteMatch {
  route: string;
  params: Record<string, string>;
}

// Parse route pattern like /products/edit/:id into regex
function compileRoute(pattern: string): { regex: RegExp; keys: string[] } {
  const keys: string[] = [];
  const regexStr = pattern
    .replace(/:(\w+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    })
    .replace(/\//g, '\\/');
  return { regex: new RegExp(`^${regexStr}$`), keys };
}

export function matchRoute(
  hash: string,
  routes: string[]
): RouteMatch | null {
  const path = hash.replace(/^#/, '') || '/';

  for (const pattern of routes) {
    const { regex, keys } = compileRoute(pattern);
    const match = path.match(regex);
    if (match) {
      const params: Record<string, string> = {};
      keys.forEach((key, i) => {
        params[key] = match[i + 1];
      });
      return { route: pattern, params };
    }
  }
  return null;
}

export function navigate(path: string): void {
  window.location.hash = path;
}

export function currentPath(): string {
  return window.location.hash.replace(/^#/, '') || '/';
}
