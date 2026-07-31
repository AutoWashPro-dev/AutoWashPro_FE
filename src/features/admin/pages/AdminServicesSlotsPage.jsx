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
import { hasPermission } from '../../../utils/rbac';

const formatDayOfWeek = (dow) => {
  if (!dow || dow === 'ALL') return 'Mọi ngày (T2 - CN)';
  if (dow === 'WEEKDAY') return 'Ngày thường (T2 - T6)';
  if (dow === 'WEEKEND') return 'Cuối tuần (T7 - CN)';
  const map = { MON: 'Thứ 2', TUE: 'Thứ 3', WED: 'Thứ 4', THU: 'Thứ 5', FRI: 'Thứ 6', SAT: 'Thứ 7', SUN: 'Chủ Nhật' };
  return map[dow] || dow;
};

// Chuỗi 24 giờ cố định (00:00 -> 23:45) chống lỗi AM/PM (CH/SA) trên trình duyệt
const TIME_OPTIONS_24H = (() => {
  const list = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      list.push(`${hh}:${mm}`);
    }
  }
  return list;
})();

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
  const isAdmin = roles.includes('ROLE_ADMIN');
  const currentUser = {
    roleName: isAdmin ? 'ROLE_ADMIN' : (isManager ? 'ROLE_MANAGER' : 'ROLE_CASHIER'),
    role: isAdmin ? 'ADMIN' : (isManager ? 'MANAGER' : 'CASHIER')
  };
  
  // ── Custom Toast & Confirmation Dialog States ──
  const [toast, setToast] = useState(null); // { type: 'success'|'warning'|'error', message: '...' }
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, confirmLabel, cancelLabel, summary, onConfirm, onCancel, isSubmitting, isDestructive }
  const [notificationModal, setNotificationModal] = useState(null); // { title, content, type }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 4500);
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
  const [currentService, setCurrentService] = useState(null); // null means adding new

  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(null);
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [showSlotSuccessModal, setShowSlotSuccessModal] = useState(false);
  const [createdSlotTime, setCreatedSlotTime] = useState('');

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
    startTime: '08:00',
    endTime: '08:30',
    maxCapacity: '',
    dayOfWeek: 'ALL'
  });

  // Add Slot Modal State
  const [newSlotStartTime, setNewSlotStartTime] = useState('19:00');
  const [newSlotEndTime, setNewSlotEndTime] = useState('19:30');
  const [newSlotMaxCapacity, setNewSlotMaxCapacity] = useState(3);
  const [newSlotDayOfWeek, setNewSlotDayOfWeek] = useState('ALL');

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

// Handlers for Closures
const handleLockSlot = (e) => {
  if (e) e.preventDefault();
  if (!closureForm.closureDate) {
    showToast('Vui lòng chọn ngày nghỉ!', 'warning');
    return;
  }
  if (!selectedSlotId) {
    showToast('Vui lòng chọn khung giờ cần khóa!', 'warning');
    return;
  }

  const selectedSlot = slots.find(sl => sl.timeSlotId === Number(selectedSlotId) || sl.id === selectedSlotId);
  const slotTime = selectedSlot ? selectedSlot.time : `ID: ${selectedSlotId}`;

  setConfirmDialog({
    title: 'Xác nhận thêm ngày nghỉ trạm',
    confirmLabel: 'Xác nhận lưu lịch nghỉ',
    cancelLabel: 'Kiểm tra lại',
    summary: [
      { label: 'Ngày nghỉ lễ', value: closureForm.closureDate },
      { label: 'Lý do nghỉ', value: 'Khóa khung giờ lẻ' },
      { label: 'Khung giờ bị ảnh hưởng', value: slotTime }
    ],
    onConfirm: async () => {
      try {
        await serviceCatalogApi.lockSingleSlot({
          date: closureForm.closureDate,
          slotId: Number(selectedSlotId),
          lock: true
        });
        showToast('Khóa thành công khung giờ được chọn cho ngày nghỉ trạm!');
        setNotificationModal({
          title: 'Tạo mới thành công!',
          content: `Lịch nghỉ trạm ngày ${closureForm.closureDate} (Khung giờ ${slotTime}) đã được thêm thành công vào hệ thống.`,
          type: 'success'
        });
        
        // Nạp lại toàn bộ cấu hình closures từ API để có dữ liệu thực tế và chuẩn ID từ DB
        const closuresData = await serviceCatalogApi.getAllClosures();
        setClosures(closuresData);

        setClosureModalOpen(false);
        setClosureForm({ closureDate: '', reason: '', isFullDay: true });
        setIsSpecificSlotBlockEnabled(false);
        setSelectedSlotId('');
        setAvailableSlots([]);
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Lỗi khi khóa khung giờ!';
        showToast(errMsg, 'error');
      }
    }
  });
};

