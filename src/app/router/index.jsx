import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import CustomerLayout from '../../layouts/CustomerLayout';
import DashboardLayout from '../../layouts/DashboardLayout';
import PrivateRoute from '../../routes/PrivateRoute';

// Pages
import HomePage from '../../features/home/pages/HomePage';
import LoginPage from '../../features/auth/pages/LoginPage';
import RegisterPage from '../../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../../features/auth/pages/ForgotPasswordPage';
import DashboardPage from '../../features/customer/pages/DashboardPage';
import ProfilePage from '../../features/customer/pages/ProfilePage';
import CarsPage from '../../features/customer/pages/CarsPage';
import LoyaltyPage from '../../features/customer/pages/LoyaltyPage';
import BookingPage from '../../features/booking/pages/BookingPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
    ],
  },
  {
    path: '/customer',
    element: <PrivateRoute><CustomerLayout /></PrivateRoute>,
    children: [
      // Only generic customer pages not in the dashboard should go here, if any
    ],
  },
  {
    path: '/customer',
    element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'cars',
        element: <CarsPage />,
      },
      {
        path: 'loyalty',
        element: <LoyaltyPage />,
      },
      {
        path: 'booking',
        element: <BookingPage />,
      },
    ]
  }
]);

export default router;
