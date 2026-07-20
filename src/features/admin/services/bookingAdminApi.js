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

export const bookingAdminApi = {
  /**
   * Lấy danh sách bookings cho Admin/POS theo ngày hoặc trạng thái
   */
  getBookings: async (date, status) => {
    try {
      let url = `/admin/bookings`;
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (status && status !== 'All') params.append('status', status);
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const res = await api.get(url);
      return res.data;
    } catch (err) {
      console.warn('API /admin/bookings offline or error:', err.message);
      return [];
    }
  },

  /**
   * Lấy chi tiết đơn đặt lịch theo ID
   */
  getBookingById: async (id) => {
    try {
      const res = await api.get(`/admin/bookings/${id}`);
      return res.data;
    } catch (err) {
      console.warn('API getBookingById offline or error:', err.message);
      throw err;
    }
  },

  /**
   * Cập nhật trạng thái đơn đặt lịch (Confirm, Cancel, In Progress, Completed)
   */
  updateStatus: async (bookingId, newStatus) => {
    try {
      const res = await api.put(`/admin/bookings/${bookingId}/status`, { status: newStatus });
      return res.data;
    } catch (err) {
      console.error('API updateStatus failed:', err.message);
      throw err;
    }
  },

  /**
   * Tạo đơn đặt lịch trực tiếp tại quầy (Walk-in Booking - E2E-1 POS)
   */
  createWalkInBooking: async (data) => {
    try {
      const res = await api.post('/admin/bookings/walk-in', data);
      return res.data;
    } catch (err) {
      console.error('API createWalkInBooking failed:', err.message);
      throw err;
    }
  },

  /**
   * Tìm kiếm đơn đặt lịch chéo ngày cho Admin/POS
   */
  searchBookings: async (query, date) => {
    const res = await api.get(`/admin/bookings/search`, { params: { query, date } });
    return res.data;
  },

  /**
   * Check-in trễ giờ tại quầy
   */
  checkinLate: async (bookingId) => {
    const res = await api.post(`/admin/bookings/${bookingId}/checkin-late`);
    return res.data;
  },

  /**
   * Thanh toán hóa đơn tại quầy (Cash, Bank, MoMo QR)
   */
  checkoutBooking: async (bookingId, data) => {
    const res = await api.post(`/admin/bookings/${bookingId}/checkout`, data);
    return res.data;
  },

  /**
   * Giám sát công suất slot trong ngày
   */
  getOccupancyMonitor: async (date) => {
    const res = await api.get(`/admin/slots/occupancy-monitor`, { params: { date } });
    return res.data;
  },

  adjustLock: async (slotId, date, isLocked) => {
    const res = await api.post(`/admin/slots/${slotId}/lock`, null, { params: { date, lock: isLocked } });
    return res.data;
  }
};
