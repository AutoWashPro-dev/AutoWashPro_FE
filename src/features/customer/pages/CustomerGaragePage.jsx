import React, { useState } from 'react';
import { Plus, Car, ShieldCheck, AlertCircle, X, Loader2 } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import { customerApi } from '../services/customerApi';

export default function CustomerGaragePage() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
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
    fetchVehicles();
  }, []);

  // States quản lý Form Thêm/Sửa xe máy
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('Scooter');
  const [isDefault, setIsDefault] = useState(false);

  // Mở modal Thêm xe mới
  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setModel('');
    setLicensePlate('');
    setVehicleType('Scooter');
    setIsDefault(false);
    setIsModalOpen(true);
  };

  // Mở modal Chỉnh sửa xe
  const handleOpenEditModal = (veh) => {
    setEditingVehicle(veh);
    setModel(veh.model);
    setLicensePlate(veh.licensePlate);
    setVehicleType(veh.vehicleType);
    setIsDefault(veh.isDefault);
    setIsModalOpen(true);
  };

  // Lưu thông tin xe (Thêm mới hoặc Cập nhật)
  const handleSaveVehicle = async (e) => {
    e.preventDefault();

    if (!model.trim() || !licensePlate.trim()) {
      alert("Vui lòng nhập đầy đủ Tên xe và Biển số xe.");
      return;
    }

    const payload = { model, licensePlate, vehicleType, isDefault };

    try {
      if (editingVehicle) {
        // Cập nhật xe cũ (mô phỏng, backend cần PUT api)
        let updatedVehicles = [...vehicles];
        if (isDefault) {
          updatedVehicles = updatedVehicles.map(v => ({ ...v, isDefault: false }));
        }
        setVehicles(updatedVehicles.map(v => 
          v.vehicleId === editingVehicle.vehicleId 
            ? { ...v, model, licensePlate, vehicleType, isDefault } 
            : v
        ));
      } else {
        // Thêm xe mới qua API
        const newVeh = await customerApi.addVehicle(payload);
        
        let updatedVehicles = [...vehicles];
        if (isDefault) {
          updatedVehicles = updatedVehicles.map(v => ({ ...v, isDefault: false }));
        }
        
        // Enforce fallback for the new vehicle data
        const safeVeh = {
          ...newVeh,
          vehicleId: newVeh.vehicleId || newVeh.id || Date.now(),
          brand: newVeh.brand || 'N/A',
          model: newVeh.model || model || 'N/A',
          licensePlate: newVeh.licensePlate || licensePlate || 'N/A',
          color: newVeh.color || 'N/A',
          year: newVeh.year || 'N/A',
          vehicleType: newVeh.vehicleType || vehicleType || 'N/A',
          isDefault: vehicles.length === 0 ? true : isDefault
        };
        
        setVehicles([...updatedVehicles, safeVeh]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert("Lỗi khi lưu thông tin xe.");
      console.error(err);
    }
  };

  // Xóa xe máy khỏi ga-ra
  const handleDeleteVehicle = (veh) => {
    if (veh.isDefault && vehicles.length > 1) {
      alert("Bạn không thể xóa xe mặc định. Vui lòng đặt xe khác làm mặc định trước.");
      return;
    }

    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa xe "${veh.model} (${veh.licensePlate})" khỏi Ga-ra không?`);
    if (!confirmDelete) return;

    setVehicles(vehicles.filter(v => v.vehicleId !== veh.vehicleId));
  };

  // Click nhanh để đổi xe mặc định
  const handleSetDefault = async (veh) => {
    try {
      await customerApi.setDefaultVehicle(veh.vehicleId || veh.id);
      setVehicles(vehicles.map(v => ({
        ...v,
        isDefault: (v.vehicleId || v.id) === (veh.vehicleId || veh.id)
      })));
    } catch (err) {
      console.error('Lỗi khi set default vehicle:', err);
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
        {vehicles.length > 0 && (
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all"
          >
            <Plus size={14} /> Thêm xe mới
          </button>
        )}
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
            <span className="text-[10px] text-slate-400">Rút ngắn thời gian làm hóa đơn</span>
          </div>

          {/* Render danh sách xe */}
          {vehicles.map(veh => (
            <div key={veh.vehicleId} className="relative group">
              <VehicleCard 
                vehicle={veh}
                isDefault={veh.isDefault}
                isSelected={veh.isDefault}
                isSelectable={false}
                onEdit={() => handleOpenEditModal(veh)}
                onDelete={() => handleDeleteVehicle(veh)}
              />
              
              {/* Nút bấm nhanh để đặt mặc định khi di chuột qua card */}
              {!veh.isDefault && (
                <button 
                  onClick={() => handleSetDefault(veh)}
                  className="absolute top-3 right-3 text-[10px] bg-slate-100 text-slate-500 border hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                >
                  Đặt mặc định
                </button>
              )}
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

              {/* Biển số xe */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Biển số xe</label>
                <input 
                  type="text" 
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="Ví dụ: 29-H1 888.88 hoặc 59-S3 123.45"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono tracking-wide"
                  required
                />
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {editingVehicle ? 'Lưu thay đổi' : 'Đăng ký ngay'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
