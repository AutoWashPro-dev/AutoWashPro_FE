import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Key, 
  Check, 
  Mail,
  Send,
  Loader2,
  Car,
  CalendarDays,
  ShieldCheck
} from 'lucide-react';
import { customerApi } from '../services/customerApi';
import { validateGmail } from '../../../utils/validationUtils';

export default function CustomerAccountPage() {
  const navigate = useNavigate();
  const [subTab, setSubTab] = useState('profile'); // 'profile', 'password'

  // State thông tin cá nhân khách hàng
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (val && !validateGmail(val)) {
      setEmailError("Địa chỉ email phải là Gmail hợp lệ (VD: user@gmail.com)");
    } else {
      setEmailError("");
    }
  };
  
  // Profile data from GET /customer/auth/me
  const [customerStats, setCustomerStats] = useState({
    customerId: "N/A",
    phoneNumber: "N/A",
    tierName: "N/A",
    tierDisplayName: "N/A",
    loyaltyPoints: 0,
    totalSpending: 0,
    visitCount: 0,
    bookingWindowDays: 7,
    vehicles: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // State mật khẩu
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Call GET /api/v1/customer/auth/me with Bearer token
        const data = await customerApi.getProfile();
        if (data) {
          // Pre-fill editable form fields
          setFullName(data.fullName || "");
          setEmail(data.email || "");
          setIsEmailVerified(data.isEmailVerified ?? false);
          
          // Map all response fields to customerStats
          setCustomerStats({
            customerId: data.customerId || "N/A",
            phoneNumber: data.phoneNumber || "N/A",
            tierName: data.tierName || "MEMBER",
            tierDisplayName: data.tierDisplayName || data.tierName || "Member",
            loyaltyPoints: data.loyaltyPoints ?? 0,
            totalSpending: data.totalSpending ?? 0,
            visitCount: data.visitCount ?? 0,
            bookingWindowDays: data.bookingWindowDays ?? 7,
            vehicles: Array.isArray(data.vehicles) ? data.vehicles : []
          });
        }
      } catch (err) {
        console.error("Failed to fetch account profile:", err);
        // If 401/403, redirect to login
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          navigate('/login');
          return;
        }
        setErrorMessage("Không thể tải thông tin tài khoản. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // Gửi email kích hoạt tài khoản
  const handleSendVerification = async () => {
    setIsSendingVerification(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const res = await customerApi.requestEmailVerification();
      setIsEmailVerified(true);
      setSuccessMessage(res.message || "Hệ thống đã gửi link kích hoạt đến Gmail của bạn. Trạng thái đã được xác thực!");
    } catch (err) {
      console.error("Failed to request email verification:", err);
      setErrorMessage(err.response?.data?.message || "Gửi yêu cầu xác thực thất bại. Vui lòng thử lại!");
    } finally {
      setIsSendingVerification(false);
    }
  };

  // Cập nhật thông tin tài khoản
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!validateGmail(email)) {
      setErrorMessage("Địa chỉ email phải là Gmail hợp lệ và kết thúc bằng @gmail.com.");
      return;
    }

    try {
      const updatedData = await customerApi.updateProfile({ fullName, email });
      if (updatedData) {
        setFullName(updatedData.fullName || "");
        setEmail(updatedData.email || "");
        setIsEmailVerified(updatedData.isEmailVerified ?? false);
        setCustomerStats(prev => ({
          ...prev,
          customerId: updatedData.customerId || prev.customerId,
          phoneNumber: updatedData.phoneNumber || prev.phoneNumber,
          tierName: updatedData.tierName || prev.tierName,
          tierDisplayName: updatedData.tierDisplayName || updatedData.tierName || prev.tierDisplayName,
          loyaltyPoints: updatedData.loyaltyPoints ?? prev.loyaltyPoints,
          totalSpending: updatedData.totalSpending ?? prev.totalSpending,
          visitCount: updatedData.visitCount ?? prev.visitCount,
          bookingWindowDays: updatedData.bookingWindowDays ?? prev.bookingWindowDays,
          vehicles: Array.isArray(updatedData.vehicles) ? updatedData.vehicles : prev.vehicles
        }));
      }
      setSuccessMessage("Cập nhật thông tin tài khoản thành công!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setErrorMessage(err.response?.data?.message || "Cập nhật thông tin thất bại. Vui lòng thử lại!");
    }
  };

  // Đổi mật khẩu tài khoản (API: POST /customer/auth/email/reset-password)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    // Validate required fields are not empty
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ tất cả các trường mật khẩu.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu mới và Xác nhận mật khẩu không trùng khớp!');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await customerApi.changePassword({
        newPassword: newPassword,
        confirmPassword: confirmPassword
      });
      setSuccessMessage('Đổi mật khẩu thành công!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Failed to change password:', err);
      const serverMsg = err.response?.data?.message || err.message || '';
      setErrorMessage(serverMsg || 'Thay đổi mật khẩu thất bại. Vui lòng thử lại!');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // Skeleton loading component for the profile tab
  const ProfileSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-2.5 bg-slate-200 rounded w-2/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
      {/* Vehicles skeleton */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
        <div className="h-3 bg-slate-200 rounded w-1/4"></div>
        <div className="h-10 bg-slate-200 rounded-xl"></div>
      </div>
      {/* Form skeleton */}
      <div className="space-y-4 max-w-xl">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-10 bg-slate-200 rounded-xl"></div>
        <div className="h-10 bg-slate-200 rounded-xl"></div>
        <div className="h-10 bg-slate-200 rounded-xl w-1/3"></div>
      </div>
    </div>
  );

  // Tier badge color helper
  const getTierBadgeStyle = (tierName) => {
    const tier = (tierName || '').toUpperCase();
    if (tier.includes('PLATINUM')) return 'bg-violet-100 text-violet-700 border-violet-200';
    if (tier.includes('GOLD')) return 'bg-gradient-to-r from-[#FFF0B3] via-[#E2B755] to-[#B38728] text-slate-950 font-black border border-[#FFF8D6] shadow-sm';
    if (tier.includes('SILVER')) return 'bg-slate-200 text-slate-700 border-slate-300';
    return 'bg-blue-100 text-blue-700 border-blue-200'; // MEMBER default
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
                <ProfileSkeleton />
              ) : (
                <>
                {/* Thẻ hiển thị các tham số cố định — mapped from GET /customer/auth/me */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Mã Khách hàng</span>
                    <span className="text-sm font-bold font-mono text-slate-800">{customerStats.customerId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Số điện thoại (ID)</span>
                    <span className="text-sm font-bold font-mono text-slate-800">{customerStats.phoneNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Hạng VIP hiện tại</span>
                    <span className={`inline-block text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-lg border ${getTierBadgeStyle(customerStats.tierName)}`}>
                      {customerStats.tierDisplayName}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100/50 col-span-2 md:col-span-3"></div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Điểm tích lũy</span>
                    <span className="text-sm font-bold text-slate-800">{customerStats.loyaltyPoints} Pts</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Đã tiêu</span>
                    <span className="text-sm font-bold text-slate-800">
                      {customerStats.totalSpending !== undefined && customerStats.totalSpending !== null 
                        ? `${Number(customerStats.totalSpending).toLocaleString('vi-VN')} đ` 
                        : '0 đ'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Số lần dọn xe</span>
                    <span className="text-sm font-bold text-slate-800">{customerStats.visitCount} lần dọn xe</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100/50 col-span-2 md:col-span-3"></div>
                  <div className="col-span-2 md:col-span-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Cửa sổ đặt lịch</span>
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-blue-500" />
                      Cho phép đặt trước {customerStats.bookingWindowDays} ngày
                    </span>
                  </div>
                </div>

                {/* Danh sách phương tiện đã đăng ký — from vehicles[] */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                  <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 uppercase">
                    <Car size={14} className="text-blue-600" /> Phương tiện đã đăng ký
                  </h4>
                  {customerStats.vehicles.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Chưa có phương tiện nào được đăng ký.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {customerStats.vehicles.map((v) => (
                        <div 
                          key={v.vehicleId || v.id} 
                          className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <Car size={14} className="text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-slate-800 block truncate">{v.model || 'N/A'}</span>
                            <span className="text-[11px] text-slate-500 font-mono font-semibold">{v.licensePlate || 'N/A'}</span>
                          </div>
                          {v.isDefault && (
                            <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg uppercase flex items-center gap-0.5 shrink-0">
                              <ShieldCheck size={10} /> Mặc định
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
                        onChange={handleEmailChange}
                        className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                        required
                      />
                      {!isEmailVerified && (
                        <button
                          type="button"
                          disabled={isSendingVerification || !!emailError}
                          onClick={handleSendVerification}
                          className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 flex items-center gap-1 shrink-0 transition-colors"
                        >
                          <Send size={12} /> {isSendingVerification ? 'Đang gửi...' : 'Gửi mã xác thực'}
                        </button>
                      )}
                    </div>
                    {emailError && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{emailError}</p>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={!!emailError || !email.trim() || !fullName.trim()}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
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
                disabled={isSubmittingPassword}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {isSubmittingPassword ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <span>Cập nhật mật khẩu mới</span>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
