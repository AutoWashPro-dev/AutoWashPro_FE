import React, { useState, useEffect } from 'react';
import { 
  Banknote, 
  Calendar, 
  Gauge, 
  Coins, 
  TrendingUp, 
  PlusCircle, 
  XCircle, 
  HelpCircle 
} from 'lucide-react';
import WashbayGrid from '../components/WashbayGrid';
import { dashboardApi } from '../services/dashboardApi';

const AdminDashboardPage = () => {
  const [period, setPeriod] = useState('today'); // 'today', 'week', 'month', 'year'
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [kpiSummary, setKpiSummary] = useState(null); // LÆ°u trá»¯ trá»±c tiáº¿p response tá»« /api/v1/admin/dashboard/kpi-summary
  const [errorMsg, setErrorMsg] = useState(null);

  // AI Advisor States (E2E-3)
  const [aiProposal, setAiProposal] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [applyingProposal, setApplyingProposal] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  const handleRequestAiHelp = async () => {
    setLoadingAi(true);
    setShowAiPanel(true);
    try {
      const timeRange = period.toUpperCase();
      const res = await dashboardApi.analyzeDashboard(timeRange);
      setAiProposal(res);
    } catch (err) {
      console.error('Failed to request AI Advisor proposal:', err);
      alert('KhÃ´ng thá»ƒ nháº­n Ä‘á» xuáº¥t tá»« AI Advisor: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingAi(false);
    }
  };

  const handleApplyAiProposal = async () => {
    if (!aiProposal || !aiProposal.proposalId) return;
    setApplyingProposal(true);
    try {
      const res = await dashboardApi.applyProposal(aiProposal.proposalId);
      alert(res.message || 'KÃ­ch hoáº¡t chiáº¿n dá»‹ch tá»« Ä‘á» xuáº¥t AI thÃ nh cÃ´ng!');
      // Reload dashboard stats
      setPeriod(period);
    } catch (err) {
      console.error('Failed to apply AI proposal:', err);
      alert('Lá»—i Ã¡p dá»¥ng Ä‘á» xuáº¥t AI: ' + (err.response?.data?.message || err.message));
    } finally {
      setApplyingProposal(false);
    }
  };

  const initialEmptyData = {
    bookingsCount: 0,
    completed: 0,
    paid: 0,
    wait: 0,
    canceled: 0,
    bookingsLabel: '0% so vá»›i ká»³ trÆ°á»›c',
    bookingsSub: 'ÄÃºng háº¹n E2E-1: 0%',
    revenueStr: '0 Ä‘',
    revenueLabel: '0% so vá»›i má»¥c tiÃªu',
    loyaltyEarn: '0 Pts',
    loyaltyRedeem: '0 Pts',
    loyaltyNet: '0 Pts',
    completedPct: 0,
    paidPct: 0,
    waitPct: 0,
    canceledPct: 0,
    capacityPct: '0%',
    capacityPeak: 'â€”',
    
    yLeftLabels: ['10M', '7.5M', '5M', '2.5M', '0 Ä‘'],
    yRightLabels: ['200k/xe', '150k/xe', '100k/xe', '50k/xe', '0'],
    
    donutDash: '0 100', donutOffset: '0',
    donutPaidDash: '0 100', donutPaidOffset: '0',
    donutUnpaidDash: '0 100', donutUnpaidOffset: '0',
    donutCanceledDash: '0 100', donutCanceledOffset: '0',
    
    core1Name: 'GÃ³i chÃ­nh: Deluxe Wash', core1Price: '0 Ä‘ (0%)', core1Pct: '0%',
    core2Name: 'GÃ³i chÃ­nh: Premium Wash', core2Price: '0 Ä‘ (0%)', core2Pct: '0%',
    core3Name: 'GÃ³i chÃ­nh: Basic Wash', core3Price: '0 Ä‘ (0%)', core3Pct: '0%',
    addonPrice: '0 Ä‘ (0%)', addonPct: '0%',

    stackedChart: [],
    occupancyChart: []
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboard() {
      setLoading(true);
      try {
        const timeRange = period.toUpperCase();
        const [kpiRes, trendsRes, distRes, slotsRes] = await Promise.allSettled([
          dashboardApi.getKpiSummary(timeRange),
          dashboardApi.getRevenueTrends(timeRange),
          dashboardApi.getBookingDistribution(timeRange),
          dashboardApi.getSlotPerformance(timeRange),
        ]);

        if (!isMounted) return;

        const rejected = [kpiRes, trendsRes, distRes, slotsRes].filter(r => r.status === 'rejected');
        if (rejected.length > 0) {
          const firstErr = rejected[0].reason;
          console.error('Má»™t hoáº·c nhiá»u API Dashboard bá»‹ lá»—i (bá»‹ tá»« chá»‘i):', firstErr);
          if (firstErr?.response?.status === 401 || firstErr?.response?.status === 403) {
            setErrorMsg('âš ï¸ PhiÃªn Ä‘Äƒng nháº­p Admin Ä‘Ã£ háº¿t háº¡n hoáº·c token khÃ´ng há»£p lá»‡ (Lá»—i 401/403). Vui lÃ²ng ÄÄ‚NG XUáº¤T vÃ  ÄÄ‚NG NHáº¬P Láº I!');
          } else {
            setErrorMsg(`âš ï¸ KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u tá»« Backend API (${firstErr?.message || 'Lá»—i káº¿t ná»‘i/CORS'}). Vui lÃ²ng kiá»ƒm tra láº¡i server port 8080!`);
          }
        } else {
          setErrorMsg(null);
        }

        const kpi = kpiRes.status === 'fulfilled' && kpiRes.value ? kpiRes.value : {};
        setKpiSummary(kpi); // Gáº¯n dá»¯ liá»‡u API kpi-summary vÃ o state
        const trends = trendsRes.status === 'fulfilled' && Array.isArray(trendsRes.value) ? trendsRes.value : [];
        const dist = distRes.status === 'fulfilled' && distRes.value ? distRes.value : {};
        const slots = slotsRes.status === 'fulfilled' && Array.isArray(slotsRes.value) ? slotsRes.value : [];

        // 1. PhÃ¢n phá»‘i tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng (Donut Chart)
        const distList = dist.distributions || [];
        const getDist = (st, altSt, altLabel) => distList.find(d => d.status === st || d.status === altSt || d.label === altLabel) || { count: 0, percentage: 0 };
        const comp = getDist('COMPLETED', 'HoÃ n thÃ nh');
        const pd = getDist('PAID', 'CONFIRMED', 'ÄÃ£ thanh toÃ¡n');
        const unpd = getDist('UNPAID', 'PENDING', 'ChÆ°a thanh toÃ¡n');
        const canc = getDist('CANCELLED', 'CANCELLED_BY_CUSTOMER', 'ÄÃ£ há»§y Ä‘Æ¡n');

        // 2. TÃ­nh toÃ¡n tá»•ng cÃ¡c gÃ³i dá»‹ch vá»¥ tá»« dáº£i trend
        const totalBasic = trends.reduce((acc, t) => acc + Number(t.standardWashRevenue || 0), 0);
        const totalCombo = trends.reduce((acc, t) => acc + Number(t.interiorComboRevenue || 0), 0);
        const totalVip = trends.reduce((acc, t) => acc + Number(t.ceramicVipRevenue || 0), 0);
        const totalSum = totalBasic + totalCombo + totalVip || 1;
        const vipPct = ((totalVip / totalSum) * 100).toFixed(1);
        const comboPct = ((totalCombo / totalSum) * 100).toFixed(1);
        const basicPct = ((totalBasic / totalSum) * 100).toFixed(1);
        const addonPct = Math.max(0, (100 - Number(vipPct) - Number(comboPct) - Number(basicPct))).toFixed(1);

        // 3. Chuáº©n hÃ³a dá»¯ liá»‡u biá»ƒu Ä‘á»“ Stacked Bar
        const stackedChartData = trends.map(t => {
          const basicVal = Number(t.standardWashRevenue || 0) / 1000;
          const comboVal = Number(t.interiorComboRevenue || 0) / 1000;
          const vipVal = Number(t.ceramicVipRevenue || 0) / 1000;
          const totalVal = Number(t.totalRevenue || 0) / 1000 || (basicVal + comboVal + vipVal);
          const aovVal = Number(t.aov || 0); // VND
          return {
            label: t.timeLabel || '',
            basic: Math.round(basicVal),
            combo: Math.round(comboVal),
            vip: Math.round(vipVal),
            total: Math.round(totalVal),
            totalStr: `${(totalVal * 1000).toLocaleString('vi-VN')} Ä‘`,
            aov: Math.round(aovVal / 1000), // k
            aovStr: `${aovVal.toLocaleString('vi-VN')} Ä‘/xe`,
            cars: aovVal > 0 ? Math.round((totalVal * 1000) / aovVal) : 0
          };
        });

        // 4. TÃ­nh toÃ¡n trá»¥c Ä‘á»™ng cho biá»ƒu Ä‘á»“ doanh thu & AOV
        const maxBar = Math.max(...stackedChartData.map(c => c.total), 1000);
        const fmtLabel = (valK) => valK >= 1000 ? `${(valK / 1000).toFixed(valK >= 10000 ? 0 : 1)}M` : `${Math.round(valK)}k`;
        const yLeftLabels = [fmtLabel(maxBar), fmtLabel(maxBar * 0.75), fmtLabel(maxBar * 0.5), fmtLabel(maxBar * 0.25), '0 Ä‘'];

        const maxAovK = Math.max(...stackedChartData.map(c => c.aov), 100);
        const yRightLabels = [`${Math.round(maxAovK)}k/xe`, `${Math.round(maxAovK * 0.75)}k/xe`, `${Math.round(maxAovK * 0.5)}k/xe`, `${Math.round(maxAovK * 0.25)}k/xe`, '0'];

        const mapped = {
          bookingsCount: kpi.totalBookings || dist.totalBookings || 0,
          completed: comp.count || 0,
          paid: pd.count || 0,
          wait: unpd.count || 0,
          canceled: canc.count || 0,
          bookingsLabel: `${(kpi.bookingsGrowthPercentage || 0) >= 0 ? '+' : ''}${kpi.bookingsGrowthPercentage || 0}% so vá»›i ká»³ trÆ°á»›c`,
          bookingsSub: `ÄÃºng háº¹n E2E-1: ${kpi.onTimeRateE2E1 || 92}%`,
          revenueStr: `${Number(kpi.actualRevenuePaid || 0).toLocaleString('vi-VN')} Ä‘`,
          revenueLabel: `${(kpi.revenueGrowthPercentage || 0) >= 0 ? '+' : ''}${kpi.revenueGrowthPercentage || 0}% so vá»›i má»¥c tiÃªu`,
          loyaltyEarn: `${Number(kpi.pointsIssued || 0).toLocaleString('vi-VN')} Pts`,
          loyaltyRedeem: `${Number(kpi.pointsRedeemed || 0).toLocaleString('vi-VN')} Pts`,
          loyaltyNet: `${Number(kpi.loyaltyPointsNet || 0).toLocaleString('vi-VN')} Pts`,
          completedPct: Math.round(comp.percentage || 0),
          paidPct: Math.round(pd.percentage || 0),
          waitPct: Math.round(unpd.percentage || 0),
          canceledPct: Math.round(canc.percentage || 0),
          capacityPct: `${Number(kpi.slotOccupancyRate || 0).toFixed(0)}%`,
          capacityPeak: `${kpi.peakForecastLabel || 'â€”'} (Cao)`,
          
          yLeftLabels,
          yRightLabels,
          
          donutDash: `${comp.percentage || 0} ${100 - (comp.percentage || 0)}`,
          donutOffset: '0',
          donutPaidDash: `${pd.percentage || 0} ${100 - (pd.percentage || 0)}`,
          donutPaidOffset: `-${comp.percentage || 0}`,
          donutUnpaidDash: `${unpd.percentage || 0} ${100 - (unpd.percentage || 0)}`,
          donutUnpaidOffset: `-${(comp.percentage || 0) + (pd.percentage || 0)}`,
          donutCanceledDash: `${canc.percentage || 0} ${100 - (canc.percentage || 0)}`,
          donutCanceledOffset: `-${(comp.percentage || 0) + (pd.percentage || 0) + (unpd.percentage || 0)}`,
          
          core1Name: 'GÃ³i chÃ­nh: Deluxe Wash',
          core1Price: `${totalVip.toLocaleString('vi-VN')} Ä‘ (${vipPct}%)`,
          core1Pct: `${vipPct}%`,
          core2Name: 'GÃ³i chÃ­nh: Premium Wash',
          core2Price: `${totalCombo.toLocaleString('vi-VN')} Ä‘ (${comboPct}%)`,
          core2Pct: `${comboPct}%`,
          core3Name: 'GÃ³i chÃ­nh: Basic Wash',
          core3Price: `${totalBasic.toLocaleString('vi-VN')} Ä‘ (${basicPct}%)`,
          core3Pct: `${basicPct}%`,
          addonPrice: `0 Ä‘ (${addonPct}%)`,
          addonPct: `${addonPct}%`,

          stackedChart: stackedChartData,
          maxBar,
          maxAov: maxAovK,

          occupancyChart: (() => {
            return slots.map(s => {
              const occ = Math.round(s.occupancyRate || 0);
              const risk = Math.round(s.noShowRate || 0);
              const timeStr = s.timeSlot || '08:00';
              const endHourStr = (parseInt(timeStr.split(':')[0], 10) + 1).toString().padStart(2, '0') + ':00';
              return {
                time: timeStr,
                label: `${timeStr} - ${endHourStr}`,
                occ: occ,
                occStr: `${occ}% (${s.actualBooked || 0}/${s.configuredMaxCapacity || 0} xe)`,
                level: occ >= 80 ? 'high' : occ >= 50 ? 'med' : 'low',
                risk: risk,
                riskStr: `${risk}% (${s.isHighRisk ? 'Cao ðŸ”¥' : 'Tháº¥p'})`,
                note: s.isHighRisk ? 'âš ï¸ Cáº£nh bÃ¡o E2E-1: Khung giá» rá»§i ro cao' : 'Hoáº¡t Ä‘á»™ng á»•n Ä‘á»‹nh theo E2E-1'
              };
            });
          })(),
          maxRisk: (() => {
            const maxR = Math.max(...slots.map(s => Number(s.noShowRate || 0)), 30);
            return maxR <= 30 ? 30 : maxR <= 50 ? 50 : maxR <= 80 ? 80 : 100;
          })(),
          yRightRiskLabels: (() => {
            const maxR = Math.max(...slots.map(s => Number(s.noShowRate || 0)), 30);
            const m = maxR <= 30 ? 30 : maxR <= 50 ? 50 : maxR <= 80 ? 80 : 100;
            return [`${m}%`, `${Math.round(m * 0.75)}%`, `${Math.round(m * 0.5)}%`, `${Math.round(m * 0.25)}%`, '0%'];
          })(),
          maxOcc: (() => {
            const maxO = Math.max(...slots.map(s => Number(s.occupancyRate || 0)), 25);
            return maxO <= 25 ? 25 : maxO <= 50 ? 50 : maxO <= 75 ? 75 : 100;
          })(),
          yLeftOccLabels: (() => {
            const maxO = Math.max(...slots.map(s => Number(s.occupancyRate || 0)), 25);
            const m = maxO <= 25 ? 25 : maxO <= 50 ? 50 : maxO <= 75 ? 75 : 100;
            return [`${m}%`, `${Math.round(m * 0.75)}%`, `${Math.round(m * 0.5)}%`, `${Math.round(m * 0.25)}%`, '0%'];
          })()
        };
        setLiveData(mapped);
      } catch (err) {
        console.error('Lá»—i khi táº£i dá»¯ liá»‡u API tá»« backend:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDashboard();
    return () => { isMounted = false; };
  }, [period]);

  const current = liveData || initialEmptyData;
return (
    <div className="space-y-6 pb-6 text-slate-800">
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm font-medium text-sm animate-pulse">
          <div className="flex items-center gap-2">
            <span>{errorMsg}</span>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('autowash_token'); localStorage.removeItem('token'); localStorage.removeItem('accessToken'); window.location.href = '/login'; }} 
            className="bg-rose-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-rose-700 transition-all text-xs shrink-0 cursor-pointer shadow-sm"
          >
            ÄÄƒng xuáº¥t & ÄÄƒng nháº­p láº¡i ngay
          </button>
        </div>
      )}
      
      {/* Command Center Title & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold font-outfit text-slate-800 tracking-tight">Command Center</h2>
            {loading && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium animate-pulse">Äang Ä‘á»“ng bá»™ API...</span>}
            {liveData && !loading && !errorMsg && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">âš¡ Live Backend API</span>}
            {errorMsg && !loading && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium">âš ï¸ Lá»—i káº¿t ná»‘i API</span>}
          </div>
          <p className="text-xs text-slate-400 font-semibold">Tá»•ng quan hoáº¡t Ä‘á»™ng váº­n hÃ nh & Tá»· lá»‡ láº¥p Ä‘áº§y tráº¡m rá»­a xe mÃ¡y.</p>
        </div>
        
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleRequestAiHelp}
            className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-650 text-white text-xs font-black px-4.5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-indigo-200 animate-bounce" />
            Nháº­n Hiáº¿n Káº¿ AI ðŸ’¡
          </button>

          <div className="bg-white border border-slate-200/80 rounded-xl p-1 flex gap-1.5 text-xs text-slate-500 shadow-sm">
            <button 
              onClick={() => setPeriod('today')} 
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                period === 'today' ? 'bg-slate-900 text-white shadow-sm' : 'hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              HÃ´m nay
            </button>
            <button 
              onClick={() => setPeriod('week')} 
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                period === 'week' ? 'bg-slate-900 text-white shadow-sm' : 'hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Tuáº§n
            </button>
            <button 
              onClick={() => setPeriod('month')} 
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                period === 'month' ? 'bg-slate-900 text-white shadow-sm' : 'hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              ThÃ¡ng
            </button>
            <button 
              onClick={() => setPeriod('year')} 
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                period === 'year' ? 'bg-slate-900 text-white shadow-sm' : 'hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              NÄƒm
            </button>
          </div>
        </div>
      </div>

      {/* AI Advisor Panel */}
      {showAiPanel && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-indigo-500/20 text-xs">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-700/50">
            <div className="flex items-center gap-2.5">
              <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-400/30">
                <Gauge className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
              <div className="text-left">
                <h3 className="font-extrabold text-sm tracking-tight font-outfit">AI Advisor Command</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Trá»£ lÃ½ AI phÃ¢n tÃ­ch hiá»‡u suáº¥t vÃ  Ä‘á» xuáº¥t chiáº¿n lÆ°á»£c Win-back tá»± Ä‘á»™ng.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAiPanel(false)}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>

          {loadingAi ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-300 text-[11px] font-bold animate-pulse">Trá»£ lÃ½ AI Ä‘ang thu tháº­p dá»¯ liá»‡u dashboard vÃ  phÃ¢n tÃ­ch...</p>
            </div>
          ) : aiProposal ? (
            <div className="mt-5 space-y-5 text-left">
              {/* Lá»i khuyÃªn */}
              <div className="bg-slate-800/40 p-4.5 rounded-2xl border border-slate-700/40 leading-relaxed text-slate-200">
                <h4 className="font-black text-indigo-300 uppercase tracking-wider text-[9px] mb-2">ðŸ’¡ PhÃ¢n tÃ­ch & Lá»i khuyÃªn tá»« AI</h4>
                <p className="whitespace-pre-line font-medium leading-relaxed">{aiProposal.advisoryText || 'KhÃ´ng phÃ¡t hiá»‡n rá»§i ro nÃ o Ä‘Ã¡ng ká»ƒ trong thá»i gian nÃ y.'}</p>
              </div>

              {/* Voucher Ä‘á» xuáº¥t */}
              {aiProposal.proposedVoucher && (
                <div className="bg-indigo-600/10 p-5 rounded-2xl border border-indigo-500/30 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-500 text-white font-mono font-black px-2.5 py-0.5 rounded text-[9px] tracking-wider uppercase">
                        {aiProposal.proposedVoucher.code}
                      </span>
                      <span className="text-[9px] text-indigo-300 font-extrabold">Äá» xuáº¥t Voucher Win-back</span>
                    </div>
                    <h5 className="font-black text-white text-xs">{aiProposal.proposedVoucher.name}</h5>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      Ãp dá»¥ng cho háº¡ng: <strong className="text-white">{aiProposal.proposedVoucher.minTier}+</strong> â€¢ 
                      Váº¯ng máº·t: <strong className="text-white">&gt; {aiProposal.proposedVoucher.minRecencyDays} ngÃ y</strong> â€¢ 
                      NgÃ¢n sÃ¡ch: <strong className="text-white">{aiProposal.proposedVoucher.totalBudget} vouchers</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={handleApplyAiProposal}
                      disabled={applyingProposal}
                      className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-[10px] font-black px-5 py-3 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                    >
                      {applyingProposal ? "Äang kÃ­ch hoáº¡t..." : "âœ… 1-Click Apply"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-400 py-10 font-bold text-center">KhÃ´ng cÃ³ Ä‘á» xuáº¥t nÃ o sáºµn sÃ ng. Báº¥m nÃºt phÃ­a trÃªn Ä‘á»ƒ nháº­n hiáº¿n káº¿.</p>
          )}
        </div>
      )}

      {/* 1. KPI CARDS (4-Column Golden Ratio Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Card 1: Bookings - Gáº¯n trá»±c tiáº¿p tá»« API /api/v1/admin/dashboard/kpi-summary */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Äáº·t lá»‹ch {period === 'today' ? 'HÃ´m nay' : period === 'week' ? 'Tuáº§n nÃ y' : period === 'month' ? 'ThÃ¡ng nÃ y' : 'NÄƒm nay'}</p>
                <h3 className="text-2xl font-extrabold font-outfit text-slate-800 mt-1">
                  {kpiSummary?.totalBookings !== undefined && kpiSummary?.totalBookings !== null ? kpiSummary.totalBookings : current.bookingsCount}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                <Calendar className="w-4.5 h-4.5 text-cyan-600" />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {kpiSummary?.bookingsGrowthPercentage !== undefined && kpiSummary?.bookingsGrowthPercentage !== null ? `${kpiSummary.bookingsGrowthPercentage >= 0 ? '+' : ''}${kpiSummary.bookingsGrowthPercentage}% so vá»›i ká»³ trÆ°á»›c` : current.bookingsLabel}
            </span>
            <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/80 text-[11px]">
              {`ÄÃºng háº¹n E2E-1: ${kpiSummary?.onTimeRateE2E1 !== undefined && kpiSummary?.onTimeRateE2E1 !== null ? kpiSummary.onTimeRateE2E1 : 95}%`}
            </span>
          </div>
        </div>

        {/* Card 2: Revenue - Gáº¯n trá»±c tiáº¿p tá»« API /api/v1/admin/dashboard/kpi-summary */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doanh thu Thá»±c thu (PAID)</p>
                <h3 className="text-2xl font-extrabold font-outfit text-slate-800 mt-1">
                  {kpiSummary?.actualRevenuePaid !== undefined && kpiSummary?.actualRevenuePaid !== null ? `${Number(kpiSummary.actualRevenuePaid).toLocaleString('vi-VN')} Ä‘` : current.revenueStr}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Banknote className="w-4.5 h-4.5 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {kpiSummary?.revenueGrowthPercentage !== undefined && kpiSummary?.revenueGrowthPercentage !== null ? `${kpiSummary.revenueGrowthPercentage >= 0 ? '+' : ''}${kpiSummary.revenueGrowthPercentage}% so vá»›i má»¥c tiÃªu` : current.revenueLabel}
            </span>
          </div>
        </div>

        {/* Card 3: Loyalty Pulse - Gáº¯n trá»±c tiáº¿p tá»« API /api/v1/admin/dashboard/kpi-summary */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Äiá»ƒm tÃ­ch / Ä‘á»•i (Loyalty)</p>
                <h3 className="text-2xl font-extrabold font-outfit text-slate-800 mt-1">
                  {kpiSummary?.loyaltyPointsNet !== undefined && kpiSummary?.loyaltyPointsNet !== null ? `${Number(kpiSummary.loyaltyPointsNet).toLocaleString('vi-VN')} Pts` : (current.loyaltyNet || current.loyaltyEarn)}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                <Coins className="w-4.5 h-4.5 text-violet-600" />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="text-emerald-600 flex items-center gap-0.5">
              <PlusCircle className="w-3.5 h-3.5" /> PhÃ¡t: {kpiSummary?.pointsIssued !== undefined && kpiSummary?.pointsIssued !== null ? `${Number(kpiSummary.pointsIssued).toLocaleString('vi-VN')} Pts` : current.loyaltyEarn}
            </span>
            <span className="text-rose-500 flex items-center gap-0.5">
              <XCircle className="w-3.5 h-3.5" /> Äá»•i: {kpiSummary?.pointsRedeemed !== undefined && kpiSummary?.pointsRedeemed !== null ? `${Number(kpiSummary.pointsRedeemed).toLocaleString('vi-VN')} Pts` : current.loyaltyRedeem}
            </span>
          </div>
        </div>

        {/* Card 4: Slot Capacity - Gáº¯n trá»±c tiáº¿p tá»« API /api/v1/admin/dashboard/kpi-summary */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hiá»‡u suáº¥t Slot láº¥p Ä‘áº§y</p>
                <h3 className="text-2xl font-extrabold font-outfit text-slate-800 mt-1">
                  {kpiSummary?.slotOccupancyRate !== undefined && kpiSummary?.slotOccupancyRate !== null ? `${Number(kpiSummary.slotOccupancyRate).toFixed(1)}%` : current.capacityPct}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Gauge className="w-4.5 h-4.5 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Äá»‰nh dá»± kiáº¿n:</span>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-bold border border-rose-100">
              {kpiSummary?.peakForecastLabel || current.capacityPeak || 'CÃ¡c ngÃ y lá»… (Cao)'}
            </span>
          </div>
        </div>

      </div>

      {/* 2. BIá»‚U Äá»’ 1: Cá»˜T CHá»’NG GÃ“I Dá»ŠCH Vá»¤ & ÄÆ¯á»œNG AOV + PHÃ‚N PHá»I Äáº¶T Lá»ŠCH (DONUT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Biá»ƒu Äá»“ 1 (Left, spans 2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-850 font-outfit">Biá»ƒu Ä‘á»“ 1: Stacked Bar cÆ¡ cáº¥u dá»‹ch vá»¥ & Ä‘Æ°á»ng AOV</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Doanh thu phÃ¢n táº§ng theo gÃ³i (TiÃªu chuáº©n, Combo, VIP) & GiÃ¡ trá»‹ trung bÃ¬nh xe AOV (API /revenue-trends).</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Rá»­a TiÃªu Chuáº©n</span>
                <span className="flex items-center gap-1 text-amber-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Combo Ná»™i Tháº¥t</span>
                <span className="flex items-center gap-1 text-violet-600"><span className="w-2.5 h-2.5 rounded-full bg-violet-500" /> Ceramic VIP</span>
                <span className="flex items-center gap-1 text-indigo-600"><span className="w-4 h-1 rounded-full bg-indigo-600 inline-block relative"><span className="w-2 h-2 rounded-full bg-indigo-600 border border-white absolute -top-0.5 left-1" /></span> AOV (VNÄ/Xe)</span>
              </div>
            </div>
          </div>

          {/* Stacked Bar + AOV Line Chart Display Area */}
          <div className="relative h-64 w-full bg-slate-50/40 rounded-xl p-4 flex flex-col justify-end border border-slate-100/80 mt-4">
            
            {/* Left Y-Axis Label (Revenue VND) */}
            <div className="absolute left-2.5 top-4 bottom-10 flex flex-col justify-between text-[9px] text-indigo-600 font-bold text-left pointer-events-none">
              {current.yLeftLabels.map((lbl, idx) => <span key={`yl-${idx}`}>{lbl}</span>)}
            </div>

            {/* Right Y-Axis Label (AOV / Cars count) */}
            <div className="absolute right-2.5 top-4 bottom-10 flex flex-col justify-between text-[9px] text-amber-600 font-bold text-right pointer-events-none">
              {current.yRightLabels.map((lbl, idx) => <span key={`yr-${idx}`}>{lbl}</span>)}
            </div>

            {/* Grid Lines */}
            <div className="absolute inset-x-12 top-4 bottom-10 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-slate-400 w-full" />
              <div className="border-b border-slate-400 w-full" />
              <div className="border-b border-slate-400 w-full" />
              <div className="border-b border-slate-400 w-full" />
              <div className="border-b border-slate-400 w-full" />
            </div>

            {/* Bars & Continuous AOV Line Container */}
            <div className="absolute inset-x-12 top-4 bottom-10">
              <div className="relative z-10 w-full h-full flex items-end justify-between gap-2">
                
                {/* Continuous SVG AOV Trend Line & Exact Dots */}
                {current.stackedChart && current.stackedChart.length > 0 && (
                  <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
                    <defs>
                      <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#4f46e5" floodOpacity="0.35" />
                      </filter>
                    </defs>
                    <polyline 
                      points={current.stackedChart.map((col, idx) => {
                        const maxAov = current.maxAov || Math.max(...current.stackedChart.map(c => c.aov || 0), 100);
                        const aovPct = maxAov > 0 ? Math.min(100, Math.max(0, ((col.aov || 0) / maxAov) * 100)) : 0;
                        const x = ((idx + 0.5) / current.stackedChart.length) * 1000;
                        const y = 1000 - (aovPct * 10);
                        return `${x},${y}`;
                      }).join(' ')} 
                      fill="none" 
                      stroke="#4f46e5" 
                      strokeWidth="24" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      filter="url(#lineGlow)"
                    />
                  </svg>
                )}

              {current.stackedChart && current.stackedChart.length > 0 ? current.stackedChart.map((col, idx) => {
                const maxVal = current.maxBar || Math.max(...current.stackedChart.map(c => c.total || 0), 1000);
                const heightPct = maxVal > 0 ? Math.min(100, Math.max(0, ((col.total || 0) / maxVal) * 100)) : 0;
                const basicPct = col.total > 0 ? ((col.basic || 0) / col.total) * 100 : 25;
                const comboPct = col.total > 0 ? ((col.combo || 0) / col.total) * 100 : 25;
                const vipPct = col.total > 0 ? ((col.vip || 0) / col.total) * 100 : 25;
                const otherPct = col.total > 0 ? ((col.other || 0) / col.total) * 100 : 25;

                const maxAov = current.maxAov || Math.max(...current.stackedChart.map(c => c.aov || 0), 100);
                const aovPct = maxAov > 0 ? Math.min(100, Math.max(0, ((col.aov || 0) / maxAov) * 100)) : 0;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer">
                    
                    {/* Hover Tooltip (Exact Match to NovaWash Screenshot) */}
                    <div className="absolute -top-[132px] left-1/2 transform -translate-x-1/2 bg-slate-900/95 text-white p-3 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-40 w-48 text-[11px] leading-tight border border-slate-700/80 backdrop-blur-sm">
                      <div className="font-extrabold text-emerald-400 border-b border-slate-700/80 pb-1.5 mb-1.5 flex justify-between">
                        <span>{col.label}</span>
                        <span>{col.totalStr}</span>
                      </div>
                      <div className="space-y-1 text-slate-300 font-medium">
                        <div className="flex justify-between items-center"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"/> Rá»­a TiÃªu Chuáº©n:</span><span className="font-extrabold text-emerald-400">{col.basic}k</span></div>
                        <div className="flex justify-between items-center"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"/> Combo Ná»™i Tháº¥t:</span><span className="font-extrabold text-amber-400">{col.combo}k</span></div>
                        <div className="flex justify-between items-center"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500"/> Ceramic VIP:</span><span className="font-extrabold text-violet-400">{col.vip}k</span></div>
                        {col.other > 0 && (
                          <div className="flex justify-between items-center"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"/> Dá»‹ch vá»¥ khÃ¡c:</span><span className="font-extrabold text-slate-300">{col.other}k</span></div>
                        )}
                      </div>
                      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold px-2.5 py-1.5 rounded-xl shadow-inner mt-2 flex justify-between items-center text-[10px]">
                        <span>AOV TB ({col.cars} xe)</span>
                        <span className="text-amber-200">{col.aovStr}</span>
                      </div>
                    </div>

                    {/* Circular Interactive AOV Dot exactly on the polyline */}
                    <div 
                      className="absolute w-3.5 h-3.5 rounded-full bg-indigo-600 border-[2.5px] border-white shadow-md z-30 group-hover:scale-150 group-hover:bg-amber-400 transition-all duration-200 pointer-events-none" 
                      style={{ bottom: `${aovPct}%`, left: '50%', transform: 'translate(-50%, 50%)' }}
                    />

                    {/* Stacked Torch Bar Column (Biá»ƒu Ä‘á»“ Äuá»‘c Stacked Bar) */}
                    <div 
                      className="w-full max-w-[36px] sm:max-w-[42px] rounded-t-xl overflow-hidden flex flex-col-reverse shadow-sm transition-all duration-300 group-hover:brightness-110 group-hover:-translate-y-0.5" 
                      style={{ height: `${heightPct}%` }}
                    >
                      <div style={{ height: `${basicPct}%` }} className="bg-[#10b981] w-full transition-all duration-500" title={`Rá»­a TiÃªu Chuáº©n: ${col.basic}k`} />
                      <div style={{ height: `${comboPct}%` }} className="bg-[#f59e0b] w-full transition-all duration-500" title={`Combo Ná»™i Tháº¥t: ${col.combo}k`} />
                      <div style={{ height: `${vipPct}%` }} className="bg-[#8b5cf6] w-full transition-all duration-500" title={`Ceramic VIP: ${col.vip}k`} />
                      <div style={{ height: `${otherPct}%` }} className="bg-slate-400 w-full transition-all duration-500" title={`Dá»‹ch vá»¥ khÃ¡c: ${col.other}k`} />
                    </div>
                  </div>
                );
              }) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-slate-400">ChÆ°a cÃ³ dá»¯ liá»‡u giao dá»‹ch cho chu ká»³ nÃ y</div>
              )}
            </div>
            </div>

            {/* X-Axis Label Container (sits safely below bottom-10, from bottom-1.5 h-7!) */}
            <div className="absolute inset-x-12 bottom-1.5 h-7 flex items-center justify-between gap-2 pointer-events-none">
              {current.stackedChart && current.stackedChart.map((col, idx) => (
                <div key={idx} className="flex-1 flex justify-center text-center">
                  <span className="text-[10px] font-extrabold text-slate-500 truncate max-w-full">{col.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Donut Chart: PhÃ¢n phá»‘i Äáº·t lá»‹ch (Right, spans 1 col) */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-800 font-outfit">Biá»ƒu Ä‘á»“ Donut: PhÃ¢n phá»‘i tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tá»· lá»‡ cÃ¡c tráº¡ng thÃ¡i Ä‘Æ¡n rá»­a xe trong chu ká»³ lá»c (API /booking-distribution).</p>
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            {/* Custom SVG Donut */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0 my-2">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3.2" strokeDasharray={current.donutDash} strokeDashoffset={current.donutOffset} />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#06b6d4" strokeWidth="3.2" strokeDasharray={current.donutPaidDash} strokeDashoffset={current.donutPaidOffset} />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3.2" strokeDasharray={current.donutUnpaidDash} strokeDashoffset={current.donutUnpaidOffset} />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="3.2" strokeDasharray={current.donutCanceledDash} strokeDashoffset={current.donutCanceledOffset} />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-extrabold font-outfit text-slate-800">{current.bookingsCount}</span>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Lá»‹ch Ä‘áº·t</p>
              </div>
            </div>

            {/* Progress breakdown description */}
            <div className="grid grid-cols-2 gap-3 w-full text-xs font-semibold text-slate-500 mt-2">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <div className="text-slate-800 font-bold text-[11px]">{current.completedPct || 0}% ({current.completed})</div>
                  <div className="text-[9px] text-slate-455">HoÃ n thÃ nh</div>
                </div>
              </div>
              <div className="flex items-center gap-2 border-b border-slate-50 pb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
                <div>
                  <div className="text-slate-800 font-bold text-[11px]">{current.paidPct || 0}% ({current.paid})</div>
                  <div className="text-[9px] text-slate-455">ÄÃ£ thanh toÃ¡n</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <div className="text-slate-800 font-bold text-[11px]">{current.waitPct || 0}% ({current.wait})</div>
                  <div className="text-[9px] text-slate-455">ChÆ°a thanh toÃ¡n</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <div>
                  <div className="text-slate-800 font-bold text-[11px]">{current.canceledPct || 0}% ({current.canceled})</div>
                  <div className="text-[9px] text-slate-455">ÄÃ£ há»§y Ä‘Æ¡n</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. DIAGNOSIS RELATION TEXTBOX */}
      <div className="bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-indigo-50/90 border border-indigo-100 p-4.5 rounded-2xl text-xs text-indigo-950 leading-relaxed flex gap-3.5 shadow-sm items-center">
        <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm shrink-0">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold uppercase tracking-wide text-indigo-700 mr-1.5">Má»‘i liÃªn há»‡ & TrÃ­ tuá»‡ nhÃ¢n táº¡o (AI Engine):</span> 
          Biá»ƒu Ä‘á»“ 1 pháº£n Ã¡nh cháº¥t lÆ°á»£ng tÄƒng trÆ°á»Ÿng thÃ´ng qua cÆ¡ cáº¥u dá»‹ch vá»¥ vÃ  má»©c chi tiÃªu trung bÃ¬nh (AOV). Trong khi Ä‘Ã³, <strong className="text-indigo-900 font-extrabold">Biá»ƒu Äá»“ 2</strong> phÃ­a dÆ°á»›i phÃ¢n tÃ­ch trá»±c tiáº¿p <strong className="text-indigo-900 font-extrabold">12 khung giá» E2E-1</strong>, tÃ­ch há»£p AI dá»± bÃ¡o rá»§i ro bÃ¹ng lá»‹ch (Churn Risk) vÃ  Ä‘iá»u phá»‘i cÃ´ng suáº¥t thá»£ thá»i gian thá»±c.
        </div>
      </div>

      {/* 4. BIá»‚U Äá»’ 2: CÃ”NG SUáº¤T 12 KHUNG GIá»œ E2E-1 & AI Dá»° BÃO CHURN RISK (FULL WIDTH) */}
      <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-850 font-outfit">Biá»ƒu Ä‘á»“ 2: Hiá»‡u suáº¥t 12 Khung giá» E2E-1 & Cáº£nh bÃ¡o rá»§i ro</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Theo dÃµi cÃ´ng suáº¥t khai thÃ¡c theo khung giá» vÃ  rá»§i ro há»§y háº¹n/trá»… giá» theo thá»i gian thá»±c (API /slot-performance).</p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-bold items-center">
            <span className="flex items-center gap-1.5 text-cyan-600"><span className="w-3 h-3 rounded-full bg-[#06b6d4]" /> % Láº¥p Ä‘áº§y Slot (Occupancy)</span>
            <span className="flex items-center gap-1.5 text-rose-600"><span className="w-5 h-1 rounded-full bg-rose-600 inline-block relative"><span className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-white absolute -top-0.5 left-1" /></span> % Tá»· lá»‡ Há»§y Háº¹n / No-Show</span>
          </div>
        </div>

        {/* 12-Hour E2E-1 Combo Bar + Line Chart Display Area */}
        <div className="relative h-72 w-full bg-slate-50/40 rounded-xl p-4 flex flex-col justify-end border border-slate-100/80 mt-4">
          
          {/* Left Y-Axis Label (% Láº¥p Ä‘áº§y Slot) */}
          <div className="absolute left-2.5 top-4 bottom-10 flex flex-col justify-between text-[10px] text-cyan-600 font-extrabold text-left pointer-events-none">
            {(current.yLeftOccLabels || ['100%', '75%', '50%', '25%', '0%']).map((lbl, idx) => <span key={`yl-occ-${idx}`}>{lbl}</span>)}
          </div>

          {/* Right Y-Axis Label (% No-Show / Churn Risk) */}
          <div className="absolute right-2.5 top-4 bottom-10 flex flex-col justify-between text-[10px] text-rose-600 font-extrabold text-right pointer-events-none">
            {(current.yRightRiskLabels || ['30%', '22.5%', '15%', '7.5%', '0%']).map((lbl, idx) => <span key={`yr-risk-${idx}`}>{lbl}</span>)}
          </div>

          {/* Grid Lines */}
          <div className="absolute inset-x-12 top-4 bottom-10 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-slate-400 w-full" />
            <div className="border-b border-slate-400 w-full" />
            <div className="border-b border-slate-400 w-full" />
            <div className="border-b border-slate-400 w-full" />
            <div className="border-b border-slate-400 w-full" />
          </div>

          {/* 12 Columns & Continuous No-Show Line Container */}
          <div className="absolute inset-x-12 top-4 bottom-10">
            <div className="relative z-10 w-full h-full flex items-end justify-between gap-1.5">
              
              {/* Continuous SVG No-Show Trend Line & Exact Dots */}
              {current.occupancyChart && (
                <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
                  <defs>
                    <filter id="roseGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.4" />
                    </filter>
                  </defs>
                  <polyline 
                    points={current.occupancyChart.map((slot, idx) => {
                      const maxR = current.maxRisk || 30;
                      const riskPct = maxR > 0 ? Math.min(100, Math.max(0, ((slot.risk || 0) / maxR) * 100)) : 0;
                      const x = ((idx + 0.5) / current.occupancyChart.length) * 1000;
                      const y = 1000 - (riskPct * 10);
                      return `${x},${y}`;
                    }).join(' ')} 
                    fill="none" 
                    stroke="#ef4444" 
                    strokeWidth="24" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    filter="url(#roseGlow)"
                  />
                </svg>
              )}

            {current.occupancyChart ? current.occupancyChart.map((slot, idx) => {
              const maxO = current.maxOcc || 100;
              const heightPct = maxO > 0 ? Math.min(100, Math.max(0, ((slot.occ || 0) / maxO) * 100)) : 0;
              const maxR = current.maxRisk || 30;
              const riskPct = maxR > 0 ? Math.min(100, Math.max(0, ((slot.risk || 0) / maxR) * 100)) : 0;
              const isLowOrSilver = slot.occ < 30;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer">
                  
                  {/* Hover Tooltip Card */}
                  <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 bg-slate-900/95 text-white p-3 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-40 w-52 text-[11px] leading-relaxed border border-slate-700/80 backdrop-blur-sm">
                    <div className="font-extrabold text-cyan-400 border-b border-slate-700/80 pb-1 mb-1.5 flex justify-between items-center">
                      <span>Khung giá»: {slot.time}</span>
                      <span className="px-1.5 py-0.5 bg-cyan-950 text-cyan-300 rounded text-[10px]">Láº¥p Ä‘áº§y {slot.occ}%</span>
                    </div>
                    <div className="text-slate-200 font-medium mb-1.5 flex items-start gap-1">
                      <span className="text-amber-400 shrink-0">ðŸ“Œ</span>
                      <span>{slot.note}</span>
                    </div>
                    <div className="bg-rose-950/80 text-rose-300 border border-rose-800/60 font-extrabold px-2 py-1 rounded-xl flex justify-between items-center text-[10px]">
                      <span>âš ï¸ Rá»§i ro Há»§y/Trá»… háº¹n:</span>
                      <span className="text-white bg-rose-600 px-1.5 py-0.5 rounded">{slot.risk}%</span>
                    </div>
                  </div>

                  {/* Circular Interactive No-Show Dot exactly on the polyline */}
                  <div 
                    className="absolute w-3.5 h-3.5 rounded-full bg-rose-600 border-[2.5px] border-white shadow-md z-30 group-hover:scale-150 group-hover:bg-amber-400 transition-all duration-200 pointer-events-none" 
                    style={{ bottom: `${riskPct}%`, left: '50%', transform: 'translate(-50%, 50%)' }}
                  >
                    {/* Floating Risk % badge above dot when hovered */}
                    <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 px-1.5 py-0.5 bg-rose-600 text-white font-extrabold text-[9px] rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {slot.risk}%
                    </span>
                  </div>

                  {/* Column Bar (% Láº¥p Ä‘áº§y Slot) */}
                  <div 
                    className={`w-full max-w-[28px] sm:max-w-[36px] rounded-t-xl overflow-hidden shadow-sm transition-all duration-300 group-hover:brightness-110 group-hover:-translate-y-0.5 ${
                      slot.isHighRisk ? 'bg-rose-500' : slot.occ >= 80 ? 'bg-amber-500' : isLowOrSilver ? 'bg-slate-300/90' : 'bg-[#06b6d4]'
                    }`} 
                    style={{ height: `${heightPct}%` }}
                    title={`Khung giá» ${slot.time}: Láº¥p Ä‘áº§y ${slot.occ}%, Rá»§i ro No-Show ${slot.risk}%`}
                  />
                </div>
              );
            }) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Äang táº£i dá»¯ liá»‡u 12 khung giá» E2E-1...</div>
            )}
            </div>
          </div>

          {/* X-Axis Label Container (sits safely below bottom-10, from bottom-1.5 h-7!) */}
          <div className="absolute inset-x-12 bottom-1.5 h-7 flex items-center justify-between gap-1.5 pointer-events-none">
            {current.occupancyChart && current.occupancyChart.map((slot, idx) => (
              <div key={idx} className="flex-1 flex justify-center text-center">
                <span className="text-[10px] font-extrabold text-slate-500 truncate max-w-full">{slot.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Rule E2E-1 / E2E-3 Banner */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2.5 text-xs font-semibold text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 inline-block animate-pulse" />
          <div>
            <span className="font-extrabold text-rose-600 uppercase tracking-wide">Quy táº¯c E2E-1 / E2E-3:</span> Khi % Rá»§i ro vÆ°á»£t ngÆ°á»¡ng <span className="text-rose-600 font-extrabold underline">20%</span> táº¡i cÃ¡c má»‘c váº¯ng khÃ¡ch (&lt;50%), há»‡ thá»‘ng tá»± Ä‘á»™ng Ä‘á» xuáº¥t kÃ­ch hoáº¡t chiáº¿n dá»‹ch Voucher Loyalty Win-back!
          </div>
        </div>
      </div>
          <h3 className="font-bold text-base text-slate-850 font-outfit">Quản lý Cấu hình Washbay &amp; Slots</h3>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Danh sách các khoang rửa và khung giờ khả dụng.</p>
      <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="mb-4">
          <h3 className="font-bold text-base text-slate-850 font-outfit">Quản lý Cấu hình Washbay & Slots</h3>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Danh sách các khoang rửa và khung giờ khả dụng.</p>
        </div>
        <WashbayGrid selectedDate={period === 'today' ? new Date().toISOString().split('T')[0] : null} />
      </div>

    </div>
  );
};

export default AdminDashboardPage;

