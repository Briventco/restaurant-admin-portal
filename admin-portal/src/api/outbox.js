// api/outbox.js

class OutboxApi {
  async list(params = {}) {
    try {
      const mockOutbox = this.getMockOutbox();
      let filtered = [...mockOutbox];
      
      if (params.restaurantId) {
        filtered = filtered.filter(m => m.restaurantId === params.restaurantId);
      }
      
      if (params.status) {
        filtered = filtered.filter(m => m.status === params.status);
      }
      
      const sortField = params.sort || 'time';
      const sortOrder = params.order || 'desc';
      filtered.sort((a, b) => {
        if (sortOrder === 'desc') {
          return new Date(b[sortField]) - new Date(a[sortField]);
        }
        return new Date(a[sortField]) - new Date(b[sortField]);
      });
      
      return filtered;
    } catch (error) {
      console.error('Error fetching outbox messages:', error);
      throw error;
    }
  }

  async getById(messageId) {
    try {
      const messages = this.getMockOutbox();
      const message = messages.find(m => m.id === messageId);
      if (!message) {
        throw new Error('Message not found');
      }
      return message;
    } catch (error) {
      console.error('Error fetching message:', error);
      throw error;
    }
  }

  async retry(messageId) {
    try {
      const messages = this.getAllStoredOutbox();
      const index = messages.findIndex(m => m.id === messageId);
      
      if (index === -1) {
        throw new Error('Message not found');
      }
      
      messages[index].attempts += 1;
      messages[index].status = 'pending';
      messages[index].lastRetry = new Date().toISOString();
      messages[index].updatedAt = new Date().toISOString();
      
      localStorage.setItem('outbox', JSON.stringify(messages));
      return messages[index];
    } catch (error) {
      console.error('Error retrying message:', error);
      throw error;
    }
  }

  async retryAll(filters = {}) {
    try {
      const messages = this.getAllStoredOutbox();
      let filtered = messages;
      
      if (filters.restaurantId) {
        filtered = filtered.filter(m => m.restaurantId === filters.restaurantId);
      }
      
      if (filters.status) {
        filtered = filtered.filter(m => m.status === filters.status);
      }
      
      const retried = [];
      filtered.forEach(message => {
        const index = messages.findIndex(m => m.id === message.id);
        if (index !== -1) {
          messages[index].attempts += 1;
          messages[index].status = 'pending';
          messages[index].lastRetry = new Date().toISOString();
          messages[index].updatedAt = new Date().toISOString();
          retried.push(messages[index]);
        }
      });
      
      localStorage.setItem('outbox', JSON.stringify(messages));
      return retried;
    } catch (error) {
      console.error('Error retrying all messages:', error);
      throw error;
    }
  }

  async delete(messageId) {
    try {
      const messages = this.getAllStoredOutbox();
      const filtered = messages.filter(m => m.id !== messageId);
      localStorage.setItem('outbox', JSON.stringify(filtered));
      return { message: 'Message deleted successfully' };
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const messages = this.getAllStoredOutbox();
      const total = messages.length;
      const pending = messages.filter(m => m.status === 'pending').length;
      const sent = messages.filter(m => m.status === 'sent').length;
      const failed = messages.filter(m => m.status === 'failed').length;
      
      const byRestaurant = {};
      messages.forEach(m => {
        if (!byRestaurant[m.restaurant]) {
          byRestaurant[m.restaurant] = {
            total: 0,
            pending: 0,
            sent: 0,
            failed: 0
          };
        }
        byRestaurant[m.restaurant].total++;
        byRestaurant[m.restaurant][m.status]++;
      });
      
      return {
        total,
        pending,
        sent,
        failed,
        byRestaurant
      };
    } catch (error) {
      console.error('Error fetching outbox stats:', error);
      throw error;
    }
  }

  getAllStoredOutbox() {
    const stored = localStorage.getItem('outbox');
    if (stored) {
      return JSON.parse(stored);
    }
    const initialOutbox = this.getInitialOutbox();
    localStorage.setItem('outbox', JSON.stringify(initialOutbox));
    return initialOutbox;
  }

