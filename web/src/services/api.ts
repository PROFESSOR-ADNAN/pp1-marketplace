const DEFAULT_API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://souq-api-xxdp.onrender.com';

const rawApiUrl = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
const API_BASE = `${rawApiUrl}/api/v1`;

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('souq_token');
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errorMessage = '';

    if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      errorMessage = errorData.errors
        .map((e: any) => e.message || (e.path ? `${e.path.join('.')}: ${e.message}` : JSON.stringify(e)))
        .join(', ');
    } else if (typeof errorData.detail === 'string') {
      errorMessage = errorData.detail;
    } else if (typeof errorData.message === 'string') {
      errorMessage = errorData.message;
    } else if (typeof errorData.error === 'string') {
      errorMessage = errorData.error;
    } else if (errorData.detail && typeof errorData.detail === 'object') {
      errorMessage = JSON.stringify(errorData.detail);
    } else if (errorData.message && typeof errorData.message === 'object') {
      errorMessage = JSON.stringify(errorData.message);
    } else {
      errorMessage = `Request failed with status ${response.status}`;
    }

    throw new Error(errorMessage);
  }

  return response.json();
};
