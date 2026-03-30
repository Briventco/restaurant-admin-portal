const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export const runtimeApi = {

  async getSuperAdminDashboard() {
    await delay();
    return {
      totalRestaurants: 24,
      activeRestaurants: 18,
      totalOrders: 1247,
      pendingActions: 3,
      connectedSessions: 12,
      failedOutboxCount: 2,
      totalRestaurantsTrend: 12,
      activeRestaurantsTrend: 8,
      totalOrdersTrend: 23,
      recentActivities: [
        { id: 1, action: 'New restaurant registered: "Mama Put Kitchen"', user: 'Admin', time: '2 mins ago', type: 'success' },
        { id: 2, action: 'Order #NG-001 completed — ₦12,500', user: 'Adebayo O.', time: '5 mins ago', type: 'success' },
        { id: 3, action: 'WhatsApp session connected for "Suya Spot"', user: 'System', time: '12 mins ago', type: 'info' },
        { id: 4, action: 'System update completed successfully', user: 'Admin', time: '25 mins ago', type: 'success' },
        { id: 5, action: 'Failed message retry scheduled for 3 items', user: 'System', time: '32 mins ago', type: 'warning' },
        { id: 6, action: 'Monthly report generated', user: 'System', time: '1 hour ago', type: 'info' },
        { id: 7, action: 'New user account created: "Oluwaseun B."', user: 'Admin', time: '2 hours ago', type: 'success' },
        { id: 8, action: 'Payment received from "Jollof Heaven"', user: 'Funke A.', time: '3 hours ago', type: 'success' },
      ],
      performanceMetrics: {
        avgResponseTime: '1.2s',
        successRate: 98.5,
        activeUsers: 156,
        uptime: 99.9,
        apiCalls: 45892,
        errorRate: 1.5,
      },
    };
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
    return [
      { id: 'NG-001', customer: 'Oluwaseun Adebayo', phone: '+234 801 111 2222', amount: 12500, status: 'completed', items: 3, time: '10:30 AM', date: 'Today' },
      { id: 'NG-002', customer: 'Ngozi Okonkwo', phone: '+234 802 222 3333', amount: 8500, status: 'pending', items: 2, time: '11:15 AM', date: 'Today' },
      { id: 'NG-003', customer: 'Chidi Eze', phone: '+234 803 333 4444', amount: 23500, status: 'processing', items: 4, time: '09:45 AM', date: 'Today' },
      { id: 'NG-004', customer: 'Fatima Bello', phone: '+234 804 444 5555', amount: 6200, status: 'completed', items: 2, time: '08:30 AM', date: 'Today' },
      { id: 'NG-005', customer: 'Emeka Okafor', phone: '+234 805 555 6666', amount: 15400, status: 'pending', items: 3, time: '12:00 PM', date: 'Today' },
      { id: 'NG-006', customer: 'Amara Chukwu', phone: '+234 806 666 7777', amount: 18750, status: 'completed', items: 5, time: '02:15 PM', date: 'Yesterday' },
      { id: 'NG-007', customer: 'Taiwo Adesanya', phone: '+234 807 777 8888', amount: 9300, status: 'processing', items: 2, time: '01:45 PM', date: 'Yesterday' },
    ];
  },

  async getOrderDetail(restaurantId, orderId) {
    await delay();
    return {
      id: orderId,
      customer: 'Oluwaseun Adebayo',
      phone: '+234 801 111 2222',
      address: '24 Allen Avenue, Ikeja, Lagos',
      amount: 12500,
      status: 'completed',
      paymentMethod: 'Transfer',
      paymentStatus: 'paid',
      date: 'Mar 29, 2026 · 10:30 AM',
      items: [
        { name: 'Jollof Rice (Large)', qty: 2, price: 4500 },
        { name: 'Grilled Chicken', qty: 1, price: 3500 },
      ],
      timeline: [
        { label: 'Order placed', time: '10:30 AM' },
        { label: 'Staff confirmed', time: '10:35 AM' },
        { label: 'Out for delivery', time: '10:55 AM' },
        { label: 'Delivered', time: '11:22 AM' },
      ],
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