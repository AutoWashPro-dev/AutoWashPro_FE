import React from 'react';
import { QrCode } from 'lucide-react';

export default function VIPCard({ customer, onShowQr }) {
  // Cấu hình màu sắc thẻ động theo hạng VIP
  const getTierStyles = (tierName) => {
    switch (tierName?.toUpperCase()) {
      case 'PLATINUM':
        return 'bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-950 text-slate-100 border-zinc-700';
      case 'GOLD':
        return 'bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-800 text-white border-amber-400';
      case 'SILVER':
        return 'bg-gradient-to-br from-slate-300 via-slate-400 to-zinc-500 text-slate-900 border-slate-200';
      default: // MEMBER
        return 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-800 text-white border-indigo-400';
    }
  };

  return (
    <div className={`rounded-2xl p-6 border shadow-lg relative overflow-hidden ${getTierStyles(customer.tier?.tierName)}`}>
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
      
      <div className="flex justify-between items-start mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest opacity-75">Thẻ VIP Thành Viên</span>
          <h3 className="text-xl font-bold font-mono tracking-wider mt-1">{customer.fullName?.toUpperCase()}</h3>
        </div>
        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
          {customer.tier?.tierName || 'MEMBER'}
        </span>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <span className="text-xs opacity-75">Điểm Tích Lũy</span>
          <p className="text-3xl font-extrabold tracking-tight">{customer.loyaltyPoints || 0} <span className="text-sm font-normal">Pts</span></p>
        </div>
      </div>
    </div>
  );
}
