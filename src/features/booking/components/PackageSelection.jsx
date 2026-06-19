import React from 'react';
import { Clock } from 'lucide-react';

export default function PackageSelection({ selectedPackageId, onSelectPackage }) {
  const packages = [
    {
      id: 'pkg1',
      name: 'Rửa tiêu chuẩn',
      price: 150000,
      description: 'Rửa ngoài bọt tuyết, hút bụi nội thất cơ bản, lau kính.',
      duration: '45 phút',
      isPopular: false
    },
    {
      id: 'pkg2',
      name: 'Chăm sóc toàn diện',
      price: 450000,
      description: 'Bao gồm rửa tiêu chuẩn, dưỡng nhựa nhám, xịt gầm, và khử mùi ozone.',
      duration: '60 phút',
      isPopular: true
    },
    {
      id: 'pkg3',
      name: 'Detailing cao cấp',
      price: 1200000,
      description: 'Vệ sinh khoang máy, đánh bóng sơn cơ bản, dọn nội thất chuyên sâu.',
      duration: '180 phút',
      isPopular: false
    }
  ];

  return (
    <div className="flex flex-col gap-[16px] w-full pt-[4px]">
      <h3 className="font-['Inter'] font-semibold text-[#181c1e] text-[24px] leading-[32px]">
        2. Chọn gói dịch vụ
      </h3>
      <div className="flex flex-col gap-[16px] w-full">
        {packages.map((pkg) => {
          const isSelected = selectedPackageId === pkg.id;

          return (
            <div
              key={pkg.id}
              onClick={() => onSelectPackage(pkg.id)}
              className={`flex gap-[16px] items-start p-[21px] rounded-[12px] cursor-pointer relative overflow-hidden transition-all ${
                isSelected
                  ? 'bg-[#dae2ff] border-2 border-solid border-[#003d9b] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'
                  : 'bg-white border border-solid border-[#c3c6d6]'
              }`}
            >
              {/* Radio Button */}
              <div className="w-[20px] h-[24px] shrink-0 pt-[4px] relative">
                <div className={`w-[20px] h-[20px] rounded-full border border-solid flex items-center justify-center ${
                  isSelected ? 'border-[#003d9b] bg-[#003d9b]' : 'border-[#c3c6d6] bg-white'
                }`}>
                  {isSelected && <div className="w-[8px] h-[8px] bg-white rounded-full"></div>}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col gap-[4px]">
                <div className="flex items-center justify-between w-full pr-[64px]">
                  <span className={`font-['Inter'] ${isSelected ? 'font-bold' : 'font-medium'} text-[#181c1e] text-[14px] leading-[20px]`}>
                    {pkg.name}
                  </span>
                  <span className={`font-['Inter'] font-bold text-[#003d9b] text-[14px] leading-[20px]`}>
                    {pkg.price.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                
                <p className="font-['Inter'] font-normal text-[#434654] text-[14px] leading-[20px] m-0">
                  {pkg.description}
                </p>

                {isSelected && (
                  <div className="pt-[8px] w-full">
                    <div className="bg-[#b2c5ff] inline-flex items-center gap-[4px] px-[8px] py-[4px] rounded-[4px]">
                      <Clock size={12} className="text-[#003d9b]" />
                      <span className="font-['Inter'] font-normal text-[#003d9b] text-[12px] leading-[16px]">
                        {pkg.duration}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Popular Badge */}
              {pkg.isPopular && (
                <div className="absolute top-0 right-0 bg-[#003d9b] rounded-bl-[8px] px-[12px] py-[4px]">
                  <span className="font-['Inter'] font-bold text-white text-[12px] leading-[16px]">
                    Phổ biến
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
