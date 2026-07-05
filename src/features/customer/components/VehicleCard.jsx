import React from 'react';
import { Trash2, Edit2, ShieldCheck } from 'lucide-react';

export default function VehicleCard({ vehicle, isDefault, onSelect, onEdit, onDelete, isSelectable }) {
  return (
    <div 
      onClick={() => isSelectable && onSelect?.(vehicle)}
      className={`border rounded-xl p-4 bg-white relative transition-all ${
        isSelectable ? 'cursor-pointer hover:border-blue-500 hover:shadow-md' : ''
      } ${isDefault ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200'}`}
    >
      {isDefault && (
        <span className="absolute top-3 right-3 flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-medium">
          <ShieldCheck size={12} /> Mặc định
        </span>
      )}
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
      
      {/* Nút thao tác khi hiển thị trong Ga-ra */}
      {!isSelectable && (onEdit || onDelete) && (
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
          {onEdit && (
            <button onClick={() => onEdit(vehicle)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded">
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(vehicle)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-50 rounded">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
