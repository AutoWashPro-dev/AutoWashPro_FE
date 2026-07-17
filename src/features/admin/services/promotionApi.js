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

export const promotionApi = {
  getKpiSummary: async () => {
    try {
      const res = await api.get('/admin/promotions/kpi-summary');
      return res.data;
    } catch (err) {
      console.warn('API getKpiSummary error, using fallback:', err.message);
      return {
        totalPromoValueIssued: 125400000,
        activeCampaignsCount: 7,
        totalVouchersClaimed: 1890,
        marketingRoi: 3.2,
        redemptionRate: 65.6
      };
    }
  },

  getPromotions: async (status, keyword, page = 0, size = 50) => {
    try {
      let url = `/admin/promotions?page=${page}&size=${size}`;
      if (status && status !== 'ALL') url += `&status=${status}`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
      const res = await api.get(url);
      const items = res.data?.content || res.data || [];
      return items.map(item => {
        let mappedType = 'cash';
        if (item.discountType === 'PERCENTAGE') mappedType = 'percent';
        if (item.discountType === 'FREE_SERVICE') mappedType = 'free_wash';
        return {
          ...item,
          discountType: mappedType,
          isActive: item.status === 'ACTIVE'
        };
      });
    } catch (err) {
      console.warn('API getPromotions error, using fallback:', err.message);
      return [];
    }
  },

  createPromotion: async (data) => {
    let backendType = 'FIXED_AMOUNT';
    if (data.discountType === 'percent' || data.discountType === 'PERCENTAGE') backendType = 'PERCENTAGE';
    if (data.discountType === 'free_wash' || data.discountType === 'FREE_SERVICE') backendType = 'FREE_SERVICE';
    
    // Parse dates to correct ISO formats if present, or let them pass
    const payload = {
      code: data.code,
      name: data.name,
      description: data.description || '',
      discountType: backendType,
      value: Number(data.value) || 0,
      costPoints: Number(data.costPoints) || 0,
      minTier: data.minTier || 'Member',
      minRecencyDays: Number(data.minRecencyDays) || 0,
      maxClaimPerUser: Number(data.maxClaimPerUser) || 0,
      totalBudget: Number(data.totalBudget) || 0,
      startDate: data.startDate ? (data.startDate.includes('T') ? data.startDate : `${data.startDate}T00:00:00`) : null,
      endDate: data.endDate ? (data.endDate.includes('T') ? data.endDate : `${data.endDate}T23:59:59`) : null,
      applicableServiceCode: data.applicableServiceCode || null,
      applicableDays: data.applicableDays || null,
      maxDiscountAmount: data.maxDiscountAmount != null ? Number(data.maxDiscountAmount) : null,
      minOrderValue: data.minOrderValue != null ? Number(data.minOrderValue) : null
    };

    const res = await api.post('/admin/promotions', payload);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.put(`/admin/promotions/${id}/status?status=${status}`);
    return res.data;
  },

  deletePromotion: async (id) => {
    const res = await api.delete(`/admin/promotions/${id}`);
    return res.data;
  },

  previewTarget: async (data) => {
    const res = await api.post('/admin/promotions/target-preview', data);
    return res.data;
  },

  grantDirect: async (data) => {
    const res = await api.post('/admin/promotions/grant-direct', data);
    return res.data;
  }
};
