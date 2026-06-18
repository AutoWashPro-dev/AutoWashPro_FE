import {
  LayoutDashboard,
  Calendar,
  Users,
  Briefcase,
  BarChart,
  Settings,
  HelpCircle,
  LogOut,
  CalendarPlus,
  Crown,
  CalendarDays,
  ChevronRight,
  Camera,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../../components/common/Logo';

export default function ProfilePage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="content-stretch flex items-start justify-center pl-[280px] relative size-full min-h-screen bg-gray-50">
      {/* SideNavBar */}
      <div className="fixed bg-[#f1f4f7] flex flex-col gap-[8px] h-full items-start left-0 p-[16px] top-0 w-[280px]">
        <div className="flex flex-col items-start pb-[32px] w-full">
          <div className="flex flex-col gap-[4px] items-start px-[8px] w-full">
            <div className="flex flex-col items-start w-full pb-2">
              <Logo />
            </div>
            <div className="flex flex-col items-start w-full">
              <p className="font-normal text-[#434654] text-[12px] leading-[16px]">Quản lý dịch vụ</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start pb-[24px] w-full">
          <button className="bg-[#0052cc] hover:bg-[#0047b3] transition-colors flex gap-[8px] items-center justify-center px-[16px] py-[12px] rounded-[8px] w-full text-white">
            <CalendarPlus size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Đặt lịch mới</span>
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-[4px] items-start w-full">
          <a href="#" className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full text-[#434654] hover:bg-gray-200 transition-colors">
            <LayoutDashboard size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Tổng quan</span>
          </a>
          <a href="#" className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full text-[#434654] hover:bg-gray-200 transition-colors">
            <Calendar size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Đặt lịch</span>
          </a>
          <a href="#" className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full text-[#434654] hover:bg-gray-200 transition-colors">
            <Users size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Khách hàng</span>
          </a>
          <Link to="/customer/cars" className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full text-[#434654] hover:bg-gray-200 transition-colors">
            <Briefcase size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Dịch vụ</span>
          </Link>
          <a href="#" className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full text-[#434654] hover:bg-gray-200 transition-colors">
            <BarChart size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Báo cáo</span>
          </a>
          <a href="#" className="bg-[#0052cc] flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full text-[#c4d2ff]">
            <Settings size={18} />
            <span className="font-bold text-[14px] leading-[20px] text-white">Cài đặt</span>
          </a>
        </nav>

        <div className="border-[#c3c6d6] border-t flex flex-col gap-[4px] items-start pt-[17px] w-full">
          <a href="#" className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full text-[#434654] hover:bg-gray-200 transition-colors">
            <HelpCircle size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Trợ giúp</span>
          </a>
          <a href="#" className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full text-[#434654] hover:bg-gray-200 transition-colors">
            <LogOut size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Đăng xuất</span>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-[32px] items-start max-w-[1440px] p-[32px] w-full">
        {/* Header */}
        <div className="flex flex-col gap-[8px] items-start w-full">
          <div className="flex flex-col items-start w-full">
            <h1 className="font-semibold text-[#181c1e] text-[32px] tracking-[-0.32px] leading-[40px]">Hồ sơ cá nhân</h1>
          </div>
          <div className="flex flex-col items-start w-full">
            <p className="font-normal text-[#434654] text-[16px] leading-[24px]">Quản lý thông tin và bảo mật tài khoản của bạn.</p>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] w-full">

          {/* Left Column - Summary Cards */}
          <div className="lg:col-span-4 flex flex-col gap-[24px] w-full">
            {/* Account Summary Card */}
            <div className="bg-white border border-[#e5e7eb] flex flex-col gap-[24px] overflow-hidden p-[25px] rounded-[12px] shadow-sm w-full relative">
              <div className="flex gap-[16px] items-center w-full z-10">
                <div className="bg-[#d6e0f3] border-4 border-white flex items-center justify-center p-[4px] rounded-full shadow-sm size-[64px]">
                  <Crown className="text-[#0052cc]" size={28} />
                </div>
                <div className="flex flex-col gap-[4px]">
                  <p className="font-medium text-[#434654] text-[14px] tracking-[0.7px] uppercase leading-[20px]">HẠNG THÀNH VIÊN</p>
                  <p className="font-bold text-[#003d9b] text-[24px] leading-[32px]">Platinum</p>
                </div>
              </div>

              <div className="border-[#c3c6d6] border-t flex pt-[25px] w-full z-10">
                <div className="flex-1 flex flex-col gap-[4px]">
                  <p className="font-normal text-[#434654] text-[12px] leading-[16px]">Điểm tích lũy</p>
                  <p className="font-semibold text-[#181c1e] text-[18px] leading-[28px]">2.450</p>
                </div>
                <div className="flex-1 flex flex-col gap-[4px]">
                  <p className="font-normal text-[#434654] text-[12px] leading-[16px]">Đơn hàng</p>
                  <p className="font-semibold text-[#181c1e] text-[18px] leading-[28px]">12</p>
                </div>
              </div>

              <div className="border-[#c3c6d6] border-t flex justify-center pt-[17px] w-full z-10">
                <div className="flex gap-[4px] items-center text-[#434654]">
                  <CalendarDays size={14} />
                  <p className="font-normal text-[12px] leading-[16px]">Tham gia từ 01/2024</p>
                </div>
              </div>

              {/* Decorative Background */}
              <div className="absolute bg-[#0052cc] blur-[20px] opacity-10 -right-[48px] rounded-full size-[128px] -top-[48px]" />
            </div>

            {/* Ad/Banner Card */}
            <div className="bg-white border border-[#e5e7eb] flex flex-col overflow-hidden p-[25px] rounded-[12px] w-full relative">
              <div className="absolute inset-0 bg-blue-50 opacity-50 pointer-events-none" />

              <div className="flex flex-col gap-[8px] pb-[1px] w-full z-10">
                <p className="font-bold text-[#003d9b] text-[14px] leading-[20px]">Ưu đãi Platinum</p>
                <div className="font-semibold text-[#181c1e] text-[16px] leading-[24px]">
                  <p>Giảm 20% cho gói phủ Ceramic</p>
                  <p>toàn diện.</p>
                </div>
                <a href="#" className="flex gap-[4px] items-center pt-[10.5px] text-[#003d9b] hover:underline">
                  <span className="font-medium text-[14px] leading-[20px]">Xem chi tiết</span>
                  <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-8 flex flex-col gap-[24px] w-full">
            {/* Personal Info Section */}
            <div className="bg-white border border-[#e5e7eb] flex flex-col gap-[24px] p-[25px] rounded-[12px] w-full">
              <div className="border-[#c3c6d6] border-b pb-[17px] w-full">
                <h2 className="font-semibold text-[#181c1e] text-[24px] leading-[32px]">Thông tin cá nhân</h2>
              </div>

              <div className="flex flex-col md:flex-row gap-[32px] w-full">
                {/* Avatar Column */}
                <div className="flex flex-col gap-[16px] items-center">
                  <div className="group relative border-4 border-[#f1f4f7] rounded-full shadow-sm size-[128px] overflow-hidden cursor-pointer">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                      alt="User avatar"
                      className="absolute inset-0 size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="text-white" size={24} />
                    </div>
                  </div>
                  <button className="font-medium text-[#003d9b] text-[14px] hover:underline">
                    Đổi ảnh đại diện
                  </button>
                </div>

                {/* Form Fields */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-[24px] w-full">
                  <div className="flex flex-col gap-[8px] w-full">
                    <label className="font-medium text-[#434654] text-[14px] leading-[20px]">Họ tên</label>
                    <input
                      type="text"
                      className="bg-[#f7fafd] border border-[#6b7280] rounded-[8px] px-[17px] py-[14px] font-normal text-[#181c1e] text-[16px] w-full focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:border-transparent"
                      defaultValue="Nguyễn Văn A"
                    />
                  </div>
                  <div className="flex flex-col gap-[8px] w-full">
                    <label className="font-medium text-[#434654] text-[14px] leading-[20px]">Email</label>
                    <input
                      type="email"
                      className="bg-gray-100 border border-gray-300 rounded-[8px] px-[17px] py-[14px] font-normal text-gray-500 text-[16px] w-full cursor-not-allowed"
                      defaultValue="nguyenvana@example.com"
                      readOnly
                    />
                    <p className="font-normal text-[#555f6f] text-[12px] leading-[16px]">Email không thể thay đổi</p>
                  </div>
                  <div className="flex flex-col gap-[8px] w-full">
                    <label className="font-medium text-[#434654] text-[14px] leading-[20px]">Số điện thoại</label>
                    <input
                      type="tel"
                      className="bg-[#f7fafd] border border-[#6b7280] rounded-[8px] px-[17px] py-[14px] font-normal text-[#181c1e] text-[16px] w-full focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:border-transparent"
                      defaultValue="0901234567"
                    />
                  </div>
                  <div className="flex flex-col gap-[8px] w-full">
                    <label className="font-medium text-[#434654] text-[14px] leading-[20px]">Ngày sinh</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="bg-[#f7fafd] border border-[#6b7280] rounded-[8px] px-[17px] py-[14px] font-normal text-[#181c1e] text-[16px] w-full pr-[40px] focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:border-transparent"
                        defaultValue="05/05/1990"
                      />
                      <div className="absolute right-[16px] top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-[8px] w-full">
                <button className="bg-[#0052cc] hover:bg-[#0047b3] transition-colors font-medium text-white text-[14px] leading-[20px] px-[24px] py-[12px] rounded-[8px]">
                  Lưu thay đổi
                </button>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white border border-[#e5e7eb] flex flex-col gap-[24px] p-[25px] rounded-[12px] w-full">
              <div className="border-[#c3c6d6] border-b flex gap-[8px] items-center pb-[17px] w-full">
                <Settings size={20} className="text-[#181c1e]" />
                <h2 className="font-semibold text-[#181c1e] text-[24px] leading-[32px]">Bảo mật</h2>
              </div>

              <div className="flex flex-col gap-[24px] w-full max-w-[448px]">
                <div className="flex flex-col gap-[8px] w-full">
                  <label className="font-medium text-[#434654] text-[14px] leading-[20px]">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className="bg-[#f7fafd] border border-[#6b7280] rounded-[8px] px-[17px] py-[14px] w-full pr-[40px] focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:border-transparent"
                    />
                    <button
                      type="button"
                      className="absolute right-[16px] top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-[8px] w-full">
                  <label className="font-medium text-[#434654] text-[14px] leading-[20px]">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="bg-[#f7fafd] border border-[#6b7280] rounded-[8px] px-[17px] py-[14px] w-full pr-[40px] focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:border-transparent"
                    />
                    <button
                      type="button"
                      className="absolute right-[16px] top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="font-normal text-[#555f6f] text-[12px] leading-[16px]">Ít nhất 8 ký tự, bao gồm chữ và số.</p>
                </div>

                <div className="flex flex-col gap-[8px] w-full">
                  <label className="font-medium text-[#434654] text-[14px] leading-[20px]">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="bg-[#f7fafd] border border-[#6b7280] rounded-[8px] px-[17px] py-[14px] w-full pr-[40px] focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:border-transparent"
                    />
                    <button
                      type="button"
                      className="absolute right-[16px] top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-[8px] w-full">
                  <button className="bg-[#f7fafd] border border-[#c3c6d6] hover:bg-gray-100 transition-colors font-medium text-[#181c1e] text-[14px] leading-[20px] px-[25px] py-[13px] rounded-[8px]">
                    Cập nhật mật khẩu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
