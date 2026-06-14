const fs = require('fs');
const path = require('path');

const files = {
  'src/layouts/CustomerLayout.jsx': `import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function CustomerLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar isAuthenticated={true} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}`,
  'src/routes/PrivateRoute.jsx': `import { Navigate } from 'react-router-dom';
import useAuthStore from '../app/store/authStore';

export default function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}`,
  'src/components/layout/Navbar.jsx': `import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

export default function Navbar({ isAuthenticated }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/"><Logo /></Link>
        <nav className="hidden md:flex space-x-8">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Trang chủ</Link>
          <a href="#services" className="text-gray-600 hover:text-blue-600 font-medium">Dịch vụ</a>
          <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium">Bảng giá</a>
          <a href="#contact" className="text-gray-600 hover:text-blue-600 font-medium">Liên hệ</a>
        </nav>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Link to="/customer/dashboard" className="text-blue-600 font-medium">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">Đăng nhập</Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}`,
  'src/components/layout/Footer.jsx': `export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">AutoWash Pro</h3>
          <p className="text-gray-400">Nền tảng quản lý và đặt lịch chăm sóc xe chuyên nghiệp.</p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Dịch vụ</h4>
          <ul className="space-y-2 text-gray-400">
            <li>Rửa xe tiêu chuẩn</li>
            <li>Detailing cao cấp</li>
            <li>Dọn nội thất</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Hỗ trợ</h4>
          <ul className="space-y-2 text-gray-400">
            <li>FAQ</li>
            <li>Chính sách bảo mật</li>
            <li>Điều khoản sử dụng</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Liên hệ</h4>
          <ul className="space-y-2 text-gray-400">
            <li>1900 1234</li>
            <li>support@autowashpro.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; 2026 AutoWash Pro. All rights reserved.</p>
      </div>
    </footer>
  );
}`,
  'src/components/common/Logo.jsx': `export default function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-xl">A</span>
      </div>
      <span className="font-bold text-xl text-gray-900">AutoWash Pro</span>
    </div>
  );
}`,
  'src/app/store/authStore.js': `import { create } from 'zustand';

const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  login: (userData) => set({ isAuthenticated: true, user: userData }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));

export default useAuthStore;
`,
  'src/features/auth/pages/LoginPage.jsx': `export default function LoginPage() {
  return <div className="flex justify-center items-center py-20"><h1 className="text-2xl font-bold">Đăng nhập</h1></div>;
}`,
  'src/features/auth/pages/RegisterPage.jsx': `export default function RegisterPage() {
  return <div className="flex justify-center items-center py-20"><h1 className="text-2xl font-bold">Đăng ký</h1></div>;
}`,
  'src/features/customer/pages/DashboardPage.jsx': `export default function DashboardPage() {
  return <div><h1 className="text-2xl font-bold">Dashboard Khách hàng</h1></div>;
}`,
  'src/features/home/pages/HomePage.jsx': `export default function HomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center py-20">Trang chủ sẽ được thiết kế theo Figma</h1>
    </div>
  );
}`
};

for (const [filepath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join('c:/Users/KHOAVANG/Desktop/wash-car-pro-frontend', filepath), content);
  console.log('Created', filepath);
}
