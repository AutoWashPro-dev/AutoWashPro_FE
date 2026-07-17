import React, { useState, useEffect } from 'react';
import { washbayAdminApi } from '../services/washbayAdminApi';

export default function WashbayGrid({ selectedDate }) {
  const [washbays, setWashbays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWashbays = async () => {
      setIsLoading(true);
      try {
        const dateToFetch = selectedDate || new Date().toISOString().split('T')[0];
        const data = await washbayAdminApi.getWashbaysWithSlots(dateToFetch);
        setWashbays(data || []);
      } catch (error) {
        console.error('Error fetching washbays with slots:', error);
        setWashbays([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWashbays();
  }, [selectedDate]);

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  if (!washbays || washbays.length === 0) {
    return <div className="text-center p-8 text-slate-500">Không có dữ liệu Khoang rửa (Washbay) nào được cấu hình.</div>;
  }

  return (
    <div className="space-y-4">
      {washbays.map((bay) => (
        <div key={bay.id || bay.washbayId} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-2">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-black">
              {bay.code || 'WB'}
            </div>
            <div>
              <h4 className="font-bold text-slate-800">{bay.name || 'Khoang rửa'}</h4>
              <p className="text-xs text-slate-500">Tình trạng: {bay.isActive ? 'Hoạt động' : 'Bảo trì'}</p>
            </div>
          </div>
          
          {/* Slots Grid */}
          <div className="flex flex-wrap gap-2">
            {bay.slots && bay.slots.length > 0 ? (
              bay.slots.map((slot, idx) => {
                const isBooked = slot.status === 'BOOKED';
                return (
                  <div 
                    key={slot.id || idx}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all `}
                  >
                    {slot.startTime ? slot.startTime.substring(0, 5) : '00:00'} - {slot.endTime ? slot.endTime.substring(0, 5) : '00:00'}
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400">Không có khung giờ nào được phân bổ.</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

