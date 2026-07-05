import React from 'react';
import { Tag, Clock } from 'lucide-react';

export default function VoucherTicket({ voucher, onAction, actionLabel, isExpired }) {
  return (
    <div className={`flex border rounded-xl overflow-hidden bg-white shadow-sm transition-all hover:shadow ${isExpired ? 'opacity-60' : ''}`}>
      {/* Cánh trái chứa icon và màu biểu thị giá trị */}
      <div className={`w-24 flex flex-col justify-center items-center text-white p-3 ${isExpired ? 'bg-slate-400' : 'bg-gradient-to-b from-blue-500 to-indigo-600'}`}>
        <Tag size={28} />
        <span className="text-xs mt-1 font-bold">VOUCHER</span>
      </div>

      {/* Đường răng cưa xé cuống vé phân cách */}
      <div className="w-1 border-r border-dashed border-slate-200 relative my-2"></div>

      {/* Cánh phải chứa nội dung chi tiết */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-slate-800 text-sm leading-snug">{voucher.title || 'Ưu đãi dọn xe'}</h4>
          <p className="text-xs text-slate-500 mt-1">{voucher.description}</p>
        </div>
        
        <div className="flex justify-between items-end mt-4 pt-2 border-t border-slate-50">
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <Clock size={10} /> Hạn: {voucher.expiryDate || 'N/A'}
          </span>
          {onAction && (
            <button 
              disabled={isExpired}
              onClick={() => onAction(voucher)}
              className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
            >
              {actionLabel || 'Sử dụng'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
