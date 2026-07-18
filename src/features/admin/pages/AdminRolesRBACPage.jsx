import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Check, 
  AlertTriangle, 
  Key, 
  Layers, 
  Settings, 
  RefreshCw, 
  Save, 
  X, 
  HelpCircle, 
  Info
} from 'lucide-react';
import { roleApi } from '../services/roleApi';

export default function AdminRolesRBACPage() {
  const [activeTab, setActiveTab] = useState('roles'); // 'roles' | 'matrix'
  const [loading, setLoading] = useState(true);
  
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

  const userRoles = getRoles();
  const isManager = userRoles.includes('ROLE_MANAGER');

  const navigate = useNavigate();

  useEffect(() => {
    if (isManager) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isManager, navigate]);

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  
  // Matrix state tracking: map of roleId -> Set of permissionIds
  const [matrixState, setMatrixState] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // Form states for Create Modal
  const [newRoleForm, setNewRoleForm] = useState({
    roleName: 'ROLE_',
    description: '',
    selectedPermIds: []
  });

  // Form state for Edit Description
  const [editDescText, setEditDescText] = useState('');

  // Toast / alert feedback
  const [feedback, setFeedback] = useState(null);

  const showNotification = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([
        roleApi.getRoles(),
        roleApi.getPermissions(true)
      ]);
      setRoles(rolesData);
      setPermissions(permsData);

      // Initialize matrixState from rolesData
      const initialMap = {};
      rolesData.forEach(r => {
        initialMap[r.roleId] = new Set((r.permissions || []).map(p => p.permissionId));
      });
      setMatrixState(initialMap);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error loading roles data:', error);
      showNotification('Lỗi tải dữ liệu vai trò: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Group permissions by moduleGroup
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const group = perm.moduleGroup || 'Khác (Other)';
    if (!acc[group]) acc[group] = [];
    acc[group].push(perm);
    return acc;
  }, {});

  // Handle matrix checkbox toggle
  const handleTogglePermission = (roleId, permId, isLocked) => {
    if (isLocked) {
      showNotification('Không thể chỉnh sửa quyền của ROLE_ADMIN (quản trị tối cao) hoặc vai trò bị khóa!', 'error');
      return;
    }
    setMatrixState(prev => {
      const currentSet = new Set(prev[roleId] || []);
      if (currentSet.has(permId)) {
        currentSet.delete(permId);
      } else {
        currentSet.add(permId);
      }
      return { ...prev, [roleId]: currentSet };
    });
    setHasUnsavedChanges(true);
  };

  // Save matrix changes
  const handleSaveMatrix = async () => {
    setIsSaving(true);
    try {
      // Find editable roles
      const editableRoles = roles.filter(r => r.roleName !== 'ROLE_ADMIN');
      
      await Promise.all(
        editableRoles.map(r => {
          const newPermIds = Array.from(matrixState[r.roleId] || []);
          return roleApi.updateRolePermissions(r.roleId, newPermIds);
        })
      );
      
      showNotification('Đã cập nhật ma trận phân quyền RBAC thành công cho toàn hệ thống! 🚀', 'success');
      setHasUnsavedChanges(false);
      await loadData();
    } catch (error) {
      showNotification('Lỗi khi lưu ma trận quyền: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Create custom role handler
  const handleCreateRoleSubmit = async (e) => {
    e.preventDefault();
    if (!newRoleForm.roleName || !newRoleForm.roleName.startsWith('ROLE_')) {
      showNotification('Tên vai trò bắt buộc phải bắt đầu bằng ROLE_ (ví dụ: ROLE_SUPERVISOR)', 'error');
      return;
    }
    try {
      await roleApi.createRole({
        roleName: newRoleForm.roleName.toUpperCase(),
        description: newRoleForm.description,
        permissionIds: newRoleForm.selectedPermIds
      });
      showNotification(`Đã khởi tạo vai trò mới "${newRoleForm.roleName.toUpperCase()}" thành công!`, 'success');
      setShowCreateModal(false);
      setNewRoleForm({ roleName: 'ROLE_', description: '', selectedPermIds: [] });
      await loadData();
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  // Delete custom role handler
  const handleDeleteRole = async (role) => {
    if (['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CASHIER'].includes(role.roleName)) {
      showNotification('Không thể xóa các vai trò hệ thống mặc định (System Roles)!', 'error');
      return;
    }
    if (role.staffCount > 0) {
      showNotification(`Vai trò "${role.roleName}" đang được gán cho ${role.staffCount} nhân viên. Vui lòng chuyển vai trò của nhân viên trước khi xóa!`, 'error');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa vai trò tự chọn "${role.roleName}" khỏi hệ thống không?`)) {
      try {
        await roleApi.deleteRole(role.roleId);
        showNotification(`Đã xóa vai trò "${role.roleName}" thành công!`, 'success');
        await loadData();
      } catch (error) {
        showNotification(error.message, 'error');
      }
    }
  };

  // Edit description handler
  const handleUpdateDescription = async (e) => {
    e.preventDefault();
    if (!editingRole) return;
    try {
      await roleApi.updateRole(editingRole.roleId, { description: editDescText });
      showNotification(`Đã cập nhật mô tả cho "${editingRole.roleName}" thành công!`, 'success');
      setEditingRole(null);
      await loadData();
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f7fafd] text-slate-800 p-6 overflow-hidden">
      
      {/* Toast Notification Bar */}
      {feedback && (
        <div className={`fixed top-5 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border animate-slide-left transition-all ${
          feedback.type === 'error' 
            ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30' 
            : 'bg-slate-900 text-white border-slate-700 shadow-slate-900/30'
        }`}>
          {feedback.type === 'error' ? <AlertTriangle className="w-5 h-5 text-rose-300" /> : <CheckCircle className="w-5 h-5 text-[#57f287]" />}
          <span className="text-xs font-extrabold tracking-wide">{feedback.message}</span>
        </div>
      )}

      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#0047AB] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0047AB]/20 text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              Quản Lý Vai Trò & Phân Quyền (Roles & RBAC)
              <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-[#0047AB] text-[10px] font-black rounded-full uppercase tracking-wider">
                Enterprise Security
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Chuẩn hóa ma trận phân quyền theo mô hình Admin - Manager - Cashier. Quản lý truy cập API thời gian thực.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={loadData}
            disabled={loading}
            title="Làm mới dữ liệu từ máy chủ"
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0047AB]' : ''}`} />
          </button>

          {activeTab === 'matrix' && (
            <button
              onClick={handleSaveMatrix}
              disabled={!hasUnsavedChanges || isSaving}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-[#57f287] hover:bg-[#44db72] text-slate-900 shadow-[#57f287]/20 scale-[1.02]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Đang cập nhật...' : 'Lưu Thay Đổi Phân Quyền'}
            </button>
          )}

          {!isManager && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4.5 py-2.5 bg-[#0047AB] hover:bg-[#003a8c] text-white text-xs font-black rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#0047AB]/20 cursor-pointer hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Tạo Vai Trò Mới (Custom Role)
            </button>
          )}
        </div>
      </div>

      {/* 2. Tabs Navigation */}
      <div className="flex items-center gap-2 pt-4 pb-4 shrink-0">
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'roles'
              ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Key className="w-4 h-4 text-amber-400" />
          Danh Sách Vai Trò ({roles.filter(role => !(isManager && role.roleName === 'ROLE_ADMIN')).length})
        </button>

        {!isManager && (
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            Ma Trận Quyền (RBAC Matrix)
            {hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-[#57f287] animate-pulse" title="Có thay đổi chưa lưu" />
            )}
          </button>
        )}
      </div>

      {/* 3. Main Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400 font-bold text-sm">
            <RefreshCw className="w-8 h-8 animate-spin text-[#0047AB]" />
            Đang đồng bộ ma trận phân quyền từ máy chủ...
          </div>
        ) : activeTab === 'matrix' ? (
          /* TAB 1: PERMISSION MATRIX TABLE */
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200/60 flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#0047AB]" />
                Tích chọn các ô checkbox để cấp quyền cho vai trò tương ứng. Các thay đổi sẽ có hiệu lực ngay lập tức sau khi nhấn Lưu.
              </span>
              <div className="flex items-center gap-4 text-[11px] font-bold">
                <span className="flex items-center gap-1 text-emerald-600"><ShieldCheck className="w-4 h-4" /> Được cấp quyền</span>
                <span className="flex items-center gap-1 text-slate-400"><Lock className="w-4 h-4" /> Khóa (System Managed)</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-black sticky top-0 z-10">
                    <th className="py-3.5 px-6 w-1/3 border-b border-slate-800">Mô-đun & Chức năng (Permission Catalog)</th>
                    {roles.map(r => (
                      <th key={r.roleId} className="py-3.5 px-4 text-center min-w-[140px] border-b border-slate-800 border-l border-slate-800/60">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className="text-white font-black tracking-wide text-xs">{r.roleName}</span>
                          <span className="text-[9px] font-semibold text-slate-400 normal-case">{r.staffCount} nhân viên</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                  {Object.entries(groupedPermissions).map(([groupName, perms], idx) => (
                    <React.Fragment key={groupName}>
                      {/* Module Group Header */}
                      <tr className="bg-indigo-50/50 border-t-2 border-slate-200/60">
                        <td colSpan={roles.length + 1} className="py-2.5 px-6 font-black text-[#0047AB] uppercase tracking-wider text-[11px] flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5" />
                          {groupName} ({perms.length} quyền)
                        </td>
                      </tr>

                      {/* Permission Rows */}
                      {perms.map(perm => (
                        <tr key={perm.permissionId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-6 border-r border-slate-100">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-slate-850 text-xs flex items-center gap-2">
                                {perm.permissionLabel}
                                {!perm.enabled && (
                                  <span className="px-1.5 py-0.2 bg-amber-50 text-amber-600 border border-amber-200 text-[8px] font-black rounded uppercase">Phase 2</span>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5">{perm.permissionCode}</span>
                            </div>
                          </td>

                          {roles.map(role => {
                            const isLocked = role.roleName === 'ROLE_ADMIN' || !perm.enabled;
                            const isChecked = (matrixState[role.roleId] || new Set()).has(perm.permissionId);

                            return (
                              <td key={role.roleId} className="py-3 px-4 text-center border-l border-slate-100 bg-white/50">
                                <label className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-all ${
                                  isLocked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:bg-slate-100'
                                }`}>
                                  <input
                                    type="checkbox"
                                    disabled={isLocked}
                                    checked={isChecked}
                                    onChange={() => handleTogglePermission(role.roleId, perm.permissionId, isLocked)}
                                    className="hidden"
                                  />
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                    isChecked
                                      ? isLocked 
                                        ? 'bg-slate-800 text-white shadow-sm' 
                                        : 'bg-[#0047AB] text-white shadow-md shadow-[#0047AB]/20 scale-105'
                                      : 'bg-slate-100 border border-slate-300 text-transparent hover:border-slate-400'
                                  }`}>
                                    {isLocked && isChecked ? (
                                      <Lock className="w-3.5 h-3.5 text-slate-300" />
                                    ) : isChecked ? (
                                      <Check className="w-4 h-4 stroke-[3]" />
                                    ) : null}
                                  </div>
                                </label>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* TAB 2: ROLES DIRECTORY GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {roles.filter(role => !(isManager && role.roleName === 'ROLE_ADMIN')).map(role => {
              const isSystemRole = ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CASHIER'].includes(role.roleName);
              const isAdmin = role.roleName === 'ROLE_ADMIN';

              return (
                <div key={role.roleId} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group">
                  {/* Accent Top Border */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isAdmin ? 'bg-rose-600' : isSystemRole ? 'bg-[#0047AB]' : 'bg-[#57f287]'
                  }`} />

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 pt-1">
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase tracking-wider mb-1.5 border ${
                          isAdmin 
                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : isSystemRole 
                            ? 'bg-indigo-50 text-[#0047AB] border-indigo-100' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {isAdmin ? 'System Supreme' : isSystemRole ? 'Default System Role' : 'Custom Role'}
                        </span>
                        <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                          {role.roleName}
                          {isAdmin && <Lock className="w-4 h-4 text-rose-500 shrink-0" title="Khóa bảo vệ tối cao" />}
                        </h3>
                      </div>

                      <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200/80 rounded-xl text-slate-700 text-xs font-black shrink-0">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        {role.staffCount} staff
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-500 line-clamp-2 min-h-[32px]">
                      {role.description || 'Chưa có mô tả chi tiết cho vai trò này.'}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>Quyền được gán: <strong className="text-slate-800">{(role.permissions || []).length} / {permissions.length}</strong></span>
                      <span className="text-[#0047AB] cursor-pointer hover:underline" onClick={() => setActiveTab('matrix')}>
                        Xem ma trận &rarr;
                      </span>
                    </div>
                  </div>

                  {!isManager && (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingRole(role);
                          setEditDescText(role.description || '');
                        }}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5 text-slate-500" />
                        Sửa Mô Tả
                      </button>

                      {!isSystemRole && (
                        <button
                          onClick={() => handleDeleteRole(role)}
                          disabled={role.staffCount > 0}
                          title={role.staffCount > 0 ? 'Không thể xóa vai trò đang có nhân viên' : 'Xóa vai trò tự chọn'}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Xóa
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE CUSTOM ROLE */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 border border-slate-100 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#0047AB] rounded-xl flex items-center justify-center text-white shadow-md shadow-[#0047AB]/20">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Tạo Vai Trò Mới (Create Custom Role)</h3>
                  <p className="text-[11px] font-semibold text-slate-400">Thiết lập vai trò tùy biến để phân quyền cho nhân viên trạm</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-50 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1 no-scrollbar">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Tên Mã Vai Trò (Role Code) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="ROLE_SUPERVISOR, ROLE_INSPECTOR..."
                  value={newRoleForm.roleName}
                  onChange={e => setNewRoleForm({...newRoleForm, roleName: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-black tracking-wide uppercase focus:outline-none focus:border-[#0047AB] focus:bg-white transition-all"
                />
                <span className="text-[10px] font-semibold text-slate-400 block">Bắt buộc bắt đầu bằng tiền tố <strong className="text-slate-700">ROLE_</strong> (viết hoa không dấu).</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Mô tả công việc & Phạm vi</label>
                <textarea
                  rows="2"
                  placeholder="Ví dụ: Giám sát viên ca tối, chịu trách nhiệm rà soát chất lượng dọn xe..."
                  value={newRoleForm.description}
                  onChange={e => setNewRoleForm({...newRoleForm, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-xs focus:outline-none focus:border-[#0047AB] focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Chọn Quyền Khởi Tạo (Initial Permissions)</span>
                  <span className="text-[#0047AB] text-[11px] font-bold">Đã chọn: {newRoleForm.selectedPermIds.length}</span>
                </label>

                <div className="max-h-52 overflow-y-auto space-y-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60 no-scrollbar">
                  {Object.entries(groupedPermissions).map(([groupName, perms]) => (
                    <div key={groupName} className="space-y-1.5">
                      <span className="text-[10px] font-black text-[#0047AB] uppercase tracking-wider block border-b border-slate-200/60 pb-1">
                        {groupName}
                      </span>
                      <div className="grid grid-cols-1 gap-1">
                        {perms.filter(p => p.enabled).map(p => {
                          const isSelected = newRoleForm.selectedPermIds.includes(p.permissionId);
                          return (
                            <label key={p.permissionId} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white transition-all cursor-pointer text-xs font-bold text-slate-700">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  setNewRoleForm(prev => {
                                    const nextPerms = isSelected 
                                      ? prev.selectedPermIds.filter(id => id !== p.permissionId)
                                      : [...prev.selectedPermIds, p.permissionId];
                                    return { ...prev, selectedPermIds: nextPerms };
                                  });
                                }}
                                className="w-4 h-4 rounded text-[#0047AB] focus:ring-[#0047AB]"
                              />
                              <span>{p.permissionLabel} <span className="text-[10px] text-slate-400 font-mono">({p.permissionCode})</span></span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black transition-all cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0047AB] hover:bg-[#003a8c] text-white rounded-xl text-xs font-black transition-all shadow-md shadow-[#0047AB]/20 cursor-pointer"
                >
                  Xác Nhận Tạo Vai Trò
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT ROLE DESCRIPTION */}
      {editingRole && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#0047AB]" />
                Sửa Mô Tả: {editingRole.roleName}
              </h3>
              <button onClick={() => setEditingRole(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDescription} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Mô tả chi tiết vai trò</label>
                <textarea
                  rows="3"
                  value={editDescText}
                  onChange={e => setEditDescText(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-xs focus:outline-none focus:border-[#0047AB] focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-4.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0047AB] hover:bg-[#003a8c] text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
