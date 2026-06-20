import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import SideNavBar from '../components/layout/SideNavBar';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-bg-main font-['Inter'] relative">
      <SideNavBar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="font-bold text-primary-dark">AutoWash Pro</div>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 text-text-muted hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>
        
        <Outlet />
      </main>
    </div>
  );
}
