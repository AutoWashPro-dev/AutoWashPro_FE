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
    if (status === 401) {
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
  // Get customer profile & loyalty progress details
  getCustomerProfile: async () => {
    try {
      const res = await api.get('/customer/loyalty/profile');
      return res.data;
    } catch (err) {
      console.warn('API getCustomerProfile error, using fallback:', err.message);
      // Fallback matching mock data
      const userRaw = localStorage.getItem('autowash_user');
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          const totalSpending = Number(user.totalSpending || user.lifetimeSpend || 115000);
          return {
            customerId: user.customerId || user.id || 16,
            fullName: user.fullName || user.name || 'Nhân Thành',
            email: user.email || 'ctndx001@gmail.com',
            phoneNumber: user.phoneNumber || '0123456789',
            loyaltyPoints: user.loyaltyPoints !== undefined ? user.loyaltyPoints : 11,
            totalSpending: totalSpending,
            tierName: user.tierName || 'MEMBER',
            nextTierName: 'SILVER',
            nextTierMinSpend: 1000000,
            spendNeededForNextTier: Math.max(0, 1000000 - totalSpending),
            progressPercentage: Math.min(100, Math.floor((totalSpending / 1000000) * 100))
          };
        } catch (e) {}
      }
      return {
        customerId: 16,
        fullName: 'Nhân Thành',
        email: 'ctndx001@gmail.com',
        phoneNumber: '0123456789',
        loyaltyPoints: 11,
        totalSpending: 115000,
        tierName: 'MEMBER',
        nextTierName: 'SILVER',
        nextTierMinSpend: 1000000,
        spendNeededForNextTier: 885000,
        progressPercentage: 11.5
      };
    }
  },

  // Get customer profile via GET /api/v1/customer/auth/me
  getProfile: async () => {
    try {
      const res = await api.get('/customer/auth/me');
      return res.data;
    } catch (err) {
      console.warn('API getProfile (/customer/auth/me) error, using fallback:', err.message);
      // Re-throw 401/403 so the caller can redirect to login
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        throw err;
      }
      const userRaw = localStorage.getItem('autowash_user');
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          return {
            customerId: user.customerId || user.id || 1,
            phoneNumber: user.phoneNumber || '',
            fullName: user.fullName || user.name || 'Khách hàng',
            tierName: user.tierName || 'MEMBER',
            tierDisplayName: user.tierDisplayName || user.tierName || 'Member',
            bookingWindowDays: user.bookingWindowDays ?? 7,
            visitCount: user.visitCount ?? 0,
            totalSpending: user.totalSpending ?? 0,
            loyaltyPoints: user.loyaltyPoints ?? 0,
            vehicles: user.vehicles || []
          };
        } catch (e) {}
      }
      return {
        customerId: 1,
        phoneNumber: '',
        fullName: 'Khách hàng',
        tierName: 'MEMBER',
        tierDisplayName: 'Member',
        bookingWindowDays: 7,
        visitCount: 0,
        totalSpending: 0,
        loyaltyPoints: 0,
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
    // API spec: POST /customer/auth/email/reset-password
    // Payload: { token: string, newPassword: string, confirmPassword: string }
    const token = localStorage.getItem('autowash_token') || sessionStorage.getItem('autowash_token');
    const res = await api.post('/customer/auth/email/reset-password', {
      token: token,
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword,
    });
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
  getMyBookings: async (params = null) => {
    try {
      let url = '/customer/bookings';
      if (params) {
        if (typeof params === 'string') {
          url += `?status=${params}`;
        } else {
          const query = new URLSearchParams(params).toString();
          url += `?${query}`;
        }
      }
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
      const res = await api.get('/customer/feedbacks/my-feedbacks');
      return res.data || [];
    } catch (err) {
      console.warn('API getMyFeedbacks error:', err.message);
      return [];
    }
  },

  // Submit feedback
  createFeedback: async (customerId, feedbackData) => {
    const url = customerId ? `/customer/feedbacks?customerId=${customerId}` : '/customer/feedbacks';
    // Ensure bookingCode is explicitly a string to match backend's expected key type
    const payload = {
      ...feedbackData,
      bookingCode: String(feedbackData.bookingCode || '').trim(),
    };
    const res = await api.post(url, payload);
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
    const res = await api.patch(`/customer/vehicles/${vehicleId}/default`);
    return res.data;
  },

  // Delete vehicle
  deleteVehicle: async (vehicleId) => {
    const res = await api.delete(`/customer/vehicles/${vehicleId}`);
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
      ];
    }
  }
};
