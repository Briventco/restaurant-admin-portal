import { mockOrders } from '../data/mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const ordersApi = {
  listByRestaurant: async (restaurantId, filters = {}) => {
    await delay(500);
    let result = mockOrders.filter(order => order.restaurantId === restaurantId);
    if (filters.status && filters.status !== 'all') {
      result = result.filter(order => order.status === filters.status);
    }
    return result;
  },

  getById: async (orderId) => {
    await delay(300);
    const order = mockOrders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return { ...order };
  },

  updateStatus: async (orderId, { status }) => {
    await delay(400);
    const index = mockOrders.findIndex(o => o.id === orderId);
    if (index === -1) {
      throw new Error('Order not found');
    }
    mockOrders[index].status = status;
    mockOrders[index].updatedAt = new Date().toISOString();
    return { ...mockOrders[index] };
  },

  bulkUpdateStatus: async (orderIds, status) => {
    await delay(600);
    const updatedOrders = [];
    orderIds.forEach(orderId => {
      const index = mockOrders.findIndex(o => o.id === orderId);
      if (index !== -1) {
        mockOrders[index].status = status;
        mockOrders[index].updatedAt = new Date().toISOString();
        updatedOrders.push(mockOrders[index]);
      }
    });
    return updatedOrders;
  },

  create: async (orderData) => {
    await delay(500);
    const newOrder = {
      id: `ORD-${String(mockOrders.length + 1).padStart(3, '0')}`,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockOrders.push(newOrder);
    return { ...newOrder };
  },

  delete: async (orderId) => {
    await delay(500);
    const index = mockOrders.findIndex(o => o.id === orderId);
    if (index === -1) {
      throw new Error('Order not found');
    }
    mockOrders.splice(index, 1);
    return { success: true };
  },

  getStats: async (restaurantId) => {
    await delay(300);
    const restaurantOrders = mockOrders.filter(o => o.restaurantId === restaurantId);
    const total = restaurantOrders.length;
    const pending = restaurantOrders.filter(o => o.status === 'pending').length;
    const confirmed = restaurantOrders.filter(o => o.status === 'confirmed').length;
    const preparing = restaurantOrders.filter(o => o.status === 'preparing').length;
    const completed = restaurantOrders.filter(o => o.status === 'completed').length;
    const cancelled = restaurantOrders.filter(o => o.status === 'cancelled').length;
    const totalRevenue = restaurantOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    
    return {
      total,
      pending,
      confirmed,
      preparing,
      completed,
      cancelled,
      totalRevenue
    };
  },

  search: async (restaurantId, searchTerm) => {
    await delay(300);
    let result = mockOrders.filter(order => order.restaurantId === restaurantId);
    if (searchTerm) {
      result = result.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }
};

export default ordersApi;