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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    if (status === 401 || status === 403) {
      localStorage.removeItem('autowash_token');
      localStorage.removeItem('autowash_user');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user_roles');
      localStorage.removeItem('accessToken');
      sessionStorage.clear();
      window.dispatchEvent(new Event('auth_logout'));
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const customerApi = {
  // Get customer profile (points, tier, name)
  getProfile: async () => {
    try {
      const res = await api.get('/customer/profile');
      return res.data;
    } catch (err) {
      console.warn('API getProfile error, using fallback:', err.message);
      const userRaw = localStorage.getItem('autowash_user');
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          return {
            customerId: user.customerId || user.id || 1,
            fullName: user.fullName || user.name || 'Nguyen Van An',
            loyaltyPoints: user.loyaltyPoints !== undefined ? user.loyaltyPoints : 850,
            tierName: user.tierName || user.tier || 'MEMBER',
            bookingWindowDays: 7,
            vehicles: []
          };
        } catch (e) {}
      }
      return {
        customerId: 1,
        fullName: 'Nguyen Van An',
        loyaltyPoints: 850,
        tierName: 'MEMBER',
        bookingWindowDays: 7,
        vehicles: []
      };
    }
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/customer/profile', profileData);
    return res.data;
  },

  requestEmailVerification: async () => {
    const res = await api.post('/customer/email/request-verification');
    return res.data;
  },

  changePassword: async (passwordData) => {
    const res = await api.post('/customer/profile/change-password', passwordData);
    return res.data;
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

  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    try {
      const res = await api.put('/customer/notifications/mark-all-read');
      return res.data;
    } catch (err) {
      console.warn('API markAllNotificationsRead error:', err.message);
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
  getAvailableSlots: async (date) => {
    try {
      const res = await api.get(`/customer/bookings/slots?date=${date}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn('API getAvailableSlots error, using demo fallback:', err.message);
    }
    // Demo Fallback Slots
    return [
      { slotId: 1, startTime: "08:00:00", endTime: "09:00:00", maxCapacity: 3, bookedCount: 0, availableCapacity: 3, isAvailable: true },
      { slotId: 2, startTime: "09:00:00", endTime: "10:00:00", maxCapacity: 3, bookedCount: 1, availableCapacity: 2, isAvailable: true },
      { slotId: 3, startTime: "10:00:00", endTime: "11:00:00", maxCapacity: 3, bookedCount: 0, availableCapacity: 3, isAvailable: true },
      { slotId: 4, startTime: "14:00:00", endTime: "15:00:00", maxCapacity: 3, bookedCount: 0, availableCapacity: 3, isAvailable: true },
      { slotId: 5, startTime: "15:00:00", endTime: "16:00:00", maxCapacity: 3, bookedCount: 0, availableCapacity: 3, isAvailable: true },
      { slotId: 6, startTime: "16:00:00", endTime: "17:00:00", maxCapacity: 3, bookedCount: 0, availableCapacity: 3, isAvailable: true }
    ];
  },

  // Get customer's voucher wallet
  getMyVouchers: async (customerId = null, status = 'ISSUED') => {
    try {
      const url = customerId 
        ? `/customer/rewards/my-vouchers?status=${status}&customerId=${customerId}` 
        : `/customer/rewards/my-vouchers?status=${status}`;
      const res = await api.get(url);
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
  getMyBookings: async (status = null) => {
    try {
      const url = status ? `/customer/bookings?status=${status}` : '/customer/bookings';
      const res = await api.get(url);
      return res.data || [];
    } catch (err) {
      console.warn('API getMyBookings error, using fallback:', err.message);
      return [];
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
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn('API getRewardShop error, using demo fallback:', err.message);
    }
    // Demo Fallback Rewards Shop Items
    return [
      {
        id: 1,
        code: "WELCOME50",
        title: "Quà chào mừng thành viên mới",
        description: "Giảm 10% cho đơn rửa xe đầu tiên",
        discountType: "PERCENTAGE",
        value: 10,
        pointsCost: 0,
        minTier: "Member",
        isUnlocked: true,
        isGrayscale: false,
        unlockTooltip: null
      },
      {
        id: 4,
        code: "VOUCHER_50K",
        title: "Voucher Giảm Giá 50k đổi điểm",
        description: "Áp dụng giảm trực tiếp cho mọi hóa đơn đặt lịch rửa xe.",
        discountType: "FIXED_AMOUNT",
        value: 50000,
        pointsCost: 450,
        minTier: "Member",
        isUnlocked: true,
        isGrayscale: false,
        unlockTooltip: null
      },
      {
        id: 5,
        code: "VOUCHER_FREE",
        title: "Voucher Rửa Xe Miễn Phí (Đổi Điểm)",
        description: "Đổi 1 lượt sử dụng gói rửa xe toàn diện hoàn toàn miễn phí.",
        discountType: "FREE_SERVICE",
        value: 100000,
        pointsCost: 1000,
        minTier: "Member",
        isUnlocked: false,
        isGrayscale: true,
        unlockTooltip: "🔒 Cần thêm 150 điểm Loyalty để đổi mã này."
      },
      {
        id: 2,
        code: "SUMMER24",
        title: "Voucher Mùa Hè Rực Rỡ",
        description: "Giảm giá 50.000đ cho tất cả dịch vụ rửa xe",
        discountType: "FIXED_AMOUNT",
        value: 50000,
        pointsCost: 0,
        minTier: "Gold",
        isUnlocked: false,
        isGrayscale: true,
        unlockTooltip: "🔒 Độc quyền cho thành viên hạng Gold trở lên."
      }
    ];
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
  getMyFeedbacks: async () => {
    try {
      const res = await api.get('/customer/feedbacks');
      return res.data || [];
    } catch (err) {
      console.warn('API getMyFeedbacks error:', err.message);
      return [];
    }
  },

  // Submit feedback
  createFeedback: async (feedbackData) => {
    const res = await api.post('/customer/feedbacks', feedbackData);
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

  // Set default vehicle
  setDefaultVehicle: async (vehicleId) => {
    const res = await api.put(`/customer/vehicles/${vehicleId}/set-default`);
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
