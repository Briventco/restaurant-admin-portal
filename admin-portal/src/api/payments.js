import { request } from '../services/api';

export const paymentsApi = {
  async listReceipts(restaurantId, orderId) {
    const response = await request(`/restaurants/${restaurantId}/orders/${orderId}/payment-receipts`, {
      method: 'GET',
    });

    return Array.isArray(response.receipts) ? response.receipts : [];
  },

  async confirmPayment(restaurantId, orderId, note = '') {
    return request(`/restaurants/${restaurantId}/orders/${orderId}/payment-review/confirm`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  },

  async rejectPayment(restaurantId, orderId, reason = '', note = '') {
    return request(`/restaurants/${restaurantId}/orders/${orderId}/payment-review/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, note }),
    });
  },
};

export default paymentsApi;
