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

const CustomerRoute = ({ children }) => children;
const StaffRoute = ({ children }) => children;
const AdminRoute = ({ children }) => children;

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
      <CustomerRoute>
        <CustomerLayout />
      </CustomerRoute>
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
      <StaffRoute>
        <StaffLayout />
      </StaffRoute>
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
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
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
