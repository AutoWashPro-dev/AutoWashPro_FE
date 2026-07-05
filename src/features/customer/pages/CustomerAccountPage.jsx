import React, { useState } from 'react';
import { 
  User, 
  Key, 
  Check, 
  Mail,
  Send
} from 'lucide-react';

export default function CustomerAccountPage() {
  const [subTab, setSubTab] = useState('profile'); // 'profile', 'password'

  // State thông tin cá nhân khách hàng (Đồng bộ tuyệt đối Nguyễn Minh Anh - C-01)
  const [fullName, setFullName] = useState("Nguyễn Minh Anh");
  const [email, setEmail] = useState("nguyenminhanh@gmail.com");
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  // State mật khẩu
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Dữ liệu khách hàng Nguyễn Minh Anh
  const customerStats = {
    customerId: "CUS-00109",
    phone: "0912345678",
    tierName: "PLATINUM MEMBER",
    pointsBalance: 1240,
    lifetimeSpend: 15400000,
    joinedDate: "15/02/2026"
  };

  // Gửi email kích hoạt tài khoản mô phỏng
  const handleSendVerification = () => {
    setIsSendingVerification(true);
    setTimeout(() => {
      setIsSendingVerification(false);
      setIsEmailVerified(true);
      alert("Hệ thống đã gửi link kích hoạt đến Gmail của bạn. Trạng thái đã được xác thực!");
    }, 1500);
  };

  // Cập nhật thông tin tài khoản
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    alert("Cập nhật thông tin tài khoản thành công!");
  };

  // Đổi mật khẩu tài khoản
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới và Xác nhận mật khẩu không trùng khớp!");
      return;
    }
    alert("Thay đổi mật khẩu tài khoản thành công!");
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Format tiền tệ VNĐ
  const formatVnd = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ========================================================================================= */}
        {/* CỘT TRÁI: DÃY SUB-TAB DỌC CHỌN PHÂN HỆ (DESKTOP) */}
        {/* ========================================================================================= */}
        <aside className="w-full lg:w-[240px] shrink-0 flex flex-row lg:flex-col gap-1 border-b lg:border-b-0 lg:border-r border-slate-150 pb-4 lg:pb-0 lg:pr-6 overflow-x-auto">
          <button
            onClick={() => setSubTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all w-full text-left ${
              subTab === 'profile'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <User size={16} />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            onClick={() => setSubTab('password')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all w-full text-left ${
              subTab === 'password'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
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
          
          {/* TAB 1: THÔNG TIN CÁ NHÂN (PROFILE) */}
          {subTab === 'profile' && (
            <div className="space-y-6">
              
              {/* Thẻ hiển thị các tham số cố định */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Mã Khách hàng</span>
                  <span className="text-sm font-bold font-mono text-slate-800">{customerStats.customerId}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Số điện thoại (ID)</span>
                  <span className="text-sm font-bold font-mono text-slate-800">{customerStats.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Hạng VIP hiện tại</span>
                  <span className="text-sm font-bold text-blue-600 uppercase">{customerStats.tierName}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100/50 col-span-2 md:col-span-3"></div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Điểm tích lũy</span>
                  <span className="text-sm font-bold text-slate-800">{customerStats.pointsBalance} Pts</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Doanh thu trọn đời</span>
                  <span className="text-sm font-bold text-slate-800">{formatVnd(customerStats.lifetimeSpend)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Ngày gia nhập trạm</span>
                  <span className="text-sm font-bold text-slate-800">{customerStats.joinedDate}</span>
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
    </div>
  );
}
