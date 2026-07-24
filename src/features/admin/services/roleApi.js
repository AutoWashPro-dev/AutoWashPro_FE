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

// Fallback dữ liệu chuẩn cho Frontend UX (khớp 100% PermissionCatalog mới trên Backend)
const MOCK_PERMISSIONS = [
  // Luồng E2E-1: Vận hành Quầy POS & Đặt lịch
  { permissionId: 1, permissionCode: 'VIEW_BOOKINGS', permissionLabel: 'Xem danh sách & chi tiết đơn đặt lịch', moduleGroup: 'Luồng E2E-1: Vận hành Quầy POS & Đặt lịch', phase: 1, enabled: true },
  { permissionId: 2, permissionCode: 'UPDATE_BOOKING_STATUS', permissionLabel: 'Cập nhật trạng thái đơn đặt lịch (Xác nhận, Đang rửa, Xong)', moduleGroup: 'Luồng E2E-1: Vận hành Quầy POS & Đặt lịch', phase: 1, enabled: true },
  { permissionId: 3, permissionCode: 'CHECKIN_LATE', permissionLabel: 'Xác nhận Check-in trễ giờ tại quầy', moduleGroup: 'Luồng E2E-1: Vận hành Quầy POS & Đặt lịch', phase: 1, enabled: true },
  { permissionId: 4, permissionCode: 'CHECKOUT_BOOKING', permissionLabel: 'Thanh toán hóa đơn & hoàn tất đơn tại quầy', moduleGroup: 'Luồng E2E-1: Vận hành Quầy POS & Đặt lịch', phase: 1, enabled: true },
  { permissionId: 5, permissionCode: 'LOCK_SLOT', permissionLabel: 'Khóa / Mở khóa thủ công mốc giờ rửa xe', moduleGroup: 'Luồng E2E-1: Vận hành Quầy POS & Đặt lịch', phase: 1, enabled: true },

  // Luồng E2E-2: Khách hàng CRM
  { permissionId: 6, permissionCode: 'VIEW_CUSTOMERS', permissionLabel: 'Tra cứu thông tin khách hàng & lịch sử điểm tích lũy', moduleGroup: 'Luồng E2E-2: Khách hàng CRM', phase: 1, enabled: true },
  { permissionId: 7, permissionCode: 'MANAGE_CUSTOMER_STATUS', permissionLabel: 'Khóa / Mở khóa trạng thái hoạt động tài khoản khách hàng', moduleGroup: 'Luồng E2E-2: Khách hàng CRM', phase: 1, enabled: true },

  // Luồng E2E-3: Khuyến mãi & Direct Gifting
  { permissionId: 8, permissionCode: 'VIEW_PROMOTIONS', permissionLabel: 'Xem danh sách chiến dịch & KPI khuyến mãi', moduleGroup: 'Luồng E2E-3: Khuyến mãi & Direct Gifting', phase: 1, enabled: true },
  { permissionId: 9, permissionCode: 'MANAGE_PROMOTIONS', permissionLabel: 'Tạo mới, kích hoạt / xóa chiến dịch Voucher', moduleGroup: 'Luồng E2E-3: Khuyến mãi & Direct Gifting', phase: 1, enabled: true },
  { permissionId: 10, permissionCode: 'GRANT_PROMOTIONS', permissionLabel: 'Xem trước tệp đối tượng & Tặng voucher trực tiếp', moduleGroup: 'Luồng E2E-3: Khuyến mãi & Direct Gifting', phase: 1, enabled: true },
  { permissionId: 11, permissionCode: 'VIEW_FEEDBACKS', permissionLabel: 'Xem danh sách đánh giá từ khách hàng', moduleGroup: 'Luồng E2E-3: Khuyến mãi & Direct Gifting', phase: 1, enabled: true },
  { permissionId: 12, permissionCode: 'RESOLVE_FEEDBACK', permissionLabel: 'Xử lý khiếu nại & Phát voucher đền bù', moduleGroup: 'Luồng E2E-3: Khuyến mãi & Direct Gifting', phase: 1, enabled: true },

  // Luồng E2E-4: Admin Dashboard & Analytics
  { permissionId: 13, permissionCode: 'VIEW_DASHBOARD', permissionLabel: 'Xem báo cáo KPI, Biểu đồ Doanh thu & Slot', moduleGroup: 'Luồng E2E-4: Dashboard & Analytics', phase: 1, enabled: true },

  // Cấu hình Hệ thống & RBAC Matrix
  { permissionId: 14, permissionCode: 'VIEW_SERVICES', permissionLabel: 'Xem bảng giá gói rửa & mốc giờ làm việc', moduleGroup: 'Cấu hình Hệ thống & RBAC', phase: 1, enabled: true },
  { permissionId: 15, permissionCode: 'MANAGE_SERVICES', permissionLabel: 'Thêm mới, sửa giá & Bật/Tắt gói dịch vụ', moduleGroup: 'Cấu hình Hệ thống & RBAC', phase: 1, enabled: true },
  { permissionId: 16, permissionCode: 'MANAGE_SLOTS', permissionLabel: 'Quản lý khung giờ, công suất & lịch đóng cửa', moduleGroup: 'Cấu hình Hệ thống & RBAC', phase: 1, enabled: true },
  { permissionId: 17, permissionCode: 'VIEW_NOTIFICATIONS', permissionLabel: 'Xem & đánh dấu đã đọc thông báo trạm', moduleGroup: 'Cấu hình Hệ thống & RBAC', phase: 1, enabled: true },
  { permissionId: 18, permissionCode: 'CONFIG_RBAC_MATRIX', permissionLabel: 'Cấu hình Ma trận phân quyền RBAC hệ thống', moduleGroup: 'Cấu hình Hệ thống & RBAC', phase: 1, enabled: true }
];

