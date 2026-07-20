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

export const loyaltyApi = {
  /**
   * Lấy danh sách các Hạng thành viên VIP & Cấu hình Booking Window
   */
  getAllTiers: async () => {
    try {
      const res = await api.get('/admin/loyalty/tiers');
      return res.data.map(item => ({
        ...item,
        key: item.tierName || item.name || item.key,
        name: item.tierName || item.name || item.key,
        minSpend: item.minSpendVnd || item.minSpend || 0,
        pointMultiplier: item.pointsMultiplier || item.pointMultiplier || 1.0,
        bookingWindow: item.bookingWindowDays || item.bookingWindow || 7,
        isActive: item.isActive !== undefined ? item.isActive : true
      }));
    } catch (err) {
      console.warn('API /admin/loyalty/tiers offline or error:', err.message);
      return [];
    }
  },

  /**
   * Cập nhật cấu hình hạng thành viên VIP
   * @param {number|string} tierId 
   * @param {Object} data 
   */
  updateTierConfig: async (tierId, data) => {
    try {
      const payload = {
        tierName: data.name || data.key,
        minSpendVnd: Number(data.minSpend),
        pointsMultiplier: Number(data.pointMultiplier),
        bookingWindowDays: Number(data.bookingWindow),
        isActive: data.isActive !== undefined ? data.isActive : true
      };
      const actualId = data.tierId || tierId || 1;
      const res = await api.put(`/admin/loyalty/tiers/${actualId}`, payload);
      return { ...data, ...res.data };
    } catch (err) {
      console.warn('API updateTierConfig fallback:', err.message);
      return data;
    }
  },

  /**
   * Lấy danh sách khách hàng từ CRM
   */
  getCustomers: async (status, keyword, page = 0, size = 50) => {
    try {
      let url = `/admin/customers?page=${page}&size=${size}`;
      if (status && status !== 'All') url += `&status=${status}`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
      const res = await api.get(url);
      const items = res.data?.content || res.data || [];
      return items.map((item, idx) => {
        const custId = item.customerId || item.id;
        const codeNum = custId ? String(custId).padStart(2, '0') : String(idx + 1).padStart(2, '0');
        
        // Calculate days since last wash or signup
        let days = 0;
        const lastWash = item.lastCompletedBookingAt;
        if (lastWash) {
          const washDate = new Date(lastWash);
          const now = new Date();
          const diffMs = now - washDate;
          days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        } else if (item.createdAt) {
          const regDate = new Date(item.createdAt);
          const now = new Date();
          const diffMs = now - regDate;
          days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        }

        return {
          ...item,
          id: item.customerCode || `C-${codeNum}`,
          customerId: custId,
          name: item.fullName || item.name || 'Khách hàng',
          phone: item.phoneNumber || item.phone || '090***000',
          tier: item.tierName || item.tier || 'Member',
          points: item.loyaltyPoints || item.points || 0,
          totalSpend: item.totalSpending || item.totalSpend || 0,
          visits: item.visitCount !== undefined ? item.visitCount : (item.totalVisits || item.visits || 0),
          avatar: item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
          lastVisitDays: days,
          status: item.status || 'Active'
        };
      });
    } catch (err) {
      console.warn('API /admin/customers offline or error:', err.message);
      return [];
    }
  },

  /**
   * Cập nhật trạng thái khách hàng (ACTIVE / INACTIVE)
   */
  updateCustomerStatus: async (customerId, status) => {
    try {
      const res = await api.patch(`/admin/customers/${customerId}/status`, { status });
      return res.data;
    } catch (err) {
      console.error('API updateCustomerStatus failed:', err.message);
      throw err;
    }
  },

  /**
   * Lấy lịch sử biến động điểm thưởng của một khách hàng từ CRM
   */
  getCustomerPointHistory: async (customerId) => {
    try {
      const res = await api.get(`/admin/customers/${customerId}/points/history`);
      return res.data || [];
    } catch (err) {
      console.warn(`API getCustomerPointHistory for customer ${customerId} offline:`, err.message);
      return [];
    }
  },

  /**
   * Lấy chi tiết khách hàng theo ID
   */
  getCustomerById: async (customerId) => {
    try {
      const res = await api.get(`/admin/customers/${customerId}`);
      return res.data;
    } catch (err) {
      console.warn(`API getCustomerById for customer ${customerId} offline, using fallback:`, err.message);
      const saved = localStorage.getItem('autowash_customers');
      if (saved) {
        const list = JSON.parse(saved);
        const found = list.find(c => String(c.customerId || c.id) === String(customerId));
        if (found) {
          return {
            ...found,
            tierName: found.tierName || found.tier,
            loyaltyPoints: found.loyaltyPoints !== undefined ? found.loyaltyPoints : (found.points || 0),
            lastCompletedBookingAt: found.lastCompletedBookingAt || new Date().toISOString()
          };
        }
      }
      return null;
    }
  },

  /**
   * Lấy cấu hình gộp (Loyalty Config & Tiers)
   */
  getLoyaltySettings: async () => {
    try {
      const res = await api.get('/admin/loyalty/settings');
      const data = res.data || {};
      const mappedTiers = (data.tiers || []).map(item => ({
        ...item,
        key: item.tierName || item.name || item.key,
        name: item.tierName || item.name || item.key,
        minSpend: item.minSpendVnd || item.minSpend || 0,
        pointMultiplier: item.pointsMultiplier || item.pointMultiplier || 1.0,
        bookingWindow: item.bookingWindowDays || item.bookingWindow || 7,
        isActive: item.isActive !== undefined ? item.isActive : true
      }));
      return {
        config: data.config || {},
        tiers: mappedTiers
      };
    } catch (err) {
      console.warn('API /admin/loyalty/settings offline:', err.message);
      return { config: {}, tiers: [] };
    }
  },

  /**
   * Cập nhật cấu hình chung Loyalty
   */
  updateLoyaltyConfig: async (configData) => {
    try {
      const payload = {
        basePointRate: Number(configData.basePointRate),
        basePoints: Number(configData.basePoints || 1),
        roundDown: Boolean(configData.roundDown),
        pointValidityMonths: Number(configData.pointValidityMonths),
        inactivityDowngradeMonths: Number(configData.inactivityDowngradeMonths),
        inactivityLockoutMonths: Number(configData.inactivityLockoutMonths)
      };
      const res = await api.put('/admin/loyalty/config', payload);
      return res.data;
    } catch (err) {
      console.warn('API /admin/loyalty/config offline, using fallback:', err.message);
      return configData;
    }
  },

  /**
   * Kích hoạt chạy các job rà soát tự động từ backend
   */
  runSimulationJobs: async () => {
    try {
      const res = await api.post('/admin/loyalty/simulate/run-jobs');
      return res.data;
    } catch (err) {
      console.warn('API /admin/loyalty/simulate/run-jobs error:', err.message);
      throw err;
    }
  },

  /**
   * Giả lập khách hàng vắng mặt
   */
  simulateSetInactivity: async (customerId, months) => {
    try {
      const res = await api.post(`/admin/loyalty/simulate/set-inactivity?customerId=${customerId}&months=${months}`);
      return res.data;
    } catch (err) {
      console.warn('API simulateSetInactivity error:', err.message);
      throw err;
    }
  },

  /**
   * Giả lập tích lũy điểm quá hạn
   */
  simulateSetPointsExpired: async (customerId, months) => {
    try {
      const res = await api.post(`/admin/loyalty/simulate/set-points-expired?customerId=${customerId}&months=${months}`);
      return res.data;
    } catch (err) {
      console.warn('API simulateSetPointsExpired error:', err.message);
      throw err;
    }
  }
};
