import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { 
  Sparkles, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Car, 
  CheckCircle2,
  ChevronRight,
  Droplets,
  Wrench,
  HelpCircle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!loginId.trim() || !password) {
      setError('Vui lòng nhập đầy đủ thông tin tài khoản và mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.login({ loginId: loginId.trim(), password });
      
      localStorage.setItem('autowash_token', res.accessToken);
      localStorage.setItem('autowash_user', JSON.stringify(res.user || res));
      
      if (res.redirectUrl) {
        navigate(res.redirectUrl, { replace: true });
      } else {
        const userType = res.userType || res.user?.userType || 'CUSTOMER';
        const roles = res.roles || res.user?.roles || [];
        if (userType === 'STAFF' || roles.some(r => r.includes('ADMIN') || r.includes('MANAGER') || r.includes('STAFF'))) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/customer/dashboard', { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Tài khoản hoặc mật khẩu không chính xác.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-[#f7fafd] flex flex-col font-sans text-slate-800">
      
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#f7fafd]/90 backdrop-blur-md border-b border-indigo-50/50 px-4 lg:px-8 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-blue-900 to-indigo-950 bg-clip-text text-transparent tracking-wider">
              Novawash
            </span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link to="/" className="hover:text-blue-600 transition-colors duration-200">Trang chủ</Link>
            <a href="/#booking-steps" className="hover:text-blue-600 transition-colors duration-200">Đặt lịch</a>
            <a href="/#membership" className="hover:text-blue-600 transition-colors duration-200">Hạng thành viên</a>
            <a href="/#contact" className="hover:text-blue-600 transition-colors duration-200">Liên hệ</a>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')} 
              className="text-sm font-bold text-slate-700 hover:text-blue-600 px-4 py-2 rounded-xl hover:bg-slate-100/50 transition-all duration-200"
            >
              Đăng nhập
            </button>
            <button 
              onClick={() => navigate('/register')} 
              className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-full shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all duration-200"
            >
              Đăng ký
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50/70 to-indigo-100/50 gap-8 min-h-[70vh]">
        {/* Bright, sparkling ambient water bubbles */}
        <div className="absolute top-10 left-10 w-80 h-80 bg-sky-300/30 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Decorative floating icons */}
        <div className="absolute top-12 left-1/4 text-sky-400/30 pointer-events-none animate-bounce" style={{ animationDuration: '5s' }}>
          <Droplets className="w-10 h-10" />
        </div>
        <div className="absolute bottom-12 right-1/3 text-blue-500/20 pointer-events-none animate-bounce" style={{ animationDuration: '6s' }}>
          <Sparkles className="w-12 h-12" />
        </div>

        {/* Main Content Container - Compact & Perfectly Balanced */}
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 relative z-10 py-4">
          
          {/* Left Section: Bright & Sparkling Overview (60%) */}
          <div className="w-full lg:w-7/12 flex flex-col justify-center space-y-5">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-blue-200/80 shadow-sm backdrop-blur-md w-fit">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
              </span>
              <span className="text-xs font-bold text-blue-700 tracking-wide flex items-center gap-1.5">
                <span>CỔNG ĐĂNG NHẬP CHUNG</span>
                <span className="text-slate-300">|</span>
                <span className="text-sky-600 font-medium">Khách Hàng & Quản Trị</span>
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-2.5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900">
                Hệ Thống Rửa Xe <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 flex items-center gap-2.5">
                  <span>Sáng Bóng Chuẩn VIP</span>
                  <Sparkles className="w-8 h-8 text-sky-500 inline animate-spin" style={{ animationDuration: '10s' }} />
                </span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base max-w-lg font-normal leading-relaxed">
                Chào mừng đến với <strong className="text-blue-700 font-bold">Novawash</strong>! Cổng truy cập hợp nhất giúp Khách hàng đặt lịch chăm sóc xe và Quản lý điều hành xưởng chuyên nghiệp.
              </p>
            </div>

            {/* Compact Role Explanations (2 columns side-by-side) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 max-w-xl">
              
              {/* Customer Card */}
              <div className="p-4 rounded-2xl bg-white/80 border border-blue-100/80 shadow-md shadow-blue-500/5 backdrop-blur-md flex flex-col gap-1.5 hover:border-blue-400/50 hover:shadow-lg transition-all duration-300 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-200 flex items-center justify-center text-sky-600">
                    <Car className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 uppercase tracking-wider">
                    Khách Hàng
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mt-1">Đặt Lịch & Tích Điểm</h3>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Nhập <strong className="text-blue-600 font-semibold">Số Điện Thoại</strong> để đặt lịch rửa xe siêu tốc, tích điểm VIP và theo dõi xe real-time.
                </p>
              </div>

              {/* Admin/Staff Card */}
              <div className="p-4 rounded-2xl bg-white/80 border border-indigo-100/80 shadow-md shadow-indigo-500/5 backdrop-blur-md flex flex-col gap-1.5 hover:border-indigo-400/50 hover:shadow-lg transition-all duration-300 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                    Quản Trị / POS
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mt-1">Điều Hành & Vận Hành</h3>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Nhập <strong className="text-indigo-600 font-semibold">Username</strong> để quản lý hàng chờ, check-in, cấu hình dịch vụ và xem doanh thu.
                </p>
              </div>

            </div>

            {/* Compact Highlights Bar */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Quy trình tự động 100%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dung dịch rửa xe cao cấp</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bảo hành sáng bóng</span>
              </div>
            </div>

          </div>

          {/* Right Section: Compact & Balanced Login Card (40%) */}
          <div className="w-full lg:w-5/12 max-w-md">
            <div className="bg-white/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-blue-900/10 rounded-3xl border border-white relative overflow-hidden text-left">
              
              {/* Top Aqua-Blue Gloss Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-blue-600 to-indigo-600" />

              {/* Compact Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 mb-3">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Đăng Nhập Tài Khoản
                </h2>
                <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50/80 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
                  <span>⚡ Omni-Login: Nhận diện tự động</span>
                </div>
              </div>

              {/* Form */}
              <form className="space-y-4" onSubmit={handleLogin}>
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2 font-semibold animate-shake">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label htmlFor="loginId" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                    Tài khoản đăng nhập
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-blue-500" />
                    </div>
                    <input
                      id="loginId"
                      type="text"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="SĐT Khách hàng hoặc Username..."
                      className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                      Mật khẩu
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-blue-500" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition text-sm font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center pt-0.5">
                  <input
                    id="remember-me"
                    type="checkbox"
                    defaultChecked
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs font-medium text-slate-600 cursor-pointer select-none">
                    Ghi nhớ đăng nhập trên máy này
                  </label>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/25 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:via-sky-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 cursor-pointer group"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Đăng Nhập Ngay</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Compact Footer / Register Link */}
              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <p className="text-xs font-medium text-slate-600">
                  Chưa có tài khoản Khách hàng?{' '}
                  <Link to="/register" className="font-bold text-blue-600 hover:text-indigo-600 transition inline-flex items-center gap-0.5 ml-0.5">
                    <span>Đăng ký thành viên</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </p>
              </div>

              {/* Compact Security Trust badge */}
              <div className="mt-4 flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Bảo mật 256-bit Encryption Chuẩn SSL</span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-400 py-16 px-4 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 text-left">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="text-xl font-black text-white tracking-wider">Novawash</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Hệ thống đặt lịch rửa xe máy thông minh và chăm sóc xe toàn diện theo tiêu chuẩn quốc tế hàng đầu Việt Nam.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h5 className="text-white font-bold text-sm tracking-wider uppercase">Dịch vụ</h5>
            <ul className="space-y-2 text-xs font-semibold">
              <li><a href="/#booking-steps" className="hover:text-blue-500 transition-colors">Rửa xe máy chuyên sâu</a></li>
              <li><a href="/#booking-steps" className="hover:text-blue-500 transition-colors">Bảo dưỡng yên xe</a></li>
              <li><a href="/#booking-steps" className="hover:text-blue-500 transition-colors">Đánh bóng & Phục hồi nhựa</a></li>
              <li><a href="/#booking-steps" className="hover:text-blue-500 transition-colors">Chăm sóc động cơ</a></li>
            </ul>
          </div>

          {/* About Links */}
          <div className="space-y-4">
            <h5 className="text-white font-bold text-sm tracking-wider uppercase">Liên kết</h5>
            <ul className="space-y-2 text-xs font-semibold">
              <li><a href="/#membership" className="hover:text-blue-500 transition-colors">Hạng thành viên</a></li>
              <li><a href="/#booking-steps" className="hover:text-blue-500 transition-colors">Đặt lịch ngay</a></li>
              <li><a href="/#contact" className="hover:text-blue-500 transition-colors">Hỗ trợ khách hàng</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4 text-xs font-semibold">
            <h5 className="text-white font-bold text-sm tracking-wider uppercase text-left">Liên hệ</h5>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Hotline: 123-456-7890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Ctndx001@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                <span>123 Đường ABC, Quận 9 gì đó dưới Landmark</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800/80 mt-12 pt-6 text-center text-[10px] font-bold text-slate-600">
          <p>© {new Date().getFullYear()} Novawash. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
