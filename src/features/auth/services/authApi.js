import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Thêm interceptor để tự động gắn Bearer Token nếu có trong localStorage
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

export const authApi = {
  /**
   * Omni-Login cho cả Khách hàng và Staff/Admin
   * @param {Object} data - { loginId, password }
   */
  login: async (data) => {
    try {
      const response = await api.post('/auth/login', data);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Tài khoản hoặc mật khẩu không chính xác!');
      }
      console.warn('Backend API /auth/login offline or network error, falling back to mock login:', error.message);
      // Fallback mock cho demo UX chỉ khi máy chủ backend hoàn toàn offline (mất kết nối mạng)
      const loginId = data.loginId || '';
      const isStaff = loginId.toLowerCase().includes('admin') || loginId.toLowerCase().includes('staff');
      
      if (loginId === 'error') {
        throw new Error('Tài khoản hoặc mật khẩu không chính xác!');
      }

      const mockUser = isStaff ? {
        id: 1,
        username: loginId,
        fullName: 'Admin Hệ Thống',
        userType: 'STAFF',
        roles: ['ROLE_ADMIN'],
      } : {
        id: 15,
        username: loginId,
        fullName: 'Nguyễn Minh Anh',
        phoneNumber: loginId.match(/^\d+$/) ? loginId : '0902000001',
        email: loginId.includes('@') ? loginId : 'customer@gmail.com',
        userType: 'CUSTOMER',
        roles: ['ROLE_CUSTOMER'],
        tierName: 'PLATINUM MEMBER',
      };

      return {
        accessToken: 'mock_jwt_token_' + Date.now(),
        tokenType: 'Bearer',
        expiresIn: 86400,
        user: mockUser,
        userType: isStaff ? 'STAFF' : 'CUSTOMER',
        redirectUrl: isStaff ? '/admin/dashboard' : '/customer/dashboard',
        roles: mockUser.roles,
        username: mockUser.username,
        fullName: mockUser.fullName,
      };
    }
  },

  /**
   * Đăng ký tài khoản khách hàng bằng Email
   * @param {Object} data - { fullName, phoneNumber, email, password }
   */
  registerWithEmail: async (data) => {
    try {
      const response = await api.post('/customer/auth/email/register', data);
      return response.data;
    } catch (error) {
      console.warn('Backend API register error or offline, falling back to mock:', error.message);
      if (error.response) {
        throw new Error(error.response.data?.message || `Lỗi xử lý từ máy chủ (${error.response.status})`);
      }
      return {
        message: 'Registration successful. Please check your email to activate your account.',
        email: data.email,
        mailMode: 'MOCK',
        devActionUrl: `http://localhost:5173/verify-email?token=_MOCK_VERIFY_TOKEN_${Date.now()}`,
      };
    }
  },

  /**
   * Xác thực Email qua Token từ URL
   * @param {string} token
   */
  verifyEmail: async (token) => {
    try {
      const response = await api.get(`/customer/auth/email/verify?token=${token}`);
      return response.data;
    } catch (error) {
      console.warn('Backend API verify error or offline, falling back to mock:', error.message);
      if (error.response) {
        throw new Error(error.response.data?.message || `Lỗi xử lý từ máy chủ (${error.response.status})`);
      }
      return {
        success: true,
        message: 'Email verified successfully. Please login to continue.',
      };
    }
  },

  /**
   * Yêu cầu gửi link Quên mật khẩu qua Email
   * @param {string} email
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/customer/auth/email/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.warn('Backend API forgot password error or offline, falling back to mock:', error.message);
      if (error.response) {
        throw new Error(error.response.data?.message || `Lỗi xử lý từ máy chủ (${error.response.status})`);
      }
      return {
        message: 'If the email exists and the account is active, a password reset link has been sent.',
      };
    }
  },

  /**
   * Đặt lại mật khẩu với Token từ Email
   * @param {Object} data - { token, newPassword, confirmPassword }
   */
  resetPassword: async (data) => {
    try {
      const response = await api.post('/customer/auth/email/reset-password', data);
      return response.data;
    } catch (error) {
      console.warn('Backend API reset password error or offline, falling back to mock:', error.message);
      if (error.response) {
        throw new Error(error.response.data?.message || `Lỗi xử lý từ máy chủ (${error.response.status})`);
      }
      return {
        message: 'Password reset successfully. Please login with your new password.',
      };
    }
  },

  /**
   * Kích hoạt tài khoản được tạo lúc Booking
   * @param {Object} data - { token, newPassword, confirmPassword }
   */
  claimAccount: async (data) => {
    try {
      const response = await api.post('/customer/auth/email/claim', data);
      return response.data;
    } catch (error) {
      console.warn('Backend API claim account error or offline, falling back to mock:', error.message);
      if (error.response) {
        throw new Error(error.response.data?.message || `Lỗi xử lý từ máy chủ (${error.response.status})`);
      }
      return {
        success: true,
        message: 'Account claimed and activated successfully. You can now login.',
      };
    }
  },

  /**
   * Lấy thông tin hồ sơ Khách hàng
   */
  getProfile: async () => {
    try {
      const response = await api.get('/customer/auth/me');
      return response.data;
    } catch (error) {
      console.warn('Backend API getProfile error or offline, falling back to mock:', error.message);
      const userStr = localStorage.getItem('autowash_user');
      if (userStr) return JSON.parse(userStr);
      return {
        customerId: 15,
        fullName: 'Nguyễn Minh Anh',
        phoneNumber: '0902000001',
        email: 'customer@gmail.com',
        tierName: 'PLATINUM MEMBER',
        loyaltyPoints: 1240,
        totalSpending: 1500000,
        totalVisits: 12,
      };
    }
  },
};
