import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  Users, 
  Wrench, 
  BarChart, 
  Settings, 
  HelpCircle, 
  LogOut,
  Plus
} from 'lucide-react';

export default function SideNavBar() {
  const navItems = [
    { name: 'Tổng quan', path: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Đặt lịch', path: '/customer/booking', icon: CalendarPlus },
    { name: 'Khách hàng', path: '/customer/customers', icon: Users },
    { name: 'Dịch vụ', path: '/customer/services', icon: Wrench },
    { name: 'Báo cáo', path: '/customer/reports', icon: BarChart },
  ];

  return (
    <div className="bg-[#f1f4f7] border-[#c3c6d6] border-r border-solid flex flex-col gap-[8px] h-screen items-start pl-[16px] pr-[17px] py-[16px] w-[280px] shrink-0 sticky top-0">
      {/* Logo Area */}
      <div className="w-full pb-[16px]">
        <div className="flex flex-col gap-[4px] px-[16px] py-[24px] w-full">
          <div className="w-full">
            <h1 className="font-['Inter'] font-black text-[#003d9b] text-[24px] leading-[32px] m-0">
              AutoWash Pro
            </h1>
          </div>
          <div className="w-full">
            <p className="font-['Inter'] font-normal text-[#434654] text-[12px] leading-[16px] m-0">
              Quản lý dịch vụ
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full pb-[24px]">
        <Link 
          to="/customer/booking"
          className="bg-[#0052cc] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex gap-[8px] items-center justify-center px-[16px] py-[12px] rounded-[12px] w-full transition-colors hover:bg-[#0043a8]"
        >
          <Plus size={14} className="text-[#c4d2ff]" />
          <span className="font-['Inter'] font-bold text-[#c4d2ff] text-[14px] leading-[20px]">
            Đặt lịch mới
          </span>
        </Link>
      </div>

      {/* Main Nav Links */}
      <div className="flex-1 w-full flex flex-col gap-[4px] overflow-y-auto overflow-x-hidden no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full transition-colors ${
                isActive
                  ? 'bg-[#0052cc] text-[#c4d2ff] font-bold'
                  : 'text-[#434654] font-medium hover:bg-[#e2e6eb]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} className={isActive ? 'text-[#c4d2ff]' : 'text-[#434654]'} />
                <span className="text-[14px] leading-[20px]">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Spacer to push Settings to bottom */}
        <div className="flex-1 min-h-[48px]"></div>
        
        {/* Settings Link */}
        <NavLink
          to="/customer/settings"
          className={({ isActive }) =>
            `flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full transition-colors ${
              isActive
                ? 'bg-[#0052cc] text-[#c4d2ff] font-bold'
                : 'text-[#434654] font-medium hover:bg-[#e2e6eb]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Settings size={18} className={isActive ? 'text-[#c4d2ff]' : 'text-[#434654]'} />
              <span className="text-[14px] leading-[20px]">Cài đặt</span>
            </>
          )}
        </NavLink>
      </div>

      {/* Bottom Nav Links */}
      <div className="w-full pt-[8px]">
        <div className="border-[#c3c6d6] border-t border-solid flex flex-col gap-[4px] pt-[17px] w-full">
          <NavLink
            to="/customer/help"
            className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full transition-colors hover:bg-[#e2e6eb] text-[#434654] font-medium"
          >
            <HelpCircle size={18} />
            <span className="text-[14px] leading-[20px]">Trợ giúp</span>
          </NavLink>
          <button className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] w-full transition-colors hover:bg-[#fee2e2] text-[#ba1a1a] font-medium">
            <LogOut size={18} />
            <span className="text-[14px] leading-[20px]">Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
}
