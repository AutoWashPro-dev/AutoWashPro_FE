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
    const token = localStorage.getItem('autowash_token');
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
      // Fallback profile for mock - ensure customerId is present to load real API data
      return {
        customerId: 1, // Default customerId = 1 (Nguyễn Minh Anh)
        fullName: 'Nguyễn Minh Anh',
        loyaltyPoints: 1240,
        tierName: 'PLATINUM MEMBER',
        bookingWindowDays: 14,
        vehicles: [
          { vehicleId: 1, licensePlate: "51A-12345", model: "Honda SH 150i", isDefault: true }
        ]
      };
    }
  },

  // Get notifications
  getNotifications: async () => {
    try {
      const res = await api.get('/customer/notifications');
      return res.data || [];
    } catch (err) {
      console.warn('API getNotifications error:', err.message);
      return [];
    }
  },

  // Get notifications history
  getMyNotifications: async (limit = 20) => {
    try {
      const res = await api.get(`/customer/notifications?limit=${limit}`);
      return res.data || [];
    } catch (err) {
      console.warn('API getMyNotifications error:', err.message);
      throw err;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const res = await api.get('/customer/notifications/unread-count');
      return res.data || { unreadCount: 0 };
    } catch (err) {
      console.warn('API getUnreadCount error:', err.message);
      throw err;
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      const res = await api.put('/customer/notifications/mark-all-read');
      return res.data;
    } catch (err) {
      console.warn('API markAllAsRead error:', err.message);
      throw err;
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
  getMyVouchers: async (customerId = 1, status = 'ISSUED') => {
    try {
      const res = await api.get(`/customer/rewards/my-vouchers?status=${status}&customerId=${customerId}`);
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

  // Get customer's history
  getMyBookings: async () => {
    try {
      const res = await api.get('/customer/bookings');
      return res.data || [];
    } catch (err) {
      console.warn('API getMyBookings error, using fallback:', err.message);
      return [
        {
          bookingId: 101,
          bookingCode: 'AW-9812',
          bookingDate: '2026-06-30',
          startTime: '09:00:00',
          licensePlate: '51A-12345',
          model: 'Honda SH 150i',
          finalAmount: 80000,
          status: 'COMPLETED',
          items: [{ serviceNameSnapshot: 'Rửa xe máy siêu cấp & bảo dưỡng' }]
        },
        {
          bookingId: 102,
          bookingCode: 'AW-9720',
          bookingDate: '2026-06-15',
          startTime: '14:00:00',
          licensePlate: '51A-12345',
          model: 'Honda SH 150i',
          finalAmount: 50000,
          status: 'COMPLETED',
          items: [{ serviceNameSnapshot: 'Rửa xe máy cao cấp' }]
        }
      ];
    }
  },

  // Cancel booking
  cancelBooking: async (id) => {
    const res = await api.post(`/customer/bookings/${id}/cancel`);
    return res.data;
  },

  // Get rewards shop listing
  getRewardShop: async (customerId = 1) => {
    try {
      const res = await api.get(`/customer/rewards/shop?customerId=${customerId}`);
      return res.data || [];
    } catch (err) {
      console.warn('API getRewardShop error:', err.message);
      return [];
    }
  },

  // Claim free voucher (costPoints = 0)
  claimFreeVoucher: async (promotionId, customerId = 1) => {
    const res = await api.post(`/customer/rewards/${promotionId}/claim?customerId=${customerId}`);
    return res.data;
  },

  // Exchange points for a voucher
  exchangePoints: async (promotionId, customerId = 1) => {
    const res = await api.post(`/customer/rewards/${promotionId}/exchange?customerId=${customerId}`);
    return res.data;
  },

  // Get customer's feedback history
  getMyFeedbacks: async (customerId = 1) => {
    try {
      const res = await api.get(`/customer/feedbacks/my-feedbacks?customerId=${customerId}`);
      return res.data || [];
    } catch (err) {
      console.warn('API getMyFeedbacks error:', err.message);
      return [];
    }
  },

  // Submit feedback
  createFeedback: async (feedbackData, customerId = 1) => {
    const res = await api.post(`/customer/feedbacks?customerId=${customerId}`, feedbackData);
    return res.data;
  },

  // Get customer vehicles
  getMyVehicles: async () => {
    try {
      const res = await api.get('/customer/vehicles');
      return res.data || [];
    } catch (err) {
      console.warn('API getMyVehicles error:', err.message);
      return [];
    }
  },

  // Register vehicle
  addVehicle: async (vehicleData) => {
    const res = await api.post('/customer/vehicles', vehicleData);
    return res.data;
  },

  // Get customer's points ledger / transaction history
  getMyPointHistory: async () => {
    try {
      const res = await api.get('/customer/loyalty/points/history');
      return res.data || [];
    } catch (err) {
      console.warn('API getMyPointHistory error, using fallback:', err.message);
      return [
        { pointTransactionId: 101, points: 50, activityType: 'EARNED', bookingCode: 'AW-9801', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
        { pointTransactionId: 102, points: -20, activityType: 'REDEEMED', bookingCode: null, createdAt: '2026-07-15T14:30:00' },
        { pointTransactionId: 103, points: 15, activityType: 'EARNED', bookingCode: 'AW-9750', createdAt: '2026-07-10T11:00:00' },
        { pointTransactionId: 104, points: -50, activityType: 'EXPIRY', bookingCode: null, createdAt: '2026-07-01T00:00:00' }
      ];
    }
  }
};
