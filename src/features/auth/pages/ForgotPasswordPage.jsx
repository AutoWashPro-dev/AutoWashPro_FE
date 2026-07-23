import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { Sparkles, Mail, ArrowRight, CheckCircle2, ShieldCheck, ChevronLeft, KeyRound, Droplets, Phone, MapPin } from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email tài khoản của bạn.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setIsSent(true);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi gửi yêu cầu khôi phục mật khẩu.');
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
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50/70 to-indigo-100/50 gap-8 min-h-[70vh]">
        
        {isSent ? (
          <div className="w-full max-w-md relative z-10 my-8">
            <div className="bg-white/95 backdrop-blur-2xl py-8 px-6 sm:px-8 shadow-2xl shadow-blue-900/10 rounded-3xl border border-white text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-blue-600 to-indigo-600" />

              <div className="w-14 h-14 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-blue-600 animate-bounce" />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Đã Gửi Link Khôi Phục!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Hệ thống vừa tự động gửi thư hỗ trợ đổi mật khẩu
              </p>
              
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed text-left font-medium space-y-2">
                <p>
                  Nếu email <strong className="text-blue-600 font-bold font-mono">{email}</strong> hợp lệ trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu trong giây lát.
                </p>
                <p className="text-[11px] text-slate-500">
                  👉 Vui lòng kiểm tra hộp thư đến (và cả mục Spam/Thư rác) để hoàn tất.
                </p>
              </div>

              {/* Dev Mock Action */}
              <div className="mt-5 p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-left">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-blue-700 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Kiểm thử nhanh (Dev Mode):</span>
                </div>
                <p className="text-[11px] text-slate-600 mb-2.5 font-medium">
                  Nhấn nút dưới để chuyển thẳng tới trang đặt lại mật khẩu không cần mở mail:
                </p>
                <Link
                  to={`/reset-password?token=_MOCK_RESET_TOKEN_${Date.now()}`}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-600/20"
                >
                  <span>⚡ Mở Trang Đổi Mật Khẩu Ngay</span>
                </Link>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 font-extrabold text-xs text-blue-600 hover:text-indigo-600 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Quay lại Cổng Đăng Nhập</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto relative z-10 py-8">
            <div className="bg-white/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-blue-900/10 rounded-3xl border border-white relative overflow-hidden text-left">
              
              {/* Top Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-blue-600 to-indigo-600" />

              {/* Compact Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 mb-3">
                  <KeyRound className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Quên Mật Khẩu?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Nhập email đăng ký, chúng tôi sẽ gửi liên kết khôi phục ngay
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2 font-semibold animate-shake">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label htmlFor="email" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                    Địa chỉ Email đã đăng ký
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-blue-500" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition text-sm font-medium"
                      required
                    />
                  </div>
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
                        <span>Gửi Yêu Cầu Khôi Phục</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Clean Footer / Login Link */}
              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 font-extrabold text-xs text-blue-600 hover:text-indigo-600 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Quay lại Cổng Đăng Nhập</span>
                </Link>
              </div>

              {/* Compact Security Trust badge */}
              <div className="mt-4 flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Bảo mật dữ liệu 256-bit Encryption Chuẩn SSL</span>
              </div>

            </div>
          </div>
        )}

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
