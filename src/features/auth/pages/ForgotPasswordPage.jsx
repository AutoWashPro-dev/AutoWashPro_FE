import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, KeyRound, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [contactValue, setContactValue] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();

  // Handle OTP countdown
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!contactValue) return;
    setStep(2);
    setCountdown(60); // Reset countdown
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only 1 digit per box
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.join('').length === 4) {
      setStep(3);
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setStep(4); // Success step
  };

  return (
    <div className="flex justify-center items-center py-24 px-4 bg-bg-main min-h-[calc(100vh-64px)] font-['Inter']">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-border-main w-full max-w-md flex flex-col items-center relative">
        
        {step < 4 && (
          <Link to="/login" className="absolute left-6 top-8 text-text-muted hover:text-text-main transition-colors">
            <ArrowLeft size={24} />
          </Link>
        )}

        {/* Step 1: Request OTP */}
        {step === 1 && (
          <div className="w-full flex flex-col items-center">
            <div className="w-12 h-12 bg-primary-light text-primary rounded-full flex items-center justify-center mb-6">
              <KeyRound size={24} />
            </div>
            <h1 className="text-2xl font-bold text-text-main mb-2">Quên mật khẩu?</h1>
            <p className="text-text-muted text-center mb-8 text-sm">
              Đừng lo lắng, hãy nhập email hoặc số điện thoại của bạn và chúng tôi sẽ gửi mã khôi phục.
            </p>

            <div className="flex w-full bg-bg-sidebar rounded-lg p-1 mb-6">
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${method === 'email' ? 'bg-white shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
                onClick={() => setMethod('email')}
              >
                Email
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${method === 'phone' ? 'bg-white shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
                onClick={() => setMethod('phone')}
              >
                Số điện thoại
              </button>
            </div>

            <form onSubmit={handleSendOtp} className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1">
                <label className="text-text-main text-sm font-medium">
                  {method === 'email' ? 'Email của bạn' : 'Số điện thoại của bạn'}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {method === 'email' ? <Mail size={18} /> : <Phone size={18} />}
                  </div>
                  <input 
                    type={method === 'email' ? 'email' : 'tel'}
                    required 
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder={method === 'email' ? "name@example.com" : "0901234567"} 
                    className="w-full border border-gray-300 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:border-primary bg-white text-text-main" 
                  />
                </div>
              </div>
              
              <button type="submit" className="bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-dark transition shadow-sm mt-4">
                Gửi mã xác nhận
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <div className="w-full flex flex-col items-center">
            <h1 className="text-2xl font-bold text-text-main mb-2 mt-2">Nhập mã xác nhận</h1>
            <p className="text-text-muted text-center mb-8 text-sm">
              Chúng tôi đã gửi mã xác nhận 4 số đến <br/>
              <span className="font-semibold text-text-main">{contactValue}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="flex flex-col items-center gap-6 w-full">
              <div className="flex gap-4 justify-center w-full">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-14 h-14 text-center text-2xl font-bold border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-text-main transition-colors"
                  />
                ))}
              </div>

              <button 
                type="submit" 
                disabled={otp.join('').length < 4}
                className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-dark transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xác thực
              </button>

              <div className="text-center text-sm">
                <span className="text-text-muted">Chưa nhận được mã? </span>
                {countdown > 0 ? (
                  <span className="text-text-muted font-medium">Gửi lại sau {countdown}s</span>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => setCountdown(60)} 
                    className="text-primary font-medium hover:underline"
                  >
                    Gửi lại mã
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <div className="w-full flex flex-col items-center">
            <h1 className="text-2xl font-bold text-text-main mb-2 mt-2">Tạo mật khẩu mới</h1>
            <p className="text-text-muted text-center mb-8 text-sm">
              Mật khẩu mới của bạn phải khác với mật khẩu sử dụng trước đó.
            </p>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1">
                <label className="text-text-main text-sm font-medium">Mật khẩu mới</label>
                <input type="password" required placeholder="••••••••" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary bg-white text-text-main" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-text-main text-sm font-medium">Xác nhận mật khẩu mới</label>
                <input type="password" required placeholder="••••••••" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary bg-white text-text-main" />
              </div>
              
              <button type="submit" className="bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-dark transition shadow-sm mt-4 w-full">
                Xác nhận đổi mật khẩu
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="w-full flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-2xl font-bold text-text-main mb-2">Thành công!</h1>
            <p className="text-text-muted text-center mb-8 text-sm">
              Mật khẩu của bạn đã được thay đổi thành công. Bạn có thể đăng nhập bằng mật khẩu mới.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-dark transition shadow-sm"
            >
              Quay lại đăng nhập
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
