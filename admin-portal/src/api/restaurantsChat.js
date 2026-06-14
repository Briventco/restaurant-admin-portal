// Mock data function
const getMockChatThread = (restaurantId, customerName, customerPhone) => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const createMessage = ({ id, role, message, status, timeOffset, senderName = null, metadata = {} }) => ({
    id,
    role,
    message,
    status,
    time: timeOffset,
    ...(senderName && { senderName }),
    metadata: {
      timestamp: new Date(timeOffset).toISOString(),
      ...metadata
    }
  });

  const orderDetails = {
    items: ['2x Large Pepperoni Pizza', '1x Coke', '1x Garlic Bread'],
    subtotal: 45000,
    deliveryFee: 5000,
    total: 50000,
    currency: 'NGN'
  };

  const order = {
    id: 'ORD-2024-001',
    status: 'processing',
    items: orderDetails.items,
    paymentMethod: 'card',
    deliveryTime: '30-45 minutes'
  };

  return [
    createMessage({
      id: 'msg_001',
      role: 'user',
      message: 'Hello, I would like to place an order for delivery',
      status: 'delivered',
      timeOffset: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      senderName: customerName,
      metadata: { intent: 'order_placement', channel: 'web', phone: customerPhone }
    }),
    createMessage({
      id: 'msg_002',
      role: 'assistant',
      message: `Welcome ${customerName}! I'd be happy to help you with your order. What would you like to order today?`,
      status: 'delivered',
      timeOffset: new Date(now.getTime() - 115 * 60 * 1000).toISOString(),
      metadata: { responseTime: '2.5s', confidence: 0.95 }
    }),
    createMessage({
      id: 'msg_003',
      role: 'user',
      message: 'I want 2 large pepperoni pizzas and 1 bottle of coke',
      status: 'delivered',
      timeOffset: new Date(now.getTime() - 110 * 60 * 1000).toISOString(),
      senderName: customerName,
      metadata: { itemsCount: 3, orderType: 'delivery' }
    }),
    createMessage({
      id: 'msg_004',
      role: 'assistant',
      message: `Great choice! Your order summary:\n${order.items.map(item => `• ${item}`).join('\n')}\nSubtotal: ₦${orderDetails.subtotal.toLocaleString()}\nWould you like to add any sides? We have garlic bread (₦5,000) or cheese sticks (₦6,000).`,
      status: 'delivered',
      timeOffset: new Date(now.getTime() - 105 * 60 * 1000).toISOString(),
      metadata: { cartValue: orderDetails.subtotal, suggestedUpsell: true }
    }),
    createMessage({
      id: 'msg_005',
      role: 'user',
      message: 'Yes, add garlic bread please',
      status: 'delivered',
      timeOffset: new Date(now.getTime() - 100 * 60 * 1000).toISOString(),
      senderName: customerName,
      metadata: { addedItem: 'garlic_bread', price: 5000 }
    }),
    createMessage({
      id: 'msg_006',
      role: 'assistant',
      message: `Garlic bread added! Your updated total is ₦${orderDetails.total.toLocaleString()}. What's your delivery address?`,
      status: 'delivered',
      timeOffset: new Date(now.getTime() - 95 * 60 * 1000).toISOString(),
      metadata: { totalWithAddon: orderDetails.total, currency: orderDetails.currency }
    }),
    createMessage({
      id: 'msg_007',
      role: 'user',
      message: '123 Main Street, Apartment 4B, Lagos',
      status: 'delivered',
      timeOffset: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
      senderName: customerName,
      metadata: { addressType: 'delivery', city: 'Lagos' }
    }),
    createMessage({
      id: 'msg_008',
      role: 'assistant',
      message: `Perfect! Your order #${order.id} will arrive in ${order.deliveryTime}. Would you like to pay with card or cash on delivery?`,
      status: 'delivered',
      timeOffset: new Date(now.getTime() - 85 * 60 * 1000).toISOString(),
      metadata: { eta: '30-45min', orderId: order.id }
    }),
    createMessage({
      id: 'msg_009',
      role: 'user',
      message: 'Card please',
      status: 'delivered',
      timeOffset: new Date(now.getTime() - 80 * 60 * 1000).toISOString(),
      senderName: customerName,
      metadata: { paymentMethod: order.paymentMethod }
    }),
    createMessage({
      id: 'msg_010',
      role: 'assistant',
      message: `Processing your payment of ₦${orderDetails.total.toLocaleString()} via card...`,
      status: 'pending',
      timeOffset: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      metadata: { paymentStatus: 'initiated', amount: orderDetails.total, method: 'card' }
    }),
    createMessage({
      id: 'msg_011',
      role: 'assistant',
      message: `⚠️ Payment failed. Amount: ₦${orderDetails.total.toLocaleString()}. Please try again or use a different payment method. Error code: PAY_401.`,
      status: 'failed',
      timeOffset: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
      metadata: { 
        errorCode: 'PAY_401', 
        errorReason: 'insufficient_funds',
        retryCount: 0,
        suggestion: 'try_cash'
      }
    }),
    createMessage({
      id: 'msg_012',
      role: 'user',
      message: `I have a question about yesterday's order #${order.id}`,
      status: 'delivered',
      timeOffset: yesterday.toISOString(),
      senderName: customerName,
      metadata: { inquiryType: 'delivery_issue', orderReference: order.id }
    }),
    createMessage({
      id: 'msg_013',
      role: 'assistant',
      message: `I'd be happy to help! I see your order #${order.id} was placed yesterday. What specific issue would you like to discuss?`,
      status: 'delivered',
      timeOffset: new Date(yesterday.getTime() + 5 * 60 * 1000).toISOString(),
      metadata: { orderLookup: 'success', responseTime: '1.2s' }
    }),
    createMessage({
      id: 'msg_014',
      role: 'user',
      message: 'The delivery was late by 20 minutes',
      status: 'delivered',
      timeOffset: new Date(yesterday.getTime() + 30 * 60 * 1000).toISOString(),
      senderName: customerName,
      metadata: { delayDuration: 20, promisedTime: '45min', actualTime: '65min' }
    }),
    createMessage({
      id: 'msg_015',
      role: 'assistant',
      message: `I sincerely apologize for the 20-minute delay with your order. Let me escalate this to our delivery team and apply a compensation credit of ₦5,000 to your account.`,
      status: 'delivered',
      timeOffset: new Date(yesterday.getTime() + 35 * 60 * 1000).toISOString(),
      metadata: { 
        compensation: 5000, 
        escalationId: 'ESC-2024-789',
        teamNotified: true
      }
    }),
    createMessage({
      id: 'msg_016',
      role: 'user',
      message: 'Can I get a discount on my next order?',
      status: 'delivered',
      timeOffset: twoDaysAgo.toISOString(),
      senderName: customerName,
      metadata: { promotionRequest: true, customerTier: 'regular' }
    }),
    createMessage({
      id: 'msg_017',
      role: 'assistant',
      message: `Absolutely! As a valued customer, here's a 15% discount code for your next order: WELCOME15\n\nValidity: 30 days\nMinimum order: ₦10,000\nMaximum discount: ₦7,500`,
      status: 'delivered',
      timeOffset: new Date(twoDaysAgo.getTime() + 10 * 60 * 1000).toISOString(),
      metadata: { 
        discountCode: 'WELCOME15', 
        discountPercent: 15,
        validUntil: new Date(now.setDate(now.getDate() + 30)).toISOString(),
        terms: 'minimum_order_10000'
      }
    })
  ];
};

