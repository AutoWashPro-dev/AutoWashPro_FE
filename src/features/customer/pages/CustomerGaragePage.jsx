import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Car, ShieldCheck, AlertCircle, X, Loader2, Calendar } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import { customerApi } from '../services/customerApi';
import { formatLicensePlate, validateLicensePlate } from '../../../utils/validationUtils';

export default function CustomerGaragePage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTargetVehicle, setDeleteTargetVehicle] = useState(null);
  const [garageAlert, setGarageAlert] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  // Custom Alerts helper to match design system
  const showAlert = (message, type = 'warning', title = 'Thông báo') => {
    setGarageAlert({
      isOpen: true,
      type,
      title,
      message
    });
  };

  // States for adding vehicle confirmation modal
  const [isVehicleConfirmModalOpen, setIsVehicleConfirmModalOpen] = useState(false);
  const [vehiclePayloadToConfirm, setVehiclePayloadToConfirm] = useState(null);
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);

  // Close modals on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDeleteTargetVehicle(null);
        setGarageAlert(prev => ({ ...prev, isOpen: false }));
        setIsVehicleConfirmModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchVehicles = async () => {
    try {
      const data = await customerApi.getMyVehicles();
      if (Array.isArray(data)) {
        // Enforce strict data fallback logic
        const mappedVehicles = data.map(v => ({
          ...v,
          vehicleId: v.vehicleId || v.id,
          brand: v.brand || 'N/A',
          model: v.model || 'N/A',
          licensePlate: v.licensePlate || v.plate || 'N/A',
          color: v.color || 'N/A',
          year: v.year || 'N/A',
          vehicleType: v.vehicleType || v.type || 'N/A',
          isDefault: v.isDefault ?? false
        }));
        setVehicles(mappedVehicles);
      }
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchVehicles();
  }, []);

  React.useEffect(() => {
    window.addEventListener('vehicleListUpdated', fetchVehicles);
    return () => window.removeEventListener('vehicleListUpdated', fetchVehicles);
  }, []);

  // States quản lý Form Thêm/Sửa xe máy
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('Scooter');
  const [isDefault, setIsDefault] = useState(false);
  const [licensePlateError, setLicensePlateError] = useState('');

  // Mở modal Thêm xe mới
  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setModel('');
    setLicensePlate('');
    setVehicleType('Scooter');
    setIsDefault(false);
    setLicensePlateError('');
    setIsModalOpen(true);
  };

  // Mở modal Chỉnh sửa xe
  const handleOpenEditModal = (veh) => {
    setEditingVehicle(veh);
    setModel(veh.model);
    setLicensePlate(veh.licensePlate);
    setVehicleType(veh.vehicleType);
    setIsDefault(veh.isDefault);
    setLicensePlateError('');
    setIsModalOpen(true);
  };

  const handleLicensePlateChange = (e) => {
    const formatted = formatLicensePlate(e.target.value);
    setLicensePlate(formatted);
    if (formatted && !validateLicensePlate(formatted)) {
      setLicensePlateError('Biển số xe không đúng định dạng (VD: 59-A1 123.45 hoặc 29H-666.66)');
    } else {
      setLicensePlateError('');
    }
  };

  // Lưu thông tin xe (Thêm mới hoặc Cập nhật)
  const handleSaveVehicle = (e) => {
    if (e) e.preventDefault();

    const trimmedModel = model.trim();
    const trimmedPlate = licensePlate.trim().toUpperCase();

    if (!trimmedModel || !trimmedPlate) {
      showAlert("Vui lòng nhập đầy đủ Tên xe và Biển số xe.", "warning");
      return;
    }

    if (!validateLicensePlate(trimmedPlate)) {
      setLicensePlateError('Biển số xe không đúng định dạng (VD: 59-A1 123.45 hoặc 29-A1 1234)');
      return;
    }

    const isFirstVehicle = vehicles.length === 0;

    const payload = { 
      model: trimmedModel, 
      licensePlate: trimmedPlate, 
      isDefault: isFirstVehicle ? true : isDefault 
    };

    setVehiclePayloadToConfirm(payload);
    setIsVehicleConfirmModalOpen(true);
  };

  const handleConfirmSaveVehicle = async () => {
    if (!vehiclePayloadToConfirm) return;
    setIsSubmittingVehicle(true);

    const trimmedModel = vehiclePayloadToConfirm.model;
    const trimmedPlate = vehiclePayloadToConfirm.licensePlate;
    const isFirstVehicle = vehicles.length === 0;

    try {
      if (editingVehicle) {
        // Cập nhật xe cũ (mô phỏng, backend cần PUT api)
        let updatedVehicles = [...vehicles];
        if (vehiclePayloadToConfirm.isDefault) {
          updatedVehicles = updatedVehicles.map(v => ({ ...v, isDefault: false }));
        }
        setVehicles(updatedVehicles.map(v => 
          v.vehicleId === editingVehicle.vehicleId 
            ? { ...v, model: trimmedModel, licensePlate: trimmedPlate, vehicleType, isDefault: vehiclePayloadToConfirm.isDefault } 
            : v
        ));
        showAlert('Cập nhật xe thành công!', 'success', 'Thành công');
      } else {
        // Thêm xe mới qua API
        const newVeh = await customerApi.addVehicle(vehiclePayloadToConfirm);
        
        let updatedVehicles = [...vehicles];
        if (isFirstVehicle || vehiclePayloadToConfirm.isDefault) {
          updatedVehicles = updatedVehicles.map(v => ({ ...v, isDefault: false }));
        }
        
        // Enforce fallback for the new vehicle data
        const safeVeh = {
          ...newVeh,
          vehicleId: newVeh.vehicleId || newVeh.id || Date.now(),
          brand: newVeh.brand || 'N/A',
          model: newVeh.model || trimmedModel || 'N/A',
          licensePlate: newVeh.licensePlate || trimmedPlate || 'N/A',
          color: newVeh.color || 'N/A',
          year: newVeh.year || 'N/A',
          vehicleType: newVeh.vehicleType || vehicleType || 'N/A',
          isDefault: isFirstVehicle ? true : vehiclePayloadToConfirm.isDefault
        };
        
        setVehicles([...updatedVehicles, safeVeh]);
        showAlert('Đăng ký xe mới thành công!', 'success', 'Thành công');
      }
      setIsModalOpen(false);
      setIsVehicleConfirmModalOpen(false);
    } catch (err) {
      showAlert("Lỗi khi lưu thông tin xe: " + (err.response?.data?.message || err.message), "error", "Lỗi");
      console.error(err);
    } finally {
      setIsSubmittingVehicle(false);
      setVehiclePayloadToConfirm(null);
    }
  };

  // Xóa xe máy khỏi ga-ra
  const handleDeleteVehicle = (veh) => {
    if (veh.isDefault && vehicles.length > 1) {
      setGarageAlert({
        isOpen: true,
        type: 'error',
        title: 'Không thể xóa',
        message: 'Bạn không thể xóa xe mặc định. Vui lòng đặt xe khác làm mặc định trước.'
      });
      return;
    }
    setDeleteTargetVehicle(veh);
  };

  const executeDeleteVehicle = async () => {
    if (!deleteTargetVehicle) return;
    const vehicleId = deleteTargetVehicle.vehicleId || deleteTargetVehicle.id;
    try {
      await customerApi.deleteVehicle(vehicleId);
      setVehicles(prev => prev.filter(v => (v.vehicleId || v.id) !== vehicleId));
      setGarageAlert({
        isOpen: true,
        type: 'success',
        title: 'Xóa thành công',
        message: 'Đã xóa phương tiện thành công!',
        showCta: false
      });
      window.dispatchEvent(new Event('vehicleListUpdated'));
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Không thể xóa phương tiện đang có lịch hẹn hoạt động.';
      setGarageAlert({
        isOpen: true,
        type: 'error',
        title: 'Lỗi xóa phương tiện',
        message: errMsg,
        showCta: true
      });
    } finally {
      setDeleteTargetVehicle(null);
    }
  };

  // Click nhanh để đổi xe mặc định
  const handleSetDefault = async (veh) => {
    try {
      const vehicleId = veh.vehicleId || veh.id;
      await customerApi.setDefaultVehicle(vehicleId);
      
      // Optimistic UI Update
      setVehicles(vehicles.map(v => ({
        ...v,
        isDefault: (v.vehicleId || v.id) === vehicleId
      })));
      showAlert('Đặt xe mặc định thành công!', 'success', 'Thành công');
    } catch (err) {
      console.error('Failed to set default vehicle:', err);
      showAlert('Có lỗi xảy ra khi đặt xe làm mặc định. Vui lòng thử lại.', 'error', 'Cập nhật thất bại');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* KHU VỰC THÔNG TIN TIÊU ĐỀ */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Car size={20} className="text-blue-600" /> Quản lý Ga-ra xe máy của tôi
          </h1>
          <p className="text-xs text-slate-500 mt-1">Đăng ký sẵn các phương tiện cá nhân giúp quy trình đặt lịch rửa xe diễn ra nhanh gọn hơn.</p>
        </div>
      </div>

      {/* LƯỚI THỂ HIỂN THỊ DANH SÁCH XE */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-slate-400 gap-2">
          <Loader2 className="animate-spin" size={24} /> Đang tải danh sách xe...
        </div>
      ) : vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card đăng ký xe nhanh (Dạng nét đứt) */}
          <div 
            onClick={handleOpenAddModal}
            className="border-2 border-dashed border-slate-350 hover:border-blue-500 rounded-xl p-6 flex flex-col justify-center items-center gap-2 cursor-pointer transition-all hover:bg-blue-50/5 h-44 group"
          >
            <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
              <Plus size={20} />
            </div>
            <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600 transition-colors">Đăng ký thêm xe</span>
          </div>

          {/* Render danh sách xe */}
          {vehicles.map(veh => (
            <div key={veh.vehicleId} className="relative group">
              <VehicleCard 
                vehicle={veh}
                isDefault={veh.isDefault}
                isSelectable={false}
                onEdit={() => handleOpenEditModal(veh)}
                onDelete={() => handleDeleteVehicle(veh)}
                onSetDefault={() => handleSetDefault(veh)}
              />
            </div>
          ))}

        </div>
      ) : (
        <div className="text-center py-16 text-slate-400 text-sm bg-white border border-dashed rounded-2xl flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
            <Car size={24} />
          </div>
          <p>Ga-ra của bạn đang trống trơn. Hãy đăng ký chiếc xe đầu tiên của mình nhé!</p>
          <button 
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
          >
            Đăng ký xe ngay
          </button>
        </div>
      )}

      {/* POPUP MODAL THÊM / SỬA THÔNG TIN XE MÁY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative p-6">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="font-bold text-slate-800 text-base">
                {editingVehicle ? 'Cập nhật thông tin xe máy' : 'Đăng ký xe máy mới'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveVehicle} className="space-y-4">
              
              {/* Tên xe */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Tên/Dòng xe máy</label>
                <input 
                  type="text" 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Ví dụ: Honda SH 150i, Yamaha Exciter..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Biển số xe</label>
                <input 
                  type="text" 
                  value={licensePlate}
                  onChange={handleLicensePlateChange}
                  onBlur={handleLicensePlateChange}
                  placeholder="Ví dụ: 29-H1 888.88 hoặc 59-S3 123.45"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono tracking-wide"
                  required
                />
                {licensePlateError && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{licensePlateError}</p>
                )}
              </div>


              {/* Checkbox đặt mặc định */}
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300 cursor-pointer"
                />
                <label htmlFor="isDefault" className="text-xs text-slate-600 font-semibold cursor-pointer">
                  Đặt chiếc xe này làm mặc định để rửa
                </label>
              </div>

              {/* Hướng dẫn quy định đồng giá */}
              <div className="flex items-start gap-2 bg-blue-50/50 border border-blue-100 p-3 rounded-xl text-[10px] text-slate-500 leading-relaxed">
                <AlertCircle size={14} className="text-blue-500 shrink-0 mt-0.5" />
                <span>
                  * Dịch vụ dọn rửa xe được đồng giá cho mọi dòng xe số, xe ga và PKL. Biển số xe sẽ được ghi nhận vào phiếu check-in đối soát.
                </span>
              </div>

              {/* Nút hành động */}
              <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-500"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={!model.trim() || !licensePlate.trim() || !!licensePlateError}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {editingVehicle ? 'Lưu thay đổi' : 'Đăng ký ngay'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      {/* 4. Add New Vehicle Confirmation Modal */}
      {isVehicleConfirmModalOpen && vehiclePayloadToConfirm && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsVehicleConfirmModalOpen(false); }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 animate-pulse">
              <Car className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-slate-800 mb-3 text-center">Xác nhận đăng ký phương tiện</h3>
            
            <div className="w-full bg-slate-50 rounded-xl p-4 mb-5 text-xs text-left space-y-2.5 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Tên/Dòng xe máy:</span>
                <span className="text-slate-850 font-bold">{vehiclePayloadToConfirm.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Biển số xe:</span>
                <span className="text-slate-850 font-mono font-bold">{vehiclePayloadToConfirm.licensePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Loại phương tiện:</span>
                <span className="text-slate-850 font-bold">Xe máy</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2.5 mt-1">
                <span className="text-slate-400 font-medium">Lựa chọn mặc định:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${vehiclePayloadToConfirm.isDefault ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                  {vehiclePayloadToConfirm.isDefault ? 'Đặt làm mặc định' : 'Không đặt mặc định'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsVehicleConfirmModalOpen(false)}
                className="flex-1 py-2.5 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-500 transition cursor-pointer"
              >
                Kiểm tra lại
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveVehicle}
                disabled={isSubmittingVehicle}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingVehicle && <Loader2 size={12} className="animate-spin" />}
                Xác nhận thêm xe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteTargetVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4 text-center">
            <h3 className="font-extrabold text-slate-800 text-lg">Xác nhận xóa phương tiện</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Bạn có chắc chắn muốn xóa phương tiện <strong className="text-slate-850 font-black">{deleteTargetVehicle.model} ({deleteTargetVehicle.licensePlate})</strong> khỏi danh sách garage của bạn? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetVehicle(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-500 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={executeDeleteVehicle}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-colors"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM ALERT DIALOG */}
      {garageAlert.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4 text-center">
            <div className="flex justify-center">
              {garageAlert.type === 'success' ? (
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
              ) : (
                <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-200 rounded-full flex items-center justify-center">
                  <AlertCircle size={24} />
                </div>
              )}
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">{garageAlert.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{garageAlert.message}</p>
            <div className="pt-2 flex flex-col gap-2">
              {garageAlert.type === 'error' && (
                <button
                  type="button"
                  onClick={() => {
                    setGarageAlert({ isOpen: false, type: 'success', title: '', message: '' });
                    navigate('/customer/book');
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Calendar size={14} /> Đi tới Quản lý / Hủy lịch đặt xe
                </button>
              )}
              <button
                type="button"
                onClick={() => setGarageAlert({ isOpen: false, type: 'success', title: '', message: '' })}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
