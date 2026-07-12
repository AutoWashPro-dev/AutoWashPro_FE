import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('autowash_token') || localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const customerApi = {
  // Get customer profile (points, tier, name)
  getProfile: async () => {
    try {
      const res = await api.get('/customer/auth/me');
      return res.data;
    } catch (err) {
      console.warn('API getProfile error:', err.message);
      // Fallback profile for mock
      return {
        fullName: 'Sarah Jenkins',
        loyaltyPoints: 1240,
        tierName: 'GOLD MEMBER'
      };
    }
  },

  // Get active services from backend (core package + addons)
  getActiveServices: async () => {
    try {
      const res = await api.get('/customer/bookings/services');
      return res.data || [];
    } catch (err) {
      console.warn('API getActiveServices error:', err.message);
      return [];
    }
  },

  // Get available slots for a given date
  getAvailableSlots: async (dateStr) => {
    try {
      const res = await api.get(`/customer/bookings/slots?date=${dateStr}`);
      return res.data || [];
    } catch (err) {
      console.warn('API getAvailableSlots error:', err.message);
      return [];
    }
  },

  // Get customer's voucher wallet
  getMyVouchers: async (status = 'ISSUED') => {
    try {
      // If we have local override testing customerId, append it
      const res = await api.get(`/customer/rewards/my-vouchers?status=${status}&customerId=1`);
      return res.data || [];
    } catch (err) {
      console.warn('API getMyVouchers error:', err.message);
      return [];
    }
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    const res = await api.post('/customer/bookings', bookingData);
    return res.data;
  },

  // Initiate MoMo checkout for an existing booking
  checkoutBooking: async (payload) => {
    const res = await api.post('/customer/bookings/checkout', payload);
    return res.data;
  },

  // Get customer's history
  getMyBookings: async () => {
    try {
      const res = await api.get('/customer/bookings');
      return res.data || [];
    } catch (err) {
      console.warn('API getMyBookings error:', err.message);
      return [];
    }
  },

  // Cancel booking
  cancelBooking: async (id) => {
    const res = await api.post(`/customer/bookings/${id}/cancel`);
    return res.data;
  },

  // Get rewards shop listing
  getRewardShop: async () => {
    try {
      const res = await api.get('/customer/rewards/shop?customerId=1');
      return res.data || [];
    } catch (err) {
      console.warn('API getRewardShop error:', err.message);
      return [];
    }
  },

  // Claim free voucher (costPoints = 0)
  claimFreeVoucher: async (promotionId) => {
    const res = await api.post(`/customer/rewards/${promotionId}/claim?customerId=1`);
    return res.data;
  },

  // Exchange points for a voucher
  exchangePoints: async (promotionId) => {
    const res = await api.post(`/customer/rewards/${promotionId}/exchange?customerId=1`);
    return res.data;
  },

  // Get customer's feedback history
  getMyFeedbacks: async () => {
    try {
      const res = await api.get('/customer/feedbacks/my-feedbacks?customerId=1');
      return res.data || [];
    } catch (err) {
      console.warn('API getMyFeedbacks error:', err.message);
      return [];
    }
  },

  // Submit feedback
  createFeedback: async (feedbackData) => {
    const res = await api.post('/customer/feedbacks?customerId=1', feedbackData);
    return res.data;
  }
};
