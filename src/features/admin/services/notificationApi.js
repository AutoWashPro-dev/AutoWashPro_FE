import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Interceptor tự động gắn Bearer Token từ localStorage
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

export const notificationApi = {
  /**
   * Lấy danh sách thông báo cho Staff / Admin
   * @param {number} limit 
   */
  getStaffNotifications: async (limit = 20) => {
    try {
      const response = await api.get(`/admin/notifications?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.warn('Backend API /admin/notifications offline or error, using fallback:', error.message);
      const saved = localStorage.getItem('autowash_admin_notifications');
      if (saved) {
        return JSON.parse(saved);
      }
      return [
        {
          notificationId: 1,
          type: "NEW_BOOKING",
          title: "🎉 Đơn đặt lịch mới!",
          content: "Khách Trần Văn An đặt khung 08:00 - 09:00 ngày hôm nay (Biển số: 29A-12345)",
          referenceCode: "NV-1001",
          isRead: false,
          createdAtFormatted: "Vừa xong"
        },
        {
          notificationId: 2,
          type: "NEW_BOOKING",
          title: "🎉 Đơn đặt lịch mới!",
          content: "Khách Lê Thị Mai đặt khung 09:00 - 10:00 ngày hôm nay (Biển số: 51B-67890)",
          referenceCode: "NV-1002",
          isRead: false,
          createdAtFormatted: "10 phút trước"
        },
        {
          notificationId: 3,
          type: "BOOKING_CANCELLED",
          title: "⚠️ Khách hàng hủy lịch hẹn!",
          content: "Khách Nguyễn Hoàng Yến đã hủy lịch hẹn NV-1004 cho khung giờ 14:00 - 15:00 ngày mai.",
          referenceCode: "NV-1004",
          isRead: true,
          createdAtFormatted: "Hôm qua"
        }
      ];
    }
  },

  /**
   * Lấy số lượng thông báo chưa xem
   */
  getUnreadCount: async () => {
    try {
      const response = await api.get('/admin/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.warn('Backend API /admin/notifications/unread-count error:', error.message);
      const saved = localStorage.getItem('autowash_admin_notifications');
      if (saved) {
        const list = JSON.parse(saved);
        return { unreadCount: list.filter(n => !(n.isRead ?? n.read)).length };
      }
      return { unreadCount: 2 };
    }
  },

  /**
   * Đánh dấu tất cả thông báo là đã xem
   */
  markAllAsRead: async () => {
    try {
      await api.put('/admin/notifications/mark-all-read');
      return true;
    } catch (error) {
      console.warn('Backend API /admin/notifications/mark-all-read error:', error.message);
      const saved = localStorage.getItem('autowash_admin_notifications');
      if (saved) {
        const list = JSON.parse(saved).map(n => ({ ...n, isRead: true, read: true }));
        localStorage.setItem('autowash_admin_notifications', JSON.stringify(list));
      }
      return true;
    }
  }
};
