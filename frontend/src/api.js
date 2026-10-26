const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function getToken() {
  return localStorage.getItem('awdf_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('awdf_token', token);
  else localStorage.removeItem('awdf_token');
}

export async function apiRequest(path, options = {}) {
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error('Cannot reach the backend. Check that the server is running on port 5000.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login' && path !== '/auth/register') {
      setToken(null);
      window.dispatchEvent(new Event('awdf:unauthorized'));
    }
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

export { API_BASE };
