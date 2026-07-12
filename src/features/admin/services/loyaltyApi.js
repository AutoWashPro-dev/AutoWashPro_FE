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
      console.warn('API /admin/loyalty/tiers offline or error, using localStorage fallback:', err.message);
      const saved = localStorage.getItem('autowash_tiers');
      if (saved) return JSON.parse(saved);
      return [
        { key: 'Member', name: 'Member', minSpend: 0, pointMultiplier: 1.0, bookingWindow: 7, isActive: true },
        { key: 'Silver', name: 'Silver', minSpend: 1000000, pointMultiplier: 1.2, bookingWindow: 7, isActive: true },
        { key: 'Gold', name: 'Gold', minSpend: 5000000, pointMultiplier: 1.5, bookingWindow: 14, isActive: true },
        { key: 'Platinum', name: 'Platinum', minSpend: 10000000, pointMultiplier: 2.0, bookingWindow: 14, isActive: true }
      ];
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
   * Run the loyalty retention simulation job
   */
  runSimulation: async () => {
    try {
      const res = await api.post('/admin/loyalty/run-simulation');
      return res.data;
    } catch (err) {
      console.warn('API /admin/loyalty/run-simulation error:', err.message);
      throw err;
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
      return items.map((item, idx) => ({
        ...item,
        id: item.customerCode || `C-0${idx + 1}`,
        customerId: item.customerId || item.id,
        name: item.fullName || item.name || 'Khách hàng',
        phone: item.phoneNumber || item.phone || '090***000',
        tier: item.tierName || item.tier || 'Member',
        points: item.loyaltyPoints || item.points || 0,
        totalSpend: item.totalSpending || item.totalSpend || 0,
        visits: item.totalVisits || item.visits || 1,
        avatar: item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
        lastVisitDays: item.lastVisitDays || 5,
        status: item.status || 'Active'
      }));
    } catch (err) {
      console.warn('API /admin/customers offline or error, using localStorage fallback:', err.message);
      const saved = localStorage.getItem('autowash_customers');
      if (saved) return JSON.parse(saved);
      return [
        { id: 'C-01', customerId: 1, name: 'Nguyễn Minh Anh', phone: '0912***456', tier: 'Platinum', points: 1240, totalSpend: 15400000, visits: 24, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100', lastVisitDays: 5, status: 'Active' },
        { id: 'C-02', customerId: 2, name: 'Lê Hoàng Long', phone: '0903***888', tier: 'Silver', points: 320, totalSpend: 3800000, visits: 8, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100', lastVisitDays: 14, status: 'Active' }
      ];
    }
  }
};
