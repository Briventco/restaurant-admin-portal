import { mockMenuItems } from '../data/mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const menuApi = {
  listByRestaurant: async (restaurantId) => {
    await delay(300);
    return mockMenuItems.filter(item => item.restaurantId === restaurantId);
  },

  getById: async (restaurantId, menuId) => {
    await delay(200);
    const item = mockMenuItems.find(item => item.id === menuId && item.restaurantId === restaurantId);
    if (!item) throw new Error('Menu item not found');
    return item;
  },

  create: async (restaurantId, menuData) => {
    await delay(300);
    const newItem = {
      id: `mi_${Date.now()}`,
      restaurantId,
      ...menuData,
      available: true
    };
    mockMenuItems.push(newItem);
    return newItem;
  },

  update: async (restaurantId, menuId, menuData) => {
    await delay(300);
    const index = mockMenuItems.findIndex(item => item.id === menuId && item.restaurantId === restaurantId);
    if (index === -1) throw new Error('Menu item not found');
    mockMenuItems[index] = { ...mockMenuItems[index], ...menuData };
    return mockMenuItems[index];
  },

  delete: async (restaurantId, menuId) => {
    await delay(300);
    const index = mockMenuItems.findIndex(item => item.id === menuId && item.restaurantId === restaurantId);
    if (index === -1) throw new Error('Menu item not found');
    mockMenuItems.splice(index, 1);
    return { success: true };
  }
};