// API functions
export const restaurantsChatApi = {
  // Get chat thread for  each restaurant s restaurant
  getChatThread: async (restaurantId, customerName, customerPhone, useMock = true) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return getMockChatThread(restaurantId, customerName, customerPhone);
    }
    
    // Real API call. with fetch 
    const response = await fetch(`/api/restaurants/${restaurantId}/chat/thread`);
    return response.json();
  },

  // Get paginate messages
  getMessages: async (restaurantId, page = 1, limit = 50, useMock = true) => {
    if (useMock) {
      const allMessages = getMockChatThread(restaurantId, 'Customer', '+234 812 345 6789');
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        messages: allMessages.slice(start, end),
        total: allMessages.length,
        page,
        totalPages: Math.ceil(allMessages.length / limit)
      };
    }
    
    const response = await fetch(`/api/restaurants/${restaurantId}/chat/messages?page=${page}&limit=${limit}`);
    return response.json();
  },

  // Send new message
  sendMessage: async (restaurantId, message, role = 'user', useMock = true) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        id: `msg_${Date.now()}`,
        role,
        message,
        status: 'delivered',
        time: new Date().toISOString(),
        metadata: { timestamp: new Date().toISOString() }
      };
    }
    
    const response = await fetch(`/api/restaurants/${restaurantId}/chat/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, role })
    });
    return response.json();
  },

  // Retry failed message
  retryMessage: async (restaurantId, messageId, useMock = true) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 600));
      return {
        id: messageId,
        status: 'pending',
        message: 'Retrying...',
        time: new Date().toISOString()
      };
    }
    
    const response = await fetch(`/api/restaurants/${restaurantId}/chat/retry/${messageId}`, {
      method: 'PUT'
    });
    return response.json();
  },

  // Get chat statistics
  getStats: async (restaurantId, useMock = true) => {
    if (useMock) {
      const messages = getMockChatThread(restaurantId, 'Customer', '+234 812 345 6789');
      return {
        totalMessages: messages.length,
        userMessages: messages.filter(m => m.role === 'user').length,
        botMessages: messages.filter(m => m.role === 'assistant').length,
        failedMessages: messages.filter(m => m.status === 'failed').length,
        lastActive: messages[messages.length - 1]?.time || new Date().toISOString()
      };
    }
    
    const response = await fetch(`/api/restaurants/${restaurantId}/chat/stats`);
    return response.json();
  },

  // Clear conversation history
  clearHistory: async (restaurantId, useMock = true) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: 'Chat history cleared' };
    }
    
    const response = await fetch(`/api/restaurants/${restaurantId}/chat/clear`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

export default restaurantsChatApi;