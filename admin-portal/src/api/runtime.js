import { apiClient } from './client';
import { getStore, simulateNetwork } from './mockStore';

export const runtimeApi = {
  listSessions: async () => {
    if (!apiClient.useMock) {
      return apiClient.get('/runtime/sessions');
    }

    const store = getStore();
    return simulateNetwork(store.sessions);
  },

  getSuperAdminDashboard: async () => {
    if (!apiClient.useMock) {
      return apiClient.get('/runtime/super-admin/dashboard');
    }

    const store = getStore();
    const totalRestaurants = store.restaurants.length;
    const activeRestaurants = store.restaurants.filter((item) => item.status === 'active').length;
    const connectedSessions = store.sessions.filter((item) => item.connection === 'connected').length;
    const failedOutboxCount = store.outbox.filter((item) => item.lifecycle === 'failed').length;
    const pendingActions = store.orders.filter(
      (item) => ['pending_staff_review', 'payment_under_review', 'awaiting_payment'].includes(item.status),
    ).length;

    return simulateNetwork({
      totalRestaurants,
      activeRestaurants,
      totalOrders: store.orders.length,
      pendingActions,
      connectedSessions,
      failedOutboxCount,
    });
  },

  getRestaurantOverview: async (restaurantId) => {
    if (!apiClient.useMock) {
      return apiClient.get(`/restaurants/${restaurantId}/runtime/overview`);
    }

    const store = getStore();
    const restaurantOrders = store.orders.filter((item) => item.restaurantId === restaurantId);
    const todayOrders = restaurantOrders.length;
    const pendingStaffReview = restaurantOrders.filter((item) => item.status === 'pending_staff_review').length;
    const awaitingPayment = restaurantOrders.filter((item) => item.status === 'awaiting_payment').length;
    const confirmedOrders = restaurantOrders.filter((item) => item.status === 'confirmed').length;

    const session = store.sessions.find((item) => item.restaurantId === restaurantId);
    const recentActivity = store.activity[restaurantId] || [];

    return simulateNetwork({
      todayOrders,
      pendingStaffReview,
      awaitingPayment,
      confirmedOrders,
      whatsappStatus: session?.connection || 'disconnected',
      recentActivity,
    });
  },

  getRestaurantWhatsAppStatus: async (restaurantId) => {
    if (!apiClient.useMock) {
      return apiClient.get(`/restaurants/${restaurantId}/runtime/whatsapp`);
    }

    const store = getStore();
    const session = store.sessions.find((item) => item.restaurantId === restaurantId);

    return simulateNetwork(
      session || {
        status: 'unknown',
        connection: 'disconnected',
        qrRequired: true,
        lastHeartbeat: null,
        reconnectAttempts: 0,
      },
    );
  },
};
