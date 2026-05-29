import { request } from '../services/api';

export const verificationApi = {
  /** Restaurant admin: resubmit after rejection */
  async resubmit(restaurantId) {
    return request(`/restaurants/${restaurantId}/verification/resubmit`, {
      method: 'POST',
    });
  },

  /** Super admin: count of pending restaurants (for sidebar badge) */
  async getPendingCount() {
    const data = await request('/admin/verification/pending-count', { method: 'GET' });
    return typeof data.count === 'number' ? data.count : 0;
  },

  /** Super admin: list all pending restaurants */
  async getPending() {
    const data = await request('/admin/verification/pending', { method: 'GET' });
    return Array.isArray(data.restaurants) ? data.restaurants : [];
  },

  /** Super admin: approve or reject a restaurant */
  async verify(restaurantId, { action, reason = '' }) {
    return request(`/admin/restaurants/${restaurantId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    });
  },
};

export default verificationApi;
