import { apiClient } from './client';
import { getStore, simulateNetwork } from './mockStore';

export const restaurantsApi = {
  list: async () => {
    if (!apiClient.useMock) {
      return apiClient.get('/restaurants');
    }
    const store = getStore();
    return simulateNetwork(store.restaurants);
  },

  getById: async (restaurantId) => {
    if (!apiClient.useMock) {
      return apiClient.get(`/restaurants/${restaurantId}`);
    }
    const store = getStore();
    const restaurant = store.restaurants.find((item) => item.id === restaurantId);
    return simulateNetwork(restaurant || null);
  },

  setStatus: async (restaurantId, status) => {
    if (!apiClient.useMock) {
      return apiClient.patch(`/restaurants/${restaurantId}/status`, { status });
    }

    const store = getStore();
    const target = store.restaurants.find((item) => item.id === restaurantId);
    if (target) {
      target.status = status;
      target.lastActivity = new Date().toISOString();
    }
    return simulateNetwork(target || null);
  },

  getSettings: async (restaurantId) => {
    if (!apiClient.useMock) {
      return apiClient.get(`/restaurants/${restaurantId}/settings`);
    }

    const store = getStore();
    return simulateNetwork(store.settings[restaurantId] || null);
  },

  updateSettings: async (restaurantId, payload) => {
    if (!apiClient.useMock) {
      return apiClient.put(`/restaurants/${restaurantId}/settings`, payload);
    }

    const store = getStore();
    const current = store.settings[restaurantId] || {};
    store.settings[restaurantId] = { ...current, ...payload };
    return simulateNetwork(store.settings[restaurantId]);
  },
};
