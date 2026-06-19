import React from 'react';
import { Outlet } from 'react-router-dom';
import SideNavBar from '../components/layout/SideNavBar';

export default function DashboardLayout() {
  return (
    <div className="flex w-full h-screen overflow-hidden bg-[#f7fafd] font-['Inter']">
      <SideNavBar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
