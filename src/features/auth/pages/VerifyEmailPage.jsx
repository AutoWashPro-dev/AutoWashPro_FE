import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck, Sparkles, Droplets } from 'lucide-react';

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
          errMsg = 'Tài khoản này đã được kích hoạt từ trước. Vui lòng nhấn đăng nhập ngay!';
        }
        setMessage(errMsg);
      }
    };

    verify();
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/70 to-indigo-100/50 flex items-center justify-center p-4 sm:p-6 selection:bg-blue-600 selection:text-white relative overflow-hidden font-sans text-slate-800">
      <div className="absolute top-1/3 left-1/2 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute top-12 left-1/3 text-sky-400/30 pointer-events-none animate-bounce" style={{ animationDuration: '5s' }}>
        <Droplets className="w-10 h-10" />
      </div>
      
      <div className="w-full max-w-md relative z-10 py-4">
        <div className="bg-white/95 backdrop-blur-2xl py-8 px-6 sm:px-8 shadow-2xl shadow-blue-900/10 rounded-3xl border border-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-blue-600 to-indigo-600" />

          {status === 'VERIFYING' && (
            <div className="py-6">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Đang Xác Thực...
              </h3>
              <p className="mt-2 text-xs text-slate-500 font-medium px-4">
                Vui lòng đợi giây lát, hệ thống đang kích hoạt tài khoản VIP của bạn.
              </p>
            </div>
          )}

          {status === 'SUCCESS' && (
            <div className="py-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm animate-bounce">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Kích Hoạt Thành Công! 🎉
              </h3>
              
              <p className="mt-2 text-xs text-slate-600 px-2 leading-relaxed font-medium">
                {message}
              </p>
              <p className="mt-1 text-xs text-blue-600 font-bold">
                Chào mừng bạn đến với AutoWash Pro.
              </p>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/25 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:via-sky-700 hover:to-indigo-700 transition-all transform active:scale-[0.98] cursor-pointer"
                >
                  <span>Đăng Nhập Để Trải Nghiệm Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {status === 'ERROR' && (
            <div className="py-4">
              <div className="w-14 h-14 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Xác Thực Thất Bại
              </h3>
              
              <p className="mt-2 text-xs text-red-600 px-2 font-medium">
                {message}
              </p>

              <div className="mt-6 space-y-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition"
                >
                  <span>Đến Trang Đăng Nhập</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Bảo mật dữ liệu 256-bit Encryption Chuẩn SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
