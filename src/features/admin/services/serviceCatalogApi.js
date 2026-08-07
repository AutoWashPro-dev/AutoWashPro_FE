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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    if (status === 401) {
      localStorage.removeItem('autowash_token');
      localStorage.removeItem('autowash_user');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user_roles');
      localStorage.removeItem('accessToken');
      sessionStorage.clear();
      window.dispatchEvent(new Event('auth_logout'));
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const serviceCatalogApi = {
  // --- Service Catalog ---
  getAllServices: async (activeOnly = false) => {
    try {
      const res = await api.get(`/admin/services?activeOnly=${activeOnly}`);
      return res.data.map((item, idx) => {
        const code = item.serviceCode || '';
        let resolvedType = 'single';
        if (item.serviceType === 'PACKAGE') {
          resolvedType = 'combo';
        } else if (item.serviceType === 'ADDON') {
          resolvedType = 'addons';
        } else {
          resolvedType = 'single';
        }

        return {
          ...item,
          id: item.serviceCode || `S-0${idx + 1}`,
          serviceId: item.serviceId,
          name: item.serviceName || item.name,
          price: item.price,
          duration: item.durationMinutes || item.duration || 15,
          type: resolvedType,
          serviceType: item.serviceType || resolvedServiceType,
          desc: item.description || item.desc || '',
          isActive: item.isActive !== undefined ? item.isActive : true,
          includedServices: item.includedServices || []
        };
      });
    } catch (err) {
      console.warn('API /admin/services offline or error, using full catalog fallback:', err.message);
      // 1. Dịch vụ đơn lẻ (SINGLE_SERVICE)
      const srvFoamStd = { id: 'SRV-10', serviceId: 10, serviceCode: 'SRV-FOAM-STD', name: 'Rửa bọt tuyết tiêu chuẩn', price: 15000, duration: 10, type: 'single', serviceType: 'SINGLE_SERVICE', desc: 'Làm sạch bụi bẩn toàn thân xe bằng bọt tuyết trung tính PH7 chuyên dụng', isActive: true };
      const srvDryAir = { id: 'SRV-11', serviceId: 11, serviceCode: 'SRV-DRY-AIR', name: 'Xịt khô vòi khí nén', price: 10000, duration: 5, type: 'single', serviceType: 'SINGLE_SERVICE', desc: 'Thổi sạch nước đọng lốc máy, công tắc và các khe kẽ bằng khí nén áp lực cao', isActive: true };
      const srvWipeShine = { id: 'SRV-12', serviceId: 12, serviceCode: 'SRV-WIPE-SHINE', name: 'Lau khô & lau bóng dàn áo', price: 10000, duration: 5, type: 'single', serviceType: 'SINGLE_SERVICE', desc: 'Lau khô kiệt nước và lau bóng dàn áo bằng khăn microfiber mịn chống trầy sơn', isActive: true };
      const srvDegreaseEng = { id: 'SRV-13', serviceId: 13, serviceCode: 'SRV-DEGREASE-ENG', name: 'Tẩy nhờn lốc máy & gầm xe', price: 20000, duration: 10, type: 'single', serviceType: 'SINGLE_SERVICE', desc: 'Tẩy sạch mảng bám dầu nhớt bẩn lâu ngày dưới gầm và lốc máy xe', isActive: true };
      const srvWashDetail = { id: 'SRV-14', serviceId: 14, serviceCode: 'SRV-WASH-DETAIL', name: 'Rửa chi tiết khoang máy & phuộc', price: 35000, duration: 15, type: 'single', serviceType: 'SINGLE_SERVICE', desc: 'Vệ sinh cẩn thận từng ngóc ngách, con ốc, gắp sau và ti phuộc xe máy', isActive: true };

      // 2. Dịch vụ đi kèm / Add-on (ADDON)
      const addTyreDress = { id: 'SRV-20', serviceId: 20, serviceCode: 'ADD-TYRE-DRESS', name: 'Quét mỡ dưỡng bóng đen lốp xe', price: 15000, duration: 5, type: 'addons', serviceType: 'ADDON', desc: 'Bảo vệ cao su lốp chống nứt nẻ, tạo độ bóng đen tự nhiên như xe mới xuất xưởng', isActive: true };
      const addChainClean = { id: 'SRV-21', serviceId: 21, serviceCode: 'ADD-CHAIN-CLEAN', name: 'Tẩy rửa nhông sên dĩa (xích)', price: 25000, duration: 15, type: 'addons', serviceType: 'ADDON', desc: 'Tẩy sạch cặn mỡ đen, rỉ sét bám trên xích sên bằng chai xịt dung dịch chuyên dụng', isActive: true };
      const addChainLube = { id: 'SRV-22', serviceId: 22, serviceCode: 'ADD-CHAIN-LUBE', name: 'Tra mỡ bôi trơn xích Motul VIP', price: 15000, duration: 5, type: 'addons', serviceType: 'ADDON', desc: 'Tra dung dịch bôi trơn kết dính cao giúp xích êm ái, giảm ma sát và chống văng mỡ', isActive: true };
      const addPlasticRestore = { id: 'SRV-23', serviceId: 23, serviceCode: 'ADD-PLASTIC-RESTORE', name: 'Phục hồi nhựa nhám dàn áo', price: 20000, duration: 10, type: 'addons', serviceType: 'ADDON', desc: 'Dưỡng phục hồi các chi tiết nhựa nhám bị ố trắng, bạc màu do nắng mưa', isActive: true };
      const addHelmetSan = { id: 'SRV-24', serviceId: 24, serviceCode: 'ADD-HELMET-SAN', name: 'Vệ sinh sấy khử khuẩn mũ bảo hiểm', price: 15000, duration: 10, type: 'addons', serviceType: 'ADDON', desc: 'Diệt khuẩn nấm mốc lót mũ bằng bọt nano và sấy khô bằng tia UV khử mùi', isActive: true };
      const addWaxProtect = { id: 'SRV-25', serviceId: 25, serviceCode: 'ADD-WAX-PROTECT', name: 'Phủ sáp bóng Gloss Shield bảo vệ sơn', price: 30000, duration: 10, type: 'addons', serviceType: 'ADDON', desc: 'Tạo lớp phủ bóng kháng nước nhẹ, chống bám bụi và bảo vệ lớp sơn bóng/sơn mờ', isActive: true };

      return [
        { id: 'S-01', serviceId: 1, serviceCode: 'PKG-STD', name: 'Gói Rửa Xe Tiêu Chuẩn', price: 30000, duration: 15, type: 'combo', serviceType: 'PACKAGE', desc: 'Quy trình rửa sạch nhanh toàn thân xe, thổi khô kiệt nước và lau bóng chuẩn tiệm', isActive: true, includedServices: [srvFoamStd, srvDryAir, srvWipeShine] },
        { id: 'S-02', serviceId: 2, serviceCode: 'PKG-DELUXE', name: 'Gói Chăm Sóc Cao Cấp', price: 60000, duration: 25, type: 'combo', serviceType: 'PACKAGE', desc: 'Rửa bọt tuyết kết hợp tẩy rửa dầu nhờn gầm máy, quét dưỡng đen lốp và tra mỡ xích', isActive: true, includedServices: [srvFoamStd, srvDegreaseEng, addTyreDress, addChainLube] },
        { id: 'S-03', serviceId: 3, serviceCode: 'PKG-ULTIMATE', name: 'Gói Chăm Sóc Siêu Cấp & Bảo Dưỡng VIP', price: 110000, duration: 40, type: 'combo', serviceType: 'PACKAGE', desc: 'Gói bảo dưỡng toàn diện từ chi tiết khoang máy đến dọn xích nhông đĩa, phục hồi nhựa nhám dàn áo và phủ bóng lốp', isActive: true, includedServices: [srvWashDetail, addChainClean, addChainLube, addPlasticRestore, addTyreDress] },
        srvFoamStd, srvDryAir, srvWipeShine, srvDegreaseEng, srvWashDetail, addTyreDress, addChainClean, addChainLube, addPlasticRestore, addHelmetSan, addWaxProtect
      ];
    }
  },

  createService: async (data) => {
    try {
      const resolvedServiceType = data.serviceType || (data.type === 'combo' ? 'PACKAGE' : (data.type === 'single' ? 'SINGLE_SERVICE' : 'ADDON'));
      const prefix = resolvedServiceType === 'PACKAGE' ? 'PKG' : (resolvedServiceType === 'SINGLE_SERVICE' ? 'SRV' : 'ADD');
      const payload = {
        serviceCode: data.serviceCode || `${prefix}-${Date.now().toString().slice(-4)}`,
        serviceName: data.name,
        serviceType: resolvedServiceType,
        price: Number(data.price),
        durationMinutes: Number(data.duration),
        description: data.desc,
        isActive: true,
        displayOrder: 1,
        includedServiceIds: data.includedServiceIds || []
      };
      const res = await api.post('/admin/services', payload);
      return {
        ...res.data,
        id: res.data.serviceCode || `S-${Date.now()}`,
        name: res.data.serviceName || data.name,
        price: res.data.price || data.price,
        duration: res.data.durationMinutes || data.duration,
        type: res.data.serviceType === 'PACKAGE' ? 'combo' : (res.data.serviceType === 'SINGLE_SERVICE' ? 'single' : 'addons'),
        serviceType: res.data.serviceType || resolvedServiceType,
        desc: res.data.description || data.desc,
        isActive: true,
        includedServices: res.data.includedServices || []
      };
    } catch (err) {
      console.warn('API createService fallback:', err.message);
      return { ...data, id: `S-${Date.now()}`, serviceId: Date.now(), isActive: true };
    }
  },

  updateService: async (id, data) => {
    try {
      const resolvedServiceType = data.serviceType || (data.type === 'combo' ? 'PACKAGE' : (data.type === 'single' ? 'SINGLE_SERVICE' : 'ADDON'));
      const payload = {
        serviceCode: data.serviceCode || data.id || `SRV-${id}`,
        serviceName: data.name,
        serviceType: resolvedServiceType,
        price: Number(data.price),
        durationMinutes: Number(data.duration),
        description: data.desc,
        isActive: data.isActive !== undefined ? data.isActive : true,
        displayOrder: 1,
        includedServiceIds: data.includedServiceIds || []
      };
      const actualId = data.serviceId || id;
      const res = await api.put(`/admin/services/${actualId}`, payload);
      return { ...data, id, serviceId: actualId, serviceType: resolvedServiceType, includedServices: res.data.includedServices || [] };
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

  deleteService: async (id, serviceId) => {
    const rawId = serviceId || id;
    const numericMatch = String(rawId).match(/\d+/);
    const actualId = numericMatch ? numericMatch[0] : rawId;
    try {
      await api.delete(`/admin/services/${actualId}`);
      return true;
    } catch (err) {
      console.error('API deleteService error:', err);
      if (err.response) {
        throw err;
      }
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
      const sTime = data.startTime || times[0] || '08:00';
      const eTime = data.endTime || times[1] || '09:00';
      const payload = {
        startTime: sTime.length === 5 ? `${sTime}:00` : sTime,
        endTime: eTime.length === 5 ? `${eTime}:00` : eTime,
        maxCapacity: Number(data.maxCapacity) || 3,
        dayOfWeek: data.dayOfWeek || 'ALL',
        isActive: true,
        displayOrder: 1
      };
      const res = await api.post('/admin/slots', payload);
      return { 
        ...data, 
        id: `SL-${Date.now()}`, 
        timeSlotId: res.data?.slotId || res.data?.timeSlotId || Date.now(), 
        startTime: payload.startTime,
        endTime: payload.endTime,
        dayOfWeek: payload.dayOfWeek,
        isActive: true 
      };
    } catch (err) {
      console.warn('API createSlot fallback:', err.message);
      return { ...data, id: `SL-${Date.now()}`, timeSlotId: Date.now(), isActive: true };
    }
  },

  updateSlot: async (id, data, timeSlotId) => {
    try {
      const times = data.time ? data.time.split('-').map(s => s.trim()) : ['08:00', '09:00'];
      const sTime = data.startTime || times[0] || '08:00';
      const eTime = data.endTime || times[1] || '09:00';
      const payload = {
        startTime: sTime.length === 5 ? `${sTime}:00` : sTime,
        endTime: eTime.length === 5 ? `${eTime}:00` : eTime,
        maxCapacity: Number(data.maxCapacity) || 3,
        dayOfWeek: data.dayOfWeek || 'ALL',
        isActive: data.isActive !== undefined ? data.isActive : true,
        displayOrder: 1
      };
      const rawId = timeSlotId || id;
      const numericMatch = String(rawId).match(/\d+/);
      const actualId = numericMatch ? numericMatch[0] : rawId;
      await api.put(`/admin/slots/${actualId}`, payload);
      return { 
        ...data, 
        id, 
        timeSlotId: actualId,
        startTime: payload.startTime,
        endTime: payload.endTime,
        dayOfWeek: payload.dayOfWeek
      };
    } catch (err) {
      console.warn('API updateSlot fallback:', err.message);
      return { ...data, id, timeSlotId: id };
    }
  },

  toggleSlotStatus: async (id, timeSlotId) => {
    try {
      const rawId = timeSlotId || id;
      const numericMatch = String(rawId).match(/\d+/);
      const actualId = numericMatch ? numericMatch[0] : rawId;
      await api.patch(`/admin/slots/${actualId}/status`);
      return true;
    } catch (err) {
      console.warn('API toggleSlotStatus fallback:', err.message);
      return true;
    }
  },

  deleteSlot: async (id, timeSlotId) => {
    const rawId = timeSlotId || id;
    const numericMatch = String(rawId).match(/\d+/);
    const actualId = numericMatch ? numericMatch[0] : rawId;
    try {
      await api.delete(`/admin/slots/${actualId}`);
      return true;
    } catch (err) {
      console.error('API deleteSlot error:', err);
      if (err.response) {
        throw err;
      }
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
