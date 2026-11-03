import { environment } from "../environments/environment";

/** Always returns an absolute URL for images/videos */
export function toAbsoluteUrl(path: string): string {
  if (!path) return '';
  // Already http(s), so it is absolute
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Fallback: Trailing slash entfernen, falls doppelt
  const base = environment.mediaBaseUrl.replace(/\/$/, '');
  return `${base}${path}`;
}