import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { Sparkles, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';

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
      setError('Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
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
      <div className="min-h-screen bg-[#f8f9fc] text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-white py-10 px-6 shadow-xl shadow-slate-200/80 sm:rounded-3xl border border-slate-200 text-center">
            <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-500/10 animate-bounce">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>
            
            <h3 className="text-2xl font-black text-[#181c1e] tracking-tight">
              {isClaim ? 'Kích Hoạt & Đặt Mật Khẩu Thành Công!' : 'Đổi Mật Khẩu Thành Công! 🎉'}
            </h3>
            
            <p className="mt-3 text-sm text-slate-700 px-2 leading-relaxed font-medium">
              {isClaim 
                ? 'Tài khoản của bạn đã chính thức được kích hoạt và bảo mật.' 
                : 'Mật khẩu mới của bạn đã được cập nhật an toàn vào hệ thống.'}
            </p>
            <p className="mt-2 text-xs text-[#0047AB] font-bold">
              Vui lòng sử dụng mật khẩu mới để đăng nhập.
            </p>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-[#0047AB]/20 text-sm font-bold text-white bg-[#0047AB] hover:bg-blue-700 transition-all transform active:scale-[0.99] cursor-pointer"
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
    <div className="min-h-screen bg-[#f8f9fc] text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 translate-y-1/2" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0047AB] flex items-center justify-center shadow-lg shadow-[#0047AB]/25">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <span className="text-3xl font-black tracking-tight text-[#181c1e]">
            AutoWash <span className="text-[#0047AB]">Pro</span>
          </span>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-slate-800">
          {isClaim ? 'Kích Hoạt Tài Khoản & Đặt Mật Khẩu' : 'Đặt Lại Mật Khẩu Mới'}
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          {isClaim 
            ? 'Vui lòng thiết lập mật khẩu an toàn để hoàn tất kích hoạt' 
            : 'Vui lòng nhập mật khẩu mới và xác nhận để tiếp tục'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/80 sm:rounded-3xl sm:px-10 border border-slate-200/80">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB]/20 focus:border-[#0047AB] transition text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB]/20 focus:border-[#0047AB] transition text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs font-bold text-slate-500 hover:text-[#0047AB] flex items-center gap-1 focus:outline-none transition"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-[#0047AB]/20 text-sm font-bold text-white bg-[#0047AB] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0047AB] transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isClaim ? 'Kích Hoạt Tài Khoản' : 'Cập Nhật Mật Khẩu'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-150 text-center">
            <Link
              to="/login"
              className="text-xs text-slate-500 hover:text-[#0047AB] font-bold underline underline-offset-4 transition"
            >
              Quay lại trang Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
