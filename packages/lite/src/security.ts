/**
 * Convert untrusted display values to text. Callers must render the result with
 * normal Svelte interpolation so the framework escapes markup characters.
 */
export function toSafeText(value: unknown, fallback = ''): string {
  return value === null || value === undefined ? fallback : String(value);
}

const URI_SCHEME = /^([a-z][a-z\d+.-]*):/iu;
const SAFE_HREF_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);

function hasUnsafeHrefCharacters(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (
      codePoint <= 0x1f
      || (codePoint >= 0x7f && codePoint <= 0x9f)
      || (codePoint >= 0x200b && codePoint <= 0x200f)
      || (codePoint >= 0x2028 && codePoint <= 0x202e)
      || codePoint === 0x2060
      || codePoint === 0xfeff
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Convert an untrusted value into a navigation-safe href.
 *
 * Relative references are preserved. Absolute references are limited to
 * http(s), mailto, tel, and browser-created http(s) blob URLs. Any control or
 * invisible character fails closed before scheme parsing so browsers cannot
 * normalize an executable protocol after validation.
 */
export function toSafeHref(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;

  const href = String(value).trim();
  if (!href || hasUnsafeHrefCharacters(href)) return undefined;

  const scheme = URI_SCHEME.exec(href)?.[1]?.toLowerCase();
  if (!scheme) return href;

  if (scheme === 'blob') {
    try {
      const blobUrl = new URL(href);
      const innerProtocol = new URL(blobUrl.pathname).protocol;
      return innerProtocol === 'http:' || innerProtocol === 'https:' ? href : undefined;
    } catch {
      return undefined;
    }
  }

  if (!SAFE_HREF_SCHEMES.has(scheme)) return undefined;

  try {
    return new URL(href).protocol === `${scheme}:` ? href : undefined;
  } catch {
    return undefined;
  }
}