  getInitialOutbox() {
    return [
      {
        id: 'msg_1001',
        messageId: 'msg_1001',
        restaurantId: 'rst_001',
        restaurant: 'Amala Sky',
        recipient: '+2348047778888',
        messageType: 'order_confirmation',
        message: 'Your order #ORD-002 has been confirmed. Thank you!',
        status: 'failed',
        lifecycle: 'failed',
        attempts: 4,
        lastError: 'QR code required',
        time: '2026-03-30T10:32:00Z',
        createdAt: '2026-03-30T10:32:00Z',
        updatedAt: '2026-03-30T10:32:00Z'
      },
      {
        id: 'msg_1002',
        messageId: 'msg_1002',
        restaurantId: 'rst_001',
        restaurant: 'Amala Sky',
        recipient: '+2348051112222',
        messageType: 'order_update',
        message: 'Your order #ORD-003 is being prepared.',
        status: 'sent',
        lifecycle: 'sent',
        attempts: 1,
        lastError: '-',
        time: '2026-03-30T11:15:00Z',
        createdAt: '2026-03-30T11:15:00Z',
        updatedAt: '2026-03-30T11:15:00Z'
      },
      {
        id: 'msg_1003',
        messageId: 'msg_1003',
        restaurantId: 'rst_002',
        restaurant: 'Buka Republic',
        recipient: '+2348069990000',
        messageType: 'payment_prompt',
        message: 'Please complete payment for order #ORD-004.',
        status: 'pending',
        lifecycle: 'pending',
        attempts: 0,
        lastError: '-',
        time: '2026-03-30T09:45:00Z',
        createdAt: '2026-03-30T09:45:00Z',
        updatedAt: '2026-03-30T09:45:00Z'
      },
      {
        id: 'msg_1004',
        messageId: 'msg_1004',
        restaurantId: 'rst_003',
        restaurant: 'Jollof Heaven',
        recipient: '+2348073334444',
        messageType: 'order_update',
        message: 'Your order #ORD-005 is out for delivery!',
        status: 'failed',
        lifecycle: 'failed',
        attempts: 3,
        lastError: 'Session disconnected',
        time: '2026-03-30T08:20:00Z',
        createdAt: '2026-03-30T08:20:00Z',
        updatedAt: '2026-03-30T08:20:00Z'
      },
      {
        id: 'msg_1005',
        messageId: 'msg_1005',
        restaurantId: 'rst_003',
        restaurant: 'Jollof Heaven',
        recipient: '+2348085556666',
        messageType: 'order_confirmation',
        message: 'Order #ORD-006 confirmed. Thank you for ordering!',
        status: 'sent',
        lifecycle: 'sent',
        attempts: 1,
        lastError: '-',
        time: '2026-03-30T12:00:00Z',
        createdAt: '2026-03-30T12:00:00Z',
        updatedAt: '2026-03-30T12:00:00Z'
      },
      {
        id: 'msg_1006',
        messageId: 'msg_1006',
        restaurantId: 'rst_004',
        restaurant: 'Mama Put Kitchen',
        recipient: '+2348097778888',
        messageType: 'payment_prompt',
        message: 'Payment pending for order #ORD-007. Please send proof of payment.',
        status: 'pending',
        lifecycle: 'pending',
        attempts: 0,
        lastError: '-',
        time: '2026-03-30T10:00:00Z',
        createdAt: '2026-03-30T10:00:00Z',
        updatedAt: '2026-03-30T10:00:00Z'
      },
      {
        id: 'msg_1007',
        messageId: 'msg_1007',
        restaurantId: 'rst_005',
        restaurant: 'Pounded Yam Express',
        recipient: '+2348108889999',
        messageType: 'order_update',
        message: 'Your order #ORD-008 is being prepared.',
        status: 'sent',
        lifecycle: 'sent',
        attempts: 1,
        lastError: '-',
        time: '2026-03-30T11:30:00Z',
        createdAt: '2026-03-30T11:30:00Z',
        updatedAt: '2026-03-30T11:30:00Z'
      },
      {
        id: 'msg_1008',
        messageId: 'msg_1008',
        restaurantId: 'rst_006',
        restaurant: 'Suya Spot',
        recipient: '+2348119990000',
        messageType: 'order_confirmation',
        message: 'Order #ORD-009 confirmed! Your suya is being prepared.',
        status: 'sent',
        lifecycle: 'sent',
        attempts: 1,
        lastError: '-',
        time: '2026-03-30T12:15:00Z',
        createdAt: '2026-03-30T12:15:00Z',
        updatedAt: '2026-03-30T12:15:00Z'
      }
    ];
  }

  getMockOutbox() {
    return this.getAllStoredOutbox();
  }
}

export const outboxApi = new OutboxApi();