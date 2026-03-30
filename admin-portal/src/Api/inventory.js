// api/inventory.js

class InventoryApi {
  baseURL = '/inventory';

  async listByRestaurant(restaurantId, params = {}) {
    try {
      const mockInventory = this.getMockInventory(restaurantId);
      let filtered = mockInventory.filter(item => item.restaurantId === restaurantId);
      
      if (params.category) {
        filtered = filtered.filter(item => item.category === params.category);
      }
      
      if (params.lowStock === 'true') {
        filtered = filtered.filter(item => item.quantity <= item.lowStockThreshold);
      }
      
      const sortField = params.sort || 'name';
      const sortOrder = params.order || 'asc';
      filtered.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a[sortField] > b[sortField] ? 1 : -1;
        }
        return a[sortField] < b[sortField] ? 1 : -1;
      });
      
      return filtered;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  }

  async getById(restaurantId, itemId) {
    try {
      const items = this.getMockInventory(restaurantId);
      const item = items.find(i => i.id === itemId && i.restaurantId === restaurantId);
      if (!item) {
        throw new Error('Inventory item not found');
      }
      return item;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      throw error;
    }
  }

  async create(restaurantId, itemData) {
    try {
      const newItem = {
        id: `inv_${Date.now()}`,
        restaurantId,
        ...itemData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const existingItems = this.getAllStoredInventory();
      existingItems.push(newItem);
      localStorage.setItem('inventory', JSON.stringify(existingItems));
      
      return newItem;
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  }

  async update(restaurantId, itemId, updateData) {
    try {
      const items = this.getAllStoredInventory();
      const index = items.findIndex(i => i.id === itemId && i.restaurantId === restaurantId);
      
      if (index === -1) {
        throw new Error('Inventory item not found');
      }
      
      items[index] = {
        ...items[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('inventory', JSON.stringify(items));
      return items[index];
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  }

  async delete(restaurantId, itemId) {
    try {
      const items = this.getAllStoredInventory();
      const filtered = items.filter(i => !(i.id === itemId && i.restaurantId === restaurantId));
      localStorage.setItem('inventory', JSON.stringify(filtered));
      return { message: 'Inventory item deleted successfully' };
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  }

  async updateStock(restaurantId, itemId, quantity, operation = 'set') {
    try {
      const items = this.getAllStoredInventory();
      const index = items.findIndex(i => i.id === itemId && i.restaurantId === restaurantId);
      
      if (index === -1) {
        throw new Error('Inventory item not found');
      }
      
      if (operation === 'add') {
        items[index].quantity += quantity;
      } else if (operation === 'subtract') {
        items[index].quantity -= quantity;
      } else {
        items[index].quantity = quantity;
      }
      
      items[index].lastStockUpdate = new Date().toISOString();
      items[index].updatedAt = new Date().toISOString();
      
      localStorage.setItem('inventory', JSON.stringify(items));
      return items[index];
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  async getLowStockItems(restaurantId) {
    try {
      const items = this.getMockInventory(restaurantId);
      const lowStock = items.filter(item => item.quantity <= item.lowStockThreshold);
      return lowStock;
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  }

  async getOutOfStockItems(restaurantId) {
    try {
      const items = this.getMockInventory(restaurantId);
      const outOfStock = items.filter(item => item.quantity === 0);
      return outOfStock;
    } catch (error) {
      console.error('Error fetching out of stock items:', error);
      throw error;
    }
  }

  async getInventoryStats(restaurantId) {
    try {
      const items = this.getMockInventory(restaurantId);
      const totalItems = items.length;
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      const lowStockCount = items.filter(item => item.quantity <= item.lowStockThreshold).length;
      const outOfStockCount = items.filter(item => item.quantity === 0).length;
      const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
      
      const categories = {};
      items.forEach(item => {
        if (!categories[item.category]) {
          categories[item.category] = {
            count: 0,
            quantity: 0,
            value: 0
          };
        }
        categories[item.category].count++;
        categories[item.category].quantity += item.quantity;
        categories[item.category].value += item.quantity * item.cost;
      });
      
      return {
        totalItems,
        totalQuantity,
        lowStockCount,
        outOfStockCount,
        totalValue,
        categories
      };
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      throw error;
    }
  }

  getAllStoredInventory() {
    const stored = localStorage.getItem('inventory');
    if (stored) {
      return JSON.parse(stored);
    }
    const initialInventory = this.getInitialInventory();
    localStorage.setItem('inventory', JSON.stringify(initialInventory));
    return initialInventory;
  }

  getInitialInventory() {
    return [
      {
        id: 'inv_001',
        restaurantId: 'rst_001',
        name: 'Amala Flour',
        category: 'Dry Goods',
        quantity: 50,
        unit: 'kg',
        cost: 500,
        lowStockThreshold: 10,
        supplier: 'Ibadan Food Supply',
        lastStockUpdate: '2026-03-28T10:00:00Z',
        createdAt: '2026-01-15T08:00:00Z',
        updatedAt: '2026-03-28T10:00:00Z'
      },
      {
        id: 'inv_002',
        restaurantId: 'rst_001',
        name: 'Ewedu Leaves',
        category: 'Fresh Produce',
        quantity: 30,
        unit: 'kg',
        cost: 200,
        lowStockThreshold: 5,
        supplier: 'Farm Fresh',
        lastStockUpdate: '2026-03-29T09:00:00Z',
        createdAt: '2026-01-15T08:00:00Z',
        updatedAt: '2026-03-29T09:00:00Z'
      },
      {
        id: 'inv_003',
        restaurantId: 'rst_002',
        name: 'Jollof Rice (50kg)',
        category: 'Dry Goods',
        quantity: 100,
        unit: 'bags',
        cost: 45000,
        lowStockThreshold: 10,
        supplier: 'Lagos Rice Mill',
        lastStockUpdate: '2026-03-28T11:00:00Z',
        createdAt: '2026-01-20T09:00:00Z',
        updatedAt: '2026-03-28T11:00:00Z'
      },
      {
        id: 'inv_004',
        restaurantId: 'rst_002',
        name: 'Fresh Snails',
        category: 'Fresh Produce',
        quantity: 50,
        unit: 'kg',
        cost: 3000,
        lowStockThreshold: 10,
        supplier: 'Seafood Direct',
        lastStockUpdate: '2026-03-29T08:00:00Z',
        createdAt: '2026-01-20T09:00:00Z',
        updatedAt: '2026-03-29T08:00:00Z'
      },
      {
        id: 'inv_005',
        restaurantId: 'rst_003',
        name: 'Jollof Rice Spice Mix',
        category: 'Spices',
        quantity: 20,
        unit: 'kg',
        cost: 800,
        lowStockThreshold: 3,
        supplier: 'Spice World',
        lastStockUpdate: '2026-03-26T15:00:00Z',
        createdAt: '2026-01-25T10:00:00Z',
        updatedAt: '2026-03-26T15:00:00Z'
      },
      {
        id: 'inv_006',
        restaurantId: 'rst_003',
        name: 'Chicken (Frozen)',
        category: 'Frozen',
        quantity: 30,
        unit: 'kg',
        cost: 2500,
        lowStockThreshold: 5,
        supplier: 'Poultry Plus',
        lastStockUpdate: '2026-03-28T13:00:00Z',
        createdAt: '2026-01-25T10:00:00Z',
        updatedAt: '2026-03-28T13:00:00Z'
      },
      {
        id: 'inv_007',
        restaurantId: 'rst_004',
        name: 'Palm Oil',
        category: 'Oils',
        quantity: 40,
        unit: 'liters',
        cost: 1200,
        lowStockThreshold: 8,
        supplier: 'Palm Oil Direct',
        lastStockUpdate: '2026-03-27T16:00:00Z',
        createdAt: '2026-02-01T11:00:00Z',
        updatedAt: '2026-03-27T16:00:00Z'
      },
      {
        id: 'inv_008',
        restaurantId: 'rst_005',
        name: 'Yam (50kg)',
        category: 'Fresh Produce',
        quantity: 80,
        unit: 'bags',
        cost: 30000,
        lowStockThreshold: 10,
        supplier: 'Yam Farmers Coop',
        lastStockUpdate: '2026-03-29T10:00:00Z',
        createdAt: '2026-02-10T09:00:00Z',
        updatedAt: '2026-03-29T10:00:00Z'
      },
      {
        id: 'inv_009',
        restaurantId: 'rst_005',
        name: 'Egusi Melon Seeds',
        category: 'Dry Goods',
        quantity: 35,
        unit: 'kg',
        cost: 800,
        lowStockThreshold: 5,
        supplier: 'Seed Supply',
        lastStockUpdate: '2026-03-28T12:00:00Z',
        createdAt: '2026-02-10T09:00:00Z',
        updatedAt: '2026-03-28T12:00:00Z'
      },
      {
        id: 'inv_010',
        restaurantId: 'rst_006',
        name: 'Suya Beef (Premium)',
        category: 'Meat',
        quantity: 45,
        unit: 'kg',
        cost: 3500,
        lowStockThreshold: 10,
        supplier: 'Abuja Meat Market',
        lastStockUpdate: '2026-03-29T09:30:00Z',
        createdAt: '2026-02-15T10:00:00Z',
        updatedAt: '2026-03-29T09:30:00Z'
      }
    ];
  }

  getMockInventory(restaurantId) {
    const allInventory = this.getAllStoredInventory();
    return allInventory.filter(i => i.restaurantId === restaurantId);
  }
}

export const inventoryApi = new InventoryApi();