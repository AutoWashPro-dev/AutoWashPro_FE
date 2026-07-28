import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '../features/admin/components/AdminSidebar';
import AdminHeader from '../features/admin/components/AdminHeader';
import AdminStatusBar from '../features/admin/components/AdminStatusBar';
import QuickNewBookingModal from '../features/admin/components/QuickNewBookingModal';
import BookingSuccessToast from '../features/admin/components/BookingSuccessToast';
import BookingActionToast from '../features/admin/components/BookingActionToast';
import BookingDetailModal from '../features/admin/components/BookingDetailModal';
import { getUserPermissions, getFirstAllowedAdminRoute } from '../utils/rbac';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const currentPath = location.pathname.replace(/\/$/, '').toLowerCase();
    if (!currentPath.startsWith('/admin')) return;

    const permissions = getUserPermissions();

    // Preserved non-DB role check for System Settings
    const getRoles = () => {
      try {
        const userRolesRaw = localStorage.getItem('user_roles');
        if (userRolesRaw) {
          const parsed = JSON.parse(userRolesRaw);
          if (Array.isArray(parsed)) return parsed;
          if (typeof parsed === 'string') return [parsed];
        }
      } catch (e) {}
      try {
        const autowashUserRaw = localStorage.getItem('autowash_user');
        if (autowashUserRaw) {
          const user = JSON.parse(autowashUserRaw);
          const roles = user.roles || user.user?.roles || user.user_roles;
          if (Array.isArray(roles)) return roles;
          if (typeof roles === 'string') return [roles];
        }
      } catch (e) {}
      return [];
    };
    const roles = getRoles();
    const isAdmin = roles.includes('ROLE_ADMIN');
    const isManager = roles.includes('ROLE_MANAGER');

    let isAuthorized = true;

    if (currentPath === '/admin/dashboard') {
      isAuthorized = permissions.includes('VIEW_DASHBOARD');
    } else if (currentPath === '/admin/bookings') {
      isAuthorized = permissions.includes('VIEW_BOOKINGS');
    } else if (currentPath === '/admin/services-slots' || currentPath === '/admin/services') {
      isAuthorized = permissions.includes('VIEW_SERVICES');
    } else if (currentPath === '/admin/customers-loyalty' || currentPath === '/admin/customers') {
      isAuthorized = permissions.includes('VIEW_CUSTOMERS') || permissions.includes('VIEW_PROMOTIONS') || permissions.includes('VIEW_FEEDBACKS');
    } else if (currentPath === '/admin/promotions') {
      isAuthorized = permissions.includes('VIEW_PROMOTIONS');
    } else if (currentPath === '/admin/feedbacks') {
      isAuthorized = permissions.includes('VIEW_FEEDBACKS');
    } else if (currentPath === '/admin/roles') {
      isAuthorized = permissions.includes('CONFIG_RBAC_MATRIX');
    } else if (currentPath === '/admin/settings') {
      // Exclusively Super Admin (ROLE_ADMIN)
      isAuthorized = isAdmin;
    }

    if (!isAuthorized) {
      const fallbackRoute = getFirstAllowedAdminRoute(permissions);
      if (fallbackRoute && fallbackRoute !== currentPath) {
        navigate(fallbackRoute, { replace: true });
      }
    }
  }, [location.pathname, navigate]);
  return (
    <div className="flex h-screen bg-[#f7fafd] overflow-hidden">
      {/* 1. Sidebar bên trái */}
      <AdminSidebar />
      
      {/* 2. Phần nội dung chính bên phải */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* 2.1 Top Header */}
        <AdminHeader />
        
        {/* 2.2 Màn hình động (Pages load here) */}
        <main className="flex-1 overflow-y-auto bg-[#f7fafd]">
          <Outlet />
        </main>
        
        {/* 2.3 Status Bar chân trang */}
        <AdminStatusBar />
      </div>

      {/* 3. Các cấu phần Modal & Toast dùng chung */}
      <QuickNewBookingModal />
      <BookingSuccessToast />
      <BookingActionToast />
      <BookingDetailModal />
    </div>
  );
}
