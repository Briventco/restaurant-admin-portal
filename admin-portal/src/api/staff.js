import { request } from '../services/api';

export const staffApi = {
  /**
   * List all staff for a restaurant.
   */
  async listByRestaurant(restaurantId) {
    const data = await request(`/restaurants/${restaurantId}/staff`, { method: 'GET' });
    return Array.isArray(data.staff) ? data.staff : [];
  },

  /**
   * Create a new staff user.
   * @param {string} restaurantId
   * @param {{ displayName, email, password, phone?, jobTitle? }} staffData
   */
  async create(restaurantId, staffData) {
    const data = await request(`/restaurants/${restaurantId}/staff`, {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
    return data.staff;
  },

  /**
   * Update a staff member.
   * @param {string} restaurantId
   * @param {string} staffId  (Firebase UID)
   * @param {{ displayName?, phone?, jobTitle?, isActive? }} updates
   */
  async update(restaurantId, staffId, updates) {
    const data = await request(`/restaurants/${restaurantId}/staff/${staffId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return data.staff;
  },

  /**
   * Deactivate (soft-delete) a staff member.
   */
  async remove(restaurantId, staffId) {
    const data = await request(`/restaurants/${restaurantId}/staff/${staffId}`, {
      method: 'DELETE',
    });
    return data;
  },
};

export default staffApi;
