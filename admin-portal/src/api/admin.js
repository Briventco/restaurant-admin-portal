import { request } from '../services/api';

function mapOnboardedRestaurant(payload = {}) {
  return {
    id: payload.id || '',
    name: payload.name || '',
    email: payload.email || '',
    phone: payload.phone || '',
    address: payload.address || '',
    timezone: payload.timezone || 'Africa/Lagos',
    plan: payload.plan || 'Starter',
    openingHours: payload.openingHours || '08:00',
    closingHours: payload.closingHours || '22:00',
  };
}

function mapOnboardedAdminUser(payload = {}) {
  return {
    uid: payload.uid || '',
    email: payload.email || '',
    displayName: payload.displayName || '',
    role: payload.role || '',
    restaurantId: payload.restaurantId || '',
  };
}

export const adminApi = {
  async createRestaurant(payload) {
    const response = await request('/admin/restaurants', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      success: Boolean(response.success),
      restaurant: mapOnboardedRestaurant(response.restaurant),
      adminUser: mapOnboardedAdminUser(response.adminUser),
      onboarding: response.onboarding || {},
    };
  },

  async listSessions() {
    const response = await request('/admin/sessions', {
      method: 'GET',
    });

    return Array.isArray(response.items) ? response.items : [];
  },

  async restartSession(restaurantId) {
    const response = await request(`/admin/sessions/${restaurantId}/restart`, {
      method: 'POST',
    });

    return response.session || null;
  },

  async disconnectSession(restaurantId) {
    const response = await request(`/admin/sessions/${restaurantId}/disconnect`, {
      method: 'POST',
    });

    return response.session || null;
  },

  async listOutboxMessages(status = '') {
    const suffix = status ? `?status=${encodeURIComponent(status)}` : '';
    const response = await request(`/admin/outbox${suffix}`, {
      method: 'GET',
    });

    return Array.isArray(response.items) ? response.items : [];
  },

  async listRoutingAudits({ restaurantId = '', limit = 50 } = {}) {
    const params = new URLSearchParams();
    if (restaurantId) {
      params.set('restaurantId', restaurantId);
    }
    if (limit) {
      params.set('limit', String(limit));
    }

    const suffix = params.toString() ? `?${params.toString()}` : '';
    const response = await request(`/admin/routing-audits${suffix}`, {
      method: 'GET',
    });

    return Array.isArray(response.items) ? response.items : [];
  },

  async getHealthMonitor() {
    const response = await request('/admin/health-monitor', {
      method: 'GET',
    });

    return {
      items: Array.isArray(response.items) ? response.items : [],
      events: Array.isArray(response.events) ? response.events : [],
    };
  },

  async recheckRestaurantHealth(restaurantId) {
    const response = await request(`/admin/restaurants/${restaurantId}/health/recheck`, {
      method: 'POST',
    });

    return response.health || null;
  },

  async retryOutboxMessage(messageId) {
    const response = await request(`/admin/outbox/messages/${messageId}/retry`, {
      method: 'POST',
    });

    return response.message || null;
  },
};

export default adminApi;