const handleSaveClosure = (e) => {
  e.preventDefault();
  if (!closureForm.closureDate || !closureForm.reason.trim()) {
    showToast('Vui lòng nhập đầy đủ Ngày nghỉ và Lý do!', 'warning');
    return;
  }

  setConfirmDialog({
    title: 'Xác nhận thêm ngày nghỉ trạm',
    confirmLabel: 'Xác nhận lưu lịch nghỉ',
    cancelLabel: 'Kiểm tra lại',
    summary: [
      { label: 'Ngày nghỉ lễ', value: closureForm.closureDate },
      { label: 'Lý do nghỉ', value: closureForm.reason.trim() },
      { label: 'Khung giờ bị ảnh hưởng', value: 'Cả ngày (Full day)' }
    ],
    onConfirm: async () => {
      try {
        const created = await serviceCatalogApi.createClosure({
          closureDate: closureForm.closureDate,
          reason: closureForm.reason.trim(),
          isFullDay: true
        });

        setClosures(prev => [...prev, created]);
        showToast(`Đã thiết lập lịch nghỉ trạm ngày ${closureForm.closureDate} thành công!`);
        setNotificationModal({
          title: 'Tạo mới thành công!',
          content: `Lịch nghỉ trạm ngày ${closureForm.closureDate} đã được thêm thành công vào hệ thống.`,
          type: 'success'
        });
        setClosureModalOpen(false);
        setClosureForm({ closureDate: '', reason: '', isFullDay: true });
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Lỗi không xác định khi tạo ngày nghỉ!';
        showToast(errMsg, 'error');
      }
    }
  });
};

const handleDeleteClosure = (closureId) => {
  const target = closures.find(c => (c.closureId || c.garageClosureId) === closureId);
  const dateStr = target ? target.closureDate : '';
  setConfirmDialog({
    title: 'Xác nhận xóa ngày nghỉ trạm',
    confirmLabel: 'Xác nhận xóa',
    cancelLabel: 'Hủy bỏ',
    isDestructive: true,
    summary: [
      { label: 'Mục tiêu', value: `Xóa lịch nghỉ trạm ngày ${dateStr || ''}` },
      { label: 'Cảnh báo', value: 'Bạn có chắc chắn muốn xóa ngày nghỉ này không? Hành động này không thể hoàn tác.' }
    ],
    onConfirm: async () => {
      try {
        await serviceCatalogApi.deleteClosure(closureId);
        setClosures(prev => prev.filter(c => (c.closureId || c.garageClosureId) !== closureId));
        showToast('Đã mở cửa hoạt động lại trạm thành công!');
        setNotificationModal({
          title: 'Xóa thành công!',
          content: 'Đã xóa lịch nghỉ trạm khỏi hệ thống thành công.',
          type: 'success'
        });
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Lỗi khi xóa ngày nghỉ!';
        showToast(errMsg, 'error');
      }
    }
  });
};

