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

// Fallback dữ liệu chuẩn cho Frontend UX (khớp 100% PermissionCatalog mới trên Backend)
const MOCK_PERMISSIONS = [
  // Phase 1: Identity & RBAC
  { permissionId: 1, permissionCode: 'READ_STAFF', permissionLabel: 'Xem danh sách / chi tiết nhân viên', moduleGroup: 'Identity & RBAC', phase: 1, enabled: true },
  { permissionId: 2, permissionCode: 'CREATE_UPDATE_STAFF', permissionLabel: 'Tạo / sửa / khóa nhân viên', moduleGroup: 'Identity & RBAC', phase: 1, enabled: true },
  { permissionId: 3, permissionCode: 'DELETE_STAFF', permissionLabel: 'Xóa nhân viên (soft/hard)', moduleGroup: 'Identity & RBAC', phase: 1, enabled: true },
  { permissionId: 4, permissionCode: 'ASSIGN_ROLE', permissionLabel: 'Gán vai trò cho nhân viên', moduleGroup: 'Identity & RBAC', phase: 1, enabled: true },
  { permissionId: 5, permissionCode: 'MANAGE_ROLE', permissionLabel: 'Tạo / sửa / xóa vai trò', moduleGroup: 'Identity & RBAC', phase: 1, enabled: true },
  { permissionId: 6, permissionCode: 'CONFIG_RBAC_MATRIX', permissionLabel: 'Cấu hình ma trận phân quyền', moduleGroup: 'Identity & RBAC', phase: 1, enabled: true },
  
  // Phase 1: Customer CRM & Loyalty
  { permissionId: 7, permissionCode: 'VIEW_CUSTOMER_PROFILE', permissionLabel: 'Xem hồ sơ khách hàng & tích điểm', moduleGroup: 'Customer CRM', phase: 1, enabled: true },
  { permissionId: 8, permissionCode: 'MANAGE_CUSTOMER_STATUS', permissionLabel: 'Quản lý khách hàng (Khóa / Mở khóa)', moduleGroup: 'Customer CRM', phase: 1, enabled: true },
  { permissionId: 9, permissionCode: 'MANAGE_LOYALTY_CONFIG', permissionLabel: 'Cấu hình chính sách Tích điểm & Hạng thành viên', moduleGroup: 'Customer CRM', phase: 1, enabled: true },
  
  // Phase 1: Booking & POS
  { permissionId: 10, permissionCode: 'CREATE_WALK_IN_BOOKING', permissionLabel: 'Tạo & tiếp nhận đơn trực tiếp tại trạm', moduleGroup: 'Booking & POS', phase: 1, enabled: true },
  { permissionId: 11, permissionCode: 'CASHIER_CHECKIN', permissionLabel: 'Thu tiền tại quầy (Checkout / Hóa đơn)', moduleGroup: 'Booking & POS', phase: 1, enabled: true },
  { permissionId: 12, permissionCode: 'CANCEL_BOOKING', permissionLabel: 'Hủy đặt lịch rửa xe & giải phóng khoang', moduleGroup: 'Booking & POS', phase: 1, enabled: true },
  { permissionId: 13, permissionCode: 'VIEW_SLOT_AVAILABILITY', permissionLabel: 'Xem sơ đồ khung giờ & khoang trống', moduleGroup: 'Booking & POS', phase: 1, enabled: true },
  
  // Phase 1: Operations
  { permissionId: 14, permissionCode: 'VIEW_STATION_QUEUE', permissionLabel: 'Xem danh sách xe đang rửa tại trạm', moduleGroup: 'Operations', phase: 1, enabled: true },
  { permissionId: 15, permissionCode: 'MANAGE_WASH_PROGRESS', permissionLabel: 'Bắt đầu rửa & xác nhận hoàn thành ca rửa', moduleGroup: 'Operations', phase: 1, enabled: true },
  { permissionId: 16, permissionCode: 'MONITOR_REALTIME_QUEUE', permissionLabel: 'Giám sát màn hình tổng Dashboard realtime', moduleGroup: 'Operations', phase: 1, enabled: true },
  { permissionId: 17, permissionCode: 'VIEW_DASHBOARD_STATS', permissionLabel: 'Xem báo cáo thống kê doanh thu & hoạt động', moduleGroup: 'Operations', phase: 1, enabled: true },
  
  // Phase 1: Service & Pricing
  { permissionId: 18, permissionCode: 'MANAGE_SERVICE_CATALOG', permissionLabel: 'Quản lý gói dịch vụ & Bảng giá theo xe', moduleGroup: 'Service & Pricing', phase: 1, enabled: true },
  { permissionId: 19, permissionCode: 'MANAGE_SLOT_CONFIG', permissionLabel: 'Cấu hình khoang rửa & Lịch làm việc', moduleGroup: 'Service & Pricing', phase: 1, enabled: true },
  
  // Phase 1: System Settings
  { permissionId: 20, permissionCode: 'MANAGE_STATION_SETTINGS', permissionLabel: 'Cài đặt thông tin chung của Trạm rửa xe', moduleGroup: 'System Settings', phase: 1, enabled: true },
  
  // Phase 2: Notifications
  { permissionId: 21, permissionCode: 'SEND_BOOKING_NOTIFICATION', permissionLabel: 'Gửi thông báo đặt lịch thành công', moduleGroup: 'Notification (Flow 2)', phase: 2, enabled: false },
  { permissionId: 22, permissionCode: 'SEND_INCIDENT_ALERT', permissionLabel: 'Gửi cảnh báo sự cố bãi', moduleGroup: 'Notification (Flow 2)', phase: 2, enabled: false },
  { permissionId: 23, permissionCode: 'VIEW_NOTIFICATION_LOG', permissionLabel: 'Xem nhật ký thông báo', moduleGroup: 'Notification (Flow 2)', phase: 2, enabled: false },
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
      permissions: MOCK_PERMISSIONS.filter(p => p.enabled && !['DELETE_STAFF', 'MANAGE_ROLE', 'CONFIG_RBAC_MATRIX'].includes(p.permissionCode))
    },
    {
      roleId: 3,
      roleName: 'ROLE_CASHIER',
      description: 'Front Desk Cashier (Thu ngân quầy & tiếp nhận xe)',
      staffCount: 5,
      permissions: MOCK_PERMISSIONS.filter(p => [
        'VIEW_CUSTOMER_PROFILE', 'CREATE_WALK_IN_BOOKING', 'CASHIER_CHECKIN', 'CANCEL_BOOKING',
        'VIEW_SLOT_AVAILABILITY', 'VIEW_STATION_QUEUE', 'MANAGE_WASH_PROGRESS', 'MONITOR_REALTIME_QUEUE',
        'SEND_INCIDENT_ALERT'
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
