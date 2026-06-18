import { request } from '../services/api';

function mapSettings(payload = {}) {
  return {
    name: payload.name || '',
    email: payload.email || '',
    phone: payload.phone || '',
    address: payload.address || '',
    timezone: payload.timezone || 'Africa/Lagos',
    openingHours: payload.openingHours || '08:00',
    closingHours: payload.closingHours || '22:00',
    acceptOrders: payload.acceptOrders !== false,
    autoConfirm: Boolean(payload.autoConfirm),
    notifyOnOrder: payload.notifyOnOrder !== false,
    customWelcomeMessage: payload.customWelcomeMessage || '',
    orderAlertRecipient:
      payload.orderAlertRecipient ||
      (Array.isArray(payload.orderAlertRecipients) && payload.orderAlertRecipients.length
        ? payload.orderAlertRecipients[0]
        : ''),
    orderAlertRecipients: Array.isArray(payload.orderAlertRecipients)
      ? payload.orderAlertRecipients
      : [],
    manualTransferEnabled: Boolean(payload.manualTransferEnabled),
    bankName: payload.bankName || '',
    accountName: payload.accountName || '',
    accountNumber: payload.accountNumber || '',
    paymentInstructions: payload.paymentInstructions || '',
  };
}

export const settingsApi = {
  async get(restaurantId) {
    const response = await request(`/restaurants/${restaurantId}/settings`, {
      method: 'GET',
    });

    return mapSettings(response.settings);
  },

  async update(restaurantId, settings) {
    const response = await request(`/restaurants/${restaurantId}/settings`, {
      method: 'PUT',
      body: JSON.stringify({
        name: settings.name,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        timezone: settings.timezone,
        openingHours: settings.openingHours,
        closingHours: settings.closingHours,
        acceptOrders: Boolean(settings.acceptOrders),
        autoConfirm: Boolean(settings.autoConfirm),
        notifyOnOrder: Boolean(settings.notifyOnOrder),
        customWelcomeMessage: settings.customWelcomeMessage,
        orderAlertRecipient: settings.orderAlertRecipient,
        orderAlertRecipients: settings.orderAlertRecipient ? [settings.orderAlertRecipient] : [],
        manualTransferEnabled: Boolean(settings.manualTransferEnabled),
        bankName: settings.bankName,
        accountName: settings.accountName,
        accountNumber: settings.accountNumber,
        paymentInstructions: settings.paymentInstructions,
      }),
    });

    return mapSettings(response.settings);
  },

  async sendTestAlert(restaurantId) {
    return request(`/restaurants/${restaurantId}/settings/order-alerts/test`, {
      method: 'POST',
    });
  },
};

export default settingsApi;