// Handlers for Services
  const handleToggleService = async (id) => {
    const target = services.find(s => s.id === id);
    if (!target) return;

    if (['PKG-STD', 'PKG-DELUXE', 'PKG-ULTIMATE'].includes(target.serviceCode || target.id)) {
      showToast('Không thể tắt hoạt động của gói dịch vụ hệ thống cốt lõi!', 'error');
      return;
    }

    try {
      await serviceCatalogApi.toggleServiceStatus(id, target.serviceId);
      setServices(prev => prev.map(s => {
        if (s.id === id) {
          const nextState = !s.isActive;
          showToast(`Đã ${nextState ? 'Bật' : 'Tắt'} hoạt động của dịch vụ: ${s.name}`);
          return { ...s, isActive: nextState };
        }
        return s;
      }));
    } catch (err) {
      showToast('Lỗi khi cập nhật trạng thái dịch vụ: ' + err.message, 'error');
    }
  };

  const handleDeleteService = (id, serviceId) => {
    const target = services.find(s => s.id === id || s.serviceId === serviceId);
    const serviceName = target ? target.name : `ID: ${id}`;

    setConfirmDialog({
      title: `Xác nhận xóa vĩnh viễn ${serviceName}?`,
      confirmLabel: 'Xác nhận xóa vĩnh viễn',
      cancelLabel: 'Hủy bỏ',
      isDestructive: true,
      summary: [
        { label: 'Tên dịch vụ', value: serviceName },
        { label: 'Cảnh báo', value: 'Hành động này sẽ xóa dữ liệu khỏi hệ thống DB và không thể hoàn tác.' }
      ],
      onConfirm: async () => {
        try {
          await serviceCatalogApi.deleteService(id, serviceId);
          const freshData = await serviceCatalogApi.getAllServices();
          const sorted = [...freshData].sort((a, b) => Number(a.price) - Number(b.price));
          setServices(sorted);
          localStorage.setItem('autowash_admin_services_db', JSON.stringify(sorted));
          showToast('Xóa thành công!');
          setNotificationModal({
            title: 'Xóa thành công!',
            content: `Đã xóa vĩnh viễn dịch vụ ${serviceName} khỏi hệ thống DB thành công.`,
            type: 'success'
          });
        } catch (err) {
          showToast('Xóa gói dịch vụ thất bại: ' + (err.response?.data?.message || err.message), 'error');
        }
      }
    });
  };

  const handleOpenAddService = (type) => {
    setCurrentService(null);
    setServiceForm({
      name: '',
      price: '',
      duration: type === 'core' ? '15' : '10',
      type: type,
      desc: '',
      includedServiceIds: []
    });
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (service) => {
    setCurrentService(service);
    const incIds = (service.includedServices || []).map(s => s.serviceId || s.id);
    setServiceForm({
      name: service.name,
      price: service.price,
      duration: service.duration,
      type: service.type,
      desc: service.desc,
      includedServiceIds: incIds
    });
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceForm.name.trim() || !serviceForm.price || !serviceForm.duration) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'warning');
      return;
    }

    if (currentService) {
      try {
        const updated = await serviceCatalogApi.updateService(currentService.id, { ...serviceForm, id: currentService.id, serviceId: currentService.serviceId });
        setServices(prev => prev.map(s => (s.id === currentService.id ? { ...s, ...updated } : s)));
        showToast(`Đã chỉnh sửa dịch vụ thành công!`);
        setServiceModalOpen(false);
      } catch (err) {
        showToast('Chỉnh sửa dịch vụ thất bại: ' + (err.response?.data?.message || err.message), 'error');
      }
    } else {
      setConfirmDialog({
        title: 'Xác nhận thêm dịch vụ mới',
        confirmLabel: 'Xác nhận tạo',
        cancelLabel: 'Kiểm tra lại',
        summary: [
          { label: 'Tên dịch vụ', value: serviceForm.name.trim() },
          { label: 'Thời lượng', value: `${serviceForm.duration} phút` },
          { label: 'Đơn giá', value: `${Number(serviceForm.price).toLocaleString('vi-VN')} đ` },
          { label: 'Phân loại', value: serviceForm.type === 'core' ? 'Gói chính' : 'Add-on đi kèm' }
        ],
        onConfirm: async () => {
          try {
            const created = await serviceCatalogApi.createService(serviceForm);
            setServices(prev => [...prev, created]);
            showToast(`Đã thêm mới dịch vụ thành công!`);
            setNotificationModal({
              title: 'Tạo mới thành công!',
              content: `Dịch vụ ${serviceForm.name.trim()} đã được thêm thành công vào hệ thống.`,
              type: 'success'
            });
            setServiceModalOpen(false);
          } catch (err) {
            showToast('Thêm dịch vụ thất bại: ' + (err.response?.data?.message || err.message), 'error');
          }
        }
      });
    }
  };

  // Handlers for Slots
  const handleToggleSlot = async (id) => {
    const target = slots.find(sl => sl.id === id);
    if (!target) return;
    try {
      await serviceCatalogApi.toggleSlotStatus(id, target.timeSlotId);
      setSlots(prev => {
        const next = prev.map(sl => {
          if (sl.id === id) {
            const nextState = !sl.isActive;
            showToast(`Đã ${nextState ? 'Kích hoạt' : 'Tạm dừng'} hoạt động khung giờ ${sl.time}`);
            return { ...sl, isActive: nextState };
          }
          return sl;
        });
        localStorage.setItem('autowash_slots', JSON.stringify(next));
        return next;
      });
    } catch (err) {
      showToast('Cập nhật trạng thái khung giờ thất bại: ' + err.message, 'error');
    }
  };

  const handleOpenEditSlot = (slot) => {
    setCurrentSlot(slot);
    let start = slot.startTime || '';
    let end = slot.endTime || '';
    if (!start || !end) {
      const parts = (slot.time || '').split('-').map(p => p.trim());
      start = parts[0] ? parts[0].substring(0, 5) : '08:00';
      end = parts[1] ? parts[1].substring(0, 5) : '08:30';
    } else {
      start = start.substring(0, 5);
      end = end.substring(0, 5);
    }

    setSlotForm({
      time: slot.time,
      startTime: start,
      endTime: end,
      maxCapacity: slot.maxCapacity || 3,
      dayOfWeek: slot.dayOfWeek || 'ALL'
    });
    setSlotModalOpen(true);
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    const { startTime, endTime, maxCapacity, dayOfWeek } = slotForm;
    if (!startTime || !endTime) {
      showToast('Vui lòng chọn đầy đủ Giờ bắt đầu và Giờ kết thúc!', 'warning');
      return;
    }
    if (startTime >= endTime) {
      showToast('⚠️ Ràng buộc thời gian: Giờ bắt đầu phải nhỏ hơn Giờ kết thúc (ví dụ: 08:00 - 08:30)!', 'warning');
      return;
    }
    const capacityNum = parseInt(maxCapacity, 10);
    if (isNaN(capacityNum) || capacityNum < 1) {
      showToast('Công suất tối đa phải là số nguyên dương (≥ 1)!', 'warning');
      return;
    }

    const targetDay = dayOfWeek || 'ALL';

    // RÀNG BUỘC CHỐNG CHỒNG THỜI GIAN (Time Overlap Validation)
    const hasOverlap = slots.some(sl => {
      if (sl.id === currentSlot.id) return false;
      if (sl.isActive === false) return false;

      const slDay = sl.dayOfWeek || 'ALL';
      const dayConflict = targetDay === 'ALL' || slDay === 'ALL' || targetDay === slDay;
      if (!dayConflict) return false;

      let s2 = sl.startTime || '';
      let e2 = sl.endTime || '';
      if (!s2 || !e2) {
        const parts = (sl.time || '').split('-').map(p => p.trim());
        s2 = parts[0] ? parts[0].substring(0, 5) : '00:00';
        e2 = parts[1] ? parts[1].substring(0, 5) : '00:00';
      } else {
        s2 = s2.substring(0, 5);
        e2 = e2.substring(0, 5);
      }

      // Công thức trùng lặp giao thoa: S1 < E2 && S2 < E1
      return (startTime < e2 && s2 < endTime);
    });

    if (hasOverlap) {
      showToast(`⚠️ RÀNG BUỘC TRÙNG LẶP THỜI GIAN: Khung giờ [${startTime} - ${endTime}] bị giao thoa thời gian với một khung giờ sẵn có trên hệ thống! Vui lòng điều chỉnh lại khoảng giờ.`, 'error');
      return;
    }

    const formattedTime = `${startTime}:00 - ${endTime}:00`;

    try {
      await serviceCatalogApi.updateSlot(currentSlot.id, {
        time: formattedTime,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        maxCapacity: capacityNum,
        dayOfWeek: targetDay
      }, currentSlot.timeSlotId);

      setSlots(prev => {
        const next = sortAndReIndexSlots(prev.map(sl => {
          if (sl.id === currentSlot.id) {
            return {
              ...sl,
              time: formattedTime,
              startTime: `${startTime}:00`,
              endTime: `${endTime}:00`,
              maxCapacity: capacityNum,
              dayOfWeek: targetDay
            };
          }
          return sl;
        }));
        localStorage.setItem('autowash_slots', JSON.stringify(next));
        showToast(`Đã cập nhật cấu hình khung giờ (${startTime} - ${endTime}) thành công!`);
        return next;
      });
      setSlotModalOpen(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Lỗi không xác định khi cập nhật khung giờ!';
      showToast(errMsg, 'error');
    }
  };

  // Handler: Add New Slot with validation + Overlap Guard + API integration
  const handleAddSlot = (e) => {
    e.preventDefault();

    if (!newSlotStartTime || !newSlotEndTime) {
      showToast('Vui lòng chọn đầy đủ Giờ bắt đầu và Giờ kết thúc!', 'warning');
      return;
    }
    if (newSlotStartTime >= newSlotEndTime) {
      showToast('⚠️ Ràng buộc thời gian: Giờ bắt đầu phải nhỏ hơn Giờ kết thúc (ví dụ: 19:00 - 19:30)!', 'warning');
      return;
    }
    const capacityNum = parseInt(newSlotMaxCapacity, 10);
    if (isNaN(capacityNum) || capacityNum < 1) {
      showToast('Công suất tối đa phải là số nguyên dương (≥ 1)!', 'warning');
      return;
    }

    const targetDay = newSlotDayOfWeek || 'ALL';

    // RÀNG BUỘC CHỐNG CHỒNG THỜI GIAN (Time Overlap Validation Guard)
    const hasOverlap = slots.some(sl => {
      if (sl.isActive === false) return false;

      const slDay = sl.dayOfWeek || 'ALL';
      const dayConflict = targetDay === 'ALL' || slDay === 'ALL' || targetDay === dayConflict;
      if (!dayConflict) return false;

      let s2 = sl.startTime || '';
      let e2 = sl.endTime || '';
      if (!s2 || !e2) {
        const parts = (sl.time || '').split('-').map(p => p.trim());
        s2 = parts[0] ? parts[0].substring(0, 5) : '00:00';
        e2 = parts[1] ? parts[1].substring(0, 5) : '00:00';
      } else {
        s2 = s2.substring(0, 5);
        e2 = e2.substring(0, 5);
      }

      // Công thức trùng lặp giao thoa: S1 < E2 && S2 < E1
      return (newSlotStartTime < e2 && s2 < newSlotEndTime);
    });

    if (hasOverlap) {
      showToast(`⚠️ RÀNG BUỘC TRÙNG LẶP THỜI GIAN: Khung giờ [${newSlotStartTime} - ${newSlotEndTime}] bị giao thoa thời gian với một khung giờ sẵn có trên hệ thống! Vui lòng chọn khoảng giờ khác.`, 'error');
      return;
    }

    const formattedTime = `${newSlotStartTime}:00 - ${newSlotEndTime}:00`;

    setConfirmDialog({
      title: 'Xác nhận thêm khung giờ mới',
      confirmLabel: 'Xác nhận thêm slot',
      cancelLabel: 'Hủy',
      summary: [
        { label: 'Giờ bắt đầu', value: newSlotStartTime },
        { label: 'Giờ kết thúc', value: newSlotEndTime },
        { label: 'Công suất phục vụ tối đa', value: `${capacityNum} xe / tiếng` },
        { label: 'Ngày áp dụng', value: formatDayOfWeek(targetDay) }
      ],
      onConfirm: async () => {
        try {
          const created = await serviceCatalogApi.createSlot({
            time: formattedTime,
            startTime: `${newSlotStartTime}:00`,
            endTime: `${newSlotEndTime}:00`,
            maxCapacity: capacityNum,
            dayOfWeek: targetDay
          });

          const newSlotObj = {
            ...created,
            id: `SL-NEW-${Date.now()}`,
            time: formattedTime,
            startTime: `${newSlotStartTime}:00`,
            endTime: `${newSlotEndTime}:00`,
            maxCapacity: capacityNum,
            dayOfWeek: targetDay,
            isActive: true
          };

          setSlots(prev => {
            const next = sortAndReIndexSlots([...prev, newSlotObj]);
            localStorage.setItem('autowash_slots', JSON.stringify(next));
            return next;
          });

          setCreatedSlotTime(`${newSlotStartTime} - ${newSlotEndTime}`);
          showToast('Khung giờ mới đã được thêm thành công!', 'success');
          setNotificationModal({
            title: 'Tạo mới thành công!',
            content: `Khung giờ ${newSlotStartTime} - ${newSlotEndTime} đã được thêm thành công vào hệ thống.`,
            type: 'success'
          });
          setIsAddSlotModalOpen(false);
          setNewSlotStartTime('19:00');
          setNewSlotEndTime('19:30');
          setNewSlotMaxCapacity(3);
        } catch (err) {
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
            showToast('Lỗi: Hệ thống ghi nhận khung giờ này đã tồn tại trong Database.', 'error');
          } else {
            const errMsg = err.response?.data?.message || err.message || 'Lỗi không xác định khi thêm khung giờ!';
            showToast(`Thêm khung giờ thất bại: ${errMsg}`, 'error');
          }
        }
      }
    });
  };

  // Handler: Delete Slot with confirmation + API integration (Hard Delete)
  const handleDeleteSlot = (slot) => {
    setConfirmDialog({
      title: 'Xác nhận xóa vĩnh viễn khung giờ',
      confirmLabel: 'Xác nhận xóa vĩnh viễn',
      cancelLabel: 'Hủy bỏ',
      isDestructive: true,
      summary: [
        { label: 'Khung giờ', value: slot.time },
        { label: 'Công suất', value: `${slot.maxCapacity} xe/tiếng` },
        { label: 'Cảnh báo', value: 'Bạn có chắc chắn muốn xóa khung giờ này? Dữ liệu sẽ bị xóa hoàn toàn khỏi hệ thống DB và không thể phục hồi.' }
      ],
      onConfirm: async () => {
        try {
          await serviceCatalogApi.deleteSlot(slot.id, slot.timeSlotId);
          const freshData = await serviceCatalogApi.getAllSlots();
          const sorted = sortAndReIndexSlots(freshData);
          setSlots(sorted);
          localStorage.setItem('autowash_slots', JSON.stringify(sorted));
          showToast('Xóa khung giờ thành công!');
          setNotificationModal({
            title: 'Xóa khung giờ thành công!',
            content: `Đã xóa vĩnh viễn khung giờ ${slot.time} khỏi hệ thống DB thành công.`,
            type: 'success'
          });
        } catch (err) {
          const errMsg = err.response?.data?.message || err.message || 'Lỗi không xác định khi xóa khung giờ!';
          showToast(`Xóa khung giờ thất bại: ${errMsg}`, 'error');
        }
      }
    });
  };

  const totalDailyCapacity = slots.filter(sl => sl.isActive).reduce((sum, sl) => sum + sl.maxCapacity, 0);

  return (
    <div className="flex flex-col h-full bg-[#f7fafd] text-slate-800 p-6 overflow-hidden">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#0047AB] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0047AB]/20 text-white">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              Quản Lý Dịch Vụ & Khung Giờ (Services & Slots)
              <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-[#0047AB] text-[10px] font-black rounded-full uppercase tracking-wider">
                Catalog & Capacity
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Quản lý danh mục gói rửa xe đồng giá, add-on đi kèm, công suất slot mẫu và lịch đóng cửa trạm.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border border-slate-200 rounded-xl p-1 flex gap-1 text-xs text-slate-600 shadow-sm self-end sm:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
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
            className={`px-4 py-2 rounded-xl font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'slots'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Khung giờ mẫu</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'slots' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'}`}>{slots.length}</span>
          </button>
          {hasPermission('LOCK_SLOT') && (
            <button
              onClick={() => setActiveTab('closures')}
              className={`px-4 py-2 rounded-xl font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'closures'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Lịch đóng cửa</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'closures' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'}`}>{closures.length}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 pt-4 pr-1 space-y-6 no-scrollbar">

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

            {hasPermission('MANAGE_SERVICES') && (
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
                            disabled={!hasPermission('MANAGE_SERVICES')}
                            onClick={() => handleToggleService(s.id)} 
                            className={`focus:outline-none transition-transform ${hasPermission('MANAGE_SERVICES') ? 'hover:scale-[1.05] cursor-pointer' : 'cursor-not-allowed'} inline-block`}
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
                        <div className="flex items-center justify-center gap-2">
                          {hasPermission('MANAGE_SERVICES') && (
                            <>
                              <button onClick={() => handleOpenEditService(s)} className="p-1.5 bg-slate-55 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-slate-660 transition-all flex items-center gap-1 font-bold cursor-pointer">
                                <Edit className="w-3.5 h-3.5" />
                                Sửa
                              </button>
                              <button 
                                onClick={() => handleDeleteService(s.id, s.serviceId)} 
                                className="p-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-lg transition-all flex items-center gap-1 font-bold cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Xóa
                              </button>
                            </>
                          )}
                        </div>
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

          <div className="flex items-center justify-end shrink-0">
            {hasPermission('MANAGE_SLOTS') && (
              <button
                onClick={() => {
                  setNewSlotStartTime('19:00');
                  setNewSlotEndTime('19:30');
                  setNewSlotMaxCapacity(3);
                  setNewSlotDayOfWeek('ALL');
                  setIsAddSlotModalOpen(true);
                }}
                className="bg-[#0047AB] hover:bg-[#003a8c] text-white text-xs font-black py-2.5 px-4.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Thêm khung giờ mới
              </button>
            )}
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
                        <button 
                          disabled={!hasPermission('MANAGE_SLOTS')}
                          onClick={() => handleToggleSlot(sl.id)} 
                          className={`focus:outline-none transition-transform ${hasPermission('MANAGE_SLOTS') ? 'hover:scale-[1.05] cursor-pointer' : 'cursor-not-allowed'} inline-block`}
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
                        {hasPermission('MANAGE_SLOTS') && (
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
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-600 block">Thời lượng (phút) *</label>
                    {serviceForm.type === 'core' && (
                      <span className="text-[10px] text-blue-600 font-extrabold bg-blue-50 px-2 py-0.5 rounded">
                        ⚡ Tự động cộng
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    required
                    readOnly={serviceForm.type === 'core' && (serviceForm.includedServiceIds || []).length > 0}
                    placeholder="Ví dụ: 20"
                    value={serviceForm.duration}
                    onChange={e => setServiceForm({...serviceForm, duration: e.target.value})}
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 ${serviceForm.type === 'core' && (serviceForm.includedServiceIds || []).length > 0 ? 'bg-slate-100 cursor-not-allowed text-blue-600 font-black' : ''}`}
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

              {serviceForm.type === 'core' && (
                <div className="space-y-2 border-t border-b border-slate-150 py-3 my-2 text-left">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-slate-800 flex items-center gap-1 text-xs">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>Chọn các gói Add-on thành phần *</span>
                    </label>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                      ⏱️ Tổng: {services.filter(s => s.type === 'addons').filter(s => (serviceForm.includedServiceIds || []).includes(s.serviceId || s.id)).reduce((acc, c) => acc + Number(c.durationMinutes || c.duration || 0), 0)} phút
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Tích chọn các dịch vụ Add-on. Thời lượng gói chính sẽ <strong>tự động cộng dồn</strong> từ tổng số phút của các dịch vụ Add-on được chọn.
                  </p>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    {services.filter(s => s.type === 'addons').length > 0 ? (
                      services.filter(s => s.type === 'addons').map((srv) => {
                        const srvId = srv.serviceId || srv.id;
                        const isChecked = (serviceForm.includedServiceIds || []).includes(srvId);
                        return (
                          <label key={srvId} className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border ${isChecked ? 'bg-blue-50/60 border-blue-400 shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const current = serviceForm.includedServiceIds || [];
                                  const next = e.target.checked
                                    ? [...current, srvId]
                                    : current.filter(id => id !== srvId);
                                  const addonItems = services.filter(s => s.type === 'addons');
                                  const newDuration = addonItems.filter(s => next.includes(s.serviceId || s.id)).reduce((acc, c) => acc + Number(c.durationMinutes || c.duration || 0), 0);
                                  setServiceForm({
                                    ...serviceForm,
                                    includedServiceIds: next,
                                    duration: newDuration > 0 ? newDuration : serviceForm.duration
                                  });
                                }}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                              />
                              <div>
                                <span className="font-bold text-slate-800 text-xs block">{srv.name || srv.serviceName}</span>
                                {srv.desc && <span className="text-[10px] text-slate-400 font-normal block">{srv.desc}</span>}
                              </div>
                            </div>
                            <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md shrink-0">
                              ⏱️ {srv.durationMinutes || srv.duration || 5} phút
                            </span>
                          </label>
                        );
                      })
                    ) : (
                      <div className="text-center py-3 text-slate-400 text-[11px]">
                        Không tìm thấy gói Add-on nào.
                      </div>
                    )}
                  </div>
                </div>
              )}

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
      {activeTab === 'closures' && hasPermission('LOCK_SLOT') && (
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

            {hasPermission('LOCK_SLOT') && hasPermission('MANAGE_SLOTS') && (
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
                          {hasPermission('LOCK_SLOT') && hasPermission('MANAGE_SLOTS') && (
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
                Cấu hình Khung giờ dọn xe
              </h3>
              <button onClick={() => setSlotModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Giờ bắt đầu *</label>
                  <select
                    value={slotForm.startTime}
                    onChange={e => setSlotForm({...slotForm, startTime: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 font-mono text-center cursor-pointer"
                  >
                    {TIME_OPTIONS_24H.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Giờ kết thúc *</label>
                  <select
                    value={slotForm.endTime}
                    onChange={e => setSlotForm({...slotForm, endTime: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 font-mono text-center cursor-pointer"
                  >
                    {TIME_OPTIONS_24H.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Công suất phục vụ tối đa (xe / giờ) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="50"
                  placeholder="Ví dụ: 3"
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

              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-2.5 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                  Ràng buộc hệ thống: Giờ bắt đầu và giờ kết thúc không được giao thoa / chồng lấn thời gian với các khung giờ đã tồn tại khác.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2 justify-end">
                <button type="button" onClick={() => setSlotModalOpen(false)} className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl">Hủy</button>
                <button type="submit" className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl">Cập nhật</button>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Giờ bắt đầu *</label>
                  <select
                    value={newSlotStartTime}
                    onChange={e => setNewSlotStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 font-mono text-center cursor-pointer"
                  >
                    {TIME_OPTIONS_24H.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Giờ kết thúc *</label>
                  <select
                    value={newSlotEndTime}
                    onChange={e => setNewSlotEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 font-mono text-center cursor-pointer"
                  >
                    {TIME_OPTIONS_24H.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Công suất phục vụ tối đa (xe / giờ) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="50"
                  placeholder="Ví dụ: 3"
                  value={newSlotMaxCapacity}
                  onChange={e => setNewSlotMaxCapacity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-center"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Áp dụng cho ngày trong tuần *</label>
                <select
                  value={newSlotDayOfWeek}
                  onChange={e => setNewSlotDayOfWeek(e.target.value)}
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

              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-indigo-700 font-semibold leading-relaxed">
                  Hệ thống tự động kiểm tra xem khung giờ mới có bị giao thoa với các khung giờ hoạt động sẵn có không trước khi lưu.
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

      {/* DYNAMIC CONFIRMATION MODAL */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-[1px] animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-100 animate-scale-up">
            <div className="pb-2 border-b border-slate-150 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-sm">{confirmDialog.title}</h3>
              <button 
                type="button" 
                onClick={() => {
                  if (confirmDialog.onCancel) confirmDialog.onCancel();
                  setConfirmDialog(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2.5 text-xs text-slate-600 font-semibold max-h-[40vh] overflow-y-auto pr-1">
              {confirmDialog.summary.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-slate-50 gap-2">
                  <span className="text-slate-450 font-bold uppercase text-[9px] shrink-0">{item.label}</span>
                  <span className="text-slate-800 font-extrabold text-right break-words">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (confirmDialog.onCancel) confirmDialog.onCancel();
                  setConfirmDialog(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {confirmDialog.cancelLabel || 'Hủy'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  setConfirmDialog(prev => ({ ...prev, isSubmitting: true }));
                  try {
                    await confirmDialog.onConfirm();
                  } finally {
                    setConfirmDialog(null);
                  }
                }}
                disabled={confirmDialog.isSubmitting}
                className={`px-4.5 py-2 font-black rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-950/10'
                    : 'bg-[#0047AB] hover:bg-[#003c94] text-white shadow-[#0047AB]/10'
                }`}
              >
                {confirmDialog.isSubmitting ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Đang xử lý...
                  </>
                ) : (
                  confirmDialog.confirmLabel || 'Xác nhận'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION MODAL (SUCCESS & ERROR) */}
      {notificationModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[160] p-4 backdrop-blur-[1px] animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-100 text-center animate-scale-up">
            <div className="flex justify-center">
              {notificationModal.type === 'error' ? (
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-xl font-bold border border-rose-100">
                  ✕
                </div>
              ) : (
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-xl font-bold border border-emerald-100">
                  ✓
                </div>
              )}
            </div>
            <h3 className={`font-extrabold text-base ${notificationModal.type === 'error' ? 'text-rose-700' : 'text-slate-800'}`}>
              {notificationModal.title}
            </h3>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">{notificationModal.content}</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setNotificationModal(null)}
                className={`w-full py-2.5 text-white font-black rounded-xl text-xs transition-colors cursor-pointer ${
                  notificationModal.type === 'error' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {notificationModal.type === 'error' ? 'Đã hiểu' : 'Đồng ý'}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* DYNAMIC FLOATING TOAST */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-black shadow-xl animate-fade-in transition-all ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-850 border-emerald-200' :
          toast.type === 'warning' ? 'bg-amber-50 text-amber-855 border-amber-250' :
          'bg-rose-50 text-rose-850 border-rose-200'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            toast.type === 'success' ? 'bg-emerald-500' :
            toast.type === 'warning' ? 'bg-amber-500' :
            'bg-rose-500'
          }`} />
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-700 font-extrabold cursor-pointer">✕</button>
        </div>
      )}

    </div>
  );
}
