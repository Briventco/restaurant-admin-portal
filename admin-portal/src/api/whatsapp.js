import { request } from '../services/api';

function mapWhatsappStatus(payload = {}) {
  return {
    configured: Boolean(payload.configured),
    bindingMode: payload.bindingMode || 'unconfigured',
    provider: payload.provider || '',
    status: payload.status || 'not_configured',
    provisioningState: payload.provisioningState || 'unassigned',
    activationReady: Boolean(payload.activationReady),
    provisioningTransitions: Array.isArray(payload.provisioningTransitions) ? payload.provisioningTransitions : [],
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

function mapSession(payload = {}) {
  return {
    restaurantId: payload.restaurantId || '',
    status: payload.status || 'disconnected',
    qrAvailable: Boolean(payload.qrAvailable),
    qrGeneratedAt: payload.qrGeneratedAt || null,
    qrExpiresAt: payload.qrExpiresAt || null,
    lastConnectedAt: payload.lastConnectedAt || null,
    lastDisconnectedAt: payload.lastDisconnectedAt || null,
    lastError: payload.lastError || '',
    phoneNumber: payload.phoneNumber || payload.phone || '',
    runtimeOwner: payload.runtimeOwner || '',
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
        provisioningState: config.provisioningState || 'unassigned',
        phone: config.phone || '',
        phoneNumberId: config.phoneNumberId || '',
        wabaId: config.wabaId || '',
        notes: config.notes || '',
      }),
    });

    return mapWhatsappStatus(response.whatsapp || {});
  },

  async getSessionStatus(restaurantId) {
    const response = await request(`/restaurants/${restaurantId}/whatsapp/session/status`, {
      method: 'GET',
    });

    return mapSession(response.session || {});
  },

  async startSession(restaurantId) {
    const response = await request(`/restaurants/${restaurantId}/whatsapp/session/start`, {
      method: 'POST',
    });

    return mapSession(response.session || {});
  },

  async restartSession(restaurantId) {
    const response = await request(`/restaurants/${restaurantId}/whatsapp/session/restart`, {
      method: 'POST',
      body: JSON.stringify({}),
    });

    return mapSession(response.session || {});
  },

  async disconnectSession(restaurantId, reason = '') {
    const response = await request(`/restaurants/${restaurantId}/whatsapp/session/disconnect`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });

    return mapSession(response.session || {});
  },

  async getQr(restaurantId, includeImage = false) {
    const response = await request(
      `/restaurants/${restaurantId}/whatsapp/session/qr?includeImage=${includeImage ? 'true' : 'false'}`,
      {
        method: 'GET',
      }
    );

    return response.qr || null;
  },
};

export default whatsappApi;
