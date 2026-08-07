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
      // Gọi song song các API lấy profile, my-benefits (có chứa bookingWindowDays từ DB) và tiers config của admin
      const [resProfile, resBenefits, resTiers] = await Promise.allSettled([
        api.get('/customer/loyalty/profile'),
        api.get('/customer/loyalty/my-benefits'),
        api.get('/customer/loyalty/tiers')
      ]);

      const profileData = resProfile.status === 'fulfilled' ? (resProfile.value.data || {}) : {};
      const benefitsData = resBenefits.status === 'fulfilled' ? (resBenefits.value.data || {}) : {};
      const tiersData = resTiers.status === 'fulfilled' ? (resTiers.value.data || []) : [];

      // Lưu danh sách tiers từ admin vào localStorage làm cache đồng bộ
      if (Array.isArray(tiersData) && tiersData.length > 0) {
        const mappedTiers = tiersData.map(item => ({
          ...item,
          tierId: item.tierId || item.id,
          key: (item.tierName || item.name || '').toUpperCase(),
          name: (item.tierName || item.name || '').toUpperCase(),
          minSpend: item.minSpendVnd || item.minSpend || 0,
          pointMultiplier: item.tierMultiplier !== undefined ? item.tierMultiplier : 1.0,
          bookingWindow: item.bookingWindowDays || item.bookingWindow || 7,
          bookingWindowDays: item.bookingWindowDays || item.bookingWindow || 7,
          isActive: item.isActive !== undefined ? item.isActive : true
        }));
        localStorage.setItem('autowash_tiers', JSON.stringify(mappedTiers));
      }

      // Ưu tiên 1: bookingWindowDays từ my-benefits API (trực tiếp từ DB tier của customer)
      let windowDays = benefitsData.bookingWindowDays || benefitsData.bookingWindow || profileData.bookingWindowDays;

      // Ưu tiên 2: Khớp hạng tierName trong danh sách tiers từ API admin
      const userTierName = (benefitsData.tierName || profileData.tierName || 'MEMBER').toUpperCase();
      if (!windowDays) {
        const tiersList = Array.isArray(tiersData) && tiersData.length > 0 ? tiersData : (() => {
          try {
            return JSON.parse(localStorage.getItem('autowash_tiers') || '[]');
          } catch (e) { return []; }
        })();

        const matchedTier = tiersList.find(t => (t.tierName || t.name || t.key || '').toUpperCase() === userTierName);
        if (matchedTier) {
          windowDays = Number(matchedTier.bookingWindowDays || matchedTier.bookingWindow || 7);
        }
      }

      return {
        ...profileData,
        ...benefitsData,
        tierName: userTierName,
        bookingWindowDays: Number(windowDays || 7)
      };
    } catch (err) {
      console.warn('API getCustomerProfile error, using fallback:', err.message);
      const userRaw = localStorage.getItem('autowash_user');
      let userTierName = 'MEMBER';
      let totalSpending = 115000;
      let fullName = 'Nhân Thành';
      let email = 'ctndx001@gmail.com';
      let phone = '0123456789';
      let points = 11;
      let customerId = 16;

      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          totalSpending = Number(user.totalSpending || user.lifetimeSpend || 115000);
          userTierName = (user.tierName || 'MEMBER').toUpperCase();
          fullName = user.fullName || user.name || fullName;
          email = user.email || email;
          phone = user.phoneNumber || phone;
          points = user.loyaltyPoints !== undefined ? user.loyaltyPoints : points;
          customerId = user.customerId || user.id || customerId;
        } catch (e) {}
      }

      let windowDays = 7;
      try {
        const tiers = JSON.parse(localStorage.getItem('autowash_tiers') || '[]');
        const foundTier = tiers.find(t => (t.key || t.name || t.tierName || '').toUpperCase() === userTierName);
        if (foundTier) {
          windowDays = Number(foundTier.bookingWindowDays || foundTier.bookingWindow || 7);
        }
      } catch (e) {}

      return {
        customerId: customerId,
        fullName: fullName,
        email: email,
        phoneNumber: phone,
        loyaltyPoints: points,
        totalSpending: totalSpending,
        tierName: userTierName,
        nextTierName: 'SILVER',
        nextTierMinSpend: 1000000,
        spendNeededForNextTier: Math.max(0, 1000000 - totalSpending),
        progressPercentage: Math.min(100, Math.floor((totalSpending / 1000000) * 100)),
        bookingWindowDays: Number(windowDays || 7)
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
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn('API getActiveServices error, using demo fallback:', err.message);
    }
    const srvFoamStd = { id: 'SRV-10', serviceId: 10, serviceCode: 'SRV-FOAM-STD', serviceName: 'Rửa bọt tuyết tiêu chuẩn', price: 15000, durationMinutes: 10, serviceType: 'SINGLE_SERVICE', description: 'Làm sạch bụi bẩn toàn thân xe bằng bọt tuyết trung tính PH7 chuyên dụng' };
    const srvDryAir = { id: 'SRV-11', serviceId: 11, serviceCode: 'SRV-DRY-AIR', serviceName: 'Xịt khô vòi khí nén', price: 10000, durationMinutes: 5, serviceType: 'SINGLE_SERVICE', description: 'Thổi sạch nước đọng lốc máy, công tắc và các khe kẽ bằng khí nén áp lực cao' };
    const srvWipeShine = { id: 'SRV-12', serviceId: 12, serviceCode: 'SRV-WIPE-SHINE', serviceName: 'Lau khô & lau bóng dàn áo', price: 10000, durationMinutes: 5, serviceType: 'SINGLE_SERVICE', description: 'Lau khô kiệt nước và lau bóng dàn áo bằng khăn microfiber mịn chống trầy sơn' };
    const srvDegreaseEng = { id: 'SRV-13', serviceId: 13, serviceCode: 'SRV-DEGREASE-ENG', serviceName: 'Tẩy nhờn lốc máy & gầm xe', price: 20000, durationMinutes: 10, serviceType: 'SINGLE_SERVICE', description: 'Tẩy sạch mảng bám dầu nhớt bẩn lâu ngày dưới gầm và lốc máy xe' };
    const srvWashDetail = { id: 'SRV-14', serviceId: 14, serviceCode: 'SRV-WASH-DETAIL', serviceName: 'Rửa chi tiết khoang máy & phuộc', price: 35000, durationMinutes: 15, serviceType: 'SINGLE_SERVICE', description: 'Vệ sinh cẩn thận từng ngóc ngách, con ốc, gắp sau và ti phuộc xe máy' };

    const addTyreDress = { id: 'SRV-20', serviceId: 20, serviceCode: 'ADD-TYRE-DRESS', serviceName: 'Quét mỡ dưỡng bóng đen lốp xe', price: 15000, durationMinutes: 5, serviceType: 'ADDON', description: 'Bảo vệ cao su lốp chống nứt nẻ, tạo độ bóng đen tự nhiên như xe mới xuất xưởng' };
    const addChainClean = { id: 'SRV-21', serviceId: 21, serviceCode: 'ADD-CHAIN-CLEAN', serviceName: 'Tẩy rửa nhông sên dĩa (xích)', price: 25000, durationMinutes: 15, serviceType: 'ADDON', description: 'Tẩy sạch cặn mỡ đen, rỉ sét bám trên xích sên bằng chai xịt dung dịch chuyên dụng' };
    const addChainLube = { id: 'SRV-22', serviceId: 22, serviceCode: 'ADD-CHAIN-LUBE', serviceName: 'Tra mỡ bôi trơn xích Motul VIP', price: 15000, durationMinutes: 5, serviceType: 'ADDON', description: 'Tra dung dịch bôi trơn kết dính cao giúp xích êm ái, giảm ma sát và chống văng mỡ' };
    const addPlasticRestore = { id: 'SRV-23', serviceId: 23, serviceCode: 'ADD-PLASTIC-RESTORE', serviceName: 'Phục hồi nhựa nhám dàn áo', price: 20000, durationMinutes: 10, serviceType: 'ADDON', description: 'Dưỡng phục hồi các chi tiết nhựa nhám bị ố trắng, bạc màu do nắng mưa' };
    const addHelmetSan = { id: 'SRV-24', serviceId: 24, serviceCode: 'ADD-HELMET-SAN', serviceName: 'Vệ sinh sấy khử khuẩn mũ bảo hiểm', price: 15000, durationMinutes: 10, serviceType: 'ADDON', description: 'Diệt khuẩn nấm mốc lót mũ bằng bọt nano và sấy khô bằng tia UV khử mùi' };
    const addWaxProtect = { id: 'SRV-25', serviceId: 25, serviceCode: 'ADD-WAX-PROTECT', serviceName: 'Phủ sáp bóng Gloss Shield bảo vệ sơn', price: 30000, durationMinutes: 10, serviceType: 'ADDON', description: 'Tạo lớp phủ bóng kháng nước nhẹ, chống bám bụi và bảo vệ lớp sơn bóng/sơn mờ' };

    return [
      { id: 'S-01', serviceId: 1, serviceCode: 'PKG-STD', serviceName: 'Gói Rửa Xe Tiêu Chuẩn', price: 30000, durationMinutes: 15, serviceType: 'PACKAGE', description: 'Quy trình rửa sạch nhanh toàn thân xe, thổi khô kiệt nước và lau bóng chuẩn tiệm', includedServices: [srvFoamStd, srvDryAir, srvWipeShine] },
      { id: 'S-02', serviceId: 2, serviceCode: 'PKG-DELUXE', serviceName: 'Gói Chăm Sóc Cao Cấp', price: 60000, durationMinutes: 25, serviceType: 'PACKAGE', description: 'Rửa bọt tuyết kết hợp tẩy rửa dầu nhờn gầm máy, quét dưỡng đen lốp và tra mỡ xích', includedServices: [srvFoamStd, srvDegreaseEng, addTyreDress, addChainLube] },
      { id: 'S-03', serviceId: 3, serviceCode: 'PKG-ULTIMATE', serviceName: 'Gói Chăm Sóc Siêu Cấp & Bảo Dưỡng VIP', price: 110000, durationMinutes: 40, serviceType: 'PACKAGE', description: 'Gói bảo dưỡng toàn diện từ chi tiết khoang máy đến dọn xích nhông đĩa, phục hồi nhựa nhám dàn áo và phủ bóng lốp', includedServices: [srvWashDetail, addChainClean, addChainLube, addPlasticRestore, addTyreDress] },
      srvFoamStd, srvDryAir, srvWipeShine, srvDegreaseEng, srvWashDetail, addTyreDress, addChainClean, addChainLube, addPlasticRestore, addHelmetSan, addWaxProtect
    ];
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
