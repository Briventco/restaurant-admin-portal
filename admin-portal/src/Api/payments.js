import { mockPayments } from '../data/mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const paymentsApi = {
  listByRestaurant: async (restaurantId) => {
    await delay(300);
    return mockPayments.filter(payment => payment.restaurantId === restaurantId);
  },

  getById: async (restaurantId, paymentId) => {
    await delay(200);
    const payment = mockPayments.find(payment => payment.id === paymentId && payment.restaurantId === restaurantId);
    if (!payment) throw new Error('Payment not found');
    return payment;
  },

  create: async (restaurantId, paymentData) => {
    await delay(300);
    const newPayment = {
      id: `pay_${Date.now()}`,
      restaurantId,
      ...paymentData,
      status: 'awaiting_payment'
    };
    mockPayments.push(newPayment);
    return newPayment;
  },

  update: async (restaurantId, paymentId, paymentData) => {
    await delay(300);
    const index = mockPayments.findIndex(payment => payment.id === paymentId && payment.restaurantId === restaurantId);
    if (index === -1) throw new Error('Payment not found');
    mockPayments[index] = { ...mockPayments[index], ...paymentData };
    return mockPayments[index];
  },

  delete: async (restaurantId, paymentId) => {
    await delay(300);
    const index = mockPayments.findIndex(payment => payment.id === paymentId && payment.restaurantId === restaurantId);
    if (index === -1) throw new Error('Payment not found');
    mockPayments.splice(index, 1);
    return { success: true };
  }
};