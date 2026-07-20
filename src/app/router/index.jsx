import { createBrowserRouter, Navigate } from 'react-router-dom';
import React from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import AdminDashboardPage from '../../features/admin/pages/AdminDashboardPage';
import AdminBookingsPage from '../../features/admin/pages/AdminBookingsPage';
import AdminServicesSlotsPage from '../../features/admin/pages/AdminServicesSlotsPage';
import AdminCustomersLoyaltyPage from '../../features/admin/pages/AdminCustomersLoyaltyPage';
import AdminRolesRBACPage from '../../features/admin/pages/AdminRolesRBACPage';
import AdminSettingsPage from '../../features/admin/pages/AdminSettingsPage';

// Import các trang và layout dành cho Khách hàng
import CustomerLayout from '../../layouts/CustomerLayout';
import CustomerDashboardPage from '../../features/customer/pages/CustomerDashboardPage';
import CustomerBookingPage from '../../features/customer/pages/CustomerBookingPage';
import CustomerRewardsPage from '../../features/customer/pages/CustomerRewardsPage';
import CustomerAccountPage from '../../features/customer/pages/CustomerAccountPage';
import CustomerGaragePage from '../../features/customer/pages/CustomerGaragePage';
import CustomerFeedbackPage from '../../features/customer/pages/CustomerFeedbackPage';

// Import các trang xác thực (Auth & Omni-Login)
import LoginPage from '../../features/auth/pages/LoginPage';
import RegisterPage from '../../features/auth/pages/RegisterPage';
import VerifyEmailPage from '../../features/auth/pages/VerifyEmailPage';
import ForgotPasswordPage from '../../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../../features/auth/pages/ResetPasswordPage';

// Placeholder layouts/routes for empty structure requirement
const PublicLayout = () => <div className="p-4">Public UI</div>;
const StaffLayout = () => <div className="p-4">Staff Board</div>;

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = React.useState(true);
  const [authenticated, setAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('autowash_token') || localStorage.getItem('token');
    const user = localStorage.getItem('autowash_user');
    if (token && user) {
      setAuthenticated(true);
    }
    const timer = setTimeout(() => {
      setChecking(false);
    }, 200); // Small delay to simulate async boot validation
    return () => clearTimeout(timer);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f7fafd] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-bold tracking-wide">Đang xác thực phiên làm việc...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const CustomerRoute = ({ children }) => {
  const userStr = localStorage.getItem('autowash_user');
  try {
    const user = JSON.parse(userStr || '{}');
    const roles = user.roles || user.user?.roles || user.user_roles || [];
    if (roles.includes('ROLE_CUSTOMER')) {
      return children;
    }
  } catch (e) {}
  return <Navigate to="/login" replace />;
};

const StaffRoute = ({ children }) => {
  const userStr = localStorage.getItem('autowash_user');
  try {
    const user = JSON.parse(userStr || '{}');
    const roles = user.roles || user.user?.roles || user.user_roles || [];
    if (roles.includes('ROLE_STAFF')) {
      return children;
    }
  } catch (e) {}
  return <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const userStr = localStorage.getItem('autowash_user');
  try {
    const user = JSON.parse(userStr || '{}');
    const roles = user.roles || user.user?.roles || user.user_roles || [];
    if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_MANAGER') || roles.includes('ROLE_CASHIER')) {
      return children;
    }
  } catch (e) {}
  return <Navigate to="/login" replace />;
};

const AdminIndexRedirect = () => {
  const userStr = localStorage.getItem('autowash_user');
  try {
    const user = JSON.parse(userStr || '{}');
    const roles = user.roles || user.user?.roles || user.user_roles || [];
    const roleList = Array.isArray(roles) ? roles : [roles];
    if (roleList.includes('ROLE_CASHIER') && !roleList.includes('ROLE_ADMIN') && !roleList.includes('ROLE_MANAGER')) {
      return <Navigate to="/admin/bookings" replace />;
    }
  } catch (e) {}
  return <Navigate to="/admin/dashboard" replace />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/claim-account',
    element: <ResetPasswordPage />,
  },
  {
    path: '/customer',
    element: (
      <ProtectedRoute>
        <CustomerRoute>
          <CustomerLayout />
        </CustomerRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/customer/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <CustomerDashboardPage />,
      },
      {
        path: 'book',
        element: <CustomerBookingPage />,
      },
      {
        path: 'rewards',
        element: <CustomerRewardsPage />,
      },
      {
        path: 'account',
        element: <CustomerAccountPage />,
      },
      {
        path: 'garage',
        element: <CustomerGaragePage />,
      },
      {
        path: 'feedback',
        element: <CustomerFeedbackPage />,
      },
    ],
  },
  {
    path: '/staff',
    element: (
      <ProtectedRoute>
        <StaffRoute>
          <StaffLayout />
        </StaffRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/staff/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <div>Staff Tasks</div>,
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminIndexRedirect />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboardPage />,
      },
      {
        path: 'bookings',
        element: <AdminBookingsPage />,
      },
      {
        path: 'services-slots',
        element: <AdminServicesSlotsPage />,
      },
      {
        path: 'customers-loyalty',
        element: <AdminCustomersLoyaltyPage />,
      },
      {
        path: 'roles',
        element: <AdminRolesRBACPage />,
      },
      {
        path: 'settings',
        element: <AdminSettingsPage />,
      },
    ],
  },
]);

export default router;
