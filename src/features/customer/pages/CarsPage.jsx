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
  Plus,
  Car,
  Edit2,
  Trash2,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../../../components/common/Logo';

export default function CarsPage() {
  return (
    <div className="content-stretch flex items-start justify-center pl-[280px] relative size-full min-h-screen bg-[#f7fafd]">
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
          <Link to="/customer/booking" className="bg-[#003d9b] hover:bg-[#003380] transition-colors flex gap-[8px] items-center justify-center px-[16px] py-[12px] rounded-[8px] w-full text-white shadow-sm">
            <CalendarPlus size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Đặt lịch mới</span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-[4px] items-start w-full">
          <Link to="/customer/dashboard" className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full text-[#434654] hover:bg-gray-200 transition-colors">
            <LayoutDashboard size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Tổng quan</span>
          </Link>
          <Link to="/customer/booking" className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full text-[#434654] hover:bg-gray-200 transition-colors">
            <Calendar size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Đặt lịch</span>
          </Link>
          <Link to="/customer/loyalty" className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full text-[#434654] hover:bg-gray-200 transition-colors">
            <Users size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Khách hàng</span>
          </Link>
          <Link to="/customer/cars" className="bg-[#0052cc] flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full text-[#c4d2ff] shadow-sm">
            <Briefcase size={18} className="text-white" />
            <span className="font-bold text-[14px] leading-[20px] text-white">Dịch vụ</span>
          </Link>
          <a href="#" className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full text-[#434654] hover:bg-gray-200 transition-colors">
            <BarChart size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Báo cáo</span>
          </a>
          <Link to="/customer/profile" className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full text-[#434654] hover:bg-gray-200 transition-colors">
            <Settings size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Cài đặt</span>
          </Link>
        </nav>

        <div className="border-[#c3c6d6] border-t flex flex-col gap-[4px] items-start pt-[17px] w-full">
          <a href="#" className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full text-[#434654] hover:bg-gray-200 transition-colors">
            <HelpCircle size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Trợ giúp</span>
          </a>
          <a href="#" className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full text-[#ba1a1a] hover:bg-red-50 transition-colors">
            <LogOut size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Đăng xuất</span>
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-[1_0_0] flex-col h-full items-start min-w-px relative">
        <div className="flex flex-col gap-[32px] items-start max-w-[1440px] p-[32px] w-full">
          
          {/* Page Header */}
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col gap-[4px] items-start">
              <h1 className="font-semibold text-[#181c1e] text-[32px] tracking-[-0.32px] leading-[40px]">
                Quản lý xe
              </h1>
              <p className="font-normal text-[#434654] text-[16px] leading-[24px]">
                Danh sách phương tiện của bạn.
              </p>
            </div>
            <button className="bg-[#003d9b] hover:bg-[#003380] transition-colors drop-shadow-sm flex gap-[8px] items-center justify-center px-[24px] py-[12px] rounded-[8px] text-white">
              <Plus size={16} />
              <span className="font-medium text-[14px] leading-[20px]">Thêm xe mới</span>
            </button>
          </div>

          {/* Bento Grid Layout for Cars */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[24px] w-full">
            
            {/* Car Card 1 (Default) */}
            <div className="bg-white border border-[#e5e7eb] flex flex-col items-start justify-between overflow-hidden p-[25px] rounded-[12px] shadow-[0px_4px_20px_0px_rgba(31,41,55,0.08)] w-full relative">
              <div className="absolute right-0 top-0 p-[16px]">
                <div className="bg-[#0052cc] flex gap-[4px] items-center px-[12px] py-[4px] rounded-full">
                  <Star size={12} className="text-[#c4d2ff] fill-current" />
                  <span className="font-medium text-[#c4d2ff] text-[12px] leading-[16px]">Xe mặc định</span>
                </div>
              </div>

              <div className="flex flex-col w-full pb-[24px]">
                <div className="flex gap-[16px] items-start w-full">
                  <div className="bg-[#f1f4f7] border border-[#e5e7eb] flex items-center justify-center rounded-[8px] size-[64px]">
                    <Car className="text-gray-600" size={32} />
                  </div>
                  <div className="flex flex-col gap-[4px] pt-[4px]">
                    <h3 className="font-bold font-mono text-[#181c1e] text-[24px] tracking-[2.4px] leading-[32px]">
                      51A-123.45
                    </h3>
                    <p className="font-normal text-[#555f6f] text-[16px] leading-[24px]">Toyota Camry</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col w-full pb-[24px]">
                <div className="grid grid-cols-2 gap-y-[16px] gap-x-[8px] w-full">
                  <div className="flex flex-col gap-[4px]">
                    <p className="font-normal text-[#434654] text-[12px] leading-[16px]">Loại xe</p>
                    <p className="font-medium text-[#181c1e] text-[14px] leading-[20px]">Sedan</p>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <p className="font-normal text-[#434654] text-[12px] leading-[16px]">Hãng</p>
                    <p className="font-medium text-[#181c1e] text-[14px] leading-[20px]">Toyota</p>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <p className="font-normal text-[#434654] text-[12px] leading-[16px]">Màu sắc</p>
                    <div className="flex gap-[8px] items-center">
                      <div className="bg-black border border-[#e5e7eb] rounded-full size-[16px]"></div>
                      <p className="font-medium text-[#181c1e] text-[14px] leading-[20px]">Đen</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-[#e5e8eb] border-t flex flex-col gap-[8px] pt-[17px] w-full">
                <Link to="/customer/booking" className="bg-[#f1f4f7] hover:bg-[#e5e7eb] transition-colors flex gap-[8px] items-center justify-center py-[10px] rounded-[8px] w-full text-[#003d9b]">
                  <Calendar size={18} />
                  <span className="font-medium text-[14px] leading-[20px]">Đặt lịch ngay cho xe này</span>
                </Link>
                <div className="flex gap-[8px] w-full">
                  <button className="bg-white border border-[#c3c6d6] hover:bg-gray-50 transition-colors flex flex-1 gap-[4px] items-center justify-center py-[9px] rounded-[8px] text-[#181c1e]">
                    <Edit2 size={14} />
                    <span className="font-medium text-[14px] leading-[20px]">Sửa</span>
                  </button>
                  <button className="bg-white border border-[#ffdad6] hover:bg-red-50 transition-colors flex flex-1 gap-[4px] items-center justify-center py-[9px] rounded-[8px] text-[#ba1a1a]">
                    <Trash2 size={14} />
                    <span className="font-medium text-[14px] leading-[20px]">Xóa</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Car Card 2 */}
            <div className="bg-white border border-[#e5e7eb] flex flex-col items-start justify-between overflow-hidden p-[25px] rounded-[12px] shadow-[0px_4px_20px_0px_rgba(31,41,55,0.08)] w-full relative">
              <div className="flex flex-col w-full pb-[24px]">
                <div className="flex gap-[16px] items-start pt-[8px] w-full">
                  <div className="bg-[#f1f4f7] border border-[#e5e7eb] flex items-center justify-center rounded-[8px] size-[64px]">
                    <Car className="text-gray-600" size={32} />
                  </div>
                  <div className="flex flex-col gap-[4px] pt-[4px]">
                    <h3 className="font-bold font-mono text-[#181c1e] text-[24px] tracking-[2.4px] leading-[32px]">
                      29C-987.65
                    </h3>
                    <p className="font-normal text-[#555f6f] text-[16px] leading-[24px]">Ford Everest</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col w-full pb-[24px]">
                <div className="grid grid-cols-2 gap-y-[16px] gap-x-[8px] w-full">
                  <div className="flex flex-col gap-[4px]">
                    <p className="font-normal text-[#434654] text-[12px] leading-[16px]">Loại xe</p>
                    <p className="font-medium text-[#181c1e] text-[14px] leading-[20px]">SUV</p>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <p className="font-normal text-[#434654] text-[12px] leading-[16px]">Hãng</p>
                    <p className="font-medium text-[#181c1e] text-[14px] leading-[20px]">Ford</p>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <p className="font-normal text-[#434654] text-[12px] leading-[16px]">Màu sắc</p>
                    <div className="flex gap-[8px] items-center">
                      <div className="bg-white border border-[#c3c6d6] rounded-full size-[16px]"></div>
                      <p className="font-medium text-[#181c1e] text-[14px] leading-[20px]">Trắng</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-[#e5e8eb] border-t flex flex-col gap-[8px] pt-[17px] w-full">
                <button className="bg-white border border-[#c3c6d6] hover:bg-gray-50 transition-colors flex gap-[8px] items-center justify-center py-[10px] rounded-[8px] w-full text-[#555f6f]">
                  <Star size={18} />
                  <span className="font-medium text-[14px] leading-[20px]">Đặt làm mặc định</span>
                </button>
                <div className="flex gap-[8px] w-full">
                  <button className="bg-white border border-[#c3c6d6] hover:bg-gray-50 transition-colors flex flex-1 gap-[4px] items-center justify-center py-[9px] rounded-[8px] text-[#181c1e]">
                    <Edit2 size={14} />
                    <span className="font-medium text-[14px] leading-[20px]">Sửa</span>
                  </button>
                  <button className="bg-white border border-[#ffdad6] hover:bg-red-50 transition-colors flex flex-1 gap-[4px] items-center justify-center py-[9px] rounded-[8px] text-[#ba1a1a]">
                    <Trash2 size={14} />
                    <span className="font-medium text-[14px] leading-[20px]">Xóa</span>
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
