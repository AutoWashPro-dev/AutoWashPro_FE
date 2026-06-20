import React from 'react';
import { Camera, ChevronDown } from 'lucide-react';

export default function PersonalInfoForm() {
  return (
    <div className="bg-white border border-border-main flex flex-col gap-[24px] p-[25px] rounded-[12px] w-full">
      <div className="border-border-main border-b pb-[17px] w-full">
        <h2 className="font-semibold text-text-main text-[24px] leading-[32px]">Thông tin cá nhân</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-[32px] w-full">
        {/* Avatar Column */}
        <div className="flex flex-col gap-[16px] items-center">
          <div className="group relative border-4 border-bg-sidebar rounded-full shadow-sm size-[128px] overflow-hidden cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
              alt="User avatar"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="text-white" size={24} />
            </div>
          </div>
          <button className="font-medium text-primary-dark text-[14px] hover:underline">
            Đổi ảnh đại diện
          </button>
        </div>

        {/* Form Fields */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-[24px] w-full">
          <div className="flex flex-col gap-[8px] w-full">
             <label className="font-medium text-text-muted text-[14px] leading-[20px]">Họ tên</label>
            <input
              type="text"
              className="bg-bg-main border border-gray-400 rounded-[8px] px-[17px] py-[14px] font-normal text-text-main text-[16px] w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              defaultValue="Nguyễn Văn A"
            />
          </div>
          <div className="flex flex-col gap-[8px] w-full">
            <label className="font-medium text-text-muted text-[14px] leading-[20px]">Email</label>
            <input
              type="email"
              className="bg-gray-100 border border-gray-300 rounded-[8px] px-[17px] py-[14px] font-normal text-gray-500 text-[16px] w-full cursor-not-allowed"
              defaultValue="nguyenvana@example.com"
              readOnly
            />
            <p className="font-normal text-gray-500 text-[12px] leading-[16px]">Email không thể thay đổi</p>
          </div>
          <div className="flex flex-col gap-[8px] w-full">
            <label className="font-medium text-text-muted text-[14px] leading-[20px]">Số điện thoại</label>
            <input
              type="tel"
              className="bg-bg-main border border-gray-400 rounded-[8px] px-[17px] py-[14px] font-normal text-text-main text-[16px] w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              defaultValue="0901234567"
            />
          </div>
          <div className="flex flex-col gap-[8px] w-full">
            <label className="font-medium text-text-muted text-[14px] leading-[20px]">Ngày sinh</label>
            <div className="relative">
              <input
                type="text"
                className="bg-bg-main border border-gray-400 rounded-[8px] px-[17px] py-[14px] font-normal text-text-main text-[16px] w-full pr-[40px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                defaultValue="05/05/1990"
              />
              <div className="absolute right-[16px] top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-[8px] w-full">
        <button className="bg-primary hover:bg-primary-dark transition-colors font-medium text-white text-[14px] leading-[20px] px-[24px] py-[12px] rounded-[8px]">
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
