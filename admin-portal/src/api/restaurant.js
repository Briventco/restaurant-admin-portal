import { request } from '../services/api';

function mapRestaurant(payload = {}) {
  return {
    id: payload.id || payload.restaurantId || '',
    restaurantId: payload.restaurantId || payload.id || '',
    name: payload.name || 'Restaurant',
    email: payload.email || '',
    phone: payload.phone || '',
    address: payload.address || '',
    timezone: payload.timezone || 'Africa/Lagos',
    plan: payload.plan || 'Starter',
    bot: payload.bot || {},
  };
}

export const restaurantApi = {
  async getCurrent(restaurantId) {
    const response = await request(`/restaurants/${restaurantId}/restaurant`, {
      method: 'GET',
    });

    return mapRestaurant(response.restaurant);
  },
};

export default restaurantApi;
