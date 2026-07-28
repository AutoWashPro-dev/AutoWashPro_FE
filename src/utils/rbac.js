export const DB_PERMISSIONS = [
  "VIEW_BOOKINGS",
  "UPDATE_BOOKING_STATUS",
  "CHECKIN_LATE",
  "CHECKOUT_BOOKING",
  "LOCK_SLOT",
  "VIEW_CUSTOMERS",
  "MANAGE_CUSTOMER_STATUS",
  "VIEW_PROMOTIONS",
  "MANAGE_PROMOTIONS",
  "GRANT_PROMOTIONS",
  "VIEW_FEEDBACKS",
  "RESOLVE_FEEDBACK",
  "VIEW_DASHBOARD",
  "VIEW_SERVICES",
  "MANAGE_SERVICES",
  "MANAGE_SLOTS",
  "VIEW_NOTIFICATIONS",
  "CONFIG_RBAC_MATRIX"
];

export const getUserPermissions = () => {
  try {
    const userStr = sessionStorage.getItem('autowash_user') || localStorage.getItem('autowash_user');
    let userPermissions = null;
    let userRoles = [];

    if (userStr) {
      const user = JSON.parse(userStr);
      const perms = user.permissions || user.user?.permissions;
      if (Array.isArray(perms) && perms.length > 0) {
        userPermissions = perms.map(p => (typeof p === 'string' ? p : p.permissionCode));
      }
      userRoles = user.roles || user.user?.roles || user.user_roles || [];
    }

    if (userRoles.length === 0) {
      try {
        const rolesRaw = sessionStorage.getItem('user_roles') || localStorage.getItem('user_roles');
        if (rolesRaw) {
          const parsed = JSON.parse(rolesRaw);
          userRoles = Array.isArray(parsed) ? parsed : [parsed];
        }
      } catch (e) {}
    }

    // ONLY ROLE_ADMIN inherently possesses all 18 DB permissions (wildcard override)
    if (userRoles.includes('ROLE_ADMIN')) {
      return DB_PERMISSIONS;
    }

    // If explicit userPermissions array exists on the logged-in user profile, return it directly
    if (Array.isArray(userPermissions) && userPermissions.length > 0) {
      return userPermissions;
    }

    // Lookup permissions assigned to user's roles from matrix in localStorage
    const mockRolesRaw = localStorage.getItem('autowash_mock_roles');
    let mockRoles = [];
    if (mockRolesRaw) {
      try { mockRoles = JSON.parse(mockRolesRaw); } catch (e) {}
    }

    if (mockRoles && mockRoles.length > 0) {
      const rolePermSet = new Set();
      mockRoles.forEach(r => {
        if (userRoles.includes(r.roleName) && Array.isArray(r.permissions)) {
          r.permissions.forEach(p => {
            const code = typeof p === 'string' ? p : p.permissionCode;
            if (code) rolePermSet.add(code);
          });
        }
      });
      return Array.from(rolePermSet);
    }

    // Default fallback if no matrix initialized yet:
    if (userRoles.includes('ROLE_MANAGER')) {
      return [
        'VIEW_BOOKINGS', 'UPDATE_BOOKING_STATUS', 'CHECKIN_LATE', 'CHECKOUT_BOOKING',
        'VIEW_DASHBOARD', 'VIEW_SERVICES', 'MANAGE_SERVICES', 'MANAGE_SLOTS',
        'VIEW_CUSTOMERS', 'VIEW_PROMOTIONS', 'VIEW_FEEDBACKS', 'VIEW_NOTIFICATIONS'
      ];
    }

    if (userRoles.includes('ROLE_CASHIER')) {
      return [
        'VIEW_BOOKINGS', 'UPDATE_BOOKING_STATUS', 'CHECKIN_LATE', 'CHECKOUT_BOOKING',
        'VIEW_DASHBOARD', 'VIEW_SERVICES', 'VIEW_CUSTOMERS', 'VIEW_PROMOTIONS',
        'VIEW_FEEDBACKS', 'VIEW_NOTIFICATIONS'
      ];
    }

    return [];
  } catch (e) {
    return [];
  }
};

export const hasPermission = (permissionCode) => {
  const permissions = getUserPermissions();
  return permissions.includes(permissionCode);
};

export const getFirstAllowedAdminRoute = (permissions = getUserPermissions()) => {
  const routePriority = [
    { code: 'VIEW_BOOKINGS', path: '/admin/bookings' },
    { code: 'VIEW_DASHBOARD', path: '/admin/dashboard' },
    { code: 'VIEW_SERVICES', path: '/admin/services-slots' },
    { code: 'VIEW_CUSTOMERS', path: '/admin/customers-loyalty' },
    { code: 'VIEW_PROMOTIONS', path: '/admin/customers-loyalty' },
    { code: 'VIEW_FEEDBACKS', path: '/admin/customers-loyalty' },
    { code: 'CONFIG_RBAC_MATRIX', path: '/admin/roles' }
  ];

  for (const item of routePriority) {
    if (permissions.includes(item.code)) {
      return item.path;
    }
  }
  return '/admin/bookings';
};
