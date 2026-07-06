import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { Sparkles, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, KeyRound, ShieldCheck, Droplets, ChevronLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const isClaim = location.pathname.includes('claim');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('token');
    if (t) {
      setToken(t);
    } else {
      setError('Không tìm thấy Token bảo mật trong đường dẫn.');
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Đường dẫn không hợp lệ hoặc thiếu Token bảo mật.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ mật khẩu mới và xác nhận.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setIsLoading(true);
    try {
      if (isClaim) {
        await authApi.claimAccount({ token, newPassword, confirmPassword });
      } else {
        await authApi.resetPassword({ token, newPassword, confirmPassword });
      }
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Không thể đặt lại mật khẩu. Token có thể đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/70 to-indigo-100/50 flex items-center justify-center p-4 sm:p-6 selection:bg-blue-600 selection:text-white relative overflow-hidden font-sans text-slate-800">
        <div className="absolute top-1/3 left-1/2 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/95 backdrop-blur-2xl py-8 px-6 sm:px-8 shadow-2xl shadow-blue-900/10 rounded-3xl border border-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-sky-500" />

            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-bounce" />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {isClaim ? 'Kích Hoạt Tài Khoản Thành Công!' : 'Đổi Mật Khẩu Thành Công! 🎉'}
            </h3>
            
            <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium px-2">
              {isClaim 
                ? 'Tài khoản của bạn đã chính thức được kích hoạt và bảo mật bằng mật khẩu mới.' 
                : 'Mật khẩu của bạn đã được cập nhật an toàn vào hệ thống AutoWash Pro.'}
            </p>
            <p className="mt-1.5 text-xs text-blue-600 font-bold">
              Vui lòng dùng mật khẩu mới để đăng nhập.
            </p>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/25 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:via-sky-700 hover:to-indigo-700 transition-all transform active:scale-[0.98] cursor-pointer"
              >
                <span>Đăng Nhập Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/70 to-indigo-100/50 flex items-center justify-center p-4 sm:p-6 selection:bg-blue-600 selection:text-white relative overflow-hidden font-sans text-slate-800">
      
      {/* Ambient water bubbles */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-sky-300/30 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '7s' }} />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      
      {/* Decorative floating droplets */}
      <div className="absolute top-12 left-1/3 text-sky-400/30 pointer-events-none animate-bounce" style={{ animationDuration: '5s' }}>
        <Droplets className="w-10 h-10" />
      </div>

      <div className="w-full max-w-md mx-auto relative z-10 py-4">
        
        <div className="bg-white/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-blue-900/10 rounded-3xl border border-white relative overflow-hidden">
          
          {/* Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-blue-600 to-indigo-600" />

          {/* Compact Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 mb-3">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {isClaim ? 'Kích Hoạt Tài Khoản VIP' : 'Đặt Lại Mật Khẩu'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isClaim ? 'Tạo mật khẩu mới để bảo vệ tài khoản Khách hàng của bạn' : 'Nhập mật khẩu mới an toàn và dễ nhớ cho bạn'}
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
              <label htmlFor="newPassword" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                Mật khẩu mới
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-blue-500" />
                </div>
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
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

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-blue-500" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu vừa gõ"
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
                    <span>{isClaim ? 'Kích Hoạt Tài Khoản' : 'Cập Nhật Mật Khẩu'}</span>
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
    </div>
  );
}
