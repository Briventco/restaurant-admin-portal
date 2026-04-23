import { request } from '../services/api';

export const onboardingApi = {
  async signup(payload) {
    return request('/auth/restaurant-signup', {
      method: 'POST',
      body: JSON.stringify({
        restaurantName: payload.restaurantName,
        restaurantId: payload.restaurantId,
        adminDisplayName: payload.adminDisplayName,
        adminEmail: payload.adminEmail,
        adminPassword: payload.adminPassword,
        phone: payload.phone,
        address: payload.address,
        timezone: payload.timezone,
        openingHours: payload.openingHours,
        closingHours: payload.closingHours,
      }),
    });
  },

  async getSummary(restaurantId) {
    return request(`/restaurants/${restaurantId}/restaurant/onboarding`, {
      method: 'GET',
    });
  },

  async complete(restaurantId) {
    return request(`/restaurants/${restaurantId}/restaurant/onboarding`, {
      method: 'PATCH',
      body: JSON.stringify({
        action: 'complete',
      }),
    });
  },
};

export default onboardingApi;
