import React from 'react';
import { Trash2, Edit2, ShieldCheck } from 'lucide-react';

export default function VehicleCard({ vehicle, isDefault, isSelected, onSelect, onEdit, onDelete, isSelectable, children }) {
  return (
    <div 
      onClick={() => isSelectable && onSelect?.(vehicle)}
      className={`border rounded-xl p-4 bg-white relative transition-all group ${
        isSelectable ? 'cursor-pointer hover:border-blue-500 hover:shadow-md' : ''
      } ${isSelected ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200'}`}
    >
      {isDefault && (
        <span className="absolute top-3 right-3 flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-medium">
          <ShieldCheck size={12} /> Mặc định
        </span>
      )}
      {children}
      <div className="flex items-center gap-3">
        <div className="text-3xl">🏍️</div>
        <div>
          <h4 className="font-bold text-slate-800">{vehicle.model || 'Xe máy'}</h4>
          <p className="text-xs text-slate-500">Loại: {vehicle.vehicleType}</p>
          {/* Biển số mô phỏng thiết kế biển số xe Việt Nam */}
          <div className="mt-2 inline-block bg-slate-100 border border-slate-300 text-slate-800 font-mono text-sm px-3 py-1 rounded-md font-bold tracking-wider">
            {vehicle.licensePlate}
          </div>
        </div>
      </div>
      
      {/* Nút thao tác cho chỉnh sửa / xóa xe */}
      {(onEdit || onDelete) && (
        <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(vehicle);
              }}
              className="rounded p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
            >
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(vehicle);
              }}
              className="rounded p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-red-600"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
