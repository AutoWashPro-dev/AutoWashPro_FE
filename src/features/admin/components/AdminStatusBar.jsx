import React from 'react';

export default function AdminStatusBar() {
  return (
    <footer className="h-8 shrink-0 bg-white border-t border-slate-200/80 px-6 flex items-center justify-between text-[10px] text-slate-400 font-semibold shadow-inner">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Hệ thống hoạt động ổn định trên Localhost (V1.2.4)</span>
      </div>
      <div className="flex gap-4">
        <a href="#" className="hover:text-slate-600 transition-colors">Điều khoản dịch vụ</a>
        <a href="#" className="hover:text-slate-600 transition-colors">Bảo mật thông tin</a>
      </div>
    </footer>
  );
}