const getInitialMockRoles = () => {
  const stored = localStorage.getItem('autowash_mock_roles');
  if (stored) return JSON.parse(stored);
  
  const defaultRoles = [
    {
      roleId: 1,
      roleName: 'ROLE_ADMIN',
      description: 'System Administrator (Toàn quyền hệ thống)',
      staffCount: 2,
      permissions: MOCK_PERMISSIONS.filter(p => p.enabled)
    },
    {
      roleId: 2,
      roleName: 'ROLE_MANAGER',
      description: 'Station Manager (Quản lý vận hành trạm)',
      staffCount: 3,
      permissions: MOCK_PERMISSIONS.filter(p => p.enabled && p.permissionCode !== 'CONFIG_RBAC_MATRIX')
    },
    {
      roleId: 3,
      roleName: 'ROLE_CASHIER',
      description: 'Front Desk Cashier (Thu ngân quầy & tiếp nhận xe)',
      staffCount: 5,
      permissions: MOCK_PERMISSIONS.filter(p => [
        'VIEW_BOOKINGS', 'UPDATE_BOOKING_STATUS', 'CHECKIN_LATE', 'CHECKOUT_BOOKING',
        'VIEW_DASHBOARD', 'VIEW_SERVICES', 'VIEW_CUSTOMERS', 'VIEW_PROMOTIONS',
        'VIEW_FEEDBACKS', 'VIEW_NOTIFICATIONS'
      ].includes(p.permissionCode))
    }
  ];
  localStorage.setItem('autowash_mock_roles', JSON.stringify(defaultRoles));
  return defaultRoles;
};

