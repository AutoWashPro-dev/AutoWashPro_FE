import { Link } from 'react-router-dom';
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
}