import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '../features/admin/components/AdminSidebar';
import AdminHeader from '../features/admin/components/AdminHeader';
import AdminStatusBar from '../features/admin/components/AdminStatusBar';
import QuickNewBookingModal from '../features/admin/components/QuickNewBookingModal';
import BookingSuccessToast from '../features/admin/components/BookingSuccessToast';
import BookingActionToast from '../features/admin/components/BookingActionToast';
import BookingDetailModal from '../features/admin/components/BookingDetailModal';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
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
    const isCashier = roles.includes('ROLE_CASHIER');
    const isFallbackCashier = !isAdmin && !isManager;

    if (isCashier || isFallbackCashier) {
      if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/bookings') {
        navigate('/admin/bookings', { replace: true });
      }
    } else if (isManager) {
      if (location.pathname === '/admin/settings' || location.pathname === '/admin/settings/') {
        navigate('/admin/dashboard', { replace: true });
      }
      if (location.pathname === '/admin/roles' || location.pathname === '/admin/roles/') {
        navigate('/admin/dashboard', { replace: true });
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
