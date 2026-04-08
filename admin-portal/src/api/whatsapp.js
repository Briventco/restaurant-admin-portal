import { request } from '../services/api';

function mapWhatsappStatus(payload = {}) {
  return {
    configured: Boolean(payload.configured),
    bindingMode: payload.bindingMode || 'unconfigured',
    provider: payload.provider || '',
    status: payload.status || 'not_configured',
    phone: payload.phone || '',
    phoneNumberId: payload.phoneNumberId || '',
    wabaId: payload.wabaId || '',
    runtimeOwner: payload.runtimeOwner || '',
    qrAvailable: Boolean(payload.qrAvailable),
    lastActive: payload.lastActive || null,
    setupMessage: payload.setupMessage || '',
    notes: payload.notes || '',
  };
}

export const whatsappApi = {
  async getStatus(restaurantId) {
    const response = await request(`/restaurants/${restaurantId}/restaurant/whatsapp-status`, {
      method: 'GET',
    });

    return mapWhatsappStatus(response.whatsapp || {});
  },

  async updateConfig(restaurantId, config) {
    const response = await request(`/restaurants/${restaurantId}/restaurant/whatsapp-config`, {
      method: 'PATCH',
      body: JSON.stringify({
        provider: config.provider || '',
        configured: Boolean(config.configured),
        phone: config.phone || '',
        phoneNumberId: config.phoneNumberId || '',
        wabaId: config.wabaId || '',
        notes: config.notes || '',
      }),
    });

    return mapWhatsappStatus(response.whatsapp || {});
  },
};

export default whatsappApi;
