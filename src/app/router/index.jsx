import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import CustomerLayout from '../../layouts/CustomerLayout';
import PrivateRoute from '../../routes/PrivateRoute';

// Pages
import HomePage from '../../features/home/pages/HomePage';
import LoginPage from '../../features/auth/pages/LoginPage';
import RegisterPage from '../../features/auth/pages/RegisterPage';
import DashboardPage from '../../features/customer/pages/DashboardPage';
import ProfilePage from '../../features/customer/pages/ProfilePage';
import CarsPage from '../../features/customer/pages/CarsPage';
import LoyaltyPage from '../../features/customer/pages/LoyaltyPage';

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
    ],
  },
  {
    path: '/customer',
    element: <PrivateRoute><CustomerLayout /></PrivateRoute>,
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
    ],
  },
  {
    path: '/customer/profile',
    element: <PrivateRoute><ProfilePage /></PrivateRoute>,
  },
  {
    path: '/customer/cars',
    element: <PrivateRoute><CarsPage /></PrivateRoute>,
  },
  {
    path: '/customer/loyalty',
    element: <PrivateRoute><LoyaltyPage /></PrivateRoute>,
  },
]);

export default router;
