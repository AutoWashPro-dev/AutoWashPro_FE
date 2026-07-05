import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('VERIFYING'); // VERIFYING, SUCCESS, ERROR
  const [message, setMessage] = useState('');
  const calledRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('ERROR');
      setMessage('Không tìm thấy Token xác thực trong đường dẫn.');
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    const verify = async () => {
      try {
        const res = await authApi.verifyEmail(token);
        setStatus('SUCCESS');
        setMessage(res.message || 'Tài khoản của bạn đã được kích hoạt thành công!');
      } catch (err) {
        setStatus('ERROR');
        let errMsg = err.message || 'Liên kết xác thực đã hết hạn hoặc không hợp lệ.';
        if (errMsg.toLowerCase().includes('already been used') || errMsg.toLowerCase().includes('used')) {
          errMsg = 'Liên kết xác thực này đã được sử dụng (Tài khoản của bạn đã được kích hoạt thành công trước đó. Vui lòng bấm nút dưới đây để đăng nhập ngay)!';
        }
        setMessage(errMsg);
      }
    };

    verify();
  }, [location.search]);

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-2.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#0047AB] flex items-center justify-center shadow-lg shadow-[#0047AB]/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl font-black tracking-tight text-[#181c1e]">
            AutoWash <span className="text-[#0047AB]">Pro</span>
          </span>
        </div>

        <div className="bg-white py-10 px-6 shadow-xl shadow-slate-200/80 sm:rounded-3xl border border-slate-200 text-center">
          {status === 'VERIFYING' && (
            <div className="py-6">
              <Loader2 className="w-16 h-16 text-[#0047AB] animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-black text-[#181c1e] tracking-tight">
                Đang Xác Thực Tài Khoản...
              </h3>
              <p className="mt-2 text-sm text-slate-500 font-medium">
                Vui lòng đợi giây lát, chúng tôi đang kiểm tra chữ ký bảo mật của liên kết.
              </p>
            </div>
          )}

          {status === 'SUCCESS' && (
            <div className="py-4">
              <div className="w-20 h-20 bg-emerald-100 border border-emerald-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-500/10 animate-bounce">
                <CheckCircle2 className="w-11 h-11 text-emerald-600" />
              </div>
              
              <h3 className="text-2xl font-black text-[#181c1e] tracking-tight">
                Kích Hoạt Thành Công! 🎉
              </h3>
              
              <p className="mt-3 text-sm text-slate-700 px-2 leading-relaxed font-medium">
                {message}
              </p>
              <p className="mt-2 text-xs text-[#0047AB] font-bold">
                Chào mừng bạn đến với hệ thống chăm sóc xe máy đồng giá cao cấp.
              </p>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-[#0047AB]/20 text-sm font-bold text-white bg-[#0047AB] hover:bg-blue-700 transition-all transform active:scale-[0.99] cursor-pointer"
                >
                  <span>Đăng Nhập Để Trải Nghiệm Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {status === 'ERROR' && (
            <div className="py-4">
              <div className="w-20 h-20 bg-red-100 border border-red-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-red-500/10">
                <XCircle className="w-11 h-11 text-red-600" />
              </div>
              
              <h3 className="text-xl font-black text-[#181c1e] tracking-tight">
                Xác Thực Không Thành Công
              </h3>
              
              <p className="mt-3 text-sm text-red-600 font-medium px-2">
                {message}
              </p>

              <div className="mt-8 space-y-3">
                <Link
                  to="/register"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition"
                >
                  <span>Đăng Ký Tài Khoản Khác</span>
                </Link>
                
                <Link
                  to="/login"
                  className="block text-xs text-[#0047AB] hover:text-blue-700 font-bold underline underline-offset-4 transition pt-2"
                >
                  Quay lại trang Đăng nhập
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
