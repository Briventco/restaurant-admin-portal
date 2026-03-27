import { apiClient } from './client';
import { getStore, simulateNetwork } from './mockStore';

export const deliveryZonesApi = {
  listByRestaurant: async (restaurantId) => {
    if (!apiClient.useMock) {
      return apiClient.get(`/restaurants/${restaurantId}/delivery-zones`);
    }

    const store = getStore();
    const zones = store.deliveryZones.filter((item) => item.restaurantId === restaurantId);
    return simulateNetwork(zones);
  },

  addZone: async (restaurantId, payload) => {
    if (!apiClient.useMock) {
      return apiClient.post(`/restaurants/${restaurantId}/delivery-zones`, payload);
    }

    const store = getStore();
    const nextZone = {
      id: `dz_${Date.now()}`,
      restaurantId,
      ...payload,
    };
    store.deliveryZones.push(nextZone);
    return simulateNetwork(nextZone);
  },

  updateZone: async (restaurantId, zoneId, payload) => {
    if (!apiClient.useMock) {
      return apiClient.patch(`/restaurants/${restaurantId}/delivery-zones/${zoneId}`, payload);
    }

    const store = getStore();
    const target = store.deliveryZones.find((item) => item.restaurantId === restaurantId && item.id === zoneId);
    if (target) {
      Object.assign(target, payload);
    }
    return simulateNetwork(target || null);
  },

  deleteZone: async (restaurantId, zoneId) => {
    if (!apiClient.useMock) {
      return apiClient.del(`/restaurants/${restaurantId}/delivery-zones/${zoneId}`);
    }

    const store = getStore();
    const index = store.deliveryZones.findIndex((item) => item.restaurantId === restaurantId && item.id === zoneId);
    if (index >= 0) {
      store.deliveryZones.splice(index, 1);
      return simulateNetwork({ success: true });
    }
    return simulateNetwork({ success: false });
  },
};
