import { apiClient } from './client';
import { getStore, simulateNetwork } from './mockStore';

export const outboxApi = {
  list: async () => {
    if (!apiClient.useMock) {
      return apiClient.get('/runtime/outbox');
    }

    const store = getStore();
    return simulateNetwork(store.outbox);
  },

  retryMessage: async (messageId) => {
    if (!apiClient.useMock) {
      return apiClient.post(`/runtime/outbox/${messageId}/retry`, {});
    }

    const store = getStore();
    const message = store.outbox.find((item) => item.messageId === messageId);
    if (message) {
      message.attempts += 1;
      if (message.lifecycle === 'failed') {
        message.lifecycle = 'retrying';
        message.lastError = '-';
      }
    }

    return simulateNetwork(message || null);
  },
};
