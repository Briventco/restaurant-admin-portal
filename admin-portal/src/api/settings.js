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
    automaticPayment: {
      enabled: Boolean(payload.automaticPayment?.enabled),
      bankCode: payload.automaticPayment?.bankCode || '',
      bankName: payload.automaticPayment?.bankName || '',
      accountNumber: payload.automaticPayment?.accountNumber || '',
      accountName: payload.automaticPayment?.accountName || '',
      businessName: payload.automaticPayment?.businessName || '',
      configured: Boolean(payload.automaticPayment?.configured),
    },
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

  async listBanks(restaurantId) {
    const response = await request(`/restaurants/${restaurantId}/settings/payment/banks`, {
      method: 'GET',
    });
    return Array.isArray(response.banks) ? response.banks : [];
  },

  async resolveAccount(restaurantId, { bankCode, accountNumber }) {
    const response = await request(`/restaurants/${restaurantId}/settings/payment/resolve-account`, {
      method: 'POST',
      body: JSON.stringify({ bankCode, accountNumber }),
    });
    return response.accountName;
  },

  async setupAutomaticPayment(restaurantId, { bankCode, bankName, accountNumber, businessName }) {
    const response = await request(`/restaurants/${restaurantId}/settings/payment/automatic-setup`, {
      method: 'POST',
      body: JSON.stringify({ bankCode, bankName, accountNumber, businessName }),
    });
    return mapSettings(response.settings);
  },

  async toggleAutomaticPayment(restaurantId, enabled) {
    const response = await request(`/restaurants/${restaurantId}/settings/payment/automatic-toggle`, {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
    return mapSettings(response.settings);
  },
};

export default settingsApi;
