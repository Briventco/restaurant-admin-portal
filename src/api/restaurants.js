import { mockRestaurants } from '../data/mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const idMapping = {
  'r1': 'rst_001',
  'r2': 'rst_002',
  'r3': 'rst_003',
  'r4': 'rst_004',
  'r5': 'rst_005',
  'r6': 'rst_006'
};

export const restaurantsApi = {
  async list() {
    await delay(500);
    return [...mockRestaurants];
  },

  async getById(id) {
    await delay(300);
    const mappedId = idMapping[id] || id;
    let restaurant = mockRestaurants.find(r => r.id === mappedId);
    if (!restaurant) {
      restaurant = mockRestaurants[0];
    }
    return { ...restaurant };
  },

  async create(data) {
    await delay(500);
    const newRestaurant = {
      id: `rst_${Date.now()}`,
      ...data,
      status: 'active',
      whatsappStatus: 'pending',
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      revenue: Math.floor(Math.random() * 100)
    };
    mockRestaurants.push(newRestaurant);
    return { ...newRestaurant };
  },

  async update(id, data) {
    await delay(500);
    const mappedId = idMapping[id] || id;
    const index = mockRestaurants.findIndex(r => r.id === mappedId);
    if (index === -1) {
      throw new Error('Restaurant not found');
    }
    mockRestaurants[index] = {
      ...mockRestaurants[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return { ...mockRestaurants[index] };
  },

  async setStatus(id, status) {
    await delay(400);
    const mappedId = idMapping[id] || id;
    const index = mockRestaurants.findIndex(r => r.id === mappedId);
    if (index === -1) {
      throw new Error('Restaurant not found');
    }
    mockRestaurants[index].status = status;
    mockRestaurants[index].lastActivity = new Date().toISOString();
    return { ...mockRestaurants[index] };
  },

  async setWhatsappStatus(id, whatsappStatus) {
    await delay(400);
    const mappedId = idMapping[id] || id;
    const index = mockRestaurants.findIndex(r => r.id === mappedId);
    if (index === -1) {
      throw new Error('Restaurant not found');
    }
    mockRestaurants[index].whatsappStatus = whatsappStatus;
    mockRestaurants[index].lastActivity = new Date().toISOString();
    return { ...mockRestaurants[index] };
  },

  async delete(id) {
    await delay(500);
    const mappedId = idMapping[id] || id;
    const index = mockRestaurants.findIndex(r => r.id === mappedId);
    if (index === -1) {
      throw new Error('Restaurant not found');
    }
    mockRestaurants.splice(index, 1);
    return { success: true };
  },

  async refreshWhatsApp(id) {
    await delay(800);
    const mappedId = idMapping[id] || id;
    const index = mockRestaurants.findIndex(r => r.id === mappedId);
    if (index === -1) {
      throw new Error('Restaurant not found');
    }
    mockRestaurants[index].whatsappStatus = 'connected';
    mockRestaurants[index].lastActivity = new Date().toISOString();
    return { ...mockRestaurants[index] };
  },

  async getStats(id) {
    await delay(300);
    const mappedId = idMapping[id] || id;
    const restaurant = mockRestaurants.find(r => r.id === mappedId);
    return {
      totalOrders: Math.floor(Math.random() * 500),
      totalRevenue: Math.floor(Math.random() * 50000),
      activeCustomers: Math.floor(Math.random() * 200),
      completionRate: Math.floor(Math.random() * 30) + 70,
      restaurantName: restaurant?.name || 'Unknown'
    };
  },

  async getDashboardStats() {
    await delay(300);
    const total = mockRestaurants.length;
    const active = mockRestaurants.filter(r => r.status === 'active').length;
    const suspended = mockRestaurants.filter(r => r.status === 'suspended').length;
    const connected = mockRestaurants.filter(r => r.whatsappStatus === 'connected').length;
    const totalRevenue = mockRestaurants.reduce((sum, r) => sum + (r.revenue || 0), 0);
    
    return {
      total,
      active,
      suspended,
      connected,
      disconnected: total - connected,
      totalRevenue
    };
  },

  async bulkUpdateStatus(ids, status) {
    await delay(800);
    const updated = [];
    ids.forEach(id => {
      const mappedId = idMapping[id] || id;
      const index = mockRestaurants.findIndex(r => r.id === mappedId);
      if (index !== -1) {
        mockRestaurants[index].status = status;
        mockRestaurants[index].lastActivity = new Date().toISOString();
        updated.push(mockRestaurants[index]);
      }
    });
    return updated;
  },

  async search(query) {
    await delay(300);
    const results = mockRestaurants.filter(r => 
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.id.toLowerCase().includes(query.toLowerCase()) ||
      (r.email && r.email.toLowerCase().includes(query.toLowerCase()))
    );
    return results;
  }
};

export default restaurantsApi;