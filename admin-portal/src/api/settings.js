import { request } from '../services/api';

function mapSettings(payload = {}) {
  return {
    name: payload.name || '',
    email: payload.email || '',
    phone: payload.phone || '',
    address: payload.address || '',
    openingHours: payload.openingHours || '08:00',
    closingHours: payload.closingHours || '22:00',
    acceptOrders: payload.acceptOrders !== false,
    autoConfirm: Boolean(payload.autoConfirm),
    notifyOnOrder: payload.notifyOnOrder !== false,
    demoNumberSellerEnabled: payload.demoNumberSellerEnabled === true,
    orderAlertRecipients: Array.isArray(payload.orderAlertRecipients)
      ? payload.orderAlertRecipients.join('\n')
      : '',
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
        openingHours: settings.openingHours,
        closingHours: settings.closingHours,
        acceptOrders: Boolean(settings.acceptOrders),
        autoConfirm: Boolean(settings.autoConfirm),
        notifyOnOrder: Boolean(settings.notifyOnOrder),
        demoNumberSellerEnabled: Boolean(settings.demoNumberSellerEnabled),
        orderAlertRecipients: String(settings.orderAlertRecipients || '')
          .split(/\r?\n|,/)
          .map((value) => value.trim())
          .filter(Boolean),
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
