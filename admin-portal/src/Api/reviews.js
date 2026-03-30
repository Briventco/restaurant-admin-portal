// api/reviews.js

class ReviewsApi {
  baseURL = '/reviews';

  async listByRestaurant(restaurantId, params = {}) {
    try {
      const mockReviews = this.getMockReviews(restaurantId);
      let filtered = mockReviews.filter(r => r.restaurantId === restaurantId);
      
      if (params.rating) {
        filtered = filtered.filter(r => r.rating === parseInt(params.rating));
      }
      
      const sortField = params.sort || 'createdAt';
      const sortOrder = params.order || 'desc';
      filtered.sort((a, b) => {
        if (sortOrder === 'desc') {
          return new Date(b[sortField]) - new Date(a[sortField]);
        }
        return new Date(a[sortField]) - new Date(b[sortField]);
      });
      
      return filtered;
    } catch (error) {
      console.error('Error fetching restaurant reviews:', error);
      throw error;
    }
  }

  async getRestaurantReviewStats(restaurantId) {
    try {
      const reviews = this.getMockReviews(restaurantId);
      const approved = reviews.filter(r => r.status === 'approved');
      
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let totalRating = 0;
      
      approved.forEach(review => {
        distribution[review.rating]++;
        totalRating += review.rating;
      });
      
      return {
        averageRating: approved.length > 0 ? totalRating / approved.length : 0,
        totalReviews: approved.length,
        ratingDistribution: distribution
      };
    } catch (error) {
      console.error('Error fetching review stats:', error);
      throw error;
    }
  }

  async getAverageRating(restaurantId) {
    try {
      const reviews = this.getMockReviews(restaurantId);
      const approved = reviews.filter(r => r.status === 'approved');
      const totalRating = approved.reduce((sum, r) => sum + r.rating, 0);
      
      return {
        averageRating: approved.length > 0 ? totalRating / approved.length : 0,
        totalReviews: approved.length
      };
    } catch (error) {
      console.error('Error fetching average rating:', error);
      throw error;
    }
  }

  async listByCustomer(customerId, params = {}) {
    try {
      const allReviews = this.getAllStoredReviews();
      const customerReviews = allReviews.filter(r => r.customerId === customerId);
      
      return customerReviews;
    } catch (error) {
      console.error('Error fetching customer reviews:', error);
      throw error;
    }
  }

