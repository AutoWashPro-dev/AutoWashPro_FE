import React from 'react';
import ProfileSummaryCard from '../components/ProfileSummaryCard';
import PersonalInfoForm from '../components/PersonalInfoForm';
import SecurityForm from '../components/SecurityForm';

export default function ProfilePage() {
  return (
    <div className="flex-1 bg-bg-main p-4 lg:p-8 min-h-screen">
      {/* Main Content */}
      <div className="flex flex-col gap-[32px] items-start max-w-[1440px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col gap-[8px] items-start w-full">
          <div className="flex flex-col items-start w-full">
            <h1 className="font-semibold text-text-main text-[28px] lg:text-[32px] tracking-[-0.32px] leading-[40px]">Hồ sơ cá nhân</h1>
          </div>
          <div className="flex flex-col items-start w-full">
            <p className="font-normal text-text-muted text-[16px] leading-[24px]">Quản lý thông tin và bảo mật tài khoản của bạn.</p>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] w-full">
          {/* Left Column - Summary Cards */}
          <ProfileSummaryCard />

          {/* Right Column - Forms */}
          <div className="lg:col-span-8 flex flex-col gap-[24px] w-full">
            <PersonalInfoForm />
            <SecurityForm />
          </div>
        </div>
      </div>
    </div>
  );
}
