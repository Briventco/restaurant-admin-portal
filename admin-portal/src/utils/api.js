const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = {
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response.json();
  },
  post: async (endpoint, data) => {
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