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
  const getRoles = () => {
    try {
      const userRolesRaw = localStorage.getItem('user_roles');
      if (userRolesRaw) {
        const parsed = JSON.parse(userRolesRaw);
        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === 'string') return [parsed];
      }
    } catch (e) {}

    try {
      const autowashUserRaw = localStorage.getItem('autowash_user');
      if (autowashUserRaw) {
        const user = JSON.parse(autowashUserRaw);
        const roles = user.roles || user.user?.roles || user.user_roles;
        if (Array.isArray(roles)) return roles;
        if (typeof roles === 'string') return [roles];
      }
    } catch (e) {}

    return [];
  };

  const roles = getRoles();
  const isManager = roles.includes('ROLE_MANAGER');
  const currentUser = {
    roleName: isManager ? 'ROLE_MANAGER' : (roles.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : 'ROLE_CASHIER')
  };

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
const [isSpecificSlotBlockEnabled, setIsSpecificSlotBlockEnabled] = useState(false);
const [selectedSlotId, setSelectedSlotId] = useState('');
const [availableSlots, setAvailableSlots] = useState([]);

  // ── Helpers: Sort slots by end time & re-assign sequential IDs ──
  const appendSeconds = (timeStr) => {
    // Converts "HH:MM" to "HH:MM:SS", leaves "HH:MM:SS" unchanged
    return timeStr.replace(/\b(\d{2}:\d{2})\b(?!:\d{2})/g, '$1:00');
  };

  const sortAndReIndexSlots = (slotArray) => {
    // Extract end time string for sorting (supports "HH:MM - HH:MM" and "HH:MM:SS - HH:MM:SS")
    const getEndTimeSortKey = (slot) => {
      if (!slot.time) return '99:99:99';
      const parts = slot.time.split('-').map(s => s.trim());
      const endPart = parts[1] || parts[0] || '99:99:99';
      // Normalize to HH:MM:SS for consistent comparison
      return appendSeconds(endPart);
    };

    const sorted = [...slotArray].sort((a, b) => {
      const endA = getEndTimeSortKey(a);
      const endB = getEndTimeSortKey(b);
      return endA.localeCompare(endB);
    });

    // Re-assign sequential display IDs
    return sorted.map((sl, idx) => ({
      ...sl,
      id: `SL-${String(idx + 1).padStart(2, '0')}`
    }));
  };

  // Nạp cấu hình services, slots và closures từ Backend API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesData, slotsData, closuresData] = await Promise.all([
          serviceCatalogApi.getAllServices(),
          serviceCatalogApi.getAllSlots(),
          serviceCatalogApi.getAllClosures()
        ]);
        const sortedPackages = [...servicesData].sort((a, b) => Number(a.price) - Number(b.price));
        setServices(sortedPackages);
        const sortedSlots = sortAndReIndexSlots(slotsData);
        setSlots(sortedSlots);
        setClosures(closuresData);
        localStorage.setItem('autowash_admin_services_db', JSON.stringify(sortedPackages));
        localStorage.setItem('autowash_slots', JSON.stringify(sortedSlots));
      } catch (err) {
        console.error('Failed to load catalog/slots/closures from API:', err);
      }
    };
    loadData();
  }, []);

  // Modals and Forms State
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const setIsAddModalOpen = setServiceModalOpen;
  const [currentService, setCurrentService] = useState(null); // null means adding new
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdServiceData, setCreatedServiceData] = useState(null);

  useEffect(() => {
    let timer;
    if (showSuccessModal) {
      timer = setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccessModal]);

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

  // Add Slot Modal State
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const setIsSlotModalOpen = setIsAddSlotModalOpen;
  const [showSlotSuccessModal, setShowSlotSuccessModal] = useState(false);
  const [createdSlotTime, setCreatedSlotTime] = useState('');

  useEffect(() => {
    let timer;
    if (showSlotSuccessModal) {
      timer = setTimeout(() => {
        setShowSlotSuccessModal(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSlotSuccessModal]);

  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotMaxCapacity, setNewSlotMaxCapacity] = useState(8);

  const [createdHolidayData, setCreatedHolidayData] = useState(null);
  const [showHolidaySuccessModal, setShowHolidaySuccessModal] = useState(false);

  useEffect(() => {
    let timer;
    if (showHolidaySuccessModal) {
      timer = setTimeout(() => {
        setShowHolidaySuccessModal(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showHolidaySuccessModal]);

  useEffect(() => {
  if (isSpecificSlotBlockEnabled && closureForm.closureDate) {
    const fetchSlots = async () => {
      try {
        const data = await serviceCatalogApi.getAllSlots();
        setAvailableSlots(data.filter(s => s.isActive !== false));
      } catch {
        setAvailableSlots([...slots].filter(s => s.isActive));
      }
    };
    fetchSlots();
  }
}, [isSpecificSlotBlockEnabled, closureForm.closureDate, slots]);

const fetchHolidays = async () => {
  try {
    const closuresData = await serviceCatalogApi.getAllClosures();
    setClosures(closuresData);
  } catch (err) {
    console.error('Failed to load closures from API:', err);
  }
};

const handleLockSlot = async (e) => {
  if (e) e.preventDefault();
  if (!closureForm.closureDate) {
    alert('Vui lòng chọn ngày nghỉ!');
    return;
  }
  if (!selectedSlotId) {
    alert('Vui lòng chọn khung giờ cần khóa!');
    return;
  }
  
  const slotObj = availableSlots.find(s => Number(s.id || s.slotId || s.timeSlotId) === Number(selectedSlotId)) || slots.find(s => Number(s.id || s.timeSlotId || s.slotId) === Number(selectedSlotId));
  const slotTimeText = slotObj ? slotObj.time : 'Khung giờ đã chọn';
  const closureDateVal = closureForm.closureDate;
  const reasonVal = closureForm.reason;

  try {
    await serviceCatalogApi.lockSingleSlot({
      date: closureDateVal,
      slotId: Number(selectedSlotId),
      lock: true
    });
    
    setCreatedHolidayData({
      isSlotOnly: true,
      date: closureDateVal,
      slotTime: slotTimeText,
      reason: reasonVal || 'Bảo trì định kỳ'
    });

    setClosureModalOpen(false);
    setClosureForm({ closureDate: '', reason: '', isFullDay: true });
    setIsSpecificSlotBlockEnabled(false);
    setSelectedSlotId('');
    setAvailableSlots([]);

    await fetchHolidays();
    setShowHolidaySuccessModal(true);
  } catch (err) {
    const errMsg = err.response?.data?.message || err.message || 'Lỗi khi khóa khung giờ!';
    alert(errMsg);
  }
};

const handleSaveClosure = async (e) => {
  e.preventDefault();
  if (!closureForm.closureDate) {
    alert('Vui lòng chọn ngày đóng cửa!');
    return;
  }
  
  const closureDateVal = closureForm.closureDate;
  const reasonVal = closureForm.reason;

  try {
    const created = await serviceCatalogApi.createClosure(closureForm);
    setClosures(prev => [...prev, created]);
    
    setCreatedHolidayData({
      isSlotOnly: false,
      date: closureDateVal,
      reason: reasonVal || 'Bảo trì định kỳ'
    });

    setClosureModalOpen(false);
    setClosureForm({ closureDate: '', reason: '', isFullDay: true });
    setIsSpecificSlotBlockEnabled(false);

    await fetchHolidays();
    setShowHolidaySuccessModal(true);
  } catch (err) {
    const errMsg = err.response?.data?.message || err.message || 'Lỗi khi thêm ngày nghỉ!';
    alert(errMsg);
  }
};

const handleDeleteClosure = async (id) => {
  const target = closures.find(c => (c.closureId || c.garageClosureId) === id);
  if (!target) return;

  if (target.isFullDay === false) {
    if (!confirm('Bạn có chắc chắn muốn mở khóa cho khung giờ này?')) {
      return;
    }
    try {
      await serviceCatalogApi.lockSingleSlot({
        date: target.closureDate,
        slotId: target.slotId,
        lock: false
      });
      setClosures(prev => prev.filter(c => (c.closureId || c.garageClosureId) !== id));
      alert('Đã mở khóa khung giờ thành công!');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Lỗi khi mở khóa khung giờ!';
      alert(errMsg);
    }
    return;
  }

  if (!confirm('Bạn có chắc chắn muốn mở cửa hoạt động lại cho ngày nghỉ này?')) {
    return;
  }
  try {
    await serviceCatalogApi.deleteClosure(id);
    setClosures(prev => prev.filter(c => c.closureId !== id && c.garageClosureId !== id));
    alert('Đã mở cửa hoạt động lại thành công!');
  } catch (err) {
    const errMsg = err.response?.data?.message || err.message || 'Lỗi khi xóa lịch nghỉ!';
    alert(errMsg);
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

  const fetchServices = async () => {
    try {
      const servicesData = await serviceCatalogApi.getAllServices();
      const sortedPackages = [...servicesData].sort((a, b) => Number(a.price) - Number(b.price));
      setServices(sortedPackages);
      localStorage.setItem('autowash_admin_services_db', JSON.stringify(sortedPackages));
    } catch (err) {
      console.error('Failed to load services from API:', err);
    }
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceForm.name.trim() || !serviceForm.price || !serviceForm.duration) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc!');
      return;
    }

    const serviceName = serviceForm.name;

    try {
      if (currentService) {
        const updated = await serviceCatalogApi.updateService(currentService.id, { ...serviceForm, id: currentService.id, serviceId: currentService.serviceId });
        setServices(prev => prev.map(s => (s.id === currentService.id ? { ...s, ...updated } : s)));
      } else {
        const created = await serviceCatalogApi.createService(serviceForm);
        setServices(prev => [...prev, created]);
      }
      
      setCreatedServiceData({
        name: serviceName,
        price: Number(serviceForm.price),
        duration: serviceForm.duration,
        category: serviceForm.type === 'core' ? 'Gói chính' : 'Add-on'
      });
      setIsAddModalOpen(false);
      setServiceForm({
        name: '',
        price: '',
        duration: '',
        type: 'core',
        desc: ''
      });
      await fetchServices();
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Đã xảy ra lỗi khi lưu dịch vụ: ' + error.message);
    }
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

  const fetchSlots = async () => {
    try {
      const slotsData = await serviceCatalogApi.getAllSlots();
      const sortedSlots = sortAndReIndexSlots(slotsData);
      setSlots(sortedSlots);
      localStorage.setItem('autowash_slots', JSON.stringify(sortedSlots));
    } catch (err) {
      console.error('Failed to load slots from API:', err);
    }
  };

  // Handler: Add New Slot with validation + API integration (HH:MM:SS format)
  const handleAddSlot = async (e) => {
    e.preventDefault();

    // Validate time range format: "HH:MM - HH:MM" or "HH:MM:SS - HH:MM:SS"
    const timeRangeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?\s*-\s*([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
    if (!newSlotTime.trim() || !timeRangeRegex.test(newSlotTime.trim())) {
      alert('Định dạng khung giờ không hợp lệ! Vui lòng nhập theo mẫu: HH:MM - HH:MM (ví dụ: 19:00 - 20:00)');
      return;
    }

    // Validate capacity is a positive integer
    const capacityNum = parseInt(newSlotMaxCapacity, 10);
    if (isNaN(capacityNum) || capacityNum < 1) {
      alert('Công suất tối đa phải là số nguyên dương (≥ 1)!');
      return;
    }

    // Normalize time to HH:MM:SS format
    const normalizedTime = appendSeconds(newSlotTime.replace(/\s+/g, ' ').trim());

    // Frontend Duplicate Prevention Guard (strict unique constraint)
    const isDuplicate = slots.some(sl => {
      const existingNormalized = appendSeconds(sl.time.replace(/\s+/g, ' ').trim());
      return existingNormalized === normalizedTime;
    });
    if (isDuplicate) {
      alert('Khung giờ này đã tồn tại trên hệ thống! Vui lòng nhập một khung giờ khác.');
      return;
    }

    const slotTimeLabel = newSlotTime;

    try {
      const created = await serviceCatalogApi.createSlot({
        time: normalizedTime,
        maxCapacity: capacityNum
      });

      const newSlotObj = {
        ...created,
        id: `SL-NEW-${Date.now()}`, // Temporary; sortAndReIndexSlots will reassign
        time: normalizedTime,
        maxCapacity: capacityNum,
        dayOfWeek: 'ALL',
        isActive: true
      };

      setSlots(prev => {
        const next = sortAndReIndexSlots([...prev, newSlotObj]);
        localStorage.setItem('autowash_slots', JSON.stringify(next));
        return next;
      });

      setCreatedSlotTime(slotTimeLabel);
      setIsSlotModalOpen(false);
      setNewSlotTime('');
      setNewSlotMaxCapacity(8);
      await fetchSlots();
      setShowSlotSuccessModal(true);
    } catch (err) {
      // Backend Conflict Error Handling: route 409 / duplicate constraint violations
      const httpStatus = err.response?.status;
      const serverMessage = (err.response?.data?.message || err.message || '').toLowerCase();
      const isDuplicateConflict =
        httpStatus === 409 ||
        serverMessage.includes('duplicate') ||
        serverMessage.includes('unique') ||
        serverMessage.includes('conflict') ||
        serverMessage.includes('đã tồn tại') ||
        serverMessage.includes('already exists');

      if (isDuplicateConflict) {
        alert('Lỗi: Hệ thống ghi nhận khung giờ này đã tồn tại trong Database.');
      } else {
        const errMsg = err.response?.data?.message || err.message || 'Lỗi không xác định khi thêm khung giờ!';
        alert(`Thêm khung giờ thất bại: ${errMsg}`);
      }
    }
  };

  // Handler: Delete Slot with confirmation + API integration
  const handleDeleteSlot = async (slot) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa khung giờ ${slot.time} khỏi hệ thống không?`
    );
    if (!confirmed) return;

    try {
      await serviceCatalogApi.deleteSlot(slot.id, slot.timeSlotId);

      setSlots(prev => {
        const filtered = prev.filter(sl => sl.id !== slot.id);
        const next = sortAndReIndexSlots(filtered);
        localStorage.setItem('autowash_slots', JSON.stringify(next));
        return next;
      });

      alert('Xóa khung giờ thành công!');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Lỗi không xác định khi xóa khung giờ!';
      alert(`Xóa khung giờ thất bại: ${errMsg}`);
    }
  };

  const totalDailyCapacity = slots.filter(sl => sl.isActive).reduce((sum, sl) => sum + sl.maxCapacity, 0);

  return (
    <div className="flex flex-col h-full bg-[#f7fafd] text-slate-800 p-5 space-y-5 overflow-hidden font-sans">
      
      {/* 1. Page Header & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 pb-2 border-b border-slate-200/60">
        <div>
          <h2 className="text-xl font-black text-slate-850 tracking-tight font-outfit flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-600" />
            Services & Slots Manager
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Quản lý danh mục gói rửa xe đồng giá, add-on đi kèm, công suất slot mẫu và lịch đóng cửa trạm.</p>
        </div>

        {/* Tab switchers */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-1 flex gap-1 text-xs text-slate-500 shadow-sm self-start md:self-auto shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl font-extrabold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Danh mục dịch vụ</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'catalog' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'}`}>{services.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`px-4 py-2 rounded-xl font-extrabold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'slots'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Khung giờ mẫu</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'slots' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'}`}>{slots.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('closures')}
            className={`px-4 py-2 rounded-xl font-extrabold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'closures'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Lịch nghỉ trạm</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'closures' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'}`}>{closures.length}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TAB CONTENT: SERVICE CATALOG                          */}
      {/* ======================================================== */}
      {activeTab === 'catalog' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          
          {/* Flat pricing alert banner */}
          <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-indigo-50/90 via-blue-50/50 to-indigo-50/30 border border-indigo-100/80 text-indigo-950 rounded-2xl shadow-sm shrink-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0 font-bold">
              <Cpu className="w-4.5 h-4.5" />
            </div>
            <div className="text-xs font-semibold">
              <span className="font-extrabold text-indigo-850">Chế độ Đồng giá xe máy hoạt động:</span> Hệ thống áp dụng mức giá đồng đều cho mọi dòng xe. Admin chỉ cần chỉnh sửa một khung giá trị cho gói chính hoặc add-on.
            </div>
          </div>

          {/* Subheader */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-1 flex gap-1 text-xs text-slate-600 shadow-sm w-full sm:w-auto">
              <button
                onClick={() => setCatalogSubTab('core')}
                className={`px-4 py-2 rounded-xl text-center font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  catalogSubTab === 'core' 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Gói dịch vụ chính ({services.filter(s=>s.type==='core').length})
              </button>
              <button
                onClick={() => setCatalogSubTab('addons')}
                className={`px-4 py-2 rounded-xl text-center font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  catalogSubTab === 'addons' 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Dịch vụ đi kèm / Add-on ({services.filter(s=>s.type==='addons').length})
              </button>
            </div>

            {currentUser?.roleName !== 'ROLE_MANAGER' && (
              <button
                onClick={handleOpenAddService}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-2.5 px-4.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Thêm dịch vụ mới
              </button>
            )}
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
                          <button 
                            disabled={currentUser?.roleName === 'ROLE_MANAGER'}
                            onClick={() => handleToggleService(s.id)} 
                            className={`focus:outline-none transition-transform ${currentUser?.roleName !== 'ROLE_MANAGER' ? 'hover:scale-[1.05]' : 'cursor-not-allowed'} inline-block`}
                          >
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
                        {currentUser?.roleName !== 'ROLE_MANAGER' && (
                          <button onClick={() => handleOpenEditService(s)} className="p-1.5 bg-slate-55 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-slate-660 transition-all flex items-center gap-1 font-bold cursor-pointer">
                            <Edit className="w-3.5 h-3.5" />
                            Sửa
                          </button>
                        )}
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

          {currentUser?.roleName !== 'ROLE_MANAGER' && (
            <div className="flex items-center justify-end shrink-0">
              <button
                onClick={() => {
                  setNewSlotTime('');
                  setNewSlotMaxCapacity(8);
                  setIsAddSlotModalOpen(true);
                }}
                className="bg-[#0047AB] hover:bg-[#003a8c] text-white text-xs font-black py-2.5 px-4.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Thêm khung giờ mới
              </button>
            </div>
          )}

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
                        <button 
                          disabled={currentUser?.roleName === 'ROLE_MANAGER'}
                          onClick={() => handleToggleSlot(sl.id)} 
                          className={`focus:outline-none transition-transform ${currentUser?.roleName !== 'ROLE_MANAGER' ? 'hover:scale-[1.05]' : 'cursor-not-allowed'} inline-block`}
                        >
                          {sl.isActive ? (
                            <span className="flex items-center gap-1 text-emerald-600 font-extrabold bg-emerald-55 px-2.5 py-1 rounded-full border border-emerald-100">
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
                        {currentUser?.roleName !== 'ROLE_MANAGER' && (
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => handleOpenEditSlot(sl)} className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-slate-650 font-bold cursor-pointer inline-flex items-center gap-1">
                              <Edit className="w-3.5 h-3.5" />
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteSlot(sl)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-200 inline-flex items-center gap-1 font-bold"
                              title={`Xóa khung giờ ${sl.time}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Xóa
                            </button>
                          </div>
                        )}
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
          
          {/* Unified Subheader Bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 border border-amber-100">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-800 font-outfit">Lịch nghỉ lễ / Bảo trì toàn trạm</h3>
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[10px] font-black">
                    Đang có {closures.length} lịch đặt
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Đặt ngày trạm đóng cửa nghỉ lễ hoặc khóa slot lẻ. Hệ thống tự động ngăn chặn khách hàng đặt lịch.</p>
              </div>
            </div>

            {currentUser?.roleName !== 'ROLE_MANAGER' && (
              <button
                onClick={() => {
                  setClosureForm({ closureDate: '', reason: '', isFullDay: true });
                  setIsSpecificSlotBlockEnabled(false);
                  setSelectedSlotId('');
                  setAvailableSlots([]);
                  setClosureModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow whitespace-nowrap self-start md:self-auto"
              >
                <Plus className="w-4 h-4" />
                Thêm ngày nghỉ trạm
              </button>
            )}
          </div>

          {closures.length === 0 ? (
            <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 animate-pulse">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm">Chưa có lịch đóng cửa/khóa slot nào</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs font-semibold">Tất cả các ngày đều đang mở cửa hoạt động bình thường. Nhấn nút thêm mới để thiết lập lịch nghỉ lễ hoặc ngày bảo trì.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...closures]
                  .sort((a, b) => new Date(a.closureDate) - new Date(b.closureDate))
                  .map(c => {
                    const closureId = c.closureId || c.garageClosureId;
                    const isFullDay = c.isFullDay !== false;
                    
                    const formattedDate = new Date(c.closureDate).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    });

                    return (
                      <div 
                        key={closureId} 
                        className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
                        style={{ borderTop: isFullDay ? '3px solid #f59e0b' : '3px solid #ef4444' }}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] text-slate-400 font-extrabold capitalize">{formattedDate.split(',')[0]}</span>
                            {isFullDay ? (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100/80 rounded-lg font-black text-[9px] uppercase tracking-wider">Nghỉ trọn ngày</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100/80 rounded-lg font-black text-[9px] uppercase tracking-wider">Khóa khung giờ</span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-slate-800 text-sm mb-1">
                            {new Date(c.closureDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </h4>
                          <p className="text-xs text-slate-500 font-semibold mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100 min-h-[44px]">
                            {c.reason || 'Không có lý do được mô tả.'}
                          </p>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <span className="text-[9px] text-slate-400 font-medium">Mã: #{closureId?.toString().slice(-4)}</span>
                          {currentUser?.roleName !== 'ROLE_MANAGER' && (
                            <button
                              onClick={() => handleDeleteClosure(closureId)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all hover:scale-105 flex items-center gap-1 cursor-pointer font-bold text-[10px]"
                              title="Xóa cấu hình này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Mở cửa lại
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD CLOSURE */}
      {closureModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={isSpecificSlotBlockEnabled ? "bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100" : "bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-100"}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 flex items-center gap-1.5 text-sm">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Thêm lịch nghỉ lễ/Bảo trì
              </h3>
              <button onClick={() => { setClosureModalOpen(false); setIsSpecificSlotBlockEnabled(false); }} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={isSpecificSlotBlockEnabled ? handleLockSlot : handleSaveClosure} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Ngày nghỉ *</label>
                <input
                  type="date"
                  required
                  value={closureForm.closureDate}
                  onChange={e => { setClosureForm({...closureForm, closureDate: e.target.value}); setSelectedSlotId(''); }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 font-outfit"
                />
              </div>

              {isSpecificSlotBlockEnabled && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Chọn khung giờ cần khóa *</label>
                  <select
                    required
                    value={selectedSlotId}
                    onChange={e => setSelectedSlotId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                  >
                    <option value="">-- Chọn khung giờ --</option>
                    {availableSlots.map(sl => (
                      <option key={sl.id} value={sl.timeSlotId || sl.id}>
                        {sl.time}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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

              <div className="flex items-center gap-2.5 py-2 px-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <input
                  type="checkbox"
                  id="toggleSpecificSlot"
                  checked={isSpecificSlotBlockEnabled}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsSpecificSlotBlockEnabled(checked);
                    if (!checked) {
                      setSelectedSlotId('');
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
                <label htmlFor="toggleSpecificSlot" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  🔒 Chỉ khóa một khung giờ cụ thể (thay vì đóng cửa toàn ngày)
                </label>
              </div>

              <div className="flex gap-2.5 pt-1 justify-end">
                <button type="button" onClick={() => { setClosureModalOpen(false); setIsSpecificSlotBlockEnabled(false); }} className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">Hủy</button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 font-black text-white rounded-xl shadow-sm transition-all cursor-pointer"
                  style={{ backgroundColor: isSpecificSlotBlockEnabled ? '#e8590c' : '#4f46e5' }}
                >
                  {isSpecificSlotBlockEnabled ? 'Khóa khung giờ' : 'Thêm ngày nghỉ'}
                </button>
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

      {/* MODAL: ADD NEW SLOT */}
      {isAddSlotModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-extrabold text-slate-850 flex items-center gap-1.5 text-sm">
                <Plus className="w-5 h-5 text-indigo-650" />
                Thêm khung giờ mới
              </h3>
              <button onClick={() => setIsAddSlotModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Khung giờ hoạt động *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 19:00 - 20:00"
                  value={newSlotTime}
                  onChange={e => setNewSlotTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 font-outfit tracking-wider"
                />
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Nhập định dạng: HH:MM - HH:MM (24 giờ)</p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Công suất phục vụ tối đa (xe / giờ) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="50"
                  placeholder="Ví dụ: 8"
                  value={newSlotMaxCapacity}
                  onChange={e => setNewSlotMaxCapacity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-center"
                />
              </div>

              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-indigo-700 font-semibold leading-relaxed">
                  Khung giờ mới sẽ được kích hoạt ngay lập tức và áp dụng cho mọi ngày trong tuần. Bạn có thể chỉnh sửa phạm vi áp dụng sau khi tạo.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2 justify-end">
                <button type="button" onClick={() => setIsAddSlotModalOpen(false)} className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">Hủy</button>
                <button type="submit" className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl cursor-pointer transition-colors">Thêm khung giờ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL FOR SERVICE SAVING */}
      {showSuccessModal && createdServiceData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 flex flex-col items-center text-center space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <div className="space-y-2 w-full">
              <h3 className="text-lg font-black text-slate-800 font-outfit">Lưu dịch vụ thành công!</h3>
              <p className="text-xs text-slate-500 font-medium">
                Thông tin chi tiết dịch vụ đã được cập nhật hệ thống:
              </p>
              
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-xs space-y-2 text-left w-full">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500">Tên dịch vụ</span>
                  <span className="font-black text-slate-800">{createdServiceData.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500">Phân loại</span>
                  <span className="font-black text-slate-800">{createdServiceData.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500">Thời gian thực hiện</span>
                  <span className="font-black text-slate-800">{createdServiceData.duration} phút</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500">Đơn giá gốc</span>
                  <span className="font-black text-indigo-700 font-mono">{(createdServiceData.price || 0).toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-2.5 font-bold text-xs transition-colors cursor-pointer"
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL FOR TIME SLOT CREATION */}
      {showSlotSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 flex flex-col items-center text-center space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800 font-outfit">Tạo khung giờ thành công!</h3>
              <p className="text-xs text-slate-500 font-medium">
                Khung giờ <strong className="text-slate-800 font-bold">{createdSlotTime}</strong> đã được thêm vào hệ thống vận hành.
              </p>
            </div>
            
            <button
              onClick={() => setShowSlotSuccessModal(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-2.5 font-bold text-xs transition-colors cursor-pointer"
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL FOR HOLIDAY/MAINTENANCE LOCK */}
      {showHolidaySuccessModal && createdHolidayData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 flex flex-col items-center text-center space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <div className="space-y-2 w-full">
              <h3 className="text-lg font-black text-slate-800 font-outfit">Khóa Lịch Thành Công!</h3>
              <p className="text-xs text-slate-500 font-medium">
                {createdHolidayData.isSlotOnly ? (
                  <>
                    Đã khóa slot <span className="bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded">{createdHolidayData.slotTime}</span> giờ ngày <span className="bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded">{createdHolidayData.date}</span> với lý do: <span className="font-bold text-slate-700">{createdHolidayData.reason}</span>
                  </>
                ) : (
                  <>
                    Đã khóa toàn bộ ngày <span className="bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded">{createdHolidayData.date}</span> với lý do: <span className="font-bold text-slate-700">{createdHolidayData.reason}</span>
                  </>
                )}
              </p>
            </div>
            
            <button
              onClick={() => {
                setShowHolidaySuccessModal(false);
                setCreatedHolidayData(null);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-2.5 font-bold text-xs transition-colors cursor-pointer"
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
