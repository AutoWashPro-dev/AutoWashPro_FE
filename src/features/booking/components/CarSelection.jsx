import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function CarSelection({ selectedCarId, onSelectCar }) {
  const cars = [
    {
      id: 'car1',
      name: 'VinFast VF8',
      plate: '30A-123.45',
      type: 'SUV',
      image: 'https://images.unsplash.com/photo-1550421884-bbceb188c12a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    },
    {
      id: 'car2',
      name: 'Honda Civic',
      plate: '29C-987.65',
      type: 'Sedan',
      image: 'https://images.unsplash.com/photo-1590362891991-f70046b0a701?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    }
  ];

  return (
    <div className="flex flex-col gap-[16px] w-full pt-[4px]">
      <h3 className="font-['Inter'] font-semibold text-[#181c1e] text-[24px] leading-[32px]">
        1. Chọn xe của bạn
      </h3>
      <div className="flex gap-[16px] w-full items-start justify-center">
        {cars.map((car) => {
          const isSelected = selectedCarId === car.id;
          
          return (
            <div
              key={car.id}
              onClick={() => onSelectCar(car.id)}
              className={`flex-1 flex flex-col gap-[14px] p-[18px] rounded-[12px] cursor-pointer transition-all relative ${
                isSelected
                  ? 'bg-white border-2 border-solid border-[#003d9b] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'
                  : 'bg-white border border-solid border-[#c3c6d6]'
              }`}
            >
              <div className="flex gap-[16px] items-center w-full">
                <div className="bg-[#ebeef1] h-[48px] w-[64px] rounded-[4px] overflow-hidden shrink-0 flex items-center justify-center relative">
                  <img
                    src={car.image}
                    alt={car.name}
                    className={`object-cover w-full h-full ${!isSelected ? 'opacity-80' : ''}`}
                  />
                </div>
                <div className="flex flex-col gap-[4px] flex-1">
                  <span className="font-['Inter'] font-medium text-[#181c1e] text-[14px] leading-[20px]">
                    {car.name}
                  </span>
                  <span className="font-['Liberation_Mono'] text-[#434654] text-[16px] leading-[24px]">
                    {car.plate}
                  </span>
                </div>
              </div>
              
              <div className={`px-[8px] py-[4px] rounded-[4px] self-start ${
                isSelected ? 'bg-[#d6e0f3]' : 'bg-[#e5e8eb]'
              }`}>
                <span className={`font-['Inter'] font-normal text-[12px] leading-[16px] ${
                  isSelected ? 'text-[#596373]' : 'text-[#434654]'
                }`}>
                  {car.type}
                </span>
              </div>

              {isSelected && (
                <div className="absolute top-[16px] right-[16px] text-[#003d9b]">
                  <CheckCircle2 size={24} fill="#003d9b" className="text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
