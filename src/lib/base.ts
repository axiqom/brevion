/** Normalized site base that always ends with `/` (e.g. `/` or `/milltrue/`). */
export const baseUrl = (() => {
  const raw = import.meta.env.BASE_URL || '/';
  return raw.endsWith('/') ? raw : `${raw}/`;
})();

/** Join a site-relative path onto the configured base (leading slash optional). */
export function withBase(path = ''): string {
  if (!path || path === '/') return baseUrl;
  // Preserve hash-only anchors as base + #hash (e.g. /milltrue/#about)
  if (path.startsWith('#')) return `${baseUrl}${path}`;
  const trimmed = path.replace(/^\/+/, '');
  return `${baseUrl}${trimmed}`;
}
