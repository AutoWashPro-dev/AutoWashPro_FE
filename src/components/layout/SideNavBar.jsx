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
  Calendar
} from 'lucide-react';
import Logo from '../common/Logo';

export default function SideNavBar() {
  const navItems = [
    { name: 'Tổng quan', path: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Đặt lịch', path: '/customer/booking', icon: Calendar },
    { name: 'Khách hàng', path: '/customer/loyalty', icon: Users },
    { name: 'Dịch vụ', path: '/customer/cars', icon: Briefcase },
    { name: 'Báo cáo', path: '/customer/reports', icon: BarChart },
    { name: 'Cài đặt', path: '/customer/profile', icon: Settings },
  ];

  return (
    <div className="bg-[#f1f4f7] flex flex-col gap-[8px] h-screen items-start p-[16px] w-[280px] shrink-0 sticky top-0">
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
        <Link to="/customer/booking" className="bg-[#0052cc] hover:bg-[#0047b3] transition-colors flex gap-[8px] items-center justify-center px-[16px] py-[12px] rounded-[8px] w-full text-white">
          <CalendarPlus size={18} />
          <span className="font-medium text-[14px] leading-[20px]">Đặt lịch mới</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-[4px] items-start w-full">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full transition-colors ${
                isActive
                  ? 'bg-[#0052cc] text-[#c4d2ff]'
                  : 'text-[#434654] hover:bg-gray-200'
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
  );
}
