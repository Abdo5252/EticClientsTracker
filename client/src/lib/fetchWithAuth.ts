
/**
 * Utility for making authenticated API requests
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    credentials: 'include', // Always include credentials for auth
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
}
