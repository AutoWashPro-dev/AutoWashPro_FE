import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('autowash_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const serviceCatalogApi = {
  // --- Service Catalog ---
  getAllServices: async (activeOnly = false) => {
    try {
      const res = await api.get(`/admin/services?activeOnly=${activeOnly}`);
      return res.data.map((item, idx) => ({
        ...item,
        id: item.serviceCode || `S-0${idx + 1}`,
        name: item.serviceName || item.name,
        price: item.price,
        duration: item.durationMinutes || item.duration || 15,
        type: (item.serviceType === 'PACKAGE' || item.type === 'core') ? 'core' : 'addons',
        desc: item.description || item.desc || '',
        isActive: item.isActive !== undefined ? item.isActive : true
      }));
    } catch (err) {
      console.warn('API /admin/services offline or error, using localStorage fallback:', err.message);
      const saved = localStorage.getItem('autowash_admin_services_db');
      if (saved) return JSON.parse(saved);
      return [
        { id: 'S-01', serviceId: 1, serviceCode: 'PKG-STD', name: 'Rửa xe máy tiêu chuẩn', price: 30000, duration: 15, type: 'core', desc: 'Rửa bọt tuyết chuyên dụng, xịt khô, lau bóng', isActive: true },
        { id: 'S-02', serviceId: 2, serviceCode: 'PKG-DELUXE', name: 'Rửa xe máy cao cấp', price: 50000, duration: 25, type: 'core', desc: 'Rửa bọt tuyết, tẩy nhờn lốc máy, dưỡng bóng lốp', isActive: true },
        { id: 'S-03', serviceId: 3, serviceCode: 'PKG-ULTIMATE', name: 'Rửa xe máy siêu cấp & bảo dưỡng', price: 80000, duration: 40, type: 'core', desc: 'Rửa chi tiết toàn diện, tẩy ố xích chíp, dưỡng nhựa nhám, tra dầu xích', isActive: true },
        { id: 'A-01', serviceId: 4, serviceCode: 'ADD-CHAIN', name: 'Tẩy rửa và dưỡng xích (sên)', price: 20000, duration: 10, type: 'addons', desc: 'Tẩy sạch cặn bẩn xích, tra dầu bôi trơn chuyên dụng', isActive: true },
        { id: 'A-02', serviceId: 5, serviceCode: 'ADD-HELMET', name: 'Vệ sinh mũ bảo hiểm khử khuẩn', price: 15000, duration: 10, type: 'addons', desc: 'Khử mùi bọt nano, sấy khô mũ bảo hiểm', isActive: true }
      ];
    }
  },

  createService: async (data) => {
    try {
      const payload = {
        serviceCode: data.type === 'core' ? `PKG-${Date.now().toString().slice(-4)}` : `ADD-${Date.now().toString().slice(-4)}`,
        serviceName: data.name,
        serviceType: data.type === 'core' ? 'PACKAGE' : 'ADDON',
        price: Number(data.price),
        durationMinutes: Number(data.duration),
        description: data.desc,
        isActive: true,
        displayOrder: 1
      };
      const res = await api.post('/admin/services', payload);
      return {
        ...res.data,
        id: res.data.serviceCode || `S-${Date.now()}`,
        name: res.data.serviceName || data.name,
        price: res.data.price || data.price,
        duration: res.data.durationMinutes || data.duration,
        type: data.type,
        desc: res.data.description || data.desc,
        isActive: true
      };
    } catch (err) {
      console.warn('API createService fallback:', err.message);
      return { ...data, id: `S-${Date.now()}`, serviceId: Date.now(), isActive: true };
    }
  },

  updateService: async (id, data) => {
    try {
      const payload = {
        serviceCode: data.id || `PKG-${id}`,
        serviceName: data.name,
        serviceType: data.type === 'core' ? 'PACKAGE' : 'ADDON',
        price: Number(data.price),
        durationMinutes: Number(data.duration),
        description: data.desc,
        isActive: data.isActive !== undefined ? data.isActive : true,
        displayOrder: 1
      };
      const actualId = data.serviceId || id;
      const res = await api.put(`/admin/services/${actualId}`, payload);
      return { ...data, id, serviceId: actualId };
    } catch (err) {
      console.warn('API updateService fallback:', err.message);
      return { ...data, id, serviceId: id };
    }
  },

  toggleServiceStatus: async (id, serviceId) => {
    try {
      const actualId = serviceId || id;
      await api.patch(`/admin/services/${actualId}/status`);
      return true;
    } catch (err) {
      console.warn('API toggleServiceStatus fallback:', err.message);
      return true;
    }
  },

  // --- Time Slots ---
  getAllSlots: async (activeOnly = false) => {
    try {
      const res = await api.get(`/admin/slots?activeOnly=${activeOnly}`);
      return res.data.map((item, idx) => ({
        ...item,
        id: `SL-0${idx + 1}`,
        slotId: item.slotId,
        timeSlotId: item.slotId || item.timeSlotId || item.id,
        time: item.time || `${item.startTime} - ${item.endTime}`,
        startTime: item.startTime,
        endTime: item.endTime,
        maxCapacity: item.maxCapacity || 3,
        isActive: item.isActive !== undefined ? item.isActive : true
      }));
    } catch (err) {
      console.warn('API /admin/slots offline or error, using localStorage fallback:', err.message);
      const saved = localStorage.getItem('autowash_slots');
      if (saved) return JSON.parse(saved);
      return [
        { id: 'SL-01', timeSlotId: 1, time: '08:00 - 09:00', startTime: '08:00', endTime: '09:00', maxCapacity: 3, isActive: true },
        { id: 'SL-02', timeSlotId: 2, time: '09:00 - 10:00', startTime: '09:00', endTime: '10:00', maxCapacity: 3, isActive: true },
        { id: 'SL-03', timeSlotId: 3, time: '10:00 - 11:00', startTime: '10:00', endTime: '11:00', maxCapacity: 3, isActive: true },
        { id: 'SL-04', timeSlotId: 4, time: '14:00 - 15:00', startTime: '14:00', endTime: '15:00', maxCapacity: 3, isActive: true },
        { id: 'SL-05', timeSlotId: 5, time: '15:00 - 16:00', startTime: '15:00', endTime: '16:00', maxCapacity: 3, isActive: true },
        { id: 'SL-06', timeSlotId: 6, time: '16:00 - 17:00', startTime: '16:00', endTime: '17:00', maxCapacity: 3, isActive: true }
      ];
    }
  },

  createSlot: async (data) => {
    try {
      const times = data.time ? data.time.split('-').map(s => s.trim()) : ['08:00', '09:00'];
      const payload = {
        startTime: times[0] || '08:00',
        endTime: times[1] || '09:00',
        maxCapacity: Number(data.maxCapacity) || 3,
        isActive: true,
        displayOrder: 1
      };
      const res = await api.post('/admin/slots', payload);
      return { ...data, id: `SL-${Date.now()}`, timeSlotId: res.data?.timeSlotId || Date.now(), isActive: true };
    } catch (err) {
      console.warn('API createSlot fallback:', err.message);
      return { ...data, id: `SL-${Date.now()}`, timeSlotId: Date.now(), isActive: true };
    }
  },

  updateSlot: async (id, data, timeSlotId) => {
    try {
      const times = data.time ? data.time.split('-').map(s => s.trim()) : ['08:00', '09:00'];
      const payload = {
        startTime: times[0] || '08:00',
        endTime: times[1] || '09:00',
        maxCapacity: Number(data.maxCapacity) || 3,
        isActive: data.isActive !== undefined ? data.isActive : true,
        displayOrder: 1
      };
      const actualId = timeSlotId || id;
      await api.put(`/admin/slots/${actualId}`, payload);
      return { ...data, id, timeSlotId: actualId };
    } catch (err) {
      console.warn('API updateSlot fallback:', err.message);
      return { ...data, id, timeSlotId: id };
    }
  },

  toggleSlotStatus: async (id, timeSlotId) => {
    try {
      const actualId = timeSlotId || id;
      await api.patch(`/admin/slots/${actualId}/status`);
      return true;
    } catch (err) {
      console.warn('API toggleSlotStatus fallback:', err.message);
      return true;
    }
  },

  deleteSlot: async (id, timeSlotId) => {
    try {
      const actualId = timeSlotId || id;
      await api.delete(`/admin/slots/${actualId}`);
      return true;
    } catch (err) {
      console.warn('API deleteSlot fallback:', err.message);
      return true;
    }
  },

  // --- Garage Closures ---
  getAllClosures: async () => {
    try {
      const [closuresRes, locksRes] = await Promise.allSettled([
        api.get('/admin/closures'),
        api.get('/admin/slots/locks')
      ]);

      const closures = closuresRes.status === 'fulfilled' ? closuresRes.value.data : [];
      const locks = locksRes.status === 'fulfilled' ? locksRes.value.data : [];

      return [...closures, ...locks];
    } catch (err) {
      console.warn('API getAllClosures offline or error:', err.message);
      return [];
    }
  },

  createClosure: async (data) => {
    const res = await api.post('/admin/closures', data);
    return res.data;
  },

  deleteClosure: async (id) => {
    await api.delete(`/admin/closures/${id}`);
    return true;
  },
  lockSingleSlot: async ({ date, slotId, lock = true }) => {
    const res = await api.post(`/admin/slots/${slotId}/lock`, null, { params: { date, lock } });
    return res.data;
  }
};
