import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TimeSelection({ selectedDate, onSelectDate, selectedTime, onSelectTime }) {
  const dates = [
    { dayOfWeek: 'T2', day: 16, fullDate: '2023-10-16' },
    { dayOfWeek: 'T3', day: 17, fullDate: '2023-10-17' },
    { dayOfWeek: 'T4', day: 18, fullDate: '2023-10-18' },
    { dayOfWeek: 'T5', day: 19, fullDate: '2023-10-19', disabled: true },
  ];

  const timeSlots = [
    { time: '08:00', availableSlots: 2, status: 'available' },
    { time: '09:00', availableSlots: 0, status: 'selected' },
    { time: '10:00', availableSlots: 4, status: 'available' },
    { time: '11:00', availableSlots: 0, status: 'full' },
    { time: '13:30', availableSlots: 3, status: 'available' },
    { time: '14:30', availableSlots: 1, status: 'available' },
  ];

  return (
    <div className="flex flex-col gap-[16px] w-full pt-[4px]">
      <h3 className="font-['Inter'] font-semibold text-[#181c1e] text-[24px] leading-[32px]">
        3. Chọn thời gian
      </h3>
      
      <div className="bg-white border border-solid border-[#c3c6d6] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-[12px] p-[25px] flex flex-col gap-[24px]">
        {/* Date Selection */}
        <div className="flex flex-col gap-[16px] w-full">
          <div className="flex items-center justify-between w-full">
            <span className="font-['Inter'] font-medium text-[#181c1e] text-[14px] leading-[20px]">
              Tháng 10, 2023
            </span>
            <div className="flex gap-[8px]">
              <button className="w-[32px] h-[32px] rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <ChevronLeft size={16} className="text-[#181c1e]" />
              </button>
              <button className="w-[32px] h-[32px] rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <ChevronRight size={16} className="text-[#181c1e]" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-[8px] w-full overflow-x-auto pb-[8px] no-scrollbar">
            {dates.map((dateObj) => {
              const isSelected = selectedDate === dateObj.fullDate;
              return (
                <div
                  key={dateObj.fullDate}
                  onClick={() => !dateObj.disabled && onSelectDate(dateObj.fullDate)}
                  className={`flex flex-col items-center justify-center w-[64px] h-[80px] rounded-[12px] shrink-0 p-px cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#003d9b] border border-solid border-[#003d9b] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] text-white'
                      : dateObj.disabled
                      ? 'border border-solid border-[#c3c6d6] opacity-50 cursor-not-allowed'
                      : 'border border-solid border-[#c3c6d6] bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className={`font-['Inter'] font-normal text-[12px] leading-[16px] ${isSelected ? 'opacity-80 text-white' : 'text-[#434654]'}`}>
                    {dateObj.dayOfWeek}
                  </span>
                  <span className={`font-['Inter'] font-semibold text-[24px] leading-[32px] ${isSelected ? 'text-white' : 'text-[#181c1e]'}`}>
                    {dateObj.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-px w-full bg-[#c3c6d6]" />

        {/* Time Slots */}
        <div className="flex flex-col gap-[16px] w-full">
          <span className="font-['Inter'] font-medium text-[#181c1e] text-[14px] leading-[20px]">
            Các khung giờ trống (Ngày 17/10)
          </span>
          
          <div className="grid grid-cols-4 gap-[12px] w-full">
            {timeSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              const isFull = slot.status === 'full';
              
              return (
                <button
                  key={slot.time}
                  onClick={() => !isFull && onSelectTime(slot.time)}
                  disabled={isFull}
                  className={`flex flex-col items-center py-[9px] rounded-[8px] border border-solid transition-colors ${
                    isSelected
                      ? 'bg-[#0052cc] border-[#003d9b] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] text-[#c4d2ff]'
                      : isFull
                      ? 'bg-[#e5e8eb] border-[#c3c6d6] opacity-50 cursor-not-allowed'
                      : 'bg-white border-[#c3c6d6] hover:bg-gray-50'
                  }`}
                >
                  <span className={`font-['Inter'] font-medium text-[14px] leading-[20px] ${
                    isSelected ? 'text-[#c4d2ff]' : isFull ? 'text-[#434654]' : 'text-[#181c1e]'
                  }`}>
                    {slot.time}
                  </span>
                  <span className={`font-['Inter'] font-normal text-[12px] leading-[16px] ${
                    isSelected ? 'opacity-80 text-[#c4d2ff]' : isFull ? 'text-[#ba1a1a]' : 'text-[#003d9b]'
                  }`}>
                    {isSelected ? 'Đã chọn' : isFull ? 'Kín lịch' : `${slot.availableSlots} chỗ`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
