import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { 
  Sparkles, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  MailCheck, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim() || !formData.username.trim() || !formData.phoneNumber.trim() || !formData.email.trim() || !formData.password) {
      setError('Vui lòng điền đầy đủ tất cả các trường thông tin bắt buộc.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.registerWithEmail({
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccessData(res);
    } catch (err) {
      setError(err.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Nếu đăng ký thành công, hiển thị màn hình hướng dẫn kiểm tra Email (Light Theme)
  if (successData) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-white py-10 px-6 shadow-xl shadow-slate-200/80 sm:rounded-3xl border border-slate-200 text-center">
            <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-500/10 animate-bounce">
              <MailCheck className="w-9 h-9 text-emerald-600" />
            </div>
            
            <h3 className="text-2xl font-black text-[#181c1e] tracking-tight">
              Đăng Ký Tài Khoản Thành Công!
            </h3>
            
            <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed text-left font-medium">
              <p>
                Cảm ơn bạn <span className="font-bold text-[#0047AB]">{formData.fullName}</span> đã tham gia AutoWash Pro.
              </p>
              <p className="mt-2">
                Chúng tôi vừa gửi một liên kết xác thực bảo mật đến email:
                <br />
                <span className="font-bold text-[#0047AB] block mt-1.5 text-center bg-white py-2 px-3 rounded-xl border border-blue-100 shadow-sm font-mono text-sm">
                  {successData.email || formData.email}
                </span>
              </p>
              <p className="mt-3.5 text-xs text-slate-500 font-normal">
                👉 Vui lòng mở hộp thư (và kiểm tra cả mục Spam/Thư rác), nhấn vào nút <strong className="text-slate-800">Confirm your email address</strong> để kích hoạt tài khoản.
              </p>
            </div>

            {/* Quick Dev Action (MOCK Mode) */}
            {successData.devActionUrl && (
              <div className="mt-6 p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0047AB] mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0047AB]" />
                  <span>Chế độ kiểm thử Dev (MOCK Mode):</span>
                </div>
                <p className="text-xs text-slate-600 mb-3 font-medium">
                  Do hệ thống đang chạy ở chế độ MOCK Mail, bạn có thể nhấn nút dưới đây để giả lập bấm vào link trong email và kích hoạt ngay:
                </p>
                <a
                  href={successData.devActionUrl}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0047AB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-[#0047AB]/20"
                >
                  <span>⚡ Kích hoạt & Xác thực ngay</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-150">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-bold text-sm text-[#0047AB] hover:text-blue-700 transition"
              >
                <span>← Quay lại trang Đăng Nhập</span>
              </Link>
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
            <Sparkles className="w-7 h-7 text-white animate-pulse" />
          </div>
          <span className="text-3xl font-black tracking-tight text-[#181c1e]">
            AutoWash <span className="text-[#0047AB]">Pro</span>
          </span>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-slate-800">
          Đăng Ký Tài Khoản Khách Hàng
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          Mở tài khoản mới, tích điểm tự động và trải nghiệm dịch vụ đồng giá
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/80 sm:rounded-3xl sm:px-10 border border-slate-200/80">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Họ và Tên <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB]/20 focus:border-[#0047AB] text-sm transition font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tên đăng nhập (Username) <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="nguyenvana123"
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB]/20 focus:border-[#0047AB] text-sm transition font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="0902000xxx"
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB]/20 focus:border-[#0047AB] text-sm transition font-mono font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Địa chỉ Email <span className="text-red-500">*</span> <span className="text-[11px] text-slate-400 font-normal lowercase">(nhận link xác thực)</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB]/20 focus:border-[#0047AB] text-sm transition font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB]/20 focus:border-[#0047AB] text-sm transition font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Xác nhận lại <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB]/20 focus:border-[#0047AB] text-sm transition font-medium"
                    required
                  />
                </div>
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-[#0047AB]/20 text-sm font-bold text-white bg-[#0047AB] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0047AB] transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Đăng Ký Tài Khoản</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-150 text-center">
            <p className="text-sm text-slate-500">
              Bạn đã có tài khoản rồi?{' '}
              <Link to="/login" className="font-bold text-[#0047AB] hover:text-blue-700 underline underline-offset-4 transition">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
