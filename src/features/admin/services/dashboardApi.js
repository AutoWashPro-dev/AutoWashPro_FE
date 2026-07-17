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
    const token = localStorage.getItem('autowash_token') || localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const dashboardApi = {
  /**
   * 1. Thẻ KPI thông số tổng quan
   */
  getKpiSummary: async (timeRange = 'TODAY', fromDate, toDate) => {
    try {
      const params = new URLSearchParams({ timeRange });
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      const res = await api.get(`/admin/dashboard/kpi-summary?${params.toString()}`);
      return res.data;
    } catch (error) {
      console.warn('API getKpiSummary error or offline:', error.message);
      throw error;
    }
  },

  /**
   * 2. Biểu đồ 1: Stacked Bar cơ cấu dịch vụ & đường AOV
   */
  getRevenueTrends: async (timeRange = 'TODAY', fromDate, toDate) => {
    try {
      const params = new URLSearchParams({ timeRange });
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      const res = await api.get(`/admin/dashboard/revenue-trends?${params.toString()}`);
      return res.data;
    } catch (error) {
      console.warn('API getRevenueTrends error or offline:', error.message);
      throw error;
    }
  },

  /**
   * 3. Biểu đồ Donut: Phân phối trạng thái đơn hàng
   */
  getBookingDistribution: async (timeRange = 'TODAY', fromDate, toDate) => {
    try {
      const params = new URLSearchParams({ timeRange });
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      const res = await api.get(`/admin/dashboard/booking-distribution?${params.toString()}`);
      return res.data;
    } catch (error) {
      console.warn('API getBookingDistribution error or offline:', error.message);
      throw error;
    }
  },

  /**
   * 4. Biểu đồ 2: Hiệu suất 12 Khung giờ E2E-1 & Cảnh báo rủi ro
   */
  getSlotPerformance: async (timeRange = 'TODAY', fromDate, toDate) => {
    try {
      const params = new URLSearchParams({ timeRange });
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      const res = await api.get(`/admin/dashboard/slot-performance?${params.toString()}`);
      return res.data;
    } catch (error) {
      console.warn('API getSlotPerformance error or offline:', error.message);
      throw error;
    }
  },

  /**
   * 5. AI Advisor: Phân tích và sinh lời khuyên / chiến dịch Win-back
   */
  analyzeDashboard: async (timeRange = 'TODAY', fromDate, toDate) => {
    try {
      const params = new URLSearchParams({ timeRange });
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      const res = await api.post(`/admin/dashboard/ai-advisor/analyze?${params.toString()}`);
      return res.data;
    } catch (error) {
      console.error('API analyzeDashboard error:', error.message);
      throw error;
    }
  },

  /**
   * 6. AI Advisor: 1-Click Apply đề xuất chiến dịch
   */
  applyProposal: async (proposalId) => {
    try {
      const res = await api.post(`/admin/dashboard/ai-advisor/apply-proposal/${proposalId}`);
      return res.data;
    } catch (error) {
      console.error('API applyProposal error:', error.message);
      throw error;
    }
  }
};
