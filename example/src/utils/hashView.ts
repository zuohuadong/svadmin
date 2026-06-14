export function readHashView(defaultView = 'default'): string {
  if (typeof window === 'undefined') return defaultView;

  const query = window.location.hash.split('?')[1] ?? '';
  return new URLSearchParams(query).get('view') ?? defaultView;
}
