// import apiClient from './client';

class AnalyticsApi {
  baseURL = '/analytics';

  async getRestaurantAnalytics(restaurantId, params = {}) {
    try {
      const mockAnalytics = this.getMockAnalytics(restaurantId);
      let data = { ...mockAnalytics };
      
      if (params.startDate && params.endDate) {
        data = this.filterByDate(data, params.startDate, params.endDate);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching restaurant analytics:', error);
      throw error;
    }
  }

  async getOrderAnalytics(restaurantId, params = {}) {
    try {
      const mockOrderAnalytics = this.getMockOrderAnalytics(restaurantId);
      let data = { ...mockOrderAnalytics };
      
      if (params.startDate && params.endDate) {
        data = this.filterByDate(data, params.startDate, params.endDate);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching order analytics:', error);
      throw error;
    }
  }

  async getRevenueAnalytics(restaurantId, params = {}) {
    try {
      const mockRevenueAnalytics = this.getMockRevenueAnalytics(restaurantId);
      let data = { ...mockRevenueAnalytics };
      
      if (params.startDate && params.endDate) {
        data = this.filterByDate(data, params.startDate, params.endDate);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  }

  async getCustomerAnalytics(restaurantId, params = {}) {
    try {
      const mockCustomerAnalytics = this.getMockCustomerAnalytics(restaurantId);
      return mockCustomerAnalytics;
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      throw error;
    }
  }

  async getMenuAnalytics(restaurantId, params = {}) {
    try {
      const mockMenuAnalytics = this.getMockMenuAnalytics(restaurantId);
      return mockMenuAnalytics;
    } catch (error) {
      console.error('Error fetching menu analytics:', error);
      throw error;
    }
  }

  async getPerformanceMetrics(restaurantId, params = {}) {
    try {
      const mockMetrics = this.getMockPerformanceMetrics(restaurantId);
      return mockMetrics;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  }

  async getDashboardStats(restaurantId) {
    try {
      return {
        totalOrders: 1247,
        totalRevenue: 4230000,
        averageOrderValue: 3392,
        activeCustomers: 456,
        completionRate: 94.5,
        popularItems: [
          { name: 'Jollof Rice', count: 342, revenue: 1539000 },
          { name: 'Amala', count: 189, revenue: 756000 },
          { name: 'Suya', count: 276, revenue: 828000 },
          { name: 'Pounded Yam', count: 218, revenue: 872000 }
        ],
        recentTrend: {
          orders: [112, 118, 124, 130, 127, 135, 142],
          revenue: [380000, 395000, 410000, 425000, 420000, 445000, 465000]
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async getSalesForecast(restaurantId, days = 7) {
    try {
      const forecast = [];
      const baseOrders = 120;
      const growthRate = 0.03;
      
      for (let i = 1; i <= days; i++) {
        const predictedOrders = Math.round(baseOrders * (1 + growthRate * i));
        const predictedRevenue = predictedOrders * 3500;
        forecast.push({
          day: i,
          predictedOrders,
          predictedRevenue,
          confidence: 0.85 + (Math.random() * 0.1)
        });
      }
      
      return {
        forecast,
        averageOrderValue: 3500,
        growthRate: growthRate * 100
      };
    } catch (error) {
      console.error('Error fetching sales forecast:', error);
      throw error;
    }
  }

  async getPeakHours(restaurantId) {
    try {
      return {
        peakHours: [
          { hour: '12:00-13:00', orders: 85, revenue: 297500 },
          { hour: '13:00-14:00', orders: 92, revenue: 322000 },
          { hour: '18:00-19:00', orders: 78, revenue: 273000 },
          { hour: '19:00-20:00', orders: 88, revenue: 308000 },
          { hour: '20:00-21:00', orders: 67, revenue: 234500 }
        ],
        busiestDay: 'Saturday',
        slowestDay: 'Tuesday'
      };
    } catch (error) {
      console.error('Error fetching peak hours:', error);
      throw error;
    }
  }

  getMockAnalytics(restaurantId) {
    const analyticsMap = {
      'rst_001': {
        totalOrders: 342,
        totalRevenue: 4230000,
        averageRating: 4.5,
        totalCustomers: 189,
        repeatCustomers: 76,
        cancellationRate: 3.2,
        averagePreparationTime: 25,
        averageDeliveryTime: 45,
        popularItems: [
          { name: 'Amala', orders: 94, revenue: 188000 },
          { name: 'Ewedu', orders: 82, revenue: 82000 },
          { name: 'Gbegiri', orders: 76, revenue: 114000 }
        ]
      },
      'rst_002': {
        totalOrders: 310,
        totalRevenue: 4050000,
        averageRating: 4.8,
        totalCustomers: 178,
        repeatCustomers: 82,
        cancellationRate: 2.1,
        averagePreparationTime: 30,
        averageDeliveryTime: 50,
        popularItems: [
          { name: 'Buka Fried Rice', orders: 156, revenue: 780000 },
          { name: 'Peppered Snail', orders: 98, revenue: 588000 },
          { name: 'Nkwobi', orders: 87, revenue: 478500 }
        ]
      },
      'rst_003': {
        totalOrders: 189,
        totalRevenue: 3100000,
        averageRating: 4.3,
        totalCustomers: 112,
        repeatCustomers: 45,
        cancellationRate: 4.5,
        averagePreparationTime: 20,
        averageDeliveryTime: 40,
        popularItems: [
          { name: 'Jollof Rice', orders: 124, revenue: 496000 },
          { name: 'Grilled Chicken', orders: 89, revenue: 311500 },
          { name: 'Fried Plantain', orders: 76, revenue: 114000 }
        ]
      },
      'rst_004': {
        totalOrders: 342,
        totalRevenue: 4230000,
        averageRating: 4.7,
        totalCustomers: 201,
        repeatCustomers: 98,
        cancellationRate: 2.8,
        averagePreparationTime: 22,
        averageDeliveryTime: 42,
        popularItems: [
          { name: 'Jollof Rice', orders: 156, revenue: 702000 },
          { name: 'Fried Rice', orders: 134, revenue: 469000 },
          { name: 'Grilled Chicken', orders: 112, revenue: 392000 }
        ]
      },
      'rst_005': {
        totalOrders: 276,
        totalRevenue: 3450000,
        averageRating: 4.6,
        totalCustomers: 156,
        repeatCustomers: 67,
        cancellationRate: 3.5,
        averagePreparationTime: 28,
        averageDeliveryTime: 48,
        popularItems: [
          { name: 'Pounded Yam', orders: 143, revenue: 357500 },
          { name: 'Egusi Soup', orders: 121, revenue: 363000 },
          { name: 'Ogbono Soup', orders: 98, revenue: 294000 }
        ]
      },
      'rst_006': {
        totalOrders: 218,
        totalRevenue: 2870000,
        averageRating: 4.4,
        totalCustomers: 134,
        repeatCustomers: 54,
        cancellationRate: 3.8,
        averagePreparationTime: 15,
        averageDeliveryTime: 35,
        popularItems: [
          { name: 'Suya Wrap', orders: 98, revenue: 294000 },
          { name: 'Kilishi', orders: 76, revenue: 190000 },
          { name: 'Grilled Fish', orders: 67, revenue: 536000 }
        ]
      }
    };
    
    return analyticsMap[restaurantId] || analyticsMap['rst_001'];
  }

  getMockOrderAnalytics(restaurantId) {
    return {
      daily: [
        { date: '2026-03-24', orders: 28, revenue: 980000 },
        { date: '2026-03-25', orders: 32, revenue: 1120000 },
        { date: '2026-03-26', orders: 35, revenue: 1225000 },
        { date: '2026-03-27', orders: 38, revenue: 1330000 },
        { date: '2026-03-28', orders: 42, revenue: 1470000 },
        { date: '2026-03-29', orders: 45, revenue: 1575000 },
        { date: '2026-03-30', orders: 48, revenue: 1680000 }
      ],
      weekly: [
        { week: 'Week 1', orders: 210, revenue: 7350000 },
        { week: 'Week 2', orders: 225, revenue: 7875000 },
        { week: 'Week 3', orders: 240, revenue: 8400000 },
        { week: 'Week 4', orders: 265, revenue: 9275000 }
      ],
      monthly: [
        { month: 'Jan 2026', orders: 890, revenue: 31150000 },
        { month: 'Feb 2026', orders: 950, revenue: 33250000 },
        { month: 'Mar 2026', orders: 1020, revenue: 35700000 }
      ],
      statusBreakdown: {
        completed: 1247,
        pending: 89,
        cancelled: 45,
        processing: 67
      }
    };
  }

  getMockRevenueAnalytics(restaurantId) {
    return {
      total: 4230000,
      byPaymentMethod: {
        transfer: 2538000,
        cash: 1269000,
        card: 423000
      },
      byCategory: {
        food: 3384000,
        drinks: 423000,
        delivery: 423000
      },
      trends: {
        daily: [320000, 340000, 360000, 380000, 400000, 420000, 450000],
        weekly: [2200000, 2350000, 2500000, 2700000],
        monthly: [8900000, 9500000, 10200000]
      },
      projected: 4500000
    };
  }

  getMockCustomerAnalytics(restaurantId) {
    return {
      totalCustomers: 456,
      newCustomers: 78,
      returningCustomers: 234,
      retentionRate: 67.5,
      customerSegments: {
        highValue: 45,
        mediumValue: 156,
        lowValue: 255
      },
      topCustomers: [
        { name: 'John Samuel', orders: 12, totalSpent: 158000 },
        { name: 'Oreoluwa John', orders: 9, totalSpent: 112000 },
        { name: 'Abisoye Kayleb', orders: 7, totalSpent: 89000 }
      ],
      acquisition: {
        whatsapp: 234,
        referral: 89,
        organic: 133
      }
    };
  }

  getMockMenuAnalytics(restaurantId) {
    return {
      topSelling: [
        { name: 'Jollof Rice', quantity: 342, revenue: 1539000 },
        { name: 'Fried Rice', quantity: 276, revenue: 966000 },
        { name: 'Grilled Chicken', quantity: 218, revenue: 763000 }
      ],
      leastSelling: [
        { name: 'Garlic Bread', quantity: 34, revenue: 238000 },
        { name: 'Zobo Drink', quantity: 56, revenue: 28000 }
      ],
      categoryBreakdown: {
        rice: { orders: 618, revenue: 2781000 },
        protein: { orders: 423, revenue: 1480500 },
        drinks: { orders: 189, revenue: 94500 },
        sides: { orders: 124, revenue: 86800 }
      }
    };
  }

  getMockPerformanceMetrics(restaurantId) {
    return {
      orderFulfillment: {
        onTime: 89.5,
        delayed: 8.2,
        cancelled: 2.3
      },
      customerSatisfaction: {
        averageRating: 4.6,
        positiveReviews: 87,
        negativeReviews: 5,
        neutralReviews: 8
      },
      operationalEfficiency: {
        averagePrepTime: 24,
        averageDeliveryTime: 45,
        staffProductivity: 85
      },
      financialHealth: {
        profitMargin: 32.5,
        revenueGrowth: 18.3,
        costEfficiency: 78
      }
    };
  }

  filterByDate(data, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (data.daily) {
      data.daily = data.daily.filter(item => {
        const date = new Date(item.date);
        return date >= start && date <= end;
      });
    }
    
    return data;
  }
}

export const analyticsApi = new AnalyticsApi();