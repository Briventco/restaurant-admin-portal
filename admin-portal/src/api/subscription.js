import { request } from '../services/api';

export const subscriptionApi = {
  // Super Admin methods
  async listPlans() {
    const response = await request('/admin/subscription-plans', {
      method: 'GET',
    });
    return response.plans;
  },

  async getPlan(planId) {
    const response = await request(`/admin/subscription-plans/${planId}`, {
      method: 'GET',
    });
    return response.plan;
  },

  async createPlan(planData) {
    const response = await request('/admin/subscription-plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
    return response.plan;
  },

  async updatePlan(planId, planData) {
    const response = await request(`/admin/subscription-plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
    return response.plan;
  },

  async deletePlan(planId) {
    const response = await request(`/admin/subscription-plans/${planId}`, {
      method: 'DELETE',
    });
    return response;
  },

  async listSubscriptions(options = {}) {
    const params = new URLSearchParams();
    if (options.status) {
      params.append('status', options.status);
    }
    const url = `/admin/subscriptions${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await request(url, {
      method: 'GET',
    });
    return response.subscriptions;
  },

  async getRestaurantSubscription(restaurantId) {
    const response = await request(`/admin/subscriptions/restaurant/${restaurantId}`, {
      method: 'GET',
    });
    return response.subscription;
  },

  async createSubscription(subscriptionData) {
    const response = await request('/admin/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
    return response.subscription;
  },

  async updateSubscription(subscriptionId, subscriptionData) {
    const response = await request(`/admin/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      body: JSON.stringify(subscriptionData),
    });
    return response.subscription;
  },

  async cancelSubscription(subscriptionId) {
    const response = await request(`/admin/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
    });
    return response.subscription;
  },

  // Restaurant Admin methods
  async listPlansForRestaurant(restaurantId) {
    const response = await request(`/restaurants/${restaurantId}/subscription-plans`, {
      method: 'GET',
    });
    return response.plans;
  },

  async getRestaurantSubscriptionOwn(restaurantId) {
    const response = await request(`/restaurants/${restaurantId}/subscription`, {
      method: 'GET',
    });
    return response.subscription;
  },

  async subscribeToPlan(restaurantId, subscriptionData) {
    const response = await request(`/restaurants/${restaurantId}/subscription`, {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
    return response.subscription;
  },
};
