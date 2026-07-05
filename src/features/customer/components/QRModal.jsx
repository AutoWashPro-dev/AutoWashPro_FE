import React from 'react';
import { X } from 'lucide-react';

export default function QRModal({ isOpen, onClose, title, qrValue, description }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative p-6 flex flex-col items-center">
        {/* Nút đóng góc phải */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Tiêu đề */}
        <h3 className="font-bold text-lg text-slate-800 text-center mb-1 mt-2">{title || 'Mã QR xác thực'}</h3>
        {description && <p className="text-xs text-slate-500 text-center mb-6">{description}</p>}

        {/* Khung vẽ mã QR (Sử dụng ảnh giả lập QR code hoặc SVG để minh họa trực quan) */}
        <div className="border border-slate-100 p-4 bg-slate-50 rounded-2xl mb-6 shadow-inner flex justify-center items-center">
          <div className="w-48 h-48 bg-white border border-slate-200 p-2 rounded-xl flex flex-col justify-center items-center relative overflow-hidden">
            {/* Ảnh mã QR Code thực tế mô phỏng dạng sọc lưới */}
            <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100">
              <path fill="currentColor" d="M0,0 h30 v10 h-20 v20 h-10 z M10,10 h10 v10 h-10 z" />
              <path fill="currentColor" d="M70,0 h30 v30 h-10 v-20 h-20 z M80,10 h10 v10 h-10 z" />
              <path fill="currentColor" d="M0,70 h10 v20 h20 v10 h-30 z M10,80 h10 v10 h-10 z" />
              {/* Vẽ một số ô ngẫu nhiên ở giữa mô phỏng cấu trúc QR */}
              <rect x="35" y="35" width="10" height="10" fill="currentColor" />
              <rect x="55" y="35" width="10" height="10" fill="currentColor" />
              <rect x="35" y="55" width="15" height="10" fill="currentColor" />
              <rect x="50" y="65" width="15" height="10" fill="currentColor" />
              <rect x="35" y="70" width="10" height="15" fill="currentColor" />
              <rect x="75" y="75" width="15" height="15" fill="currentColor" />
              {/* Đóng khung quét chính */}
              <rect x="70" y="70" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Mã chữ phía dưới */}
        <div className="bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 text-center w-full">
          <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Mã code đối soát</span>
          <span className="text-sm font-mono font-bold text-slate-800 tracking-widest">{qrValue || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}
