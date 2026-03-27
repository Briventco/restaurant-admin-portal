export const ORDER_STATUS_OPTIONS = [
  'pending_staff_review',
  'awaiting_customer_update',
  'awaiting_customer_address',
  'awaiting_payment',
  'payment_under_review',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

export const PAYMENT_STATUS_OPTIONS = [
  'not_requested',
  'awaiting_payment',
  'under_review',
  'confirmed',
  'rejected',
];

export const mockRestaurants = [
  {
    id: 'rst_001',
    name: 'Pasta House',
    status: 'active',
    whatsappStatus: 'connected',
    lastActivity: '2026-03-26T14:08:00.000Z',
  },
  {
    id: 'rst_002',
    name: 'Sushi Bay',
    status: 'active',
    whatsappStatus: 'disconnected',
    lastActivity: '2026-03-26T13:42:00.000Z',
  },
  {
    id: 'rst_003',
    name: 'Grill Corner',
    status: 'suspended',
    whatsappStatus: 'qr_required',
    lastActivity: '2026-03-25T23:20:00.000Z',
  },
];

export const mockSessions = [
  {
    id: 'sess_001',
    restaurantId: 'rst_001',
    restaurant: 'Pasta House',
    status: 'healthy',
    connection: 'connected',
    qrRequired: false,
    lastHeartbeat: '2026-03-26T14:09:00.000Z',
    reconnectAttempts: 0,
  },
  {
    id: 'sess_002',
    restaurantId: 'rst_002',
    restaurant: 'Sushi Bay',
    status: 'degraded',
    connection: 'disconnected',
    qrRequired: true,
    lastHeartbeat: '2026-03-26T13:30:00.000Z',
    reconnectAttempts: 3,
  },
  {
    id: 'sess_003',
    restaurantId: 'rst_003',
    restaurant: 'Grill Corner',
    status: 'warning',
    connection: 'disconnected',
    qrRequired: true,
    lastHeartbeat: '2026-03-25T23:10:00.000Z',
    reconnectAttempts: 5,
  },
];

export const mockOutboxMessages = [
  {
    messageId: 'msg_1001',
    restaurantId: 'rst_002',
    restaurant: 'Sushi Bay',
    recipient: '+14155550100',
    messageType: 'order_update',
    lifecycle: 'failed',
    attempts: 3,
    lastError: 'Session disconnected',
  },
  {
    messageId: 'msg_1002',
    restaurantId: 'rst_001',
    restaurant: 'Pasta House',
    recipient: '+14155550111',
    messageType: 'payment_prompt',
    lifecycle: 'sent',
    attempts: 1,
    lastError: '-',
  },
  {
    messageId: 'msg_1003',
    restaurantId: 'rst_003',
    restaurant: 'Grill Corner',
    recipient: '+14155550122',
    messageType: 'order_confirmation',
    lifecycle: 'failed',
    attempts: 4,
    lastError: 'Timeout from provider',
  },
];

export const mockOrders = [
  {
    id: 'ord_5001',
    restaurantId: 'rst_001',
    customer: 'Ava Cole',
    rawMessage: 'Hi, 1 carbonara + garlic bread, deliver to Main St',
    parsedItems: ['Spaghetti Carbonara x1', 'Garlic Bread x1'],
    items: '2 items',
    subtotal: 31,
    deliveryFee: 4,
    total: 35,
    status: 'pending_staff_review',
    paymentStatus: 'awaiting_payment',
    createdAt: '2026-03-26T13:40:00.000Z',
  },
  {
    id: 'ord_5002',
    restaurantId: 'rst_001',
    customer: 'Noah Reed',
    rawMessage: 'Need 2 margherita pizza and coke',
    parsedItems: ['Margherita Pizza x2', 'Coke x1'],
    items: '3 items',
    subtotal: 46,
    deliveryFee: 4,
    total: 50,
    status: 'awaiting_payment',
    paymentStatus: 'under_review',
    createdAt: '2026-03-26T12:22:00.000Z',
  },
  {
    id: 'ord_5003',
    restaurantId: 'rst_001',
    customer: 'Liam Grant',
    rawMessage: 'Please send grilled chicken bowl',
    parsedItems: ['Grilled Chicken Bowl x1'],
    items: '1 item',
    subtotal: 18,
    deliveryFee: 3,
    total: 21,
    status: 'confirmed',
    paymentStatus: 'confirmed',
    createdAt: '2026-03-26T11:45:00.000Z',
  },
  {
    id: 'ord_5004',
    restaurantId: 'rst_001',
    customer: 'Mia Ford',
    rawMessage: 'Burger combo please',
    parsedItems: ['Cheese Burger x1', 'Fries x1', 'Soda x1'],
    items: '3 items',
    subtotal: 24,
    deliveryFee: 3,
    total: 27,
    status: 'preparing',
    paymentStatus: 'confirmed',
    createdAt: '2026-03-26T10:55:00.000Z',
  },
  {
    id: 'ord_6001',
    restaurantId: 'rst_002',
    customer: 'Eva Kim',
    rawMessage: '2 salmon rolls pickup',
    parsedItems: ['Salmon Roll x2'],
    items: '2 items',
    subtotal: 30,
    deliveryFee: 0,
    total: 30,
    status: 'payment_under_review',
    paymentStatus: 'under_review',
    createdAt: '2026-03-26T09:10:00.000Z',
  },
];

export const mockMenuItems = [
  { id: 'mi_1', restaurantId: 'rst_001', name: 'Spaghetti Carbonara', category: 'Pasta', price: 16, available: true },
  { id: 'mi_2', restaurantId: 'rst_001', name: 'Margherita Pizza', category: 'Pizza', price: 20, available: true },
  { id: 'mi_3', restaurantId: 'rst_001', name: 'Grilled Chicken Bowl', category: 'Bowls', price: 18, available: true },
  { id: 'mi_4', restaurantId: 'rst_001', name: 'Garlic Bread', category: 'Sides', price: 7, available: false },
  { id: 'mi_5', restaurantId: 'rst_002', name: 'Salmon Roll', category: 'Sushi', price: 15, available: true },
];

export const mockDeliveryZones = [
  { id: 'dz_1', restaurantId: 'rst_001', name: 'Downtown', keywords: 'main st, 1st ave', fee: 4, active: true },
  { id: 'dz_2', restaurantId: 'rst_001', name: 'North Side', keywords: 'north, hill', fee: 6, active: true },
  { id: 'dz_3', restaurantId: 'rst_001', name: 'Far East', keywords: 'east park', fee: 8, active: false },
  { id: 'dz_4', restaurantId: 'rst_002', name: 'Bay Area', keywords: 'bay, harbor', fee: 5, active: true },
];

export const mockPayments = [
  {
    id: 'pay_1',
    restaurantId: 'rst_001',
    orderId: 'ord_5001',
    customer: 'Ava Cole',
    amount: 35,
    status: 'awaiting_payment',
    receiptState: 'not_submitted',
  },
  {
    id: 'pay_2',
    restaurantId: 'rst_001',
    orderId: 'ord_5002',
    customer: 'Noah Reed',
    amount: 50,
    status: 'under_review',
    receiptState: 'submitted',
  },
  {
    id: 'pay_3',
    restaurantId: 'rst_001',
    orderId: 'ord_5003',
    customer: 'Liam Grant',
    amount: 21,
    status: 'confirmed',
    receiptState: 'submitted',
  },
  {
    id: 'pay_4',
    restaurantId: 'rst_001',
    orderId: 'ord_5004',
    customer: 'Mia Ford',
    amount: 27,
    status: 'rejected',
    receiptState: 'submitted',
  },
];

export const mockRestaurantSettings = {
  rst_001: {
    name: 'Pasta House',
    contactNumber: '+1 415-555-0100',
    bankDetails: 'Bank of MVP • ****1234',
    paymentInstructions: 'Send payment screenshot in WhatsApp chat after transfer.',
    botSettings: 'Auto-acknowledge enabled, fallback escalation after 8 min.',
  },
};

export const mockRestaurantActivity = {
  rst_001: [
    'Order ord_5004 moved to preparing.',
    'Payment for ord_5003 confirmed.',
    'Menu item Garlic Bread marked unavailable.',
    'Customer Ava Cole requested address confirmation.',
  ],
};
