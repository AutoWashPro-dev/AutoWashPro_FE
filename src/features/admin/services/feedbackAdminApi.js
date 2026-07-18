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

export const feedbackAdminApi = {
  getFeedbacks: async (status, ratingLte, page = 0, size = 50) => {
    try {
      let url = `/admin/feedbacks?page=${page}&size=${size}`;
      if (status && status !== 'All') url += `&status=${status}`;
      if (ratingLte !== undefined && ratingLte !== null) url += `&ratingLte=${ratingLte}`;
      const res = await api.get(url);
      const items = res.data?.content || res.data || [];
      return items.map(item => {
        const rating = item.ratingStars !== undefined && item.ratingStars !== null ? item.ratingStars : (item.rating !== undefined && item.rating !== null ? item.rating : 5);
        return {
          ...item,
          id: item.feedbackId || item.id,
          date: item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'Vừa xong',
          customer: {
            id: item.customerCode || `C-0${item.customerId}`,
            customerId: item.customerId,
            name: item.customerName || 'Khách hàng',
            phone: item.customerPhone || '090***000',
            avatar: item.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
          },
          rating: rating,
          comment: item.comment,
          sentiment: rating <= 2 ? 'Negative' : rating >= 4 ? 'Positive' : 'Neutral',
          status: item.status === 'NEW' ? 'New' : item.status === 'RESOLVED' ? 'Resolved' : 'Reviewed',
          bookingId: item.bookingCode || 'AW-0000',
          internalNotes: item.resolutionNotes || item.internalNotes || ''
        };
      });
    } catch (err) {
      console.warn('API getFeedbacks error:', err.message);
      return [];
    }
  },

  resolveFeedback: async (id, data) => {
    const res = await api.put(`/admin/feedbacks/${id}/resolve`, {
      resolutionNotes: data.resolutionNotes,
      grantCompensationVoucher: data.grantCompensationVoucher || false,
      voucherCode: data.voucherCode || null,
      discountValue: data.discountValue || null
    });
    return res.data;
  }
};
