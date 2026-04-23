import { request } from '../services/api';

function mapDeliveryZone(zone = {}) {
  return {
    id: zone.id || '',
    restaurantId: zone.restaurantId || '',
    name: zone.name || 'Unnamed zone',
    fee: Number(zone.fee || 0),
    etaMinutes: Number(zone.etaMinutes || 0),
    enabled: zone.enabled !== false,
    notes: zone.notes || '',
    createdAt: zone.createdAt || null,
    updatedAt: zone.updatedAt || null,
  };
}

export const deliveryZonesApi = {
  async listByRestaurant(restaurantId) {
    const payload = await request(`/restaurants/${restaurantId}/delivery-zones`, {
      method: 'GET',
    });
    return (payload.zones || []).map(mapDeliveryZone);
  },

  async getById(restaurantId, zoneId) {
    const zones = await this.listByRestaurant(restaurantId);
    const zone = zones.find((candidate) => candidate.id === zoneId);
    if (!zone) {
      throw new Error('Delivery zone not found');
    }
    return zone;
  },

  async create(restaurantId, zoneData) {
    const payload = await request(`/restaurants/${restaurantId}/delivery-zones`, {
      method: 'POST',
      body: JSON.stringify({
        name: zoneData.name,
        fee: Number(zoneData.fee || 0),
        etaMinutes: Number(zoneData.etaMinutes || 0),
        enabled: zoneData.enabled !== false,
        notes: zoneData.notes || '',
      }),
    });

    return mapDeliveryZone(payload.zone);
  },

  async update(restaurantId, zoneId, zoneData) {
    const payload = await request(`/restaurants/${restaurantId}/delivery-zones/${zoneId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...(zoneData.name != null ? { name: zoneData.name } : {}),
        ...(zoneData.fee != null ? { fee: Number(zoneData.fee) } : {}),
        ...(zoneData.etaMinutes != null ? { etaMinutes: Number(zoneData.etaMinutes) } : {}),
        ...(zoneData.enabled != null ? { enabled: Boolean(zoneData.enabled) } : {}),
        ...(zoneData.notes != null ? { notes: zoneData.notes } : {}),
      }),
    });

    return mapDeliveryZone(payload.zone);
  },

  async delete(restaurantId, zoneId) {
    await request(`/restaurants/${restaurantId}/delivery-zones/${zoneId}`, {
      method: 'DELETE',
    });

    return { success: true };
  },
};

export default deliveryZonesApi;
