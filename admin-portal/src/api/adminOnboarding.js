import { request } from '../services/api';

export const adminOnboardingApi = {
  /**
   * Super admin creates a fully-configured restaurant in one shot.
   * The restaurant is auto-approved; the owner only needs to log in and scan QR.
   */
  async createRestaurant({
    restaurantName,
    adminEmail,
    adminPassword,
    adminDisplayName,
    phone = '',
    address = '',
    timezone = 'Africa/Lagos',
    openingHours = '08:00',
    closingHours = '22:00',
    currency = 'NGN',
    alertPhone = '',
    menuItems = [],
    deliveryZones = [],
  }) {
    return request('/admin/onboard', {
      method: 'POST',
      body: JSON.stringify({
        restaurantName,
        adminEmail,
        adminPassword,
        adminDisplayName,
        phone,
        address,
        timezone,
        openingHours,
        closingHours,
        currency,
        alertPhone,
        menuItems,
        deliveryZones,
      }),
    });
  },
};

export default adminOnboardingApi;