export const roleApi = {
  /**
   * Lấy danh sách Roles (+ permissions + staffCount)
   */
  getRoles: async () => {
    try {
      const response = await api.get('/roles');
      return response.data;
    } catch (error) {
      console.warn('Backend API /roles offline, using mock data:', error.message);
      return getInitialMockRoles();
    }
  },

  /**
   * Lấy ma trận phân quyền RBAC
   */
  getRbacMatrix: async (includeDisabled = false) => {
    try {
      const response = await api.get(`/rbac/matrix?includeDisabled=${includeDisabled}`);
      return response.data;
    } catch (error) {
      console.warn('Backend API /rbac/matrix offline, using mock data:', error.message);
      const roles = getInitialMockRoles();
      const permissions = includeDisabled ? MOCK_PERMISSIONS : MOCK_PERMISSIONS.filter(p => p.enabled);
      
      const roleColumns = roles.map(r => ({
        roleId: r.roleId,
        roleName: r.roleName,
        description: r.description,
        permissionEditable: r.roleName !== 'ROLE_ADMIN',
        deletable: r.roleName !== 'ROLE_ADMIN' && !['ROLE_MANAGER', 'ROLE_CASHIER'].includes(r.roleName),
        assignedPermissionIds: r.permissions.map(p => p.permissionId)
      }));

      return {
        permissions: permissions,
        roles: roleColumns
      };
    }
  },

  /**
   * Lấy danh sách toàn bộ Permissions
   */
  getPermissions: async (includeDisabled = true) => {
    try {
      const response = await api.get(`/permissions?includeDisabled=${includeDisabled}`);
      return response.data;
    } catch (error) {
      console.warn('Backend API /permissions offline, using mock data:', error.message);
      return includeDisabled ? MOCK_PERMISSIONS : MOCK_PERMISSIONS.filter(p => p.enabled);
    }
  },

  /**
   * Tạo Custom Role mới
   */
  createRole: async (requestData) => {
    try {
      const response = await api.post('/roles', requestData);
      return response.data;
    } catch (error) {
      console.warn('Backend API POST /roles offline, using mock data:', error.message);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Không thể tạo vai trò mới');
      }
      const roles = getInitialMockRoles();
      if (roles.some(r => r.roleName === requestData.roleName)) {
        throw new Error(`Vai trò ${requestData.roleName} đã tồn tại trong hệ thống!`);
      }
      const assignedPerms = MOCK_PERMISSIONS.filter(p => (requestData.permissionIds || []).includes(p.permissionId));
      const newRole = {
        roleId: Date.now(),
        roleName: requestData.roleName,
        description: requestData.description || 'Custom Role',
        staffCount: 0,
        permissions: assignedPerms
      };
      const updated = [...roles, newRole];
      localStorage.setItem('autowash_mock_roles', JSON.stringify(updated));
      return newRole;
    }
  },

  /**
   * Cập nhật mô tả Role
   */
  updateRole: async (roleId, requestData) => {
    try {
      const response = await api.put(`/roles/${roleId}`, requestData);
      return response.data;
    } catch (error) {
      console.warn('Backend API PUT /roles offline, using mock data:', error.message);
      const roles = getInitialMockRoles();
      const updated = roles.map(r => r.roleId === Number(roleId) ? { ...r, description: requestData.description } : r);
      localStorage.setItem('autowash_mock_roles', JSON.stringify(updated));
      return updated.find(r => r.roleId === Number(roleId));
    }
  },

  /**
   * Xóa Custom Role
   */
  deleteRole: async (roleId) => {
    try {
      const response = await api.delete(`/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.warn('Backend API DELETE /roles offline, using mock data:', error.message);
      const roles = getInitialMockRoles();
      const target = roles.find(r => r.roleId === Number(roleId));
      if (target && target.roleName === 'ROLE_ADMIN') {
        throw new Error('Không thể xóa ROLE_ADMIN - vai trò quản trị tối cao!');
      }
      const updated = roles.filter(r => r.roleId !== Number(roleId));
      localStorage.setItem('autowash_mock_roles', JSON.stringify(updated));
      return { message: 'Xóa vai trò thành công' };
    }
  },

  /**
   * Gán Permissions cho Role (Ghi đè)
   */
  updateRolePermissions: async (roleId, permissionIds) => {
    try {
      const response = await api.put(`/roles/${roleId}/permissions`, { permissionIds });
      return response.data;
    } catch (error) {
      console.warn('Backend API PUT /roles/.../permissions offline, using mock data:', error.message);
      const roles = getInitialMockRoles();
      const assignedPerms = MOCK_PERMISSIONS.filter(p => permissionIds.includes(p.permissionId));
      const updated = roles.map(r => {
        if (r.roleId === Number(roleId)) {
          if (r.roleName === 'ROLE_ADMIN') throw new Error('Không thể sửa đổi ma trận phân quyền của ROLE_ADMIN!');
          return { ...r, permissions: assignedPerms };
        }
        return r;
      });
      localStorage.setItem('autowash_mock_roles', JSON.stringify(updated));
      return updated.find(r => r.roleId === Number(roleId));
    }
  }
};
