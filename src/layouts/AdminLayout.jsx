import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../features/admin/components/AdminSidebar';
import AdminHeader from '../features/admin/components/AdminHeader';
import AdminStatusBar from '../features/admin/components/AdminStatusBar';
import QuickNewBookingModal from '../features/admin/components/QuickNewBookingModal';
import BookingSuccessToast from '../features/admin/components/BookingSuccessToast';
import BookingActionToast from '../features/admin/components/BookingActionToast';
import BookingDetailModal from '../features/admin/components/BookingDetailModal';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-[#f7fafd] overflow-hidden">
      {/* 1. Sidebar bên trái */}
      <AdminSidebar />
      
      {/* 2. Phần nội dung chính bên phải */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* 2.1 Top Header */}
        <AdminHeader />
        
        {/* 2.2 Màn hình động (Pages load here) */}
        <main className="flex-1 overflow-y-auto bg-[#f7fafd]">
          <Outlet />
        </main>
        
        {/* 2.3 Status Bar chân trang */}
        <AdminStatusBar />
      </div>

      {/* 3. Các cấu phần Modal & Toast dùng chung */}
      <QuickNewBookingModal />
      <BookingSuccessToast />
      <BookingActionToast />
      <BookingDetailModal />
    </div>
  );
}
