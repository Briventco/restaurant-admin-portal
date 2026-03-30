import { mockDeliveryZones } from '../data/mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const deliveryZonesApi = {
  listByRestaurant: async (restaurantId) => {
    await delay(300);
    return mockDeliveryZones.filter(zone => zone.restaurantId === restaurantId);
  },

  getById: async (restaurantId, zoneId) => {
    await delay(200);
    const zone = mockDeliveryZones.find(zone => zone.id === zoneId && zone.restaurantId === restaurantId);
    if (!zone) throw new Error('Delivery zone not found');
    return zone;
  },

  create: async (restaurantId, zoneData) => {
    await delay(300);
    const newZone = {
      id: `dz_${Date.now()}`,
      restaurantId,
      ...zoneData,
      active: true
    };
    mockDeliveryZones.push(newZone);
    return newZone;
  },

  update: async (restaurantId, zoneId, zoneData) => {
    await delay(300);
    const index = mockDeliveryZones.findIndex(zone => zone.id === zoneId && zone.restaurantId === restaurantId);
    if (index === -1) throw new Error('Delivery zone not found');
    mockDeliveryZones[index] = { ...mockDeliveryZones[index], ...zoneData };
    return mockDeliveryZones[index];
  },

  delete: async (restaurantId, zoneId) => {
    await delay(300);
    const index = mockDeliveryZones.findIndex(zone => zone.id === zoneId && zone.restaurantId === restaurantId);
    if (index === -1) throw new Error('Delivery zone not found');
    mockDeliveryZones.splice(index, 1);
    return { success: true };
  }
};