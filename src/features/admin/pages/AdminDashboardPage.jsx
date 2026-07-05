import React, { useState } from 'react';
import { 
  Banknote, 
  Calendar, 
  Gauge, 
  Coins, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  PlusCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  Zap,
  Wrench
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [period, setPeriod] = useState('today'); // 'today', 'week', 'month'

  const [alerts, setAlerts] = useState([
    {
      id: 'feedback',
      type: 'feedback',
      title: 'Yêu cầu kiểm tra Feedback',
      message: 'Khách hàng báo xe dọn chưa khô kỹ. Đề nghị Admin kiểm tra lại.',
      actionText: 'Xem Ý kiến',
      severity: 'high'
    },
    {
      id: 'noshow',
      type: 'noshow',
      title: 'Khách trễ giờ hẹn (No-Show)',
      message: 'Xe máy biển số 29-H2 333.33 trễ slot Premium Wash quá 30 phút.',
      actionText: 'Hủy lịch & Nhả Slot',
      severity: 'medium'
    },
    {
      id: 'overload',
      type: 'overload',
      title: 'Cảnh báo quá tải slot',
      message: 'Khung giờ 16:00 đã đạt 95% công suất (7/8 xe).',
      actionText: 'Điều phối Slots',
      severity: 'low'
    },
    {
      id: 'monthly',
      type: 'monthly',
      title: 'Kết quả Monthly Review',
      message: 'Đã hoàn thành xét thăng hạng: 12 khách hàng lên hạng Platinum.',
      actionText: 'Xem danh sách',
      severity: 'success'
    }
  ]);

  const dismissAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const handleAction = (alertItem) => {
    if (alertItem.type === 'noshow') {
      alert('Đã hủy lịch đặt trễ hẹn và giải phóng slot trống cho khung giờ!');
    } else if (alertItem.type === 'feedback') {
      alert('Đang mở màn hình nhật ký Feedback để đối soát camera...');
    } else {
      alert(`Đang mở: ${alertItem.actionText}`);
    }
    dismissAlert(alertItem.id);
  };

  // Mock slot data for the Capacity Heatmap (No Bays)
  const slots = [
    { time: '08:00', pct: 20, level: 'low' },
    { time: '09:00', pct: 35, level: 'low' },
    { time: '10:00', pct: 60, level: 'med' },
    { time: '11:00', pct: 75, level: 'med' },
    { time: '12:00', pct: 90, level: 'high' },
    { time: '13:00', pct: 65, level: 'med' },
    { time: '14:00', pct: 45, level: 'low' },
    { time: '15:00', pct: 85, level: 'high' },
    { time: '16:00', pct: 98, level: 'high' },
    { time: '17:00', pct: 92, level: 'high' },
    { time: '18:00', pct: 78, level: 'med' },
    { time: '19:00', pct: 30, level: 'low' }
  ];

  // Dynamic datasets for periods (Scaled down for realistic single motorcycle station)
  const periodData = {
    today: {
      bookingsCount: 12,
      completed: 8,
      paid: 3,
      wait: 1,
      canceled: 0,
      revenueStr: '1,280,000 đ',
      revenueLabel: '+12.5% so với mục tiêu ngày',
      loyaltyEarn: '168 Pts',
      loyaltyRedeem: '40 Pts',
      capacityPct: '25%',
      capacityPeak: '15:00 - 16:00 (Cao)',
      
      chartPointsRev: 'M 0 32 L 20 28 L 40 30 L 60 20 L 80 17 L 100 19',
      chartPointsVis: 'M 0 30 L 20 25 L 40 32 L 60 18 L 80 15 L 100 18',
      chartPointsGlow: 'M 0 32 L 20 28 L 40 30 L 60 20 L 80 17 L 100 19 L 100 37 L 0 37 Z',
      
      yLeftLabels: ['2.0M', '1.5M', '1.0M', '0.5M', '0'],
      yRightLabels: ['15 xe', '11 xe', '8 xe', '4 xe', '0'],
      
      chartDots: [
        { cx: 0, cy: 32, label: '650k', vCx: 0, vCy: 30, vLabel: '6' },
        { cx: 20, cy: 28, label: '820k', vCx: 20, vCy: 25, vLabel: '8' },
        { cx: 40, cy: 30, label: '700k', vCx: 40, vCy: 32, vLabel: '7' },
        { cx: 60, cy: 20, label: '1.15M', vCx: 60, vCy: 18, vLabel: '11' },
        { cx: 80, cy: 17, label: '1.22M', vCx: 80, vCy: 15, vLabel: '12' },
        { cx: 100, cy: 19, label: '1.28M', vCx: 100, vCy: 18, vLabel: '12' },
      ],
      chartLabels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Hôm nay'],
      
      donutDash: '66 34',
      donutOffset: '0',
      donutPaidDash: '25 75',
      donutPaidOffset: '-66',
      donutUnpaidDash: '9 91',
      donutUnpaidOffset: '-91',
      donutCanceledDash: '0 100',
      donutCanceledOffset: '0',
      
      core1Name: 'Gói chính: Deluxe Wash', core1Price: '780,000 đ (60.9%)', core1Pct: '60.9%',
      core2Name: 'Gói chính: Premium Wash', core2Price: '350,000 đ (27.3%)', core2Pct: '27.3%',
      core3Name: 'Gói chính: Basic Wash', core3Price: '150,000 đ (11.8%)', core3Pct: '11.8%',
      addonPrice: '120,000 đ (9.4%)', addonPct: '9.4%'
    },
    week: {
      bookingsCount: 84,
      completed: 58,
      paid: 20,
      wait: 4,
      canceled: 2,
      revenueStr: '8,950,000 đ',
      revenueLabel: '+8.2% so với tuần trước',
      loyaltyEarn: '1,120 Pts',
      loyaltyRedeem: '250 Pts',
      capacityPct: '22%',
      capacityPeak: 'Thứ Bảy & CN (Cao)',
      
      chartPointsRev: 'M 0 35 L 20 30 L 40 28 L 60 25 L 80 15 L 100 12',
      chartPointsVis: 'M 0 33 L 20 28 L 40 24 L 60 22 L 80 12 L 100 10',
      chartPointsGlow: 'M 0 35 L 20 30 L 40 28 L 60 25 L 80 15 L 100 12 L 100 37 L 0 37 Z',
      
      yLeftLabels: ['10.0M', '7.5M', '5.0M', '2.5M', '0'],
      yRightLabels: ['100 xe', '75 xe', '50 xe', '25 xe', '0'],
      
      chartDots: [
        { cx: 0, cy: 35, label: '6.5M', vCx: 0, vCy: 33, vLabel: '60' },
        { cx: 20, cy: 30, label: '7.2M', vCx: 20, vCy: 28, vLabel: '68' },
        { cx: 40, cy: 28, label: '7.8M', vCx: 40, vCy: 24, vLabel: '74' },
        { cx: 60, cy: 25, label: '8.1M', vCx: 60, vCy: 22, vLabel: '78' },
        { cx: 80, cy: 15, label: '8.5M', vCx: 80, vCy: 12, vLabel: '80' },
        { cx: 100, cy: 12, label: '8.95M', vCx: 100, vCy: 10, vLabel: '84' },
      ],
      chartLabels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
      
      donutDash: '69 31',
      donutOffset: '0',
      donutPaidDash: '24 76',
      donutPaidOffset: '-69',
      donutUnpaidDash: '5 95',
      donutUnpaidOffset: '-93',
      donutCanceledDash: '2 98',
      donutCanceledOffset: '-98',
      
      core1Name: 'Gói chính: Deluxe Wash', core1Price: '5,370,000 đ (60.0%)', core1Pct: '60.0%',
      core2Name: 'Gói chính: Premium Wash', core2Price: '2,420,000 đ (27.0%)', core2Pct: '27.0%',
      core3Name: 'Gói chính: Basic Wash', core3Price: '1,160,000 đ (13.0%)', core3Pct: '13.0%',
      addonPrice: '850,000 đ (9.5%)', addonPct: '9.5%'
    },
    month: {
      bookingsCount: 360,
      completed: 250,
      paid: 80,
      wait: 20,
      canceled: 10,
      revenueStr: '38,400,000 đ',
      revenueLabel: '+15.4% so với tháng trước',
      loyaltyEarn: '4,900 Pts',
      loyaltyRedeem: '1,100 Pts',
      capacityPct: '24%',
      capacityPeak: 'Các ngày lễ (Cao)',
      
      chartPointsRev: 'M 0 34 L 20 28 L 40 25 L 60 18 L 80 15 L 100 10',
      chartPointsVis: 'M 0 31 L 20 26 L 40 22 L 60 15 L 80 12 L 100 8',
      chartPointsGlow: 'M 0 34 L 20 28 L 40 25 L 60 18 L 80 15 L 100 10 L 100 37 L 0 37 Z',
      
      yLeftLabels: ['50.0M', '37.5M', '25.0M', '12.5M', '0'],
      yRightLabels: ['400 xe', '300 xe', '200 xe', '100 xe', '0'],
      
      chartDots: [
        { cx: 0, cy: 34, label: '28.0M', vCx: 0, vCy: 31, vLabel: '270' },
        { cx: 20, cy: 28, label: '32.0M', vCx: 20, vCy: 26, vLabel: '310' },
        { cx: 40, cy: 25, label: '35.0M', vCx: 40, vCy: 22, vLabel: '330' },
        { cx: 60, cy: 18, label: '36.5M', vCx: 60, vCy: 15, vLabel: '345' },
        { cx: 80, cy: 15, label: '37.8M', vCx: 80, vCy: 12, vLabel: '355' },
        { cx: 100, cy: 10, label: '38.4M', vCx: 100, vCy: 8, vLabel: '360' },
      ],
      chartLabels: ['Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng này'],
      
      donutDash: '69 31',
      donutOffset: '0',
      donutPaidDash: '22 78',
      donutPaidOffset: '-69',
      donutUnpaidDash: '6 94',
      donutUnpaidOffset: '-91',
      donutCanceledDash: '3 97',
      donutCanceledOffset: '-97',
      
      core1Name: 'Gói chính: Deluxe Wash', core1Price: '23,040,000 đ (60.0%)', core1Pct: '60.0%',
      core2Name: 'Gói chính: Premium Wash', core2Price: '10,360,000 đ (27.0%)', core2Pct: '27.0%',
      core3Name: 'Gói chính: Basic Wash', core3Price: '5,000,000 đ (13.0%)', core3Pct: '13.0%',
      addonPrice: '3,800,000 đ (9.9%)', addonPct: '9.9%'
    }
  };

  const current = periodData[period];

  return (
    <div className="space-y-6 pb-6 text-slate-800">
      
      {/* Command Center Title & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-outfit text-slate-800 tracking-tight">Command Center</h2>
          <p className="text-xs text-slate-400 font-semibold">Tổng quan hoạt động vận hành & Tỷ lệ lấp đầy trạm rửa xe máy.</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-1 flex gap-1.5 text-xs text-slate-500 shadow-sm self-start md:self-auto">
          <button 
            onClick={() => setPeriod('today')} 
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              period === 'today' ? 'bg-slate-900 text-white shadow-sm' : 'hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            Hôm nay
          </button>
          <button 
            onClick={() => setPeriod('week')} 
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              period === 'week' ? 'bg-slate-900 text-white shadow-sm' : 'hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            Tuần
          </button>
          <button 
            onClick={() => setPeriod('month')} 
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              period === 'month' ? 'bg-slate-900 text-white shadow-sm' : 'hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            Tháng
          </button>
        </div>
      </div>

      {/* 1. KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Card 1: Bookings */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đặt lịch {period === 'today' ? 'Hôm nay' : period === 'week' ? 'Tuần này' : 'Tháng này'}</p>
              <h3 className="text-2xl font-extrabold font-outfit text-slate-800 mt-1">{current.bookingsCount}</h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5 text-cyan-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="h-1.5 w-full bg-slate-100 rounded-full flex overflow-hidden">
              <div className="bg-[#10b981] h-full" style={{ width: `${(current.completed / current.bookingsCount) * 100}%` }} title={`Completed: ${current.completed}`} />
              <div className="bg-[#06b6d4] h-full" style={{ width: `${(current.paid / current.bookingsCount) * 100}%` }} title={`Paid: ${current.paid}`} />
              <div className="bg-[#f59e0b] h-full" style={{ width: `${(current.wait / current.bookingsCount) * 100}%` }} title={`Wait: ${current.wait}`} />
              <div className="bg-[#ef4444] h-full" style={{ width: `${(current.canceled / current.bookingsCount) * 100}%` }} title={`Canceled: ${current.canceled}`} />
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-400 mt-2 font-bold">
              <span className="flex items-center gap-1 text-emerald-600"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>{current.completed} Xong</span>
              <span className="flex items-center gap-1 text-cyan-600"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>{current.paid} Trả</span>
              <span className="flex items-center gap-1 text-amber-600"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>{current.wait} Chờ</span>
            </div>
          </div>
        </div>

        {/* Card 2: Revenue */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doanh thu Thực thu (PAID)</p>
              <h3 className="text-2xl font-extrabold font-outfit text-slate-800 mt-1">{current.revenueStr}</h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Banknote className="w-4.5 h-4.5 text-indigo-600" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{current.revenueLabel}</span>
          </div>
        </div>

        {/* Card 3: Loyalty Pulse */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Điểm tích / đổi (Loyalty)</p>
              <h3 className="text-2xl font-extrabold font-outfit text-slate-800 mt-1">{Math.round(current.bookingsCount * 12)}</h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <Coins className="w-4.5 h-4.5 text-violet-600" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs font-semibold text-slate-500">
            <span className="text-emerald-600 flex items-center gap-0.5"><PlusCircle className="w-3.5 h-3.5" /> Phát: {current.loyaltyEarn}</span>
            <span className="text-rose-500 flex items-center gap-0.5"><XCircle className="w-3.5 h-3.5" /> Đổi: {current.loyaltyRedeem}</span>
          </div>
        </div>

        {/* Card 4: Slot Capacity */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hiệu suất Slot lấp đầy</p>
              <h3 className="text-2xl font-extrabold font-outfit text-slate-800 mt-1">{current.capacityPct}</h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Gauge className="w-4.5 h-4.5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-slate-500 font-semibold">
            <span>Đỉnh dự kiến:</span>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-bold border border-rose-100">{current.capacityPeak}</span>
          </div>
        </div>

      </div>

      {/* 2. OPERATIONAL TRENDS CHART & PRIORITY ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart (left, spans 2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-850 font-outfit">Xu hướng Vận hành</h3>
              <div className="flex items-center gap-4 text-[11px] font-bold">
                <span className="flex items-center gap-1 text-indigo-650">
                  <span className="w-3 h-1.5 rounded-full bg-indigo-500" /> Doanh thu (VND)
                </span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-3 h-1.5 rounded-full bg-emerald-500" /> Lượt rửa (Xe)
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">So sánh tổng doanh thu thực thu và số lượt rửa xe dọn xong theo chu kỳ lọc.</p>
          </div>

          {/* SVG Line Chart */}
          <div className="relative h-64 w-full bg-slate-50/40 rounded-xl p-4 flex items-end border border-slate-100/80 mt-4">
            
            {/* Left Y-Axis Label (Revenue in VND) */}
            <div className="absolute left-2.5 top-4 bottom-8 flex flex-col justify-between text-[9px] text-indigo-500 font-bold text-left pointer-events-none">
              {current.yLeftLabels.map((lbl, idx) => <span key={`yl-${idx}`}>{lbl}</span>)}
            </div>

            {/* Right Y-Axis Label (Visits count) */}
            <div className="absolute right-2.5 top-4 bottom-8 flex flex-col justify-between text-[9px] text-emerald-600 font-bold text-right pointer-events-none">
              {current.yRightLabels.map((lbl, idx) => <span key={`yr-${idx}`}>{lbl}</span>)}
            </div>

            <svg viewBox="0 0 100 40" className="w-full h-full pl-6 pr-8 overflow-visible">
              <defs>
                <linearGradient id="chartGlowLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.12"/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                </linearGradient>
              </defs>
              
              {/* Horizontal Grid lines */}
              <line x1="0" y1="5" x2="100" y2="5" stroke="rgba(0,0,0,0.04)" strokeWidth="0.15" />
              <line x1="0" y1="15" x2="100" y2="15" stroke="rgba(0,0,0,0.04)" strokeWidth="0.15" />
              <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(0,0,0,0.04)" strokeWidth="0.15" />
              <line x1="0" y1="35" x2="100" y2="35" stroke="rgba(0,0,0,0.04)" strokeWidth="0.15" />
              
              {/* Area fill for Revenue */}
              <path d={current.chartPointsGlow} fill="url(#chartGlowLight)" />
              
              {/* Revenue Line */}
              <path d={current.chartPointsRev} fill="none" stroke="#4f46e5" strokeWidth="1.2" />
              {/* Revenue Dots & Value Labels */}
              {current.chartDots.map((dot, idx) => (
                <g key={`rev-${idx}`}>
                  <circle cx={dot.cx} cy={dot.cy} r="1.2" fill="#4f46e5" stroke="#fff" strokeWidth="0.3" />
                  <text x={dot.cx} y={dot.cy - 2.5} fontSize="2.2" fill="#4f46e5" fontWeight="bold" textAnchor="middle">{dot.label}</text>
                </g>
              ))}

              {/* Visits Line (Dashed) */}
              <path d={current.chartPointsVis} fill="none" stroke="#10b981" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
              {/* Visits Dots & Value Labels */}
              {current.chartDots.map((dot, idx) => (
                <g key={`vis-${idx}`}>
                  <circle cx={dot.vCx} cy={dot.vCy} r="1" fill="#10b981" />
                  <text x={dot.vCx} y={dot.vCy + 3.5} fontSize="2.0" fill="#10b981" fontWeight="bold" textAnchor="middle">{dot.vLabel}</text>
                </g>
              ))}
            </svg>

            {/* Bottom X-Axis Labels */}
            <div className="absolute bottom-2 left-10 right-12 flex justify-between text-[10px] text-slate-400 font-bold">
              {current.chartLabels.map((lbl, idx) => <span key={idx}>{lbl}</span>)}
            </div>
          </div>
        </div>

        {/* Priority Alerts */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-800 font-outfit">Cảnh báo khẩn cấp</h3>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-100 text-rose-600 rounded-full">{alerts.length} Yêu cầu</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Quyết định xử lý vận hành và khách hàng.</p>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar max-h-64">
            {alerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 ${
                  alert.severity === 'high' 
                    ? 'bg-rose-50/70 border-rose-100' 
                    : alert.severity === 'medium'
                    ? 'bg-slate-50 border-slate-200/60'
                    : alert.severity === 'success'
                    ? 'bg-emerald-50/70 border-emerald-100'
                    : 'bg-amber-50/70 border-amber-100'
                }`}
              >
                <div className="flex gap-2">
                  <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                    alert.severity === 'high' 
                      ? 'text-rose-500' 
                      : alert.severity === 'medium'
                      ? 'text-slate-500'
                      : alert.severity === 'success'
                      ? 'text-emerald-500'
                      : 'text-amber-500'
                  }`} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-850 leading-tight">{alert.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal font-medium">{alert.message}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 text-[10px] font-bold">
                  <button 
                    onClick={() => handleAction(alert)}
                    className={`px-2.5 py-1.5 rounded-lg text-white transition-all shadow-sm ${
                      alert.severity === 'high' 
                        ? 'bg-rose-600 hover:bg-rose-500' 
                        : alert.severity === 'medium'
                        ? 'bg-amber-600 hover:bg-amber-500'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    {alert.actionText}
                  </button>
                  <button 
                    onClick={() => dismissAlert(alert.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-500/40 mb-2" />
                <span className="text-xs font-semibold">Tất cả cảnh báo đã được xử lý</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 3. DIAGNOSIS RELATION TEXTBOX */}
      <div className="bg-indigo-50/60 border border-indigo-100/80 p-4 rounded-2xl text-xs text-indigo-800 leading-relaxed flex gap-2">
        <HelpCircle className="w-5 h-5 shrink-0 text-indigo-600" />
        <div>
          <span className="font-bold">Mối liên hệ giữa biểu đồ:</span> Biểu đồ đường **"Xu hướng Vận hành"** biểu thị tổng doanh thu tích lũy chu kỳ này đạt <span className="font-semibold">{current.revenueStr}</span>. Biểu đồ **"Doanh thu theo Gói"** bên dưới chính là **lát cắt chi tiết (Breakdown)** phân rã nguồn gốc đóng góp của từng gói dịch vụ cốt lõi để giúp Admin nắm bắt gói nào đang hoạt động hiệu quả nhất.
        </div>
      </div>

      {/* 4. OPERATIONS BREAKDOWN & REVENUE BY SERVICE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Operational Breakdown */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-800 font-outfit">Phân phối Đặt lịch</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tỷ lệ các trạng thái đơn rửa xe trong chu kỳ lọc.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 py-2">
            {/* Custom SVG Donut */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3.2" strokeDasharray={current.donutDash} strokeDashoffset={current.donutOffset} />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#06b6d4" strokeWidth="3.2" strokeDasharray={current.donutPaidDash} strokeDashoffset={current.donutPaidOffset} />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3.2" strokeDasharray={current.donutUnpaidDash} strokeDashoffset={current.donutUnpaidOffset} />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="3.2" strokeDasharray={current.donutCanceledDash} strokeDashoffset={current.donutCanceledOffset} />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-extrabold font-outfit text-slate-800">{current.bookingsCount}</span>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Lịch đặt</p>
              </div>
            </div>

            {/* Progress breakdown description */}
            <div className="grid grid-cols-2 gap-4 w-full text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <div className="text-slate-800 font-bold">{Math.round((current.completed / current.bookingsCount) * 100)}% ({current.completed})</div>
                  <div className="text-[10px] text-slate-455">Hoàn thành</div>
                </div>
              </div>
              <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
                <div>
                  <div className="text-slate-800 font-bold">{Math.round((current.paid / current.bookingsCount) * 100)}% ({current.paid})</div>
                  <div className="text-[10px] text-slate-455">Đã thanh toán</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <div className="text-slate-800 font-bold">{Math.round((current.wait / current.bookingsCount) * 100)}% ({current.wait})</div>
                  <div className="text-[10px] text-slate-455">Chưa thanh toán</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <div>
                  <div className="text-slate-800 font-bold">{Math.round((current.canceled / current.bookingsCount) * 100)}% ({current.canceled})</div>
                  <div className="text-[10px] text-slate-455">Đã hủy đơn</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue by Service type */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-800 font-outfit">Doanh thu theo Gói</h3>
            <p className="text-xs text-slate-400 mt-0.5">Phân tích tỷ lệ phần trắng đóng góp của các gói rửa xe.</p>
          </div>

          <div className="space-y-3.5 py-1">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1 items-center">
                <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-500" /> {current.core1Name}</span>
                <span>{current.core1Price}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: current.core1Pct }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1 items-center">
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-cyan-500" /> {current.core2Name}</span>
                <span>{current.core2Price}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: current.core2Pct }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1 items-center">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {current.core3Name}</span>
                <span>{current.core3Price}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-[#10b981] h-full rounded-full" style={{ width: current.core3Pct }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1 items-center">
                <span className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-slate-500" /> Dịch vụ cộng thêm: Add-ons</span>
                <span>{current.addonPrice}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full" style={{ width: current.addonPct }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. SLOT CAPACITY HEATMAP */}
      <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-800 font-outfit">Sơ đồ lấp đầy Slot hôm nay</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Theo dõi tỷ lệ chỗ đã đặt trên sức chứa tối đa của từng khung giờ.</p>
          </div>
          <div className="flex gap-4 text-[10px] font-bold text-slate-450">
            <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200" /> Thấp (&lt;50%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-200" /> Trung bình (50-80%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-rose-100 border border-rose-200" /> Cao (&gt;80%)</span>
          </div>
        </div>

        {/* Heatmap grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
          {slots.map((slot, i) => (
            <div 
              key={i} 
              className={`p-3 rounded-xl border text-center flex flex-col justify-between gap-1 shadow-sm transition-all ${
                slot.level === 'low' 
                  ? 'bg-slate-50 border-slate-200/60 text-slate-500' 
                  : slot.level === 'med'
                  ? 'bg-amber-50 border-amber-200/60 text-amber-700'
                  : 'bg-rose-50 border-rose-200/60 text-rose-700'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400">{slot.time}</span>
              <span className="text-sm font-extrabold font-outfit">{slot.pct}%</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardPage;
