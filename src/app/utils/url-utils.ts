import { environment } from "../environments/environment";

/** Gibt immer eine absolute URL für Bilder/Videos zurück */
export function toAbsoluteUrl(path: string): string {
  if (!path) return '';
  // Wenn schon http(s), dann ist es bereits absolut
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Fallback: Trailing slash entfernen, falls doppelt
  const base = environment.mediaBaseUrl.replace(/\/$/, '');
  return `${base}${path}`;
}