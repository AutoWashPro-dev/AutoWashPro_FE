import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  Plus, 
  CheckCircle,
  FileText,
  AlertCircle,
  HelpCircle,
  History,
  Trash2,
  X,
  Car
} from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import { customerApi } from '../services/customerApi';
import axios from 'axios';

export default function CustomerBookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingTab, setBookingTab] = useState('new'); // 'new' hoáº·c 'history'

  // Máº«u dá»¯ liá»‡u xe mÃ¡y cá»§a khÃ¡ch hÃ ng
  const [vehicles, setVehicles] = useState([]);

  // GÃ³i dá»‹ch vá»¥ cá»‘t lÃµi (Core Packages) vÃ  giÃ¡ cÆ¡ báº£n (Base Price)
  const [corePackages, setCorePackages] = useState([
    { id: 1, name: "GÃ³i Rá»­a Basic", basePrice: 50000, duration: "15 phÃºt", description: "Rá»­a vá» ngoÃ i, rá»­a xÃ­ch, xá»‹t gáº§m nháº¹, thá»•i khÃ´ vÃ  lau sáº¡ch gÆ°Æ¡ng kÃ­nh." },
    { id: 2, name: "GÃ³i Rá»­a Premium", basePrice: 90000, duration: "30 phÃºt", description: "Rá»­a Basic káº¿t há»£p táº©y á»‘ dÃ n nhá»±a, dÆ°á»¡ng Ä‘en lá»‘p vÃ  phá»§ sÃ¡p bÃ³ng nháº¹ báº£o vá»‡ dÃ n Ã¡o." },
    { id: 3, name: "GÃ³i Rá»­a Deluxe", basePrice: 150000, duration: "45 phÃºt", description: "Vá»‡ sinh chuyÃªn sÃ¢u xÃ­ch Ä‘Ä©a, phá»§ ceramic bÃ³ng kÃ­nh cao cáº¥p, dá»n khoang mÃ¡y bá»¥i Ä‘áº¥t lÃ¢u ngÃ y." }
  ]);

  // Tiá»‡n Ã­ch cá»™ng thÃªm (Add-ons)
  const [addonServices, setAddonServices] = useState([
    { id: 10, name: "HÃºt bá»¥i & Dá»n cá»‘p xe", price: 30000, description: "HÃºt sáº¡ch bá»¥i cÃ¡t vÃ  lau hÃ³a cháº¥t báº£o vá»‡ nhá»±a lÃ²ng cá»‘p xe." },
    { id: 11, name: "DÆ°á»¡ng lá»‘p bÃ³ng loÃ¡ng", price: 20000, description: "Xá»‹t dung dá»‹ch lÃ m Ä‘en vÃ  dÆ°á»¡ng cao su lá»‘p chá»‘ng ná»©t náº»." },
    { id: 12, name: "Vá»‡ sinh sÃªn (xÃ­ch) chuyÃªn dá»¥ng", price: 40000, description: "Táº©y nhá»›t bÃ¡m sÃªn cÅ© báº±ng chai xá»‹t Motul vÃ  tra má»¡ dÆ°á»¡ng sÃªn má»›i." }
  ]);

  // Khung giá» gá»‘c máº«u Ä‘á»ƒ so khá»›p
  const defaultTimeSlots = [
    { time: "08:00", available: true },
    { time: "09:00", available: true },
    { time: "10:00", available: true },
    { time: "11:00", available: true },
    { time: "12:00", available: true },
    { time: "13:00", available: true },
    { time: "14:00", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: true }
  ];

  // CÃ¡c State quáº£n lÃ½ lá»±a chá»n cá»§a KhÃ¡ch hÃ ng
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userHistory, setUserHistory] = useState([]);
  const [myVouchers, setMyVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState(null);

  const [timeSlots, setTimeSlots] = useState([]);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleLicensePlate, setVehicleLicensePlate] = useState('');
  const [vehicleIsDefault, setVehicleIsDefault] = useState(false);

  // Khá»Ÿi táº¡o DB autowash_slots máº«u náº¿u chÆ°a cÃ³
  const initializeSlotsDb = () => {
    if (!localStorage.getItem('autowash_slots')) {
      const initialSlots = [
        { id: 'SL-01', time: '08:00 - 09:00', maxCapacity: 8, isActive: true },
        { id: 'SL-02', time: '09:00 - 10:00', maxCapacity: 8, isActive: true },
        { id: 'SL-03', time: '10:00 - 11:00', maxCapacity: 8, isActive: true },
        { id: 'SL-04', time: '11:00 - 12:00', maxCapacity: 8, isActive: true },
        { id: 'SL-05', time: '12:00 - 13:00', maxCapacity: 6, isActive: true },
        { id: 'SL-06', time: '13:00 - 14:00', maxCapacity: 8, isActive: true },
        { id: 'SL-07', time: '14:00 - 15:00', maxCapacity: 8, isActive: true },
        { id: 'SL-08', time: '15:00 - 16:00', maxCapacity: 8, isActive: true },
        { id: 'SL-09', time: '16:00 - 17:00', maxCapacity: 8, isActive: true }
      ];
      localStorage.setItem('autowash_slots', JSON.stringify(initialSlots));
    }
  };

  const [bookingWindowDays, setBookingWindowDays] = useState(7);
  const [customerProfile, setCustomerProfile] = useState(null);

  const loadUserProfile = async () => {
    try {
      const data = await customerApi.getProfile();
      setCustomerProfile(data);
      if (data && data.bookingWindowDays) {
        setBookingWindowDays(data.bookingWindowDays);
      }
      if (data && data.vehicles && data.vehicles.length > 0) {
        setVehicles(data.vehicles);
        const defaultVeh = data.vehicles.find(v => v.isDefault) || data.vehicles[0];
        setSelectedVehicle(defaultVeh);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  const loadCustomerVouchers = async () => {
    try {
      const data = await customerApi.getMyVouchers('ISSUED');
      setMyVouchers(data || []);
    } catch (err) {
      console.error('Failed to load user vouchers:', err);
    }
  };

  const loadServices = async () => {
    try {
      const data = await customerApi.getActiveServices();
      const sortedData = (data?.data || data || []).sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      
      if (sortedData.length > 0) {
        const pkgs = sortedData.filter(s => s.serviceType === 'PACKAGE').map(s => ({
          id: s.serviceId,
          name: s.serviceName,
          basePrice: Number(s.price),
          duration: `${s.durationMinutes} minutes`,
          description: s.description
        }));
        const addons = sortedData.filter(s => s.serviceType === 'ADDON').map(s => ({
          id: s.serviceId,
          name: s.serviceName,
          price: Number(s.price),
          description: s.description
        }));
        if (pkgs.length > 0) setCorePackages(pkgs);
        if (addons.length > 0) setAddonServices(addons);
      }
    } catch (err) {
      console.error('Failed to load services from backend:', err);
    }
  };

  useEffect(() => {
    loadUserProfile();
    loadCustomerVouchers();
    loadServices();
  }, []);

  // Xá»­ lÃ½ luá»“ng Ä‘áº·t dá»‹ch vá»¥ tá»± Ä‘á»™ng chá»n (tá»« trang Dashboard)
  useEffect(() => {
    const autoSelectServiceId = location.state?.autoSelectServiceId;
    if (autoSelectServiceId && corePackages.length > 0) {
      const pkgToSelect = corePackages.find(p => p.id === autoSelectServiceId);
      if (pkgToSelect) {
        setSelectedPackage(pkgToSelect);
        // TrÃ¬ hoÃ£n má»™t chÃºt Ä‘á»ƒ Ä‘áº£m báº£o DOM Ä‘Ã£ render tráº¡ng thÃ¡i selected
        setTimeout(() => {
          const el = document.getElementById(`package-${pkgToSelect.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
      }
    }
  }, [location.state, corePackages]);

  // Xá»­ lÃ½ tá»± Ä‘á»™ng má»Ÿ tab Lá»‹ch sá»­ (theo yÃªu cáº§u openHistoryModal tá»« Dashboard)
  useEffect(() => {
    if (location.state?.openHistoryModal) {
      setBookingTab('history');
    }
  }, [location.state]);

  // TÃ­nh toÃ¡n Ä‘á»™ng tráº¡ng thÃ¡i cÃ¡c khung giá» tá»« API Backend
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }
    const fetchSlots = async () => {
      try {
        const slots = await customerApi.getAvailableSlots(selectedDate);
        const mapped = slots.map(s => {
          const timeFormatted = s.startTime ? s.startTime.substring(0, 5) : "";
          return {
            slotId: s.slotId,
            time: timeFormatted,
            available: s.isAvailable,
            bookedCount: s.bookedCount ?? 0,
            maxCapacity: s.maxCapacity ?? 0,
            availableCapacity: s.availableCapacity ?? 0,
            reason: s.disabledReason === "FULL" ? "Äáº¦Y" : s.disabledReason === "PAST" ? "ÄÃƒ QUA" : s.disabledReason ? "T.Dá»ªNG" : ""
          };
        });
        setTimeSlots(mapped);
      } catch (err) {
        console.error('Failed to load slots from API:', err);
        setTimeSlots([]);
      }
    };
    fetchSlots();
  }, [selectedDate, bookingTab]);

  // Há»‡ sá»‘ ngÃ y giá»›i háº¡n Ä‘Æ°á»£c Ä‘áº·t trÆ°á»›c theo háº¡ng VIP
  const todayStr = new Date().toISOString().split('T')[0];
  const maxDateStr = new Date(Date.now() + bookingWindowDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Load danh sÃ¡ch lá»‹ch sá»­ Ä‘Æ¡n cá»§a khÃ¡ch tá»« Backend API
  const loadUserHistory = async () => {
    try {
      const data = await customerApi.getMyBookings();
      if (data && data.length > 0) {
        const list = data.map(b => {
          const serviceName = b.items && b.items.length > 0 
            ? b.items[0].serviceNameSnapshot + (b.items.length > 1 ? ` (+${b.items.length - 1} dá»‹ch vá»¥ kÃ¨m)` : '')
            : 'Rá»­a xe mÃ¡y';
          const timeFormatted = b.startTime ? b.startTime.substring(0, 5) : "08:00";
          return {
            id: b.bookingId,
            bookingCode: b.bookingCode,
            date: String(b.bookingDate),
            time: timeFormatted,
            packageName: serviceName,
            licensePlate: b.licensePlate,
            model: b.model || 'Xe mÃ¡y',
            finalAmount: Number(b.finalAmount),
            status: b.status === 'PENDING' ? 'Pending' : b.status === 'CONFIRMED' ? 'Confirmed' : b.status === 'COMPLETED' ? 'Completed' : b.status === 'CANCELLED' ? 'Canceled' : b.status
          };
        });
        // Sáº¯p xáº¿p giáº£m dáº§n theo ngÃ y vÃ  giá» Ä‘áº·t
        const sorted = list.sort((a, b) => (b.date + ' ' + b.time).localeCompare(a.date + ' ' + a.time));
        setUserHistory(sorted);
      } else {
        setUserHistory([]);
      }
    } catch (err) {
      console.error('Failed to load user bookings:', err);
      setUserHistory([]);
    }
  };

  useEffect(() => {
    loadUserHistory();
  }, [bookingTab]);
  
  // Há»§y lá»‹ch háº¹n Ä‘áº·t trÆ°á»›c trá»±c tiáº¿p tá»« báº£ng lá»‹ch sá»­
  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(`Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n há»§y lá»‹ch háº¹n mÃ£ #${bookingId} khÃ´ng?`);
    if (!confirmCancel) return;

    try {
      await customerApi.cancelBooking(bookingId);
      alert("Há»§y lá»‹ch háº¹n thÃ nh cÃ´ng!");
      await loadUserHistory();
    } catch (error) {
      console.error("Lá»—i há»§y Ä‘áº·t lá»‹ch:", error);
      alert("KhÃ´ng thá»ƒ há»§y lá»‹ch háº¹n: " + (error.response?.data?.message || error.message));
    }
  };

  // TÃ­nh toÃ¡n giÃ¡ gÃ³i dá»‹ch vá»¥ (Äá»“ng giÃ¡ xe mÃ¡y toÃ n há»‡ thá»‘ng)
  const calculatePackagePrice = (basePrice) => {
    return basePrice;
  };

  // Xá»­ lÃ½ báº­t/táº¯t tiá»‡n Ã­ch cá»™ng thÃªm
  const handleToggleAddon = (addonId) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  // TÃ­nh tá»•ng tiá»n táº¡m tÃ­nh
  const calculateTotalAmount = () => {
    let total = 0;
    if (selectedPackage) {
      total += calculatePackagePrice(selectedPackage.basePrice);
    }
    selectedAddons.forEach(addonId => {
      const addon = addonServices.find(a => a.id === addonId);
      if (addon) total += addon.price;
    });
    return total;
  };

  const calculateDiscount = () => {
    if (!selectedVoucher) return 0;
    const total = calculateTotalAmount();
    
    if (selectedVoucher.discountType === 'FIXED_AMOUNT') {
      const val = Number(selectedVoucher.value);
      return val > total ? total : val;
    } else if (selectedVoucher.discountType === 'PERCENTAGE') {
      const pct = Number(selectedVoucher.value);
      return Math.round((total * pct) / 100);
    } else if (selectedVoucher.discountType === 'FREE_SERVICE') {
      return total;
    }
    return 0;
  };

  const resetVehicleForm = () => {
    setVehicleModel('');
    setVehicleLicensePlate('');
    setVehicleIsDefault(false);
    setEditingVehicle(null);
  };

  const closeVehicleModal = () => {
    setIsVehicleModalOpen(false);
    resetVehicleForm();
  };

  const openAddVehicleModal = () => {
    setIsVehicleModalOpen(true);
    resetVehicleForm();
  };

  const openEditVehicleModal = (vehicle) => {
    setIsVehicleModalOpen(true);
    setEditingVehicle(vehicle);
    setVehicleModel(vehicle.model || '');
    setVehicleLicensePlate(vehicle.licensePlate || '');
    setVehicleIsDefault(Boolean(vehicle.isDefault));
  };

  const handleVehicleLicensePlateChange = (e) => {
    setVehicleLicensePlate(e.target.value.toUpperCase());
  };

  const handleSetDefault = async (veh) => {
    // Optimistic UI update
    const previousVehicles = [...vehicles];
    const previousSelected = selectedVehicle;

    setSelectedVehicle(veh);
    setVehicles(vehicles.map(v => ({
      ...v,
      isDefault: (v.vehicleId || v.id) === (veh.vehicleId || veh.id)
    })));

    try {
      await customerApi.setDefaultVehicle(veh.vehicleId || veh.id);
    } catch (err) {
      console.error('Lỗi khi set default vehicle:', err);
      // Rollback on failure
      setVehicles(previousVehicles);
      setSelectedVehicle(previousSelected);
    }
  };

  const saveVehicleToBackend = async (payload) => {
    console.log('[CustomerBookingPage] save vehicle payload:', payload);

    if (payload.id && payload.id !== 'temp') {
      return payload;
    }

    try {
      const created = await customerApi.addVehicle(payload);
      return created;
    } catch (error) {
      console.warn('customerApi.addVehicle failed, using local fallback:', error);
      return payload;
    }
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();

    const trimmedModel = vehicleModel.trim();
    const trimmedPlate = vehicleLicensePlate.trim().toUpperCase();

    if (!trimmedModel) {
      alert('Vui lÃ²ng nháº­p tÃªn/dÃ²ng xe mÃ¡y.');
      return;
    }

    if (!trimmedPlate) {
      alert('Vui lÃ²ng nháº­p biá»ƒn sá»‘ xe.');
      return;
    }

    const payload = {
      id: editingVehicle?.id || `temp-${Date.now()}`,
      model: trimmedModel,
      licensePlate: trimmedPlate,
      isDefault: vehicleIsDefault,
      vehicleType: editingVehicle?.vehicleType || 'MOTORCYCLE'
    };

    try {
      const savedVehicle = await saveVehicleToBackend(payload);
      const normalizedVehicle = {
        ...savedVehicle,
        model: trimmedModel,
        licensePlate: trimmedPlate,
        isDefault: vehicleIsDefault,
        vehicleType: savedVehicle.vehicleType || payload.vehicleType
      };

      setVehicles(prev => {
        const next = prev.map(vehicle => ({
          ...vehicle,
          isDefault: vehicleIsDefault && editingVehicle?.id === vehicle.id ? true : false
        }));

        if (editingVehicle) {
          return next.map(vehicle => (vehicle.id === editingVehicle.id ? normalizedVehicle : vehicle));
        }

        return [...next, normalizedVehicle];
      });

      setSelectedVehicle(normalizedVehicle);
      closeVehicleModal();
      alert(editingVehicle ? 'Cáº­p nháº­t xe thÃ nh cÃ´ng!' : 'ÄÄƒng kÃ½ xe má»›i thÃ nh cÃ´ng!');
      console.log('[CustomerBookingPage] vehicle saved:', normalizedVehicle);
    } catch (err) {
      console.error('Failed to save vehicle:', err);
      alert('Lá»—i khi lÆ°u xe: ' + (err.response?.data?.message || err.message));
    }
  };

  // Gá»­i Ä‘Æ¡n Ä‘áº·t lá»‹ch lÃªn há»‡ thá»‘ng
  const handleConfirmBooking = async () => {
    if (!selectedVehicle) {
      alert("Vui lÃ²ng chá»n 1 chiáº¿c xe mÃ¡y Ä‘á»ƒ dá»n rá»­a.");
      return;
    }
    if (!selectedPackage) {
      alert("Vui lÃ²ng chá»n 1 gÃ³i dá»‹ch vá»¥ dá»n rá»­a chÃ­nh.");
      return;
    }
    if (!selectedDate || !selectedTime) {
      alert("Vui lÃ²ng chá»n ngÃ y vÃ  giá» háº¹n mong muá»‘n.");
      return;
    }

    const trimmedLicensePlate = String(selectedVehicle.licensePlate || '').trim().toUpperCase();
    const trimmedModel = String(selectedVehicle.model || '').trim();

    if (!trimmedLicensePlate) {
      alert('Vui lÃ²ng chá»n xe cÃ³ biá»ƒn sá»‘ há»£p lá»‡.');
      return;
    }
    if (!trimmedModel) {
      alert('Vui lÃ²ng chá»n xe cÃ³ model há»£p lá»‡.');
      return;
    }

    const selectedPackageId = Number(selectedPackage?.id || selectedPackage?.serviceId || 0);
    if (!selectedPackageId) {
      alert('KhÃ´ng tÃ¬m tháº¥y gÃ³i dá»‹ch vá»¥. Vui lÃ²ng chá»n láº¡i.');
      return;
    }
    const selectedSlot = timeSlots.find(s => s.slotId === selectedTimeSlotId || s.time === selectedTime);
if (selectedSlot && (selectedSlot.bookedCount >= selectedSlot.maxCapacity || selectedSlot.availableCapacity <= 0)) {
      alert("Khung giá» nÃ y hiá»‡n Ä‘Ã£ Ä‘áº§y cÃ´ng suáº¥t dá»n rá»­a! Ráº¥t tiáº¿c vÃ¬ sá»± báº¥t tiá»‡n nÃ y, mong quÃ½ khÃ¡ch vui lÃ²ng chá»n má»™t khung giá» khÃ¡c.");
      return;
    }
    setIsSubmitting(true);

    const bookingData = {
      licensePlate: trimmedLicensePlate,
      model: trimmedModel,
      bookingDate: selectedDate,
      timeSlotId: Number(selectedTimeSlotId || 1),
      packageId: selectedPackageId,
      addonIds: selectedAddons || [],
      notes: selectedVoucher ? `Ãp dá»¥ng voucher ${selectedVoucher.voucherCode}` : 'Äáº·t qua Mobile App',
      voucherCode: selectedVoucher?.voucherCode || ''
    };

    try {
      const token = localStorage.getItem('autowash_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post('/api/v1/customer/bookings', bookingData, { headers });
      const createdBooking = response.data;

      alert(`Äáº·t lá»‹ch thÃ nh cÃ´ng! MÃ£ Ä‘Æ¡n cá»§a báº¡n lÃ : ${createdBooking.bookingCode || createdBooking.id}. HÃ£y Ä‘áº¿n tráº¡m Ä‘Ãºng giá» háº¹n.`);

      // Sync local history fallback
      setUserHistory(prev => [
        {
          id: createdBooking.bookingId || createdBooking.id,
          bookingCode: createdBooking.bookingCode || createdBooking.id,
          date: selectedDate,
          time: selectedTime,
          packageName: selectedPackage.name,
          licensePlate: trimmedLicensePlate,
          model: trimmedModel,
          finalAmount: createdBooking.finalAmount || (calculateTotalAmount() - calculateDiscount()),
          status: 'Pending'
        },
        ...prev
      ]);

      // Reset selection state
      setSelectedVoucher(null);
      setSelectedTime("");
      setSelectedTimeSlotId(null);

      setBookingTab('history');
      await loadUserHistory();
      await loadCustomerVouchers();
    } catch (err) {
      console.error('Failed to create booking:', err);
      const message = err.response?.data?.message || err.response?.data?.error || err.message || 'KhÃ´ng thá»ƒ lÆ°u Ä‘áº·t lá»‹ch. Vui lÃ²ng thá»­ láº¡i.';
      alert('ÄÃ£ xáº£y ra lá»—i khi táº¡o Ä‘Æ¡n Ä‘áº·t lá»‹ch: ' + message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format tiá»n tá»‡ VNÄ
  const formatVnd = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      
      {/* THANH TAB CHá»ŒN PHÃ‚N Há»† Äáº¶T Lá»ŠCH / Lá»ŠCH Sá»¬ ÄÆ N */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-2xl">
        <button
          onClick={() => setBookingTab('new')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all ${
            bookingTab === 'new'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <CalendarIcon size={16} /> Äáº·t lá»‹ch rá»­a xe má»›i
        </button>
        <button
          onClick={() => setBookingTab('history')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all ${
            bookingTab === 'history'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <History size={16} /> Lá»‹ch sá»­ Ä‘áº·t lá»‹ch ({userHistory.length})
        </button>
      </div>

      {bookingTab === 'new' ? (
        /* ========================================================================================= */
        /* TAB 1: GIAO DIá»†N Äáº¶T Lá»ŠCH Má»šI (NEW BOOKING) */
        /* ========================================================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* SECTION 1: CHá»ŒN XE MÃY */}
            <section className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                  Chá»n phÆ°Æ¡ng tiá»‡n dá»n rá»­a
                </h3>
                {vehicles.length > 0 && (
                  <button 
                    onClick={openAddVehicleModal}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold"
                  >
                    <Plus size={14} /> ÄÄƒng kÃ½ xe má»›i
                  </button>
                )}
              </div>

              {vehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicles.map(veh => (
                      <div key={veh.vehicleId || veh.id} className={`relative group transition-all duration-300 ${!veh.isDefault ? 'hover:-translate-y-1 hover:shadow-lg rounded-xl' : ''}`}>
                        <VehicleCard 
                          vehicle={veh}
                          isDefault={veh.isDefault}
                          isSelected={selectedVehicle?.vehicleId === (veh.vehicleId || veh.id) || selectedVehicle?.id === (veh.vehicleId || veh.id)}
                          isSelectable={true}
                          onSelect={(v) => setSelectedVehicle(v)}
                          onEdit={(e) => openEditVehicleModal(veh)}
                          onDelete={() => {}}
                        />
                        {!veh.isDefault && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefault(veh);
                            }}
                            className="absolute top-3 right-3 z-10 text-[10px] bg-slate-100 text-slate-500 border hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                          >
                            Äáº·t máº·c Ä‘á»‹nh
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-sm bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center text-slate-300">
                    <Car size={24} className="text-blue-500" />
                  </div>
                  <p>Ga-ra cá»§a báº¡n Ä‘ang trá»‘ng trÆ¡n. HÃ£y Ä‘Äƒng kÃ½ chiáº¿c xe Ä‘áº§u tiÃªn cá»§a mÃ¬nh nhÃ©!</p>
                  <button 
                    onClick={openAddVehicleModal}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-all"
                  >
                    ÄÄƒng kÃ½ xe ngay
                  </button>
                </div>
              )}
            </section>

            {/* SECTION 2: CHá»ŒN GÃ“I Rá»¬A CHÃNH */}
            <section className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
                Chá»n gÃ³i dá»‹ch vá»¥ chÃ­nh
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {corePackages.map(pkg => {
                  const currentPrice = calculatePackagePrice(pkg.basePrice);
                  const isSelected = selectedPackage?.id === pkg.id;

                  return (
                    <div 
                      key={pkg.id}
                      id={`package-${pkg.id}`}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`border rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between h-56 text-left relative ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50/10 shadow-md ring-1 ring-blue-500' 
                          : 'border-slate-200 hover:border-blue-300 hover:shadow'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-blue-600">
                          <CheckCircle size={18} fill="currentColor" className="text-blue-600 fill-blue-100" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{pkg.name}</h4>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">
                          â° {pkg.duration}
                        </span>
                        <p className="text-xs text-slate-500 mt-3 leading-relaxed line-clamp-3">{pkg.description}</p>
                      </div>
                      
                      <div className="mt-4">
                        <span className="font-mono text-base font-black text-blue-600">
                          {formatVnd(currentPrice)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 3: CHá»ŒN TIá»†N ÃCH Cá»˜NG THÃŠM */}
            <section className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</span>
                Tiá»‡n Ã­ch cá»™ng thÃªm (Add-ons)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addonServices.map(addon => {
                  const isChecked = selectedAddons.includes(addon.id);

                  return (
                    <div 
                      key={addon.id}
                      onClick={() => handleToggleAddon(addon.id)}
                      className={`border rounded-xl p-4 cursor-pointer transition-all flex justify-between items-center ${
                        isChecked 
                          ? 'border-blue-500 bg-blue-50/15' 
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300 pointer-events-none"
                        />
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">{addon.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{addon.description}</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-700 shrink-0">
                        +{formatVnd(addon.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 4: CHá»ŒN NGÃ€Y & KHUNG GIá»œ Háº¸N Háº N Äá»ŠNH THEO TIER */}
            <section className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">4</span>
                Chá»n NgÃ y & Giá» rá»­a xe
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">NgÃ y háº¹n dá»n xe</label>
                  <input 
                    type="date"
                    min={todayStr}
                    max={maxDateStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block mt-2 leading-relaxed">
                    * Háº¡ng **PLATINUM MEMBER** cá»§a báº¡n Ä‘Æ°á»£c Æ°u tiÃªn Ä‘áº·t trÆ°á»›c tá»‘i Ä‘a **{bookingWindowDays} ngÃ y** (Má»©c tráº§n cao nháº¥t há»‡ thá»‘ng).
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Khung giá» hoáº¡t Ä‘á»™ng</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(slot => (
                      <button
                          key={slot.time}
                          disabled={slot.bookedCount >= slot.maxCapacity || slot.availableCapacity <= 0}
                          onClick={() => { setSelectedTime(slot.time); setSelectedTimeSlotId(slot.slotId); }}
                          className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all flex flex-col items-center
                        justify-center min-h-[50px] ${
                            selectedTime === slot.time
                              ? 'bg-blue-600 text-white border-blue-600'
                              : (slot.bookedCount >= slot.maxCapacity || slot.availableCapacity <= 0)
                                ? 'bg-slate-100 text-slate-300 border-slate-150 cursor-not-allowed'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-500 hover:text-blue-600'
                          }`}
                        >
                          <span>{slot.time}</span>
                          {(slot.bookedCount >= slot.maxCapacity || slot.availableCapacity <= 0) && (
                                <span className="text-[8px] font-extrabold uppercase mt-0.5 text-red-500">
                                  Äáº¦Y
                                </span>
                              )}
                        </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm sticky top-20">
              <h3 className="font-bold text-slate-800 text-base border-b pb-4 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" /> TÃ³m táº¯t lá»‹ch háº¹n dá»n xe
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-start">
                  <span className="text-slate-400 font-medium">Xe dá»n rá»­a:</span>
                  <span className="text-slate-800 font-bold text-right">
                    {selectedVehicle ? `${selectedVehicle.model} (${selectedVehicle.licensePlate})` : 'ChÆ°a chá»n'}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-slate-400 font-medium">GÃ³i dá»n rá»­a:</span>
                  <span className="text-slate-800 font-bold text-right">
                    {selectedPackage ? selectedPackage.name : 'ChÆ°a chá»n'}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-slate-400 font-medium">Tiá»‡n Ã­ch kÃ¨m:</span>
                  <span className="text-slate-800 font-bold text-right">
                    {selectedAddons.length > 0 
                      ? selectedAddons.map(id => addonServices.find(a => a.id === id)?.name).join(', ') 
                      : 'KhÃ´ng chá»n'}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-slate-400 font-medium">Lá»‹ch háº¹n dá»n:</span>
                  <span className="text-slate-800 font-bold text-right">
                    {selectedDate && selectedTime ? `${selectedTime} ngÃ y ${selectedDate}` : 'ChÆ°a chá»n'}
                  </span>
                </div>

                {/* Chá»n Voucher tá»« VÃ­ cÃ¡ nhÃ¢n */}
                <div className="border-t my-4 pt-4 space-y-2">
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Æ¯u Ä‘Ã£i cá»§a báº¡n:</span>
                  {myVouchers.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">VÃ­ cá»§a báº¡n hiá»‡n chÆ°a cÃ³ voucher kháº£ dá»¥ng.</p>
                  ) : (
                    <select
                      value={selectedVoucher ? selectedVoucher.voucherCode : ''}
                      onChange={(e) => {
                        const code = e.target.value;
                        const v = myVouchers.find(x => x.voucherCode === code);
                        setSelectedVoucher(v || null);
                      }}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-blue-500 outline-none font-medium text-slate-700 bg-white"
                    >
                      <option value="">-- Ãp dá»¥ng Voucher giáº£m giÃ¡ --</option>
                      {myVouchers.map(v => {
                        const discountDesc = v.discountType === 'FREE_SERVICE' 
                          ? 'Miá»…n phÃ­ rá»­a xe' 
                          : v.discountType === 'PERCENTAGE' 
                            ? `Giáº£m ${v.value}%` 
                            : `Giáº£m ${Number(v.value).toLocaleString('vi-VN')} Ä‘`;
                        return (
                          <option key={v.voucherCode} value={v.voucherCode}>
                            [{v.voucherCode}] {v.title || 'Voucher'} ({discountDesc})
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>

                <div className="border-t my-4"></div>

                <div className="space-y-2 pb-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Cá»™ng táº¡m tÃ­nh:</span>
                    <span className="font-mono text-slate-800 font-bold">
                      {formatVnd(calculateTotalAmount())}
                    </span>
                  </div>

                  {selectedVoucher && (
                    <div className="flex justify-between items-center text-xs text-emerald-600 font-bold">
                      <span>Voucher giáº£m giÃ¡ ({selectedVoucher.voucherCode}):</span>
                      <span className="font-mono">
                        -{formatVnd(calculateDiscount())}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-dashed">
                    <span className="text-slate-800 font-black text-sm">Tá»•ng hÃ³a Ä‘Æ¡n táº¡m tÃ­nh:</span>
                    <span className="font-mono text-lg font-black text-blue-600">
                      {formatVnd(Math.max(0, calculateTotalAmount() - calculateDiscount()))}
                    </span>
                  </div>
                </div>

                <button 
                  disabled={isSubmitting}
                  onClick={handleConfirmBooking}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:bg-blue-400"
                >
                  {isSubmitting ? 'Äang táº¡o Ä‘Æ¡n háº¹n...' : 'XÃ¡c nháº­n Äáº·t lá»‹ch ngay'}
                </button>

                <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-4 text-[10px] text-slate-500 leading-relaxed">
                  <AlertCircle size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    KhÃ´ng cáº§n thanh toÃ¡n trÆ°á»›c! Báº¡n chá»‰ cáº§n Ä‘áº¿n tráº¡m Ä‘Ãºng giá» háº¹n Ä‘á»ƒ check-in vÃ  thá»±c hiá»‡n rá»­a xe, tÃ­ch Ä‘iá»ƒm VIP.
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* ========================================================================================= */
        /* TAB 2: Lá»ŠCH Sá»¬ Äáº¶T Lá»ŠCH Dá»ŒN XE Cá»¦A KHÃCH HÃ€NG */
        /* ========================================================================================= */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm border-b pb-3 mb-4">Nháº­t kÃ½ lá»‹ch trÃ¬nh Ä‘áº·t háº¹n rá»­a xe mÃ¡y</h3>
          
          {userHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-655 border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-3 px-2">MÃ£ ÄÆ¡n háº¹n</th>
                    <th className="py-3 px-2">Thá»i gian háº¹n</th>
                    <th className="py-3 px-2">PhÆ°Æ¡ng tiá»‡n</th>
                    <th className="py-3 px-2">Dá»‹ch vá»¥ dá»n rá»­a</th>
                    <th className="py-3 px-2 text-right">Tá»•ng tiá»n</th>
                    <th className="py-3 px-2 text-center">Tráº¡ng thÃ¡i</th>
                    <th className="py-3 px-2 text-right">Thao tÃ¡c</th>
                  </tr>
                </thead>
                <tbody>
                  {userHistory.map(b => (
                    <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-2 font-mono font-bold text-blue-600">{b.bookingCode}</td>
                      <td className="py-4 px-2 font-mono">
                        {b.date} <span className="text-slate-400 font-sans">vÃ o</span> {b.time}
                      </td>
                      <td className="py-4 px-2 font-medium">{b.model} ({b.licensePlate})</td>
                      <td className="py-4 px-2">{b.packageName}</td>
                      <td className="py-4 px-2 text-right font-mono font-bold text-slate-800">{formatVnd(b.finalAmount)}</td>
                      <td className="py-4 px-2 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          b.status?.toLowerCase() === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-250'
                            : b.status?.toLowerCase() === 'pending'
                              ? 'bg-yellow-50 text-yellow-700 border border-yellow-250'
                              : 'bg-red-50 text-red-700 border border-red-250'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        {b.status?.toLowerCase() === 'pending' ? (
                          <button 
                            onClick={() => handleCancelBooking(b.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-all flex items-center gap-1 text-[10px] font-bold ml-auto"
                          >
                            <Trash2 size={12} /> Há»§y lá»‹ch háº¹n
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              ChÆ°a ghi nháº­n lá»‹ch háº¹n nÃ o trong lá»‹ch sá»­.
            </div>
          )}
        </div>
      )}

      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <h3 className="text-base font-bold text-slate-800">
                {editingVehicle ? 'Cáº­p nháº­t thÃ´ng tin xe mÃ¡y' : 'ÄÄƒng kÃ½ xe mÃ¡y má»›i'}
              </h3>
              <button
                onClick={closeVehicleModal}
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  TÃªn/DÃ²ng xe mÃ¡y
                </label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="VÃ­ dá»¥: Honda SH 150i, Yamaha Exciter..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Biá»ƒn sá»‘ xe
                </label>
                <input
                  type="text"
                  value={vehicleLicensePlate}
                  onChange={handleVehicleLicensePlateChange}
                  placeholder="VÃ­ dá»¥: 29-H1 888.88 hoáº·c 59-S3 123.45"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 font-mono text-sm tracking-wide outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="vehicleIsDefault"
                  checked={vehicleIsDefault}
                  onChange={(e) => setVehicleIsDefault(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="vehicleIsDefault" className="cursor-pointer text-xs font-semibold text-slate-600">
                  Äáº·t chiáº¿c xe nÃ y lÃ m máº·c Ä‘á»‹nh Ä‘á»ƒ rá»­a
                </label>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-[10px] leading-relaxed text-slate-500">
                <AlertCircle size={14} className="mt-0.5 shrink-0 text-blue-500" />
                <span>
                  * Dá»‹ch vá»¥ dá»n rá»­a xe Ä‘Æ°á»£c Ä‘á»“ng giÃ¡ cho má»i dÃ²ng xe sá»‘, xe ga vÃ  PKL. Biá»ƒn sá»‘ xe sáº½ Ä‘Æ°á»£c ghi nháº­n vÃ o phiáº¿u check-in Ä‘á»‘i soÃ¡t.
                </span>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={closeVehicleModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
                >
                  Há»§y bá»
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
                >
                  {editingVehicle ? 'LÆ°u thay Ä‘á»•i' : 'ÄÄƒng kÃ½ ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

