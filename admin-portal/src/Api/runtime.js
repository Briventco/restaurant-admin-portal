const API_BASE_URL = typeof window !== 'undefined' && window._env_ 
  ? window._env_.REACT_APP_API_URL 
  : (process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:3000/api');

const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const runtimeApi = {
  async getSuperAdminDashboard() {
    return apiRequest('/admin/dashboard');
  },
};