import { request } from '../services/api';

export const billingApi = {
  async getStatus(restaurantId) {
    const response = await request(`/restaurants/${restaurantId}/billing`, {
      method: 'GET',
    });
    return response.billing;
  },

  async reportPayment(restaurantId) {
    const response = await request(`/restaurants/${restaurantId}/billing/report-payment`, {
      method: 'POST',
    });
    return response.billing;
  },

  async pay(restaurantId) {
    const response = await request(`/restaurants/${restaurantId}/billing/pay`, {
      method: 'POST',
    });
    return { paymentLink: response.paymentLink, txRef: response.txRef };
  },

  async listPending() {
    const response = await request('/admin/billing/pending', {
      method: 'GET',
    });
    return response.pending;
  },

  async listAll() {
    const response = await request('/admin/billing/all', {
      method: 'GET',
    });
    return response.restaurants;
  },

  async approve(restaurantId, note = '') {
    const response = await request(`/admin/billing/restaurants/${restaurantId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
    return response.billing;
  },

  async reject(restaurantId, reason = '') {
    const response = await request(`/admin/billing/restaurants/${restaurantId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return response.billing;
  },
};
