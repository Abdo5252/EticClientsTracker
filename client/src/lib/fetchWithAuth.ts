
import { auth } from './firebase';

/**
 * Utility for making authenticated API requests with Firebase Auth
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Get the current user token
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  
  // If we have a token, add it to the Authorization header
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  return fetch(url, {
    ...options,
    headers
  });
}
