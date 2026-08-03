import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/authApi';
import logoImg from '../../../assets/logo.png';
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
  ShieldCheck,
  Droplets,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { cleanPhoneNumber, validatePhoneNumber, validateGmail } from '../../../utils/validationUtils';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendError, setResendError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleResendEmail = async () => {
    setResendError('');
    setResendSuccess('');
    try {
      await authApi.registerWithEmail({
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      setResendSuccess('Đã gửi lại link xác thực email thành công!');
      setResendCountdown(60);
    } catch (err) {
      setResendError(err.message || 'Không thể gửi lại email xác thực.');
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'phoneNumber') {
      value = cleanPhoneNumber(value);
      if (value && !validatePhoneNumber(value)) {
        setPhoneNumberError('Số điện thoại không hợp lệ (VD: 0912345678)');
      } else {
        setPhoneNumberError('');
      }
    }
    if (e.target.name === 'email') {
      if (value && !validateGmail(value)) {
        setEmailError('Địa chỉ email phải là Gmail hợp lệ (VD: user@gmail.com)');
      } else {
        setEmailError('');
      }
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('Vui lòng tích chọn đồng ý với Điều khoản & Bảo mật để tiếp tục.');
      return;
    }

    if (!formData.fullName.trim() || !formData.username.trim() || !formData.phoneNumber.trim() || !formData.email.trim() || !formData.password) {
      setError('Vui lòng điền đầy đủ tất cả các trường thông tin bắt buộc.');
      return;
    }

    if (!validatePhoneNumber(formData.phoneNumber.trim())) {
      setError('Số điện thoại không đúng định dạng Việt Nam.');
      return;
    }

    if (!validateGmail(formData.email.trim())) {
      setError('Địa chỉ email phải kết thúc bằng @gmail.com.');
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
      setError(err.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  // If registration succeeds, display the clean sparkling success verification screen
  if (successData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/70 to-indigo-100/50 flex items-center justify-center p-4 sm:p-6 selection:bg-blue-600 selection:text-white relative overflow-hidden font-sans text-slate-800">
        <div className="absolute top-1/3 left-1/2 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-pulse" />

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/95 backdrop-blur-2xl py-8 px-6 sm:px-8 shadow-2xl shadow-blue-900/10 rounded-3xl border border-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-sky-500" />

            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <MailCheck className="w-8 h-8 text-emerald-600 animate-bounce" />
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Đăng Ký Thành Công!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Tài khoản của bạn đã sẵn sàng kích hoạt
            </p>

            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed text-left font-medium space-y-2">
              <p>
                Chào mừng <strong className="text-blue-600 font-bold">{formData.fullName}</strong> đến với NovaWash.
              </p>
              <p>
                Vui lòng kiểm tra hộp thư email (và mục Thư rác/Spam) để kích hoạt tài khoản:
              </p>
              <div className="font-mono font-bold text-blue-600 text-center bg-white py-2 px-3 rounded-xl border border-blue-100 shadow-sm">
                {successData.email || formData.email}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {resendError && (
                <p className="text-[10px] text-red-500 font-bold text-center">{resendError}</p>
              )}
              {resendSuccess && (
                <p className="text-[10px] text-emerald-650 font-bold text-center">{resendSuccess}</p>
              )}
              <button
                type="button"
                disabled={resendCountdown > 0}
                onClick={handleResendEmail}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${resendCountdown > 0
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-white hover:bg-slate-50 text-blue-650 border border-slate-200 shadow-sm cursor-pointer'
                  }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendCountdown > 0 ? '' : 'animate-spin'}`} style={{ animationDuration: '3s' }} />
                <span>{resendCountdown > 0 ? `Gửi lại email sau (${resendCountdown}s)` : 'Gửi lại email xác nhận'}</span>
              </button>

              <Link
                to="/login"
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Đã xác thực email? Đăng nhập ngay!</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 font-extrabold text-xs text-blue-600 hover:text-indigo-600 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Quay lại cổng đăng nhập</span>
              </Link>
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

      <div className="w-full max-w-xl mx-auto relative z-10 py-4">

        <div className="bg-white/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-blue-900/10 rounded-3xl border border-white relative overflow-hidden">

          {/* Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-blue-600 to-indigo-600" />

          {/* Compact Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-50 to-blue-50 border border-blue-100 flex items-center justify-center shadow-md shadow-blue-500/10 mb-3 p-2">
              <img src={logoImg} alt="NovaWash Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Đăng Ký Thành Viên VIP
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Mở tài khoản nhanh, tích điểm tự động & đặt lịch rửa xe siêu tốc
            </p>
          </div>

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2 font-semibold animate-shake">
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Row 1: FullName & Username (2 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="fullName" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Họ và Tên <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-blue-500" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 text-xs font-medium transition"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="username" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-blue-500" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="nguyenvana"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 text-xs font-medium transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Phone & Email (2 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="phoneNumber" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-blue-500" />
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="0901234567"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 text-xs font-medium transition"
                    required
                  />
                </div>
                {phoneNumberError && (
                  <p className="mt-1 text-[10px] text-red-550 font-semibold">{phoneNumberError}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Địa chỉ Email <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-blue-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 text-xs font-medium transition"
                    required
                  />
                </div>
                {emailError && (
                  <p className="mt-1 text-[10px] text-red-550 font-semibold">{emailError}</p>
                )}
              </div>
            </div>

            {/* Row 3: Password & Confirm Password (2 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="password" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-blue-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Ít nhất 6 ký tự"
                    className="block w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 text-xs font-medium transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-blue-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 text-xs font-medium transition"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600">
              <input
                id="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="agreeTerms" className="cursor-pointer text-[11px] font-semibold text-slate-600">
                Đã đọc & đồng ý với <Link to="/register" className="text-blue-600 font-extrabold hover:text-indigo-600 transition underline">Điều khoản & Bảo mật</Link>
              </label>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !agreeTerms || !!phoneNumberError || !!emailError || !formData.phoneNumber || !formData.email}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/25 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:via-sky-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Đăng Ký & Tạo Tài Khoản</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Clean Footer / Login Link */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs font-medium text-slate-600">
              Bạn đã có tài khoản?{' '}
              <Link to="/login" className="font-extrabold text-blue-600 hover:text-indigo-600 transition inline-flex items-center gap-0.5 ml-0.5">
                <span>Đăng nhập ngay</span>
              </Link>
            </p>
          </div>

          {/* Compact Security Trust badge */}


        </div>
      </div>
    </div>
  );
}
