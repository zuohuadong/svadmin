export function readHashParam(name: string): string | null {
  if (typeof window === 'undefined') return null;

  const query = window.location.hash.split('?')[1] ?? '';
  return new URLSearchParams(query).get(name);
}

export function readHashView(defaultView = 'default'): string {
  return readHashParam('view') ?? defaultView;
}
