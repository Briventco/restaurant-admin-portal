import { request } from '../services/api';
import { mockOrders } from '../data/mockData';

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export const runtimeApi = {

  async getSuperAdminDashboard() {
    const response = await request('/admin/dashboard', {
      method: 'GET',
    });
    return response;
  },

  async getAllOrders() {
    const response = await request('/admin/orders', {
      method: 'GET',
    });
    return response;
  },

  async getRestaurantsList() {
    await delay();
    return [
      { id: 'r1', name: 'Amala Sky', owner: 'Tunde Fashola', status: 'suspended', orders: 94, revenue: '₦980,000', city: 'Ibadan', joined: 'Mar 2026' },
      { id: 'r2', name: 'Buka Republic', owner: 'Emeka Okafor', status: 'active', orders: 310, revenue: '₦4,050,000', city: 'Lagos', joined: 'Jan 2026' },
      { id: 'r3', name: 'Jollof Heaven', owner: 'Funke Adetokunbo', status: 'active', orders: 189, revenue: '₦3,100,000', city: 'Lagos', joined: 'Jan 2026' },
      { id: 'r4', name: 'Mama Put Kitchen', owner: 'Chukwuemeka Obi', status: 'active', orders: 342, revenue: '₦4,230,000', city: 'Lagos', joined: 'Jan 2026' },
      { id: 'r5', name: 'Pounded Yam Express', owner: 'Ngozi Eze', status: 'active', orders: 276, revenue: '₦3,450,000', city: 'PH', joined: 'Feb 2026' },
      { id: 'r6', name: 'Suya Spot', owner: 'Aisha Bello', status: 'active', orders: 218, revenue: '₦2,870,000', city: 'Abuja', joined: 'Feb 2026' },
    ];
  },

  async getRestaurantDetail(restaurantId) {
    await delay();
    return {
      id: restaurantId,
      name: 'Mama Put Kitchen',
      owner: 'Chukwuemeka Obi',
      email: 'mamput@kitchen.ng',
      phone: '+234 801 234 5678',
      address: '14 Balogun Street, Lagos Island, Lagos',
      status: 'active',
      plan: 'Pro',
      orders: 342,
      revenue: '₦4,230,000',
      joined: 'Jan 15, 2026',
      whatsappStatus: 'Connected',
      menuItemCount: 28,
      deliveryZones: ['Lagos Island', 'Victoria Island', 'Ikoyi'],
    };
  },

  async getWhatsAppSessions() {
    await delay();
    return [
      { id: 's1', restaurant: 'Mama Put Kitchen', phone: '+234 801 234 5678', status: 'connected', lastActive: '2 mins ago' },
      { id: 's2', restaurant: 'Suya Spot', phone: '+234 802 345 6789', status: 'connected', lastActive: '5 mins ago' },
      { id: 's3', restaurant: 'Jollof Heaven', phone: '+234 803 456 7890', status: 'disconnected', lastActive: '2 hours ago' },
      { id: 's4', restaurant: 'Pounded Yam Express', phone: '+234 805 678 9012', status: 'connected', lastActive: '1 min ago' },
      { id: 's5', restaurant: 'Buka Republic', phone: '+234 806 789 0123', status: 'pending', lastActive: '30 mins ago' },
    ];
  },

  async getOutboxMessages() {
    await delay();
    return [
      { id: 'm1', restaurant: 'Jollof Heaven', recipient: '+234 803 111 2222', message: 'Your order #NG-045 is confirmed!', status: 'failed', time: '10:32 AM', retries: 3 },
      { id: 'm2', restaurant: 'Amala Sky', recipient: '+234 807 333 4444', message: 'Payment received for #NG-038.', status: 'failed', time: '09:15 AM', retries: 2 },
      { id: 'm3', restaurant: 'Mama Put Kitchen', recipient: '+234 801 555 6666', message: 'Your order is out for delivery!', status: 'pending', time: '11:00 AM', retries: 0 },
    ];
  },

  async getRestaurantOverview(restaurantId) {
    await delay();
    return {
      todayOrders: 24,
      pendingStaffReview: 5,
      awaitingPayment: 8,
      confirmedOrders: 11,
      whatsappStatus: 'Connected',
      recentActivity: [
        'Order #NG-024 placed by Adebayo O. — ₦12,500',
        'Order #NG-023 confirmed by staff',
        'Payment received for Order #NG-021 — ₦8,000',
        'Order #NG-020 marked as delivered',
        'WhatsApp session reconnected successfully',
        'New menu item added: Ofada Rice Special',
      ],
    };
  },

  async getOrders(restaurantId, params = {}) {
    await delay();
    const orders = restaurantId
      ? mockOrders.filter((o) => o.restaurantId === restaurantId)
      : mockOrders;

    return orders.map((o) => ({
      id:       o.id,
      customer: o.customer,
      amount:   o.total,
      status:   o.status,
      items:    o.items,
      time:     new Date(o.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      date:     new Date(o.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
    }));
  },

  async getOrderDetail(restaurantId, orderId) {
    await delay();
    const o = restaurantId
      ? mockOrders.find((o) => o.id === orderId && o.restaurantId === restaurantId)
      : mockOrders.find((o) => o.id === orderId);

    if (!o) throw new Error('Order not found');
    return {
      ...o,
      amount:        o.total,
      paymentStatus: o.paymentStatus || 'not_requested',
      rawMessage:    o.rawMessage || '',
      parsedItems:   o.parsedItems || (o.items ? o.items.split(',').map((i) => i.trim()) : []),
      subtotal:      o.subtotal || o.total || 0,
      deliveryFee:   o.deliveryFee || 0,
    };
  },

  async updateOrderStatus(restaurantId, orderId, status) {
    await delay(200);
    return { id: orderId, status };
  },

  async getMenuItems(restaurantId) {
    await delay();
    return [
      { id: 'mi1', name: 'Jollof Rice (Large)', category: 'Rice', price: 4500, available: true, description: 'Party-style smoky jollof rice' },
      { id: 'mi2', name: 'Jollof Rice (Small)', category: 'Rice', price: 2500, available: true, description: 'Single serve smoky jollof rice' },
      { id: 'mi3', name: 'Fried Rice', category: 'Rice', price: 3500, available: true, description: 'With vegetables and chicken' },
      { id: 'mi4', name: 'Grilled Chicken', category: 'Protein', price: 3500, available: true, description: 'Half chicken, seasoned and grilled' },
      { id: 'mi5', name: 'Suya (250g)', category: 'Protein', price: 2000, available: false, description: 'Spicy grilled beef skewers' },
      { id: 'mi6', name: 'Pounded Yam + Egusi', category: 'Swallow', price: 5000, available: true, description: 'With assorted meat and stockfish' },
      { id: 'mi7', name: 'Amala + Ewedu', category: 'Swallow', price: 4500, available: true, description: 'With gbegiri and assorted meat' },
      { id: 'mi8', name: 'Zobo Drink (500ml)', category: 'Drinks', price: 800, available: true, description: 'Chilled hibiscus drink' },
    ];
  },

  async createMenuItem(restaurantId, data) {
    await delay(200);
    return { id: `mi_${Date.now()}`, ...data };
  },

  async updateMenuItem(restaurantId, itemId, data) {
    await delay(200);
    return { id: itemId, ...data };
  },

  async deleteMenuItem(restaurantId, itemId) {
    await delay(200);
    return { id: itemId, deleted: true };
  },

  async getDeliveryZones(restaurantId) {
    await delay();
    return [
      { id: 'dz1', name: 'Lagos Island', fee: 800, minOrder: 5000, active: true },
      { id: 'dz2', name: 'Victoria Island', fee: 1000, minOrder: 5000, active: true },
      { id: 'dz3', name: 'Ikoyi', fee: 1000, minOrder: 5000, active: true },
      { id: 'dz4', name: 'Surulere', fee: 1500, minOrder: 8000, active: true },
      { id: 'dz5', name: 'Yaba', fee: 1200, minOrder: 6000, active: false },
      { id: 'dz6', name: 'Ikeja', fee: 2000, minOrder: 10000, active: true },
    ];
  },

  async getPayments(restaurantId, params = {}) {
    await delay();
    return [
      { id: 'p1', orderId: 'NG-001', customer: 'Oluwaseun Adebayo', amount: 12500, method: 'Transfer', status: 'confirmed', date: 'Mar 29, 2026' },
      { id: 'p2', orderId: 'NG-003', customer: 'Chidi Eze', amount: 23500, method: 'Transfer', status: 'confirmed', date: 'Mar 29, 2026' },
      { id: 'p3', orderId: 'NG-004', customer: 'Fatima Bello', amount: 6200, method: 'Cash', status: 'confirmed', date: 'Mar 29, 2026' },
      { id: 'p4', orderId: 'NG-006', customer: 'Amara Chukwu', amount: 18750, method: 'Transfer', status: 'confirmed', date: 'Mar 28, 2026' },
      { id: 'p5', orderId: 'NG-002', customer: 'Ngozi Okonkwo', amount: 8500, method: 'Transfer', status: 'pending', date: 'Mar 29, 2026' },
      { id: 'p6', orderId: 'NG-005', customer: 'Emeka Okafor', amount: 15400, method: 'Transfer', status: 'pending', date: 'Mar 29, 2026' },
    ];
  },

  async getWhatsAppStatus(restaurantId) {
    await delay();
    return {
      status: 'connected',
      phone: '+234 801 234 5678',
      lastActive: '2 mins ago',
      messagesSent: 342,
      messagesDelivered: 338,
      messagesFailed: 4,
      qrCode: null,
    };
  },

  async getRestaurantSettings(restaurantId) {
    await delay();
    return {
      name: 'Mama Put Kitchen',
      email: 'mamaput@kitchen.ng',
      phone: '+234 801 234 5678',
      address: '14 Balogun Street, Lagos Island, Lagos',
      openingHours: '08:00',
      closingHours: '22:00',
      acceptOrders: true,
      autoConfirm: false,
      notifyOnOrder: true,
    };
  },

  async updateRestaurantSettings(restaurantId, data) {
    await delay(200);
    return { ...data, updated: true };
  },

  async getEarnings(restaurantId, params = {}) {
    await delay();
    return {
      totalEarnings: 4230000,
      thisMonth: 1250000,
      lastMonth: 980000,
      growth: 27.6,
      breakdown: [
        { month: 'Oct 2025', amount: 620000 },
        { month: 'Nov 2025', amount: 740000 },
        { month: 'Dec 2025', amount: 890000 },
        { month: 'Jan 2026', amount: 760000 },
        { month: 'Feb 2026', amount: 980000 },
        { month: 'Mar 2026', amount: 1250000 },
      ],
    };
  },

  getRestaurantWhatsAppStatus: async (restaurantId) => {
    await delay();
    return {
      connection: 'connected',
      status: 'healthy',
      qrRequired: false,
      reconnectAttempts: 0,
    };
  },
};