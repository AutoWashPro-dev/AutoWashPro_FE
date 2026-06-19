import React, { useState } from 'react';
import { Car } from 'lucide-react';
import CarSelection from '../components/CarSelection';
import PackageSelection from '../components/PackageSelection';
import TimeSelection from '../components/TimeSelection';
import BookingSummary from '../components/BookingSummary';

export default function BookingPage() {
  const [selectedCarId, setSelectedCarId] = useState('car1');
  const [selectedPackageId, setSelectedPackageId] = useState('pkg2');
  const [selectedDate, setSelectedDate] = useState('2023-10-17');
  const [selectedTime, setSelectedTime] = useState('09:00');

  return (
    <div className="flex items-start justify-center relative w-full h-full p-[32px]">
      <div className="flex flex-[1_0_0] gap-[24px] items-start max-w-[1440px] w-full">
        
        {/* Left Column: Wizard Stepper */}
        <div className="flex flex-col gap-[40px] flex-[1_0_0] max-w-[768px] w-full">
          {/* Header */}
          <div className="flex flex-col gap-[8px] w-full">
            <h2 className="font-['Inter'] font-semibold text-[#181c1e] text-[32px] tracking-[-0.32px] leading-[40px] m-0">
              Tạo lịch hẹn mới
            </h2>
            <p className="font-['Inter'] font-normal text-[#434654] text-[16px] leading-[24px] m-0">
              Vui lòng hoàn thành các bước dưới đây để xác nhận dịch vụ.
            </p>
          </div>

          {/* Stepper Container */}
          <div className="flex flex-col w-full">
            
            {/* Step 1: Chọn xe */}
            <div className="flex gap-[24px] pb-[40px] w-full relative">
              <div className="flex flex-col items-center self-stretch w-[48px] shrink-0 relative">
                <div className="bg-[#003d9b] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-full w-[48px] h-[48px] flex items-center justify-center relative z-10">
                  <Car size={20} className="text-white" />
                </div>
                <div className="absolute bg-[#e0e3e6] w-[2px] top-[48px] bottom-[-40px] left-1/2 -translate-x-1/2" />
              </div>
              <div className="flex-1 w-full pb-[8px]">
                <CarSelection 
                  selectedCarId={selectedCarId} 
                  onSelectCar={setSelectedCarId} 
                />
              </div>
            </div>

            {/* Step 2: Chọn gói dịch vụ */}
            <div className="flex gap-[24px] pb-[40px] w-full relative">
              <div className="flex flex-col items-center self-stretch w-[48px] shrink-0 relative">
                <div className="bg-[#0052cc] border-2 border-solid border-[#f7fafd] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-full w-[48px] h-[48px] flex items-center justify-center relative z-10">
                  <span className="font-['Inter'] font-semibold text-[#c4d2ff] text-[24px] leading-[32px]">2</span>
                </div>
                <div className="absolute bg-[#e0e3e6] w-[2px] top-[48px] bottom-[-40px] left-1/2 -translate-x-1/2" />
              </div>
              <div className="flex-1 w-full pb-[8px]">
                <PackageSelection 
                  selectedPackageId={selectedPackageId} 
                  onSelectPackage={setSelectedPackageId} 
                />
              </div>
            </div>

            {/* Step 3: Chọn thời gian */}
            <div className="flex gap-[24px] w-full relative">
              <div className="flex flex-col items-center self-stretch w-[48px] shrink-0 relative">
                <div className="bg-[#e5e8eb] border-2 border-solid border-[#f7fafd] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-full w-[48px] h-[48px] flex items-center justify-center relative z-10">
                  <span className="font-['Inter'] font-semibold text-[#434654] text-[24px] leading-[32px]">3</span>
                </div>
              </div>
              <div className="flex-1 w-full pb-[8px]">
                <TimeSelection 
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  selectedTime={selectedTime}
                  onSelectTime={setSelectedTime}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Summary Sidebar */}
        <BookingSummary />

      </div>
    </div>
  );
}
