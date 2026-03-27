const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';

const request = async (method, path, payload) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${method} ${path}`);
  }

  return response.json();
};

export const apiClient = {
  baseUrl: API_BASE_URL,
  useMock: USE_MOCK_API,
  get: (path) => request('GET', path),
  post: (path, payload) => request('POST', path, payload),
  patch: (path, payload) => request('PATCH', path, payload),
  put: (path, payload) => request('PUT', path, payload),
  del: (path) => request('DELETE', path),
};
