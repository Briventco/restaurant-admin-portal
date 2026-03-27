import { apiClient } from './client';
import { getStore, simulateNetwork } from './mockStore';

export const ordersApi = {
  listByRestaurant: async (restaurantId, { status } = {}) => {
    if (!apiClient.useMock) {
      const query = status ? `?status=${status}` : '';
      return apiClient.get(`/restaurants/${restaurantId}/orders${query}`);
    }

    const store = getStore();
    let orders = store.orders.filter((item) => item.restaurantId === restaurantId);
    if (status && status !== 'all') {
      orders = orders.filter((item) => item.status === status);
    }
    return simulateNetwork(orders);
  },

  getById: async (restaurantId, orderId) => {
    if (!apiClient.useMock) {
      return apiClient.get(`/restaurants/${restaurantId}/orders/${orderId}`);
    }

    const store = getStore();
    const order = store.orders.find((item) => item.restaurantId === restaurantId && item.id === orderId);
    return simulateNetwork(order || null);
  },

  updateStatus: async (restaurantId, orderId, status) => {
    if (!apiClient.useMock) {
      return apiClient.patch(`/restaurants/${restaurantId}/orders/${orderId}/status`, { status });
    }

    const store = getStore();
    const order = store.orders.find((item) => item.restaurantId === restaurantId && item.id === orderId);
    if (order) {
      order.status = status;
    }
    return simulateNetwork(order || null);
  },

  updatePaymentStatus: async (restaurantId, orderId, paymentStatus) => {
    if (!apiClient.useMock) {
      return apiClient.patch(`/restaurants/${restaurantId}/orders/${orderId}/payment-status`, { paymentStatus });
    }

    const store = getStore();
    const order = store.orders.find((item) => item.restaurantId === restaurantId && item.id === orderId);
    if (order) {
      order.paymentStatus = paymentStatus;
    }
    return simulateNetwork(order || null);
  },
};
