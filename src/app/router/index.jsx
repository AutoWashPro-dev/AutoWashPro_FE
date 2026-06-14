import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import CustomerLayout from '../../layouts/CustomerLayout';
import PrivateRoute from '../../routes/PrivateRoute';

// Pages
import HomePage from '../../features/home/pages/HomePage';
import LoginPage from '../../features/auth/pages/LoginPage';
import RegisterPage from '../../features/auth/pages/RegisterPage';
import DashboardPage from '../../features/customer/pages/DashboardPage';

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
]);

export default router;
