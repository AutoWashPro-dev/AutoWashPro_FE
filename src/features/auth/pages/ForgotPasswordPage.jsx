import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { Sparkles, Mail, ArrowRight, CheckCircle2, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
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

  if (isSent) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-white py-10 px-6 shadow-xl shadow-slate-200/80 sm:rounded-3xl border border-slate-200 text-center">
            <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-[#0047AB]/10 animate-pulse">
              <CheckCircle2 className="w-9 h-9 text-[#0047AB]" />
            </div>
            
            <h3 className="text-2xl font-black text-[#181c1e] tracking-tight">
              Đã Gửi Hướng Dẫn Khôi Phục!
            </h3>
            
            <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed text-left font-medium">
              <p>
                Nếu địa chỉ email <span className="font-bold text-[#0047AB] font-mono">{email}</span> có trong hệ thống và đã được kích hoạt, bạn sẽ nhận được một liên kết đặt lại mật khẩu trong ít phút.
              </p>
              <p className="mt-3 text-xs text-slate-500 font-normal">
                👉 Vui lòng kiểm tra hộp thư đến (và cả mục Spam/Thư rác) để hoàn tất việc đổi mật khẩu.
              </p>
            </div>

            {/* Dev Mock Action */}
            <div className="mt-6 p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0047AB] mb-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0047AB]" />
                <span>Kiểm thử nhanh (MOCK Dev Mode):</span>
              </div>
              <p className="text-xs text-slate-600 mb-3 font-medium">
                Trong lúc kiểm thử local chưa có hệ thống mail thật, bạn có thể nhấn vào đây để đi thẳng đến trang đổi mật khẩu:
              </p>
              <Link
                to={`/reset-password?token=_MOCK_RESET_TOKEN_${Date.now()}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0047AB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-[#0047AB]/20"
              >
                <span>⚡ Mở trang Đặt lại mật khẩu ngay</span>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-150">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-bold text-sm text-[#0047AB] hover:text-blue-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại trang Đăng Nhập</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />
      
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
          Khôi Phục Mật Khẩu
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          Nhập email đã đăng ký của bạn để nhận liên kết xác thực an toàn
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
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Địa chỉ Email đã đăng ký
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB]/20 focus:border-[#0047AB] transition text-sm font-medium"
                  required
                />
              </div>
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
                    <span>Gửi Liên Kết Khôi Phục</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-150 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0047AB] hover:text-blue-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại trang Đăng Nhập</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
