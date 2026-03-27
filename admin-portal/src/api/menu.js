import { apiClient } from './client';
import { getStore, simulateNetwork } from './mockStore';

export const menuApi = {
  listByRestaurant: async (restaurantId) => {
    if (!apiClient.useMock) {
      return apiClient.get(`/restaurants/${restaurantId}/menu`);
    }

    const store = getStore();
    const items = store.menuItems.filter((item) => item.restaurantId === restaurantId);
    return simulateNetwork(items);
  },

  addItem: async (restaurantId, payload) => {
    if (!apiClient.useMock) {
      return apiClient.post(`/restaurants/${restaurantId}/menu`, payload);
    }

    const store = getStore();
    const nextItem = {
      id: `mi_${Date.now()}`,
      restaurantId,
      ...payload,
    };
    store.menuItems.push(nextItem);
    return simulateNetwork(nextItem);
  },

  updateItem: async (restaurantId, itemId, payload) => {
    if (!apiClient.useMock) {
      return apiClient.patch(`/restaurants/${restaurantId}/menu/${itemId}`, payload);
    }

    const store = getStore();
    const target = store.menuItems.find((item) => item.restaurantId === restaurantId && item.id === itemId);
    if (target) {
      Object.assign(target, payload);
    }
    return simulateNetwork(target || null);
  },

  deleteItem: async (restaurantId, itemId) => {
    if (!apiClient.useMock) {
      return apiClient.del(`/restaurants/${restaurantId}/menu/${itemId}`);
    }

    const store = getStore();
    const index = store.menuItems.findIndex((item) => item.restaurantId === restaurantId && item.id === itemId);
    if (index >= 0) {
      store.menuItems.splice(index, 1);
      return simulateNetwork({ success: true });
    }
    return simulateNetwork({ success: false });
  },
};
