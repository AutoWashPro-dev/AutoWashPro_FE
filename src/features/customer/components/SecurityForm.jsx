import React, { useState } from 'react';
import { Settings, Eye, EyeOff } from 'lucide-react';

export default function SecurityForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="bg-white border border-border-main flex flex-col gap-[24px] p-[25px] rounded-[12px] w-full">
      <div className="border-border-main border-b flex gap-[8px] items-center pb-[17px] w-full">
        <Settings size={20} className="text-text-main" />
        <h2 className="font-semibold text-text-main text-[24px] leading-[32px]">Bảo mật</h2>
      </div>

      <div className="flex flex-col gap-[24px] w-full max-w-[448px]">
        <div className="flex flex-col gap-[8px] w-full">
          <label className="font-medium text-text-muted text-[14px] leading-[20px]">Mật khẩu hiện tại</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              className="bg-bg-main border border-gray-400 rounded-[8px] px-[17px] py-[14px] w-full pr-[40px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="button"
              className="absolute right-[16px] top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-[8px] w-full">
          <label className="font-medium text-text-muted text-[14px] leading-[20px]">Mật khẩu mới</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              className="bg-bg-main border border-gray-400 rounded-[8px] px-[17px] py-[14px] w-full pr-[40px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="button"
              className="absolute right-[16px] top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="font-normal text-gray-500 text-[12px] leading-[16px]">Ít nhất 8 ký tự, bao gồm chữ và số.</p>
        </div>

        <div className="flex flex-col gap-[8px] w-full">
          <label className="font-medium text-text-muted text-[14px] leading-[20px]">Xác nhận mật khẩu mới</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="bg-bg-main border border-gray-400 rounded-[8px] px-[17px] py-[14px] w-full pr-[40px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="button"
              className="absolute right-[16px] top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="pt-[8px] w-full">
          <button className="bg-bg-main border border-border-main hover:bg-gray-100 transition-colors font-medium text-text-main text-[14px] leading-[20px] px-[25px] py-[13px] rounded-[8px]">
            Cập nhật mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
}
