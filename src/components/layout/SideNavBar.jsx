import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  Users, 
  Briefcase, 
  BarChart, 
  Settings, 
  HelpCircle, 
  LogOut,
  Calendar,
  X
} from 'lucide-react';
import Logo from '../common/Logo';

export default function SideNavBar({ isOpen, onClose }) {
  const navItems = [
    { name: 'Tổng quan', path: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Đặt lịch', path: '/customer/booking', icon: Calendar },
    { name: 'Khách hàng', path: '/customer/loyalty', icon: Users },
    { name: 'Dịch vụ', path: '/customer/cars', icon: Briefcase },
    { name: 'Báo cáo', path: '/customer/reports', icon: BarChart },
    { name: 'Cài đặt', path: '/customer/profile', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed lg:static top-0 left-0 z-50 bg-bg-sidebar flex flex-col gap-[8px] h-screen items-start p-[16px] w-[280px] shrink-0 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 border-r border-border-main lg:border-none`}>
        <div className="flex flex-col items-start pb-[32px] w-full relative">
          <div className="flex flex-col gap-[4px] items-start px-[8px] w-full">
            <div className="flex flex-col items-start w-full pb-2">
              <Logo />
            </div>
            <div className="flex flex-col items-start w-full">
              <p className="font-normal text-text-muted text-[12px] leading-[16px]">Quản lý dịch vụ</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 p-2 text-text-muted hover:bg-gray-200 rounded-lg lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col items-start pb-[24px] w-full">
          <Link to="/customer/booking" className="bg-primary hover:bg-primary-dark transition-colors flex gap-[8px] items-center justify-center px-[16px] py-[12px] rounded-[8px] w-full text-white">
            <CalendarPlus size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Đặt lịch mới</span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-[4px] items-start w-full overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) =>
                `flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-light'
                    : 'text-text-muted hover:bg-gray-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={isActive ? 'text-white' : ''} />
                  <span className={`text-[14px] leading-[20px] ${isActive ? 'font-bold text-white' : 'font-medium'}`}>
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-border-main border-t flex flex-col gap-[4px] items-start pt-[17px] w-full mt-auto">
          <a href="#" className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full text-text-muted hover:bg-gray-200 transition-colors">
            <HelpCircle size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Trợ giúp</span>
          </a>
          <a href="#" className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full text-text-muted hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={18} />
            <span className="font-medium text-[14px] leading-[20px]">Đăng xuất</span>
          </a>
        </div>
      </div>
    </>
  );
}
