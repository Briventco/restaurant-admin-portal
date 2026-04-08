import { request } from '../services/api';

function mapMenuItem(item = {}) {
  return {
    id: item.id || '',
    restaurantId: item.restaurantId || '',
    name: item.name || 'Untitled item',
    category: item.category || 'Uncategorized',
    price: Number(item.price || 0),
    available: item.available !== false,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
}

export const menuApi = {
  async listByRestaurant(restaurantId) {
    const payload = await request(`/restaurants/${restaurantId}/menu-items`);
    return (payload.items || []).map(mapMenuItem);
  },

  async getById(restaurantId, menuId) {
    const items = await this.listByRestaurant(restaurantId);
    const item = items.find((candidate) => candidate.id === menuId);
    if (!item) {
      throw new Error('Menu item not found');
    }
    return item;
  },

  async create(restaurantId, menuData) {
    const payload = await request(`/restaurants/${restaurantId}/menu-items`, {
      method: 'POST',
      body: JSON.stringify({
        name: menuData.name,
        category: menuData.category || '',
        price: Number(menuData.price || 0),
        available: menuData.available !== false,
      }),
    });

    return mapMenuItem(payload.item);
  },

  async update(restaurantId, menuId, menuData) {
    const payload = await request(`/restaurants/${restaurantId}/menu-items/${menuId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...(menuData.name != null ? { name: menuData.name } : {}),
        ...(menuData.category != null ? { category: menuData.category } : {}),
        ...(menuData.price != null ? { price: Number(menuData.price) } : {}),
        ...(menuData.available != null ? { available: Boolean(menuData.available) } : {}),
      }),
    });

    return mapMenuItem(payload.item);
  },

  async delete(restaurantId, menuId) {
    await request(`/restaurants/${restaurantId}/menu-items/${menuId}`, {
      method: 'DELETE',
    });

    return { success: true };
  },
};
