import React, { useState, useEffect } from 'react';
import { 
  User, 
  Key, 
  Check, 
  Mail,
  Send,
  Loader2
} from 'lucide-react';
import { customerApi } from '../services/customerApi';

export default function CustomerAccountPage() {
  const [subTab, setSubTab] = useState('profile'); // 'profile', 'password'

  // State thông tin cá nhân khách hàng
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  
  const [customerStats, setCustomerStats] = useState({
    id: "N/A",
    customerId: "N/A",
    phoneNumber: "N/A",
    membershipTier: "N/A",
    loyaltyPoints: 0,
    totalSpent: 0,
    createdAt: "N/A"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [accountAlert, setAccountAlert] = useState({
    isOpen: false,
    type: 'warning', // 'warning' | 'error' | 'success' | 'info'
    title: '',
    message: ''
  });

  // State mật khẩu
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await customerApi.getProfile();
        if (data) {
          setFullName(data.fullName || "N/A");
          setEmail(data.email || "N/A");
          setIsEmailVerified(data.isEmailVerified ?? false);
          
          setCustomerStats({
            id: data.id || data.customerId || "N/A",
            customerId: data.id || data.customerId || "N/A",
            phoneNumber: data.phoneNumber || data.phone || "N/A",
            membershipTier: data.membershipTier || data.tierName || "REGULAR",
            loyaltyPoints: data.loyaltyPoints ?? 0,
            totalSpent: data.totalSpent ?? data.totalSpending ?? 0,
            createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString('vi-VN') : "N/A"
          });
        }
      } catch (err) {
        console.error("Failed to fetch account profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Gửi email kích hoạt tài khoản
  const handleSendVerification = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email === 'N/A' || !emailRegex.test(email)) {
      setAccountAlert({
        isOpen: true,
        type: 'warning',
        title: "Địa chỉ Email không hợp lệ",
        message: "Vui lòng nhập địa chỉ Email hợp lệ trước khi nhận mã xác thực."
      });
      return;
    }
    setIsSendingVerification(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const res = await customerApi.requestEmailVerification();
      setIsEmailVerified(true);
      setAccountAlert({
        isOpen: true,
        type: 'info',
        title: "Đã gửi mã xác thực!",
        message: "Mã OTP xác thực đã được gửi tới email. Vui lòng kiểm tra hộp thư đến của bạn."
      });
    } catch (err) {
      console.error("Failed to request email verification:", err);
      setAccountAlert({
        isOpen: true,
        type: 'error',
        title: "Gửi mã xác thực thất bại",
        message: err.response?.data?.message || "Gửi yêu cầu xác thực thất bại. Vui lòng thử lại!"
      });
    } finally {
      setIsSendingVerification(false);
    }
  };

  // Cập nhật thông tin tài khoản
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    if (!fullName || !fullName.trim()) {
      setAccountAlert({
        isOpen: true,
        type: 'warning',
        title: "Thiếu thông tin bắt buộc",
        message: "Vui lòng không để trống trường Họ và tên."
      });
      return;
    }
    try {
      const updatedData = await customerApi.updateProfile({ fullName, email });
      if (updatedData) {
        setFullName(updatedData.fullName || "N/A");
        setEmail(updatedData.email || "N/A");
        setIsEmailVerified(updatedData.isEmailVerified ?? false);
        setCustomerStats({
          id: updatedData.id || updatedData.customerId || "N/A",
          customerId: updatedData.id || updatedData.customerId || "N/A",
          phoneNumber: updatedData.phoneNumber || updatedData.phone || "N/A",
          membershipTier: updatedData.membershipTier || updatedData.tierName || "REGULAR",
          loyaltyPoints: updatedData.loyaltyPoints ?? 0,
          totalSpent: updatedData.totalSpent ?? updatedData.totalSpending ?? 0,
          createdAt: updatedData.createdAt ? new Date(updatedData.createdAt).toLocaleDateString('vi-VN') : "N/A"
        });
      }
      setAccountAlert({
        isOpen: true,
        type: 'success',
        title: "Cập nhật thông tin thành công!",
        message: "Hồ sơ cá nhân của bạn đã được cập nhật thay đổi thành công."
      });
    } catch (err) {
      console.error("Failed to update profile:", err);
      setAccountAlert({
        isOpen: true,
        type: 'error',
        title: "Cập nhật thất bại",
        message: err.response?.data?.message || "Cập nhật thông tin thất bại. Vui lòng thử lại!"
      });
    }
  };

  // Đổi mật khẩu tài khoản
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setAccountAlert({
        isOpen: true,
        type: 'warning',
        title: "Thiếu thông tin mật khẩu",
        message: "Vui lòng nhập đầy đủ Mật khẩu hiện tại, Mật khẩu mới và Xác nhận mật khẩu."
      });
      return;
    }

    if (newPassword.length < 6) {
      setAccountAlert({
        isOpen: true,
        type: 'warning',
        title: "Mật khẩu quá ngắn",
        message: "Mật khẩu mới phải chứa ít nhất 6 ký tự để đảm bảo tính an toàn."
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAccountAlert({
        isOpen: true,
        type: 'warning',
        title: "Mật khẩu xác nhận không khớp",
        message: "Mật khẩu mới và Mật khẩu xác nhận không trùng khớp. Vui lòng kiểm tra lại."
      });
      return;
    }

    try {
      await customerApi.changePassword({
        oldPassword: currentPassword,
        newPassword: newPassword
      });
      
      setAccountAlert({
        isOpen: true,
        type: 'success',
        title: "Đổi mật khẩu thành công!",
        message: "Mật khẩu của bạn đã được thay đổi. Vui lòng sử dụng mật khẩu mới cho các lần đăng nhập tiếp theo."
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error("Failed to change password:", err);
      const isAuthError = err.response?.status === 400 || err.response?.status === 401;
      setAccountAlert({
        isOpen: true,
        type: 'error',
        title: "Cập nhật thất bại",
        message: isAuthError 
          ? "Mật khẩu hiện tại không chính xác. Vui lòng thử lại."
          : (err.response?.data?.message || "Thay đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại!")
      });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ========================================================================================= */}
        {/* CỘT TRÁI: DÃY SUB-TAB DỌC CHỌN PHÂN HỆ (DESKTOP) */}
        {/* ========================================================================================= */}
        <aside className="w-full lg:w-[240px] shrink-0 flex flex-row lg:flex-col gap-1 border-b lg:border-b-0 lg:border-r border-slate-150 pb-4 lg:pb-0 lg:pr-6 overflow-x-auto">
          <button
            onClick={() => {
              setSubTab('profile');
              setSuccessMessage('');
              setErrorMessage('');
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all w-full text-left ${
              subTab === 'profile'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-500 hover:bg-slate-55 hover:text-slate-800'
            }`}
          >
            <User size={16} />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            onClick={() => {
              setSubTab('password');
              setSuccessMessage('');
              setErrorMessage('');
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all w-full text-left ${
              subTab === 'password'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-500 hover:bg-slate-55 hover:text-slate-800'
            }`}
          >
            <Key size={16} />
            <span>Đổi mật khẩu</span>
          </button>
        </aside>

        {/* ========================================================================================= */}
        {/* CỘT PHẢI: HIỂN THỊ NỘI DUNG CHI TIẾT THEO TAB ĐƯỢC CHỌN */}
        {/* ========================================================================================= */}
        <div className="flex-1">
          
          {/* Success Message Banner */}
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-2xl flex items-center gap-2 font-bold text-xs">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              {successMessage}
            </div>
          )}

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-2 font-bold text-xs">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
              {errorMessage}
            </div>
          )}

          {/* TAB 1: THÔNG TIN CÁ NHÂN (PROFILE) */}
          {subTab === 'profile' && (
            <div className="space-y-6">
              
              {isLoading ? (
                <div className="flex justify-center items-center py-20 text-slate-400 gap-2">
                  <Loader2 className="animate-spin" size={24} /> Đang tải thông tin cá nhân...
                </div>
              ) : (
                <>
                {/* Thẻ hiển thị các tham số cố định */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Mã Khách hàng</span>
                    <span className="text-sm font-bold font-mono text-slate-800">{customerStats.id || customerStats.customerId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Số điện thoại (ID)</span>
                    <span className="text-sm font-bold font-mono text-slate-800">{customerStats.phoneNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Hạng VIP hiện tại</span>
                    <span className="text-sm font-bold text-blue-600 uppercase">{customerStats.membershipTier}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100/50 col-span-2 md:col-span-3"></div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Điểm tích lũy</span>
                    <span className="text-sm font-bold text-slate-800">{customerStats.loyaltyPoints} Pts</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Doanh thu trọn đời</span>
                    <span className="text-sm font-bold text-slate-800">
                      {customerStats.totalSpent !== undefined && customerStats.totalSpent !== null 
                        ? `${customerStats.totalSpent.toLocaleString('vi-VN')} d` 
                        : '0 d'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Ngày gia nhập trạm</span>
                    <span className="text-sm font-bold text-slate-800">{customerStats.createdAt || 'N/A'}</span>
                  </div>
                </div>

                {/* Form chỉnh sửa thông tin */}
                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl text-left">
                  <h3 className="font-bold text-slate-800 text-sm border-b pb-2 mb-4">Cập nhật thông tin tài khoản</h3>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Họ và tên</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Địa chỉ Email</label>
                      {isEmailVerified ? (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <Check size={12} /> Đã xác thực
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5">
                          [ Chưa xác thực ]
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                        required
                      />
                      {!isEmailVerified && (
                        <button
                          type="button"
                          disabled={isSendingVerification}
                          onClick={handleSendVerification}
                          className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 flex items-center gap-1 shrink-0 transition-colors"
                        >
                          <Send size={12} /> {isSendingVerification ? 'Đang gửi...' : 'Gửi mã xác thực'}
                        </button>
                      )}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    Lưu thay đổi thông tin
                  </button>
                </form>
                </>
              )}

            </div>
          )}

          {/* TAB 2: ĐỔI MẬT KHẨU (PASSWORD) */}
          {subTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl text-left">
              <h3 className="font-bold text-slate-800 text-sm border-b pb-2 mb-4">Thay đổi mật khẩu đăng nhập</h3>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Mật khẩu hiện tại</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Mật khẩu mới</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Cập nhật mật khẩu mới
              </button>
            </form>
          )}

        </div>
      </div>
      {/* CUSTOM ACCOUNT ALERT MODAL */}
      {accountAlert.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 flex flex-col items-center text-center space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            {accountAlert.type === 'warning' && (
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
            )}
            {accountAlert.type === 'error' && (
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            )}
            {accountAlert.type === 'info' && (
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            )}
            {accountAlert.type === 'success' && (
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            )}

            <div className="space-y-1">
              <h3 className="text-base font-black tracking-tight font-outfit">{accountAlert.title}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {accountAlert.message}
              </p>
            </div>

            <button
              onClick={() => setAccountAlert(prev => ({ ...prev, isOpen: false }))}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2.5 font-bold text-xs transition-colors cursor-pointer"
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
