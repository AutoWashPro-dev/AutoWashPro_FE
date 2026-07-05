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
  HelpCircle,
  LogIn
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
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.login({ loginId: loginId.trim(), password });
      
      // Lưu token và thông tin user vào localStorage
      localStorage.setItem('autowash_token', res.accessToken);
      localStorage.setItem('autowash_user', JSON.stringify(res.user || res));
      
      // [OMNI-LOGIN] Tự động chuyển trang theo lệnh từ Backend (res.redirectUrl)
      if (res.redirectUrl) {
        navigate(res.redirectUrl, { replace: true });
      } else {
        // Fallback an toàn nếu backend cũ chưa trả redirectUrl
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

  const fillDemo = (demoId, demoPass) => {
    setLoginId(demoId);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background soft blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />
      
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
          Cổng Đăng Nhập Đa Năng <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0047AB] border border-blue-200 ml-1">Omni-Login</span>
        </h2>
        <p className="mt-1.5 text-center text-sm text-slate-500">
          Nhập Số điện thoại, Email hoặc Username để truy cập hệ thống
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/80 sm:rounded-3xl sm:px-10 border border-slate-200/80">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="loginId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tài khoản đăng nhập
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="loginId"
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="SĐT (0902...), Email hoặc Username"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB]/20 focus:border-[#0047AB] transition text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mật khẩu
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-[#0047AB] hover:text-blue-700 transition"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB]/20 focus:border-[#0047AB] transition text-sm font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-[#0047AB] focus:ring-[#0047AB]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-600">
                Ghi nhớ phiên đăng nhập bảo mật
              </label>
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
                    <span>Đăng Nhập Ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Section */}
          <div className="mt-6 pt-6 border-t border-slate-150">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-3">
              <ShieldCheck className="w-4 h-4 text-[#0047AB]" />
              <span>Tài khoản kiểm thử nhanh (Demo Access):</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillDemo('0902000001', 'Customer@123')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-[#0047AB]/30 text-left transition group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-700 group-hover:text-[#0047AB] flex items-center justify-between">
                  <span>Khách Hàng</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-[#0047AB] rounded">SĐT</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">0902000001</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('admin', 'Admin@123')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-500/30 text-left transition group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 flex items-center justify-between">
                  <span>Quản Trị</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded">Admin</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">admin</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Bạn chưa có tài khoản Khách hàng?{' '}
              <Link to="/register" className="font-bold text-[#0047AB] hover:text-blue-700 underline underline-offset-4 transition">
                Đăng ký thành viên ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
