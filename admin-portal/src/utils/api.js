const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';

export const api = {
  get: async (endpoint) => {
    if (USE_MOCK_API) {
      console.warn('[Mock API] GET', endpoint);
      return { success: true, data: null };
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response.json();
  },
  post: async (endpoint, data) => {
    if (USE_MOCK_API) {
      console.warn('[Mock API] POST', endpoint, data);
      return { success: true, data: null };
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

export const mockOrders = [
  { id: '#ORD-001', customer: 'John Samuel', amount: 45.00, status: 'Completed' },
  { id: '#ORD-002', customer: 'Isola Enoch', amount: 120.00, status: 'Pending' },
];