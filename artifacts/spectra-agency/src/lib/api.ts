import { setBaseUrl } from '@workspace/api-client-react';

/**
 * Resolves API URL with optional VITE_API_BASE_URL environment variable.
 * If VITE_API_BASE_URL is set (e.g. https://api.yourdomain.com), it prepends it.
 * If not set, it keeps relative /api/... URLs (ideal for Netlify proxy rewrites or local dev).
 */
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

// Synchronize base URL with the api-client-react query library
if (API_BASE) {
  setBaseUrl(API_BASE);
}

export function apiUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${cleanPath}` : cleanPath;
}
