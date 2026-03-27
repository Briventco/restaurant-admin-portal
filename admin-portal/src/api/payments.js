import { apiClient } from './client';
import { getStore, simulateNetwork } from './mockStore';

export const paymentsApi = {
  listByRestaurant: async (restaurantId) => {
    if (!apiClient.useMock) {
      return apiClient.get(`/restaurants/${restaurantId}/payments`);
    }

    const store = getStore();
    const payments = store.payments.filter((item) => item.restaurantId === restaurantId);
    return simulateNetwork(payments);
  },

  updateStatus: async (restaurantId, paymentId, status) => {
    if (!apiClient.useMock) {
      return apiClient.patch(`/restaurants/${restaurantId}/payments/${paymentId}/status`, { status });
    }

    const store = getStore();
    const payment = store.payments.find((item) => item.restaurantId === restaurantId && item.id === paymentId);
    if (payment) {
      payment.status = status;
    }
    return simulateNetwork(payment || null);
  },
};
