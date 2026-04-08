import { request } from '../services/api';

function formatJoinedLabel(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-NG', {
    month: 'short',
    year: 'numeric',
  });
}

function formatRelativeDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString();
}

function mapRestaurantListItem(payload = {}) {
  return {
    id: payload.id || payload.restaurantId || '',
    name: payload.name || 'Restaurant',
    owner: payload.owner || payload.ownerEmail || 'Unassigned',
    email: payload.email || payload.ownerEmail || '',
    phone: payload.phone || '',
    address: payload.address || '',
    status: payload.status || 'active',
    activationState: payload.activationState || 'draft',
    activationNote: payload.activationNote || '',
    healthStatus: payload.healthStatus || 'unknown',
    healthIssues: Array.isArray(payload.healthIssues) ? payload.healthIssues : [],
    healthLastCheckedAt: payload.healthLastCheckedAt || null,
    activationValidation: payload.activationValidation || {
      summary: { blockerCount: 0, warningCount: 0, completedCount: 0, totalCount: 0, isFullyValid: false },
      checklist: { completedCount: 0, totalCount: 0, ready: false, items: [] },
      sections: {},
    },
    orders: Number(payload.orders || 0),
    revenue: `N${Number(payload.revenue || 0).toLocaleString()}`,
    city: payload.city || '',
    joined: payload.joined || formatJoinedLabel(payload.createdAt),
    whatsappStatus: payload.whatsappStatus || 'disconnected',
    whatsappBindingMode: payload.whatsappBindingMode || 'unconfigured',
    lastActivity: formatRelativeDate(payload.updatedAt || payload.createdAt),
    timezone: payload.timezone || 'Africa/Lagos',
    plan: payload.plan || 'Starter',
  };
}

function mapOrder(payload = {}) {
  const createdAt = payload.createdAt ? new Date(payload.createdAt) : null;

  return {
    id: payload.id || '',
    customer: payload.customer || 'Customer',
    amount: Number(payload.amount || 0),
    status: payload.status || 'pending_confirmation',
    items: payload.items || '',
    time: createdAt && !Number.isNaN(createdAt.getTime())
      ? createdAt.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
      : '',
    date: createdAt && !Number.isNaN(createdAt.getTime())
      ? createdAt.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
      : '',
    createdAt: payload.createdAt || null,
  };
}

function mapPayment(payload = {}) {
  return {
    id: payload.id || payload.orderId || '',
    orderId: payload.orderId || '',
    customer: payload.customer || 'Customer',
    amount: Number(payload.amount || 0),
    method: payload.method || 'Not configured',
    status: payload.status || 'confirmed',
    date: payload.date
      ? new Date(payload.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
      : '',
  };
}

function mapMenuItem(payload = {}) {
  return {
    id: payload.id || '',
    name: payload.name || 'Menu item',
    category: payload.category || 'Uncategorized',
    price: Number(payload.price || 0),
    available: payload.available !== false,
    description: payload.description || '',
  };
}

function mapDeliveryZone(payload = {}) {
  return {
    id: payload.id || '',
    name: payload.name || 'Zone',
    fee: Number(payload.fee || 0),
    minOrder: Number(payload.minOrder || 0),
    active: payload.enabled !== false && payload.active !== false,
  };
}

function mapRestaurantDetail(payload = {}) {
  return {
    id: payload.restaurant?.id || payload.restaurant?.restaurantId || '',
    name: payload.restaurant?.name || 'Restaurant',
    owner: payload.restaurant?.owner || payload.restaurant?.ownerEmail || 'Unassigned',
    email: payload.restaurant?.email || '',
    phone: payload.restaurant?.phone || '',
    address: payload.restaurant?.address || '',
    status: payload.restaurant?.status || 'active',
    activationState: payload.restaurant?.activationState || 'draft',
    activationNote: payload.restaurant?.activationNote || '',
    healthStatus: payload.restaurant?.healthStatus || 'unknown',
    healthIssues: Array.isArray(payload.restaurant?.healthIssues) ? payload.restaurant.healthIssues : [],
    healthLastCheckedAt: payload.restaurant?.healthLastCheckedAt || null,
    activationChecklist: payload.restaurant?.activationChecklist || { completedCount: 0, totalCount: 0, ready: false, items: [] },
    activationValidation: payload.restaurant?.activationValidation || {
      summary: { blockerCount: 0, warningCount: 0, completedCount: 0, totalCount: 0, isFullyValid: false },
      checklist: { completedCount: 0, totalCount: 0, ready: false, items: [] },
      sections: {},
    },
    plan: payload.restaurant?.plan || 'Starter',
    orders: Number(payload.restaurant?.orders || 0),
    revenue: `N${Number(payload.restaurant?.revenue || 0).toLocaleString()}`,
    joined: payload.restaurant?.joined || formatJoinedLabel(payload.restaurant?.createdAt),
    whatsappStatus: payload.whatsapp?.status || payload.restaurant?.whatsappStatus || 'disconnected',
    whatsappBindingMode: payload.whatsapp?.bindingMode || payload.restaurant?.whatsappBindingMode || 'unconfigured',
    city: payload.restaurant?.city || '',
    menuItemCount: Array.isArray(payload.menuItems) ? payload.menuItems.length : 0,
    deliveryZones: Array.isArray(payload.deliveryZones)
      ? payload.deliveryZones.map((zone) => zone.name)
      : [],
  };
}

export const restaurantsApi = {
  async list() {
    const response = await request('/admin/restaurants', {
      method: 'GET',
    });

    return Array.isArray(response.items) ? response.items.map(mapRestaurantListItem) : [];
  },

  async getById(restaurantId) {
    const response = await request(`/admin/restaurants/${restaurantId}`, {
      method: 'GET',
    });

    return {
      restaurant: mapRestaurantDetail(response),
      orders: Array.isArray(response.orders) ? response.orders.map(mapOrder) : [],
      payments: Array.isArray(response.payments) ? response.payments.map(mapPayment) : [],
      menuItems: Array.isArray(response.menuItems) ? response.menuItems.map(mapMenuItem) : [],
      deliveryZones: Array.isArray(response.deliveryZones)
        ? response.deliveryZones.map(mapDeliveryZone)
        : [],
      healthEvents: Array.isArray(response.healthEvents) ? response.healthEvents : [],
      whatsapp: response.whatsapp || { status: 'disconnected', phone: '', lastActive: null },
      users: Array.isArray(response.users) ? response.users : [],
    };
  },

  async updateWhatsappConfig(restaurantId, config) {
    const response = await request(`/admin/restaurants/${restaurantId}/whatsapp-config`, {
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

    return response.whatsapp || null;
  },

  async updateLifecycle(restaurantId, payload) {
    const response = await request(`/admin/restaurants/${restaurantId}/lifecycle`, {
      method: 'PATCH',
      body: JSON.stringify({
        activationState: payload.activationState,
        note: payload.note || '',
      }),
    });

    return response.restaurant
      ? mapRestaurantDetail({ restaurant: response.restaurant })
      : null;
  },
};

export default restaurantsApi;
