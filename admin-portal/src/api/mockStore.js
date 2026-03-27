import {
  mockDeliveryZones,
  mockMenuItems,
  mockOrders,
  mockOutboxMessages,
  mockPayments,
  mockRestaurantActivity,
  mockRestaurants,
  mockRestaurantSettings,
  mockSessions,
} from '../data/mockData';

const clone = (value) => JSON.parse(JSON.stringify(value));

const createStore = () => ({
  restaurants: clone(mockRestaurants),
  sessions: clone(mockSessions),
  outbox: clone(mockOutboxMessages),
  orders: clone(mockOrders),
  menuItems: clone(mockMenuItems),
  deliveryZones: clone(mockDeliveryZones),
  payments: clone(mockPayments),
  settings: clone(mockRestaurantSettings),
  activity: clone(mockRestaurantActivity),
});

const store = createStore();

export const getStore = () => store;

export const resetStore = () => {
  const freshStore = createStore();
  Object.assign(store, freshStore);
};

export const simulateNetwork = async (value, delayMs = 150) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(clone(value));
    }, delayMs);
  });
};
