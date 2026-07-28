/** Production Pages origin (canonical / OG / JSON-LD). Local sticky preview stays at `/`. */
export const SITE_ORIGIN = 'https://axiqom.github.io';
export const SITE_BASE_PATH = '/brevion';
export const SITE_URL = `${SITE_ORIGIN}${SITE_BASE_PATH}`;

export const CONTACT_EMAIL = 'sales@brevion.com';
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;

/**
 * Real phone only. Empty until Mendel supplies one — never invent 555 / placeholders.
 * Can also be set via PUBLIC_PHONE at build time.
 */
export const PUBLIC_PHONE = (
  typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_PHONE
    ? String(import.meta.env.PUBLIC_PHONE).trim()
    : ''
);

export const OG_IMAGE_PATH = 'hero-cnc.jpg';

/** Absolute URL under the Pages base (always production canonicals for crawlers). */
export function absoluteUrl(path = ''): string {
  if (!path || path === '/') return `${SITE_URL}/`;
  const trimmed = path.replace(/^\/+/, '').replace(/\/+$/, '');
  return `${SITE_URL}/${trimmed}`;
}

export function absoluteAsset(path: string): string {
  const trimmed = path.replace(/^\/+/, '');
  return `${SITE_URL}/${trimmed}`;
}
