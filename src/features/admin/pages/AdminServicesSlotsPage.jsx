import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Clock, 
  Plus, 
  Edit, 
  X, 
  Layers, 
  Coins, 
  Info,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Cpu,
  Calendar,
  Trash2
} from 'lucide-react';
import { serviceCatalogApi } from '../services/serviceCatalogApi';

const formatDayOfWeek = (dow) => {
  if (!dow || dow === 'ALL') return 'Mọi ngày (T2 - CN)';
  if (dow === 'WEEKDAY') return 'Ngày thường (T2 - T6)';
  if (dow === 'WEEKEND') return 'Cuối tuần (T7 - CN)';
  const map = { MON: 'Thứ 2', TUE: 'Thứ 3', WED: 'Thứ 4', THU: 'Thứ 5', FRI: 'Thứ 6', SAT: 'Thứ 7', SUN: 'Chủ Nhật' };
  return map[dow] || dow;
};

export default function AdminServicesSlotsPage() {
  // 1. Navigation Active Tab
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'slots'
  const [catalogSubTab, setCatalogSubTab] = useState('core'); // 'core' or 'addons'

  // 2. Mock Databases
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);

  const [closures, setClosures] = useState([]);
  const [closureModalOpen, setClosureModalOpen] = useState(false);
  const [closureForm, setClosureForm] = useState({
    closureDate: '',
    reason: '',
    isFullDay: true
  });

  // Nạp cấu hình services, slots và closures từ Backend API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesData, slotsData, closuresData] = await Promise.all([
          serviceCatalogApi.getAllServices(),
          serviceCatalogApi.getAllSlots(),
          serviceCatalogApi.getAllClosures()
        ]);
        setServices(servicesData);
        setSlots(slotsData);
        setClosures(closuresData);
        localStorage.setItem('autowash_admin_services_db', JSON.stringify(servicesData));
        localStorage.setItem('autowash_slots', JSON.stringify(slotsData));
      } catch (err) {
        console.error('Failed to load catalog/slots/closures from API:', err);
      }
    };
    loadData();
  }, []);

  // Modals and Forms State
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null); // null means adding new

  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(null);

  // Temporary Form Inputs
  const [serviceForm, setServiceForm] = useState({
    name: '',
    price: '',
    duration: '',
    type: 'core',
    desc: ''
  });

  const [slotForm, setSlotForm] = useState({
    time: '',
    maxCapacity: ''
  });

  // Handlers for Closures
  const handleSaveClosure = async (e) => {
    e.preventDefault();
    if (!closureForm.closureDate) {
      alert('Vui lòng chọn ngày đóng cửa!');
      return;
    }
    try {
      const created = await serviceCatalogApi.createClosure(closureForm);
      setClosures(prev => [...prev, created]);
      alert('Đã thêm ngày nghỉ lễ thành công!');
      setClosureModalOpen(false);
      setClosureForm({ closureDate: '', reason: '', isFullDay: true });
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Lỗi khi thêm ngày nghỉ!';
      alert(errMsg);
    }
  };

  const handleDeleteClosure = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ngày nghỉ này và mở cửa hoạt động lại?')) return;
    try {
      await serviceCatalogApi.deleteClosure(id);
      setClosures(prev => prev.filter(c => c.garageClosureId !== id));
      alert('Đã mở cửa hoạt động lại thành công!');
    } catch (err) {
      alert('Lỗi khi xóa ngày nghỉ!');
    }
  };

  // Handlers for Services
  const handleToggleService = async (id) => {
    const target = services.find(s => s.id === id);
    if (!target) return;

    if (['PKG-STD', 'PKG-DELUXE', 'PKG-ULTIMATE'].includes(target.serviceCode || target.id)) {
      alert('Không thể tắt hoạt động của gói dịch vụ hệ thống cốt lõi!');
      return;
    }

    await serviceCatalogApi.toggleServiceStatus(id, target.serviceId);
    setServices(prev => prev.map(s => {
      if (s.id === id) {
        const nextState = !s.isActive;
        alert(`Đã ${nextState ? 'Bật' : 'Tắt'} hoạt động của dịch vụ: ${s.name}`);
        return { ...s, isActive: nextState };
      }
      return s;
    }));
  };

  const handleOpenAddService = () => {
    setCurrentService(null);
    setServiceForm({
      name: '',
      price: '',
      duration: '',
      type: catalogSubTab,
      desc: ''
    });
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (service) => {
    setCurrentService(service);
    setServiceForm({
      name: service.name,
      price: service.price,
      duration: service.duration,
      type: service.type,
      desc: service.desc
    });
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceForm.name.trim() || !serviceForm.price || !serviceForm.duration) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc!');
      return;
    }

    if (currentService) {
      const updated = await serviceCatalogApi.updateService(currentService.id, { ...serviceForm, id: currentService.id, serviceId: currentService.serviceId });
      setServices(prev => prev.map(s => (s.id === currentService.id ? { ...s, ...updated } : s)));
      alert(`Đã chỉnh sửa dịch vụ thành công!`);
    } else {
      const created = await serviceCatalogApi.createService(serviceForm);
      setServices(prev => [...prev, created]);
      alert(`Đã thêm mới dịch vụ thành công!`);
    }
    setServiceModalOpen(false);
  };

  // Handlers for Slots
  const handleToggleSlot = async (id) => {
    const target = slots.find(sl => sl.id === id);
    if (!target) return;
    await serviceCatalogApi.toggleSlotStatus(id, target.timeSlotId);
    setSlots(prev => {
      const next = prev.map(sl => {
        if (sl.id === id) {
          const nextState = !sl.isActive;
          alert(`Đã ${nextState ? 'Kích hoạt' : 'Tạm dừng'} hoạt động khung giờ ${sl.time}`);
          return { ...sl, isActive: nextState };
        }
        return sl;
      });
      localStorage.setItem('autowash_slots', JSON.stringify(next));
      return next;
    });
  };

  const handleOpenEditSlot = (slot) => {
    setCurrentSlot(slot);
    setSlotForm({
      time: slot.time,
      maxCapacity: slot.maxCapacity,
      dayOfWeek: slot.dayOfWeek || 'ALL'
    });
    setSlotModalOpen(true);
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    if (!slotForm.maxCapacity) {
      alert('Vui lòng nhập công suất tối đa!');
      return;
    }

    try {
      await serviceCatalogApi.updateSlot(currentSlot.id, slotForm, currentSlot.timeSlotId);
      setSlots(prev => {
        const next = prev.map(sl => {
          if (sl.id === currentSlot.id) {
            return {
              ...sl,
              maxCapacity: Number(slotForm.maxCapacity),
              dayOfWeek: slotForm.dayOfWeek || 'ALL'
            };
          }
          return sl;
        });
        localStorage.setItem('autowash_slots', JSON.stringify(next));
        alert(`Đã cập nhật cấu hình khung giờ ${currentSlot.time} thành công!`);
        return next;
      });
      setSlotModalOpen(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Lỗi không xác định khi cập nhật khung giờ!';
      alert(errMsg);
    }
  };

  const totalDailyCapacity = slots.filter(sl => sl.isActive).reduce((sum, sl) => sum + sl.maxCapacity, 0);

  return (
    <div className="flex flex-col h-full bg-[#f7fafd] text-slate-800 p-5 space-y-5 overflow-hidden">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight font-outfit">Services & Slots Manager</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Quản lý danh mục gói rửa xe đồng giá, add-on đi kèm và công suất khung giờ mẫu (Không có thông số khoang rửa).</p>
        </div>

        {/* Tab switchers */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-1 flex gap-1 text-xs text-slate-500 shadow-sm self-start md:self-auto z-10">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4.5 py-2 rounded-lg font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Danh mục dịch vụ ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`px-4.5 py-2 rounded-lg font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'slots'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Khung giờ mẫu ({slots.length})
          </button>
          <button
            onClick={() => setActiveTab('closures')}
            className={`px-4.5 py-2 rounded-lg font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'closures'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Lịch nghỉ trạm ({closures.length})
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TAB CONTENT: SERVICE CATALOG                          */}
      {/* ======================================================== */}
      {activeTab === 'catalog' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          
          {/* Flat pricing alert banner */}
          <div className="flex items-center gap-3 p-3 bg-indigo-50/50 border border-indigo-100 text-indigo-900 rounded-2xl shadow-sm shrink-0">
            <Cpu className="w-5 h-5 text-indigo-600 shrink-0" />
            <div className="text-xs font-semibold">
              <span className="font-extrabold text-indigo-850">Chế độ Đồng giá xe máy hoạt động:</span> Hệ thống áp dụng mức giá đồng đều cho mọi dòng xe. Admin chỉ cần chỉnh sửa một khung giá trị cho gói chính hoặc add-on.
            </div>
          </div>

          {/* Subheader */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
            <div className="bg-white border border-slate-200/80 rounded-xl p-1 flex gap-1 text-[11px] text-slate-500 shadow-sm w-full sm:w-auto">
              <button
                onClick={() => setCatalogSubTab('core')}
                className={`px-4 py-1.5 rounded-lg text-center font-bold transition-all cursor-pointer ${
                  catalogSubTab === 'core' ? 'bg-indigo-650 text-white shadow-sm' : 'hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                Gói dịch vụ chính ({services.filter(s=>s.type==='core').length})
              </button>
              <button
                onClick={() => setCatalogSubTab('addons')}
                className={`px-4 py-1.5 rounded-lg text-center font-bold transition-all cursor-pointer ${
                  catalogSubTab === 'addons' ? 'bg-indigo-650 text-white shadow-sm' : 'hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                Dịch vụ đi kèm / Add-on ({services.filter(s=>s.type==='addons').length})
              </button>
            </div>

            <button
              onClick={handleOpenAddService}
              className="w-full sm:w-auto bg-[#0047AB] hover:bg-[#003a8c] text-white text-xs font-black py-2.5 px-4.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm dịch vụ mới
            </button>
          </div>

          {/* List catalog table */}
          <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider z-10">
                  <tr>
                    <th className="py-3 px-5">Mã dịch vụ</th>
                    <th className="py-3 px-4">Tên dịch vụ</th>
                    <th className="py-3 px-4">Giá niêm yết (Đồng giá)</th>
                    <th className="py-3 px-4">Thời lượng dọn</th>
                    <th className="py-3 px-4">Mô tả chi tiết</th>
                    <th className="py-3 px-4 text-center">Trạng thái bán</th>
                    <th className="py-3 px-5 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {services.filter(s => s.type === catalogSubTab).map(s => (
                    <tr key={s.id} className={`hover:bg-slate-50/50 transition-colors ${!s.isActive ? 'opacity-60 bg-slate-50/20' : ''}`}>
                      <td className="py-3.5 px-5 font-black text-slate-800">{s.id}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-850">{s.name}</td>
                      <td className="py-3.5 px-4 font-black text-indigo-700 text-sm">{s.price.toLocaleString('vi-VN')} đ</td>
                      <td className="py-3.5 px-4 font-bold text-slate-650 flex items-center gap-1.5 mt-2">
                        <Clock className="w-3.5 h-3.5 text-slate-450" />
                        {s.duration} phút
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium max-w-sm truncate" title={s.desc}>{s.desc}</td>
                      <td className="py-3.5 px-4 text-center">
                        {['PKG-STD', 'PKG-DELUXE', 'PKG-ULTIMATE'].includes(s.serviceCode || s.id) ? (
                          <span className="inline-flex items-center gap-1 text-indigo-700 font-extrabold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 cursor-not-allowed" title="Dịch vụ hệ thống cố định">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                            🔒 Cố định
                          </span>
                        ) : (
                          <button onClick={() => handleToggleService(s.id)} className="focus:outline-none transition-transform hover:scale-[1.05] inline-block">
                            {s.isActive ? (
                              <span className="flex items-center gap-1 text-emerald-600 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                Đang bán
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-slate-400 font-bold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                                Ngưng bán
                              </span>
                            )}
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <button onClick={() => handleOpenEditService(s)} className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-slate-660 transition-all flex items-center gap-1 font-bold cursor-pointer">
                          <Edit className="w-3.5 h-3.5" />
                          Sửa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TAB CONTENT: SLOT TEMPLATES (NO BAYS)                 */}
      {/* ======================================================== */}
      {activeTab === 'slots' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          
          {/* Capacity KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
            <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Tổng công suất ngày</span>
                <h4 className="text-xl font-black text-indigo-700 font-outfit mt-1">{totalDailyCapacity} xe / ngày</h4>
              </div>
              <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Khung giờ hoạt động mẫu</span>
                <h4 className="text-xl font-black text-slate-800 font-outfit mt-1">{slots.filter(sl=>sl.isActive).length} khung giờ</h4>
              </div>
              <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-500" />
              </div>
            </div>
          </div>

          {/* Slots Table */}
          <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider z-10">
                  <tr>
                    <th className="py-3 px-5">Mã Slot</th>
                    <th className="py-3 px-4">Khung giờ hoạt động</th>
                    <th className="py-3 px-4">Công suất tối đa (xe / giờ)</th>
                    <th className="py-3 px-4">Áp dụng cho</th>
                    <th className="py-3 px-4 text-center">Trạng thái vận hành</th>
                    <th className="py-3 px-5 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {slots.map(sl => (
                    <tr key={sl.id} className={`hover:bg-slate-50/50 transition-colors ${!sl.isActive ? 'opacity-65 bg-slate-50/20' : ''}`}>
                      <td className="py-3.5 px-5 font-black text-slate-800">{sl.id}</td>
                      <td className="py-3.5 px-4 font-black text-slate-750 text-sm">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {sl.time}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-indigo-700 text-sm">{sl.maxCapacity} xe / tiếng</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${sl.dayOfWeek === 'WEEKEND' ? 'bg-amber-50 text-amber-700 border-amber-200' : sl.dayOfWeek === 'WEEKDAY' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {formatDayOfWeek(sl.dayOfWeek)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button onClick={() => handleToggleSlot(sl.id)} className="focus:outline-none transition-transform hover:scale-[1.05] inline-block">
                          {sl.isActive ? (
                            <span className="flex items-center gap-1 text-emerald-600 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              Kích hoạt
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-400 font-bold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                              Tạm dừng
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <button onClick={() => handleOpenEditSlot(sl)} className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-slate-650 font-bold cursor-pointer inline-block mx-auto">
                          <Edit className="w-3.5 h-3.5" />
                          Sửa công suất
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* MODAL: ADD & EDIT SERVICE */}
      {serviceModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-extrabold text-slate-850 flex items-center gap-1.5">
                <Wrench className="w-5 h-5 text-indigo-655" />
                {currentService ? `Chỉnh sửa: ${currentService.id}` : 'Thêm mới Dịch vụ'}
              </h3>
              <button onClick={() => setServiceModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Tên dịch vụ *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Rửa xe bọt tuyết..."
                  value={serviceForm.name}
                  onChange={e => setServiceForm({...serviceForm, name: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Giá dịch vụ (đ) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ví dụ: 70000"
                    value={serviceForm.price}
                    onChange={e => setServiceForm({...serviceForm, price: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Thời lượng (phút) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ví dụ: 20"
                    value={serviceForm.duration}
                    onChange={e => setServiceForm({...serviceForm, duration: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Phân loại dịch vụ *</label>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    disabled={currentService && ['PKG-STD', 'PKG-DELUXE', 'PKG-ULTIMATE'].includes(currentService.serviceCode || currentService.id)}
                    onClick={() => setServiceForm({...serviceForm, type: 'core'})} 
                    className={`flex-1 py-2 rounded-xl border font-bold text-center transition-all ${currentService && ['PKG-STD', 'PKG-DELUXE', 'PKG-ULTIMATE'].includes(currentService.serviceCode || currentService.id) ? 'cursor-not-allowed opacity-70 bg-slate-100 text-slate-400 border-slate-200' : serviceForm.type === 'core' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    Gói chính
                  </button>
                  <button 
                    type="button" 
                    disabled={currentService && ['PKG-STD', 'PKG-DELUXE', 'PKG-ULTIMATE'].includes(currentService.serviceCode || currentService.id)}
                    onClick={() => setServiceForm({...serviceForm, type: 'addons'})} 
                    className={`flex-1 py-2 rounded-xl border font-bold text-center transition-all ${currentService && ['PKG-STD', 'PKG-DELUXE', 'PKG-ULTIMATE'].includes(currentService.serviceCode || currentService.id) ? 'cursor-not-allowed opacity-70 bg-slate-100 text-slate-400 border-slate-200' : serviceForm.type === 'addons' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    Add-on
                  </button>
                </div>
                {currentService && ['PKG-STD', 'PKG-DELUXE', 'PKG-ULTIMATE'].includes(currentService.serviceCode || currentService.id) && (
                  <span className="text-[10px] text-slate-450 block mt-1">🔒 Gói dịch vụ hệ thống cố định</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Mô tả ngắn</label>
                <textarea
                  placeholder="Mô tả quy trình..."
                  value={serviceForm.desc}
                  onChange={e => setServiceForm({...serviceForm, desc: e.target.value})}
                  rows="3"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2 justify-end">
                <button type="button" onClick={() => setServiceModalOpen(false)} className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl">Hủy</button>
                <button type="submit" className="px-4.5 py-2.5 bg-indigo-600 text-white font-black rounded-xl">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TAB CONTENT: GARAGE CLOSURES                          */}
      {/* ======================================================== */}
      {activeTab === 'closures' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          <div className="flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 font-outfit">Lịch nghỉ lễ / Bảo trì toàn trạm</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Đặt ngày trạm đóng cửa nghỉ lễ hoặc bảo trì, hệ thống sẽ tự động khóa toàn bộ slot đặt lịch của ngày đó.</p>
            </div>
            <button
              onClick={() => {
                setClosureForm({ closureDate: '', reason: '', isFullDay: true });
                setClosureModalOpen(true);
              }}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm ngày nghỉ trạm
            </button>
          </div>

          <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-extrabold select-none">
                    <th className="px-5 py-3.5">Ngày nghỉ</th>
                    <th className="px-5 py-3.5">Lý do nghỉ</th>
                    <th className="px-5 py-3.5 text-center">Trạng thái</th>
                    <th className="px-5 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {closures.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-10 text-slate-400 font-medium">Không có ngày nghỉ nào được cấu hình.</td>
                    </tr>
                  ) : (
                    closures.map(c => (
                      <tr key={c.garageClosureId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 text-slate-900 font-black">
                          {new Date(c.closureDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4">{c.reason || 'Không có lý do'}</td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg font-black text-[10px]">Nghỉ trọn ngày</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleDeleteClosure(c.garageClosureId)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa ngày nghỉ (Mở cửa lại)"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CLOSURE */}
      {closureModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-extrabold text-slate-850 flex items-center gap-1.5 text-sm">
                <Calendar className="w-5 h-5 text-indigo-650" />
                Thêm lịch nghỉ lễ/Bảo trì
              </h3>
              <button onClick={() => setClosureModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveClosure} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Ngày nghỉ *</label>
                <input
                  type="date"
                  required
                  value={closureForm.closureDate}
                  onChange={e => setClosureForm({...closureForm, closureDate: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 font-outfit"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Lý do nghỉ / Tên dịp lễ *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tết Nguyên Đán, Bảo trì định kỳ..."
                  value={closureForm.reason}
                  onChange={e => setClosureForm({...closureForm, reason: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                />
              </div>

              <div className="flex gap-2.5 pt-2 justify-end">
                <button type="button" onClick={() => setClosureModalOpen(false)} className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl">Hủy</button>
                <button type="submit" className="px-4.5 py-2.5 bg-indigo-600 text-white font-black rounded-xl">Thêm mới</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SLOT */}
      {slotModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-extrabold text-slate-850 flex items-center gap-1.5 text-sm">
                <Clock className="w-5 h-5 text-indigo-650" />
                Cấu hình: {currentSlot.time}
              </h3>
              <button onClick={() => setSlotModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Công suất phục vụ tối đa (xe / giờ) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Ví dụ: 8"
                  value={slotForm.maxCapacity}
                  onChange={e => setSlotForm({...slotForm, maxCapacity: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-center"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Áp dụng cho ngày trong tuần *</label>
                <select
                  value={slotForm.dayOfWeek || 'ALL'}
                  onChange={e => setSlotForm({...slotForm, dayOfWeek: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                >
                  <option value="ALL">Mọi ngày (T2 - CN)</option>
                  <option value="WEEKDAY">Ngày thường (T2 - T6)</option>
                  <option value="WEEKEND">Cuối tuần (T7 - CN)</option>
                  <option value="MON">Thứ 2</option>
                  <option value="TUE">Thứ 3</option>
                  <option value="WED">Thứ 4</option>
                  <option value="THU">Thứ 5</option>
                  <option value="FRI">Thứ 6</option>
                  <option value="SAT">Thứ 7</option>
                  <option value="SUN">Chủ Nhật</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-2 justify-end">
                <button type="button" onClick={() => setSlotModalOpen(false)} className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl">Hủy</button>
                <button type="submit" className="px-4.5 py-2.5 bg-indigo-600 text-white font-black rounded-xl">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