  async create(reviewData) {
    try {
      const newReview = {
        id: Date.now().toString(),
        ...reviewData,
        helpfulCount: 0,
        helpfulUsers: [],
        reports: [],
        status: 'pending',
        verified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const existingReviews = this.getAllStoredReviews();
      existingReviews.push(newReview);
      localStorage.setItem('reviews', JSON.stringify(existingReviews));
      
      return newReview;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  async update(reviewId, updateData) {
    try {
      const reviews = this.getAllStoredReviews();
      const index = reviews.findIndex(r => r.id === reviewId);
      
      if (index === -1) {
        throw new Error('Review not found');
      }
      
      reviews[index] = {
        ...reviews[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('reviews', JSON.stringify(reviews));
      return reviews[index];
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  async delete(reviewId) {
    try {
      const reviews = this.getAllStoredReviews();
      const filtered = reviews.filter(r => r.id !== reviewId);
      localStorage.setItem('reviews', JSON.stringify(filtered));
      return { message: 'Review deleted successfully' };
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  async moderateReview(reviewId, moderationData) {
    try {
      const reviews = this.getAllStoredReviews();
      const index = reviews.findIndex(r => r.id === reviewId);
      
      if (index === -1) {
        throw new Error('Review not found');
      }
      
      reviews[index] = {
        ...reviews[index],
        status: moderationData.status,
        moderationNote: moderationData.moderationNote,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('reviews', JSON.stringify(reviews));
      return reviews[index];
    } catch (error) {
      console.error('Error moderating review:', error);
      throw error;
    }
  }

  async reportReview(reviewId, reportData) {
    try {
      const reviews = this.getAllStoredReviews();
      const index = reviews.findIndex(r => r.id === reviewId);
      
      if (index === -1) {
        throw new Error('Review not found');
      }
      
      const newReport = {
        userId: reportData.userId,
        reason: reportData.reason,
        description: reportData.description,
        createdAt: new Date().toISOString()
      };
      
      reviews[index].reports.push(newReport);
      reviews[index].status = 'flagged';
      reviews[index].updatedAt = new Date().toISOString();
      
      localStorage.setItem('reviews', JSON.stringify(reviews));
      return reviews[index];
    } catch (error) {
      console.error('Error reporting review:', error);
      throw error;
    }
  }

  async getReportedReviews(params = {}) {
    try {
      const allReviews = this.getAllStoredReviews();
      const reported = allReviews.filter(r => r.status === 'flagged' || r.reports.length > 0);
      
      return reported;
    } catch (error) {
      console.error('Error fetching reported reviews:', error);
      throw error;
    }
  }

  async addResponse(reviewId, responseData) {
    try {
      const reviews = this.getAllStoredReviews();
      const index = reviews.findIndex(r => r.id === reviewId);
      
      if (index === -1) {
        throw new Error('Review not found');
      }
      
      reviews[index].response = {
        id: Date.now().toString(),
        text: responseData.text,
        userId: responseData.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('reviews', JSON.stringify(reviews));
      return reviews[index];
    } catch (error) {
      console.error('Error adding review response:', error);
      throw error;
    }
  }

  async updateResponse(responseId, updateData) {
    try {
      const reviews = this.getAllStoredReviews();
      let foundReview = null;
      let foundIndex = -1;
      
      for (let i = 0; i < reviews.length; i++) {
        if (reviews[i].response && reviews[i].response.id === responseId) {
          foundReview = reviews[i];
          foundIndex = i;
          break;
        }
      }
      
      if (!foundReview) {
        throw new Error('Response not found');
      }
      
      foundReview.response.text = updateData.text;
      foundReview.response.updatedAt = new Date().toISOString();
      reviews[foundIndex] = foundReview;
      
      localStorage.setItem('reviews', JSON.stringify(reviews));
      return foundReview;
    } catch (error) {
      console.error('Error updating review response:', error);
      throw error;
    }
  }

  async deleteResponse(responseId) {
    try {
      const reviews = this.getAllStoredReviews();
      let foundIndex = -1;
      
      for (let i = 0; i < reviews.length; i++) {
        if (reviews[i].response && reviews[i].response.id === responseId) {
          foundIndex = i;
          break;
        }
      }
      
      if (foundIndex === -1) {
        throw new Error('Response not found');
      }
      
      delete reviews[foundIndex].response;
      localStorage.setItem('reviews', JSON.stringify(reviews));
      return { message: 'Response deleted successfully' };
    } catch (error) {
      console.error('Error deleting review response:', error);
      throw error;
    }
  }

  async getReviewAnalytics(restaurantId, startDate, endDate) {
    try {
      const reviews = this.getMockReviews(restaurantId);
      let filtered = reviews.filter(r => r.restaurantId === restaurantId);
      
      if (startDate && endDate) {
        filtered = filtered.filter(r => {
          const date = new Date(r.createdAt);
          return date >= new Date(startDate) && date <= new Date(endDate);
        });
      }
      
      const analytics = {};
      filtered.forEach(review => {
        const date = new Date(review.createdAt).toISOString().split('T')[0];
        if (!analytics[date]) {
          analytics[date] = {
            totalReviews: 0,
            totalRating: 0,
            ratings: []
          };
        }
        analytics[date].totalReviews++;
        analytics[date].totalRating += review.rating;
        analytics[date].ratings.push(review.rating);
      });
      
      return Object.entries(analytics).map(([date, data]) => ({
        _id: date,
        averageRating: data.totalRating / data.totalReviews,
        totalReviews: data.totalReviews,
        ratings: data.ratings
      })).sort((a, b) => a._id.localeCompare(b._id));
    } catch (error) {
      console.error('Error fetching review analytics:', error);
      throw error;
    }
  }

  async getRatingDistribution(restaurantId) {
    try {
      const reviews = this.getMockReviews(restaurantId);
      const filtered = reviews.filter(r => r.restaurantId === restaurantId && r.status === 'approved');
      
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      filtered.forEach(review => {
        distribution[review.rating]++;
      });
      
      return distribution;
    } catch (error) {
      console.error('Error fetching rating distribution:', error);
      throw error;
    }
  }

  async markHelpful(reviewId, userId) {
    try {
      const reviews = this.getAllStoredReviews();
      const index = reviews.findIndex(r => r.id === reviewId);
      
      if (index === -1) {
        throw new Error('Review not found');
      }
      
      if (reviews[index].helpfulUsers.includes(userId)) {
        throw new Error('Already marked as helpful');
      }
      
      reviews[index].helpfulCount += 1;
      reviews[index].helpfulUsers.push(userId);
      localStorage.setItem('reviews', JSON.stringify(reviews));
      
      return { helpfulCount: reviews[index].helpfulCount };
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      throw error;
    }
  }

  getAllStoredReviews() {
    const stored = localStorage.getItem('reviews');
    if (stored) {
      return JSON.parse(stored);
    }
    const initialReviews = this.getInitialReviews();
    localStorage.setItem('reviews', JSON.stringify(initialReviews));
    return initialReviews;
  }

  getInitialReviews() {
    return [
      {
        id: 'rev_1',
        restaurantId: 'rst_001',
        customerId: 'cust_1',
        orderId: 'ord_1',
        rating: 4,
        title: 'Authentic Amala!',
        comment: 'The amala was perfectly smooth and the ewedu was delicious.',
        images: [],
        tags: ['food'],
        status: 'approved',
        helpfulCount: 12,
        helpfulUsers: [],
        reports: [],
        verified: true,
        createdAt: '2026-03-25T10:00:00Z',
        updatedAt: '2026-03-25T10:00:00Z',
        customerName: 'John Doe',
        customerAvatar: 'https://randomuser.me/api/portraits/men/1.jpg'
      },
      {
        id: 'rev_2',
        restaurantId: 'rst_001',
        customerId: 'cust_2',
        orderId: 'ord_2',
        rating: 5,
        title: 'Best Amala!',
        comment: 'The gbegiri was rich and tasty. Great portion size.',
        images: [],
        tags: ['food'],
        status: 'approved',
        helpfulCount: 8,
        helpfulUsers: [],
        reports: [],
        verified: true,
        createdAt: '2026-03-24T15:30:00Z',
        updatedAt: '2026-03-24T15:30:00Z',
        customerName: 'Jane Smith',
        customerAvatar: 'https://randomuser.me/api/portraits/women/2.jpg'
      },
      {
        id: 'rev_3',
        restaurantId: 'rst_002',
        customerId: 'cust_3',
        orderId: 'ord_3',
        rating: 5,
        title: 'Excellent!',
        comment: 'The fried rice and peppered snail were amazing.',
        images: [],
        tags: ['food'],
        status: 'approved',
        helpfulCount: 15,
        helpfulUsers: [],
        reports: [],
        verified: true,
        createdAt: '2026-03-23T12:15:00Z',
        updatedAt: '2026-03-23T12:15:00Z',
        customerName: 'Mike Johnson',
        customerAvatar: 'https://randomuser.me/api/portraits/men/3.jpg'
      },
      {
        id: 'rev_4',
        restaurantId: 'rst_003',
        customerId: 'cust_4',
        orderId: 'ord_4',
        rating: 5,
        title: 'Best Jollof!',
        comment: 'The jollof rice is party-style and perfectly spiced.',
        images: [],
        tags: ['food'],
        status: 'approved',
        helpfulCount: 20,
        helpfulUsers: [],
        reports: [],
        verified: true,
        createdAt: '2026-03-21T09:20:00Z',
        updatedAt: '2026-03-21T09:20:00Z',
        customerName: 'Tom Brown',
        customerAvatar: 'https://randomuser.me/api/portraits/men/5.jpg'
      },
      {
        id: 'rev_5',
        restaurantId: 'rst_004',
        customerId: 'cust_5',
        orderId: 'ord_5',
        rating: 5,
        title: 'Home cooking!',
        comment: 'Mama Put Kitchen never disappoints.',
        images: [],
        tags: ['food'],
        status: 'approved',
        helpfulCount: 18,
        helpfulUsers: [],
        reports: [],
        verified: true,
        createdAt: '2026-03-19T11:45:00Z',
        updatedAt: '2026-03-19T11:45:00Z',
        customerName: 'Chidi Nnamdi',
        customerAvatar: 'https://randomuser.me/api/portraits/men/7.jpg'
      },
      {
        id: 'rev_6',
        restaurantId: 'rst_005',
        customerId: 'cust_6',
        orderId: 'ord_6',
        rating: 5,
        title: 'Pounded yam is fire!',
        comment: 'The pounded yam was smooth and the egusi soup was rich.',
        images: [],
        tags: ['food'],
        status: 'approved',
        helpfulCount: 22,
        helpfulUsers: [],
        reports: [],
        verified: true,
        createdAt: '2026-03-18T16:20:00Z',
        updatedAt: '2026-03-18T16:20:00Z',
        customerName: 'Ngozi Okonkwo',
        customerAvatar: 'https://randomuser.me/api/portraits/women/8.jpg'
      },
      {
        id: 'rev_7',
        restaurantId: 'rst_006',
        customerId: 'cust_7',
        orderId: 'ord_7',
        rating: 4,
        title: 'Great suya!',
        comment: 'The suya was well spiced and the meat was tender.',
        images: [],
        tags: ['food'],
        status: 'approved',
        helpfulCount: 14,
        helpfulUsers: [],
        reports: [],
        verified: true,
        createdAt: '2026-03-17T13:10:00Z',
        updatedAt: '2026-03-17T13:10:00Z',
        customerName: 'Adebayo Ogunlesi',
        customerAvatar: 'https://randomuser.me/api/portraits/men/9.jpg'
      }
    ];
  }

  getMockReviews(restaurantId) {
    const allReviews = this.getAllStoredReviews();
    return allReviews.filter(r => r.restaurantId === restaurantId);
  }
}

export const reviewsApi = new ReviewsApi();