import { request } from '../services/api';

export const adminOnboardingApi = {
  /**
   * Super admin creates a fully-configured restaurant in one shot.
   * The restaurant is auto-approved; the owner only needs to log in and scan QR.
   */
  async createRestaurant({
    restaurantName,
    adminEmail,
    adminDisplayName,
    phone = '',
    alertPhone = '',
    orderAlertRecipient = '',
    address = '',
    timezone = 'Africa/Lagos',
    openingHours = '08:00',
    closingHours = '22:00',
    currency = 'NGN',
    menuItems = [],
    deliveryZones = [],
  }) {
    return request('/admin/onboard', {
      method: 'POST',
      body: JSON.stringify({
        restaurantName,
        adminEmail,
        adminDisplayName,
        phone,
        alertPhone,
        orderAlertRecipient,
        address,
        timezone,
        openingHours,
        closingHours,
        currency,
        menuItems,
        deliveryZones,
      }),
    });
  },
};

export default adminOnboardingApi;
