import React, { useState, useEffect } from 'react';
import {
  Users,
  Gift,
  MessageSquare,
  Search,
  Coins,
  CreditCard,
  CheckCircle,
  X,
  User,
  Bike,
  TrendingUp,
  AlertTriangle,
  XCircle,
  FileText,
  Plus,
  Star,
  Heart,
  Frown,
  Check,
  Send,
  Calendar,
  Layers,
  Sparkles,
  Award,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Edit,
  Trash2,
  Lock,
  Unlock
} from 'lucide-react';
import { loyaltyApi } from '../services/loyaltyApi';
import { promotionApi } from '../services/promotionApi';
import { feedbackAdminApi } from '../services/feedbackAdminApi';
import { hasPermission } from '../../../utils/rbac';
import { bookingAdminApi } from '../services/bookingAdminApi';
import { serviceCatalogApi } from '../services/serviceCatalogApi';
import { customerApi } from '../../customer/services/customerApi';

export default function AdminCustomersLoyaltyPage() {
  // 1. Navigation Active Tab
  const [activeTab, setActiveTab] = useState(() => {
    if (hasPermission('VIEW_CUSTOMERS')) return 'crm';
    if (hasPermission('VIEW_PROMOTIONS')) return 'campaigns';
    if (hasPermission('VIEW_FEEDBACKS')) return 'feedback';
    return 'crm';
  });

  const getRoles = () => {
    try {
      const userRolesRaw = localStorage.getItem('user_roles');
      if (userRolesRaw) {
        const parsed = JSON.parse(userRolesRaw);
        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === 'string') return [parsed];
      }
    } catch (e) { }

    try {
      const autowashUserRaw = localStorage.getItem('autowash_user');
      if (autowashUserRaw) {
        const user = JSON.parse(autowashUserRaw);
        const roles = user.roles || user.user?.roles || user.user_roles;
        if (Array.isArray(roles)) return roles;
        if (typeof roles === 'string') return [roles];
      }
    } catch (e) { }

    return [];
  };

  const userRoles = getRoles();
  const isManager = userRoles.includes('ROLE_MANAGER');
  const isCashier = userRoles.includes('ROLE_CASHIER');


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

  useEffect(() => {
    if (!hasPermission('VIEW_CUSTOMERS') && activeTab === 'crm') {
      if (hasPermission('VIEW_PROMOTIONS')) setActiveTab('campaigns');
      else if (hasPermission('VIEW_FEEDBACKS')) setActiveTab('feedback');
    }
    if (!hasPermission('VIEW_PROMOTIONS') && activeTab === 'campaigns') {
      if (hasPermission('VIEW_CUSTOMERS')) setActiveTab('crm');
      else if (hasPermission('VIEW_FEEDBACKS')) setActiveTab('feedback');
    }
    if (!hasPermission('VIEW_FEEDBACKS') && activeTab === 'feedback') {
      if (hasPermission('VIEW_CUSTOMERS')) setActiveTab('crm');
      else if (hasPermission('VIEW_PROMOTIONS')) setActiveTab('campaigns');
    }
  }, [activeTab]);

  // Check permission for status change
  const hasManageStatusPermission = hasPermission('MANAGE_CUSTOMER_STATUS');

  // Tier Levels weights for cumulative filters (Platinum > Gold > Silver > Member)
  const tierLevels = {
    'Member': 0,
    'Silver': 1,
    'Gold': 2,
    'Platinum': 3,
    'VIP': 3 // Map VIP to Platinum if any legacy reference exists
  };

  // 2. STATES WITH LOCALSTORAGE FOR E2E SYNCHRONIZATION
  const [customers, setCustomers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedCustBookings, setSelectedCustBookings] = useState([]);
  const [selectedCustVouchers, setSelectedCustVouchers] = useState([]);
  const [selectedCustPointsLog, setSelectedCustPointsLog] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [promotionKpi, setPromotionKpi] = useState({
    totalPromoValueIssued: 125400000,
    activeCampaignsCount: 7,
    totalVouchersClaimed: 1890,
    marketingRoi: 3.2,
    redemptionRate: 65.6
  });

  const loadPromotionKpi = async () => {
    try {
      const summary = await promotionApi.getKpiSummary();
      if (summary) {
        setPromotionKpi(summary);
      }
    } catch (err) {
      console.error('Failed to load promotion KPI:', err);
    }
  };

  const loadPromotionsFromApi = async () => {
    try {
      const data = await promotionApi.getPromotions();
      if (data) {
        setCampaigns(data);
      }
    } catch (err) {
      console.error('Failed to load promotions from API:', err);
    }
  };

  const loadFeedbacksFromApi = async () => {
    try {
      const data = await feedbackAdminApi.getFeedbacks();
      if (data) {
        setFeedbacks(data);
      }
    } catch (err) {
      console.error('Failed to load feedbacks from API:', err);
    }
  };

  const loadCustomersFromApi = async () => {
    try {
      const data = await loyaltyApi.getCustomers();
      if (data) {
        // Sắp xếp tăng dần theo customerId (C-01, C-02...)
        const sortedData = [...data].sort((a, b) => {
          const idA = Number(a.customerId) || 0;
          const idB = Number(b.customerId) || 0;
          return idA - idB;
        });
        setCustomers(sortedData);
      }
    } catch (err) {
      console.error('Failed to load customers from API:', err);
    }
  };

  const handleToggleCustomerStatus = (customer) => {
    if (!hasManageStatusPermission) {
      showToast('Bạn không có quyền MANAGE_CUSTOMER_STATUS để thực hiện hành động này!', 'error');
      return;
    }

    const isSuspended = customer.status === 'INACTIVE' || customer.status === 'Suspended';
    const nextStatus = isSuspended ? 'ACTIVE' : 'INACTIVE';
    const confirmTitle = isSuspended ? 'Xác nhận mở khóa tài khoản' : 'Xác nhận khóa tài khoản';
    const confirmMsg = isSuspended
      ? `Bạn có chắc muốn khôi phục và mở khóa tài khoản cho khách hàng ${customer.name}?`
      : `Bạn có chắc muốn khóa tạm thời tài khoản của khách hàng ${customer.name}?`;

    setConfirmDialog({
      title: confirmTitle,
      confirmLabel: 'Xác nhận',
      cancelLabel: 'Hủy bỏ',
      isDestructive: !isSuspended,
      summary: [
        { label: 'Khách hàng', value: customer.name },
        { label: 'SĐT / ID', value: `${customer.phone} / ${customer.id}` },
        { label: 'Trạng thái mới', value: nextStatus },
        { label: 'Hành động', value: confirmMsg }
      ],
      onConfirm: async () => {
        try {
          await loyaltyApi.updateCustomerStatus(customer.customerId, nextStatus);
          showToast(`Đã cập nhật trạng thái khách hàng thành công!`);
          setNotificationModal({
            title: 'Cập nhật trạng thái thành công!',
            content: `Tài khoản khách hàng ${customer.name} đã được cập nhật sang trạng thái ${nextStatus === 'ACTIVE' ? 'Đang hoạt động (ACTIVE)' : 'Tạm khóa (INACTIVE)'}.`,
            type: 'success'
          });
          await loadCustomersFromApi();
        } catch (err) {
          console.error('Failed to toggle customer status:', err);
          const errorMsg = err.response?.data?.message || err.message || 'Cập nhật trạng thái thất bại!';
          showToast(errorMsg, 'error');
          setNotificationModal({
            title: '⚠️ Không thể khóa tài khoản khách hàng!',
            content: errorMsg,
            type: 'warning'
          });
        }
      }
    });
  };

  const loadFromApi = async () => {
    try {
      const services = await serviceCatalogApi.getAllServices();
      const pkgs = services.filter(s => s.type === 'core' || s.serviceType === 'PACKAGE');
      setAvailablePackages(pkgs);
    } catch (err) {
      console.error('Failed to load packages in CRM:', err);
    }
    await Promise.all([
      loadCustomersFromApi(),
      loadPromotionsFromApi(),
      loadFeedbacksFromApi(),
      loadPromotionKpi()
    ]);
  };

  useEffect(() => {
    loadFromApi();
  }, []);

  // Search CRM
  const [crmSearch, setCrmSearch] = useState('');
  const [crmStatusFilter, setCrmStatusFilter] = useState('ACTIVE'); // Default: 'ACTIVE' (Tách biệt hoàn toàn các acc inactive)
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState('bookings');

  useEffect(() => {
    if (!selectedCustomerId || !profileModalOpen) return;

    async function loadCustomerProfileDetail() {
      setLoadingDetail(true);
      try {
        // 1. Fetch customer vouchers
        const vouchers = await customerApi.getMyVouchers(selectedCustomerId, 'ISSUED');
        const formattedVouchers = vouchers.map(v => ({
          code: v.voucherCode,
          name: v.title || v.description || 'Ưu đãi VIP',
          value: v.discountType === 'FREE_SERVICE' ? 'Rửa miễn phí' :
            v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : `${Number(v.discountValue).toLocaleString('vi-VN')} đ`,
          status: v.status || 'ISSUED'
        }));
        setSelectedCustVouchers(formattedVouchers);

        // 2. Fetch customer bookings
        const allBookings = await bookingAdminApi.getBookings();
        const filtered = allBookings.filter(b => b.customerId === selectedCustomerId).map(b => ({
          id: b.bookingCode || b.id,
          date: b.bookingDate,
          service: b.items && b.items.length > 0 ? b.items[0].serviceNameSnapshot : 'Dọn rửa xe',
          amount: b.finalAmount || b.totalEstimatedAmount || 0,
          status: b.status
        }));
        setSelectedCustBookings(filtered);

        // 3. Fetch customer points log from real DB API
        try {
          const realPoints = await loyaltyApi.getCustomerPointHistory(selectedCustomerId);
          const formattedPoints = realPoints.map(tx => {
            const isPlus = tx.points > 0;
            const typeVal = tx.activityType === 'EARNED' ? 'EARN' :
              tx.activityType === 'REDEEMED' ? 'REDEEM' : 'EXPIRY';

            const defaultDesc = tx.bookingCode
              ? (isPlus ? `Tích điểm tự động đơn #${tx.bookingCode}` : `Trừ điểm thanh toán đơn #${tx.bookingCode}`)
              : (tx.activityType === 'REDEEMED' ? 'Đổi quà tặng / Voucher' : tx.activityType === 'EXPIRY' ? 'Thu hồi điểm quá hạn' : 'Điều chỉnh điểm');

            return {
              date: new Date(tx.createdAt).toLocaleDateString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }),
              type: typeVal,
              amount: Math.abs(tx.points),
              reason: defaultDesc
            };
          });
          setSelectedCustPointsLog(formattedPoints);
        } catch (err) {
          console.warn('Failed to load real customer points log, fallback to mock:', err.message);
          const mockLog = filtered.map(b => {
            const isCompleted = b.status === 'COMPLETED';
            return {
              date: b.date || 'Gần đây',
              type: isCompleted ? 'EARN' : 'PENDING',
              amount: Math.round(b.amount / 10000),
              reason: isCompleted ? `Tích điểm tự động đơn ${b.id}` : `Điểm chờ tích đơn ${b.id}`
            };
          });
          setSelectedCustPointsLog(mockLog);
        }
      } catch (err) {
        console.error('Failed to load customer profile details:', err);
      } finally {
        setLoadingDetail(false);
      }
    }
    loadCustomerProfileDetail();
  }, [selectedCustomerId, profileModalOpen]);

  // Unified campaign config form
  const [campaignForm, setCampaignForm] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'cash', // 'cash', 'percent', 'free_wash'
    value: '',
    costPoints: '0', // 0: Free Gift, >0: Point Exchange Shop
    minTier: 'Member', // 'Member', 'Silver', 'Gold', 'Platinum'
    minRecencyDays: '0', // 0, 30, 60
    totalBudget: '100',
    maxClaimPerUser: '1',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    applicableServiceCode: '',
    applicableDays: [], // ['MON', 'TUE', ...]
    maxDiscountAmount: '',
    minOrderValue: ''
  });

  const [availablePackages, setAvailablePackages] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  const [estimatedCount, setEstimatedCount] = useState(0);

  const handleOpenCreateModal = () => {
    setEditingCampaign(null);
    setCampaignForm({
      code: '',
      name: '',
      description: '',
      discountType: 'cash',
      value: '',
      costPoints: '0',
      minTier: 'Member',
      minRecencyDays: '0',
      totalBudget: '100',
      maxClaimPerUser: '1',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      applicableServiceCode: '',
      applicableDays: [],
      maxDiscountAmount: '',
      minOrderValue: ''
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (camp) => {
    setEditingCampaign(camp);
    const discType = camp.discountType === 'PERCENTAGE' || camp.discountType === 'percent' ? 'percent' :
      (camp.discountType === 'FREE_SERVICE' || camp.discountType === 'free_wash' ? 'free_wash' : 'cash');
    setCampaignForm({
      code: camp.code || '',
      name: camp.name || '',
      description: camp.description || '',
      discountType: discType,
      value: camp.value !== undefined && camp.value !== null ? String(camp.value) : '',
      costPoints: camp.costPoints !== undefined && camp.costPoints !== null ? String(camp.costPoints) : '0',
      minTier: camp.minTier || 'Member',
      minRecencyDays: camp.minRecencyDays !== undefined && camp.minRecencyDays !== null ? String(camp.minRecencyDays) : '0',
      totalBudget: camp.totalBudget !== undefined && camp.totalBudget !== null ? String(camp.totalBudget) : '100',
      maxClaimPerUser: camp.maxClaimPerUser !== undefined && camp.maxClaimPerUser !== null ? String(camp.maxClaimPerUser) : '1',
      startDate: camp.startDate ? camp.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: camp.endDate ? camp.endDate.split('T')[0] : new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      applicableServiceCode: camp.applicableServiceCode || '',
      applicableDays: camp.applicableDays ? (Array.isArray(camp.applicableDays) ? camp.applicableDays : String(camp.applicableDays).split(',').map(d => d.trim())) : [],
      maxDiscountAmount: camp.maxDiscountAmount !== undefined && camp.maxDiscountAmount !== null ? String(camp.maxDiscountAmount) : '',
      minOrderValue: camp.minOrderValue !== undefined && camp.minOrderValue !== null ? String(camp.minOrderValue) : ''
    });
    setIsCreateModalOpen(true);
  };

  // Auto fetch audience preview on filter change (E2E-3 Target Preview)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (campaignForm.minTier) {
        try {
          const res = await promotionApi.previewTarget({
            minTier: campaignForm.minTier.toUpperCase(),
            minRecencyDays: Number(campaignForm.minRecencyDays) || 0
          });
          setEstimatedCount(res?.estimatedCustomerCount ?? 0);
        } catch (err) {
          console.error('Failed to preview target:', err);
        }
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [campaignForm.minTier, campaignForm.minRecencyDays]);

  // Feedback Resolution Modal
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [issueCompensation, setIssueCompensation] = useState(false);

  // 4. BUSINESS LOGIC HANDLERS

  // Calculate Audience Preview count
  const getAudiencePreviewCount = () => {
    return estimatedCount;
  };

  const handleDayCheckboxChange = (day) => {
    const currentDays = [...campaignForm.applicableDays];
    if (currentDays.includes(day)) {
      setCampaignForm({
        ...campaignForm,
        applicableDays: currentDays.filter(d => d !== day)
      });
    } else {
      setCampaignForm({
        ...campaignForm,
        applicableDays: [...currentDays, day]
      });
    }
  };

  // Action: Launch / Update campaign / voucher rule
  const handleLaunchCampaign = (e) => {
    e.preventDefault();
    if (!campaignForm.code.trim() || !campaignForm.name.trim()) {
      showToast('Vui lòng nhập đầy đủ Mã và Tên voucher!', 'warning');
      return;
    }

    // Ràng buộc giá trị phần trăm (nếu nhập phần trăm)
    if (campaignForm.discountType === 'percent') {
      const val = Number(campaignForm.value);
      if (!val || val <= 0 || val > 100) {
        showToast('Giá trị giảm phần trăm phải nằm trong khoảng từ 1% đến 100%!', 'warning');
        return;
      }
    } else if (campaignForm.discountType === 'cash') {
      const val = Number(campaignForm.value);
      if (!val || val <= 0) {
        showToast('Vui lòng nhập giá trị giảm giá tiền mặt lớn hơn 0đ!', 'warning');
        return;
      }
    }

    let discountLabel = '';
    if (campaignForm.discountType === 'cash') {
      discountLabel = `${Number(campaignForm.value).toLocaleString('vi-VN')} đ`;
    } else if (campaignForm.discountType === 'percent') {
      discountLabel = `${campaignForm.value}%`;
    } else {
      discountLabel = 'Rửa miễn phí (100%)';
    }

    const pointsRequired = Number(campaignForm.costPoints);

    const newCampaignData = {
      code: campaignForm.code.toUpperCase(),
      name: campaignForm.name,
      description: campaignForm.description || '',
      discountType: campaignForm.discountType === 'free_wash' ? 'FREE_SERVICE' :
        campaignForm.discountType === 'percent' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
      value: campaignForm.discountType === 'free_wash' ? 100 : Number(campaignForm.value),
      costPoints: pointsRequired,
      minTier: campaignForm.minTier,
      minRecencyDays: Number(campaignForm.minRecencyDays),
      totalBudget: Number(campaignForm.totalBudget) || 100,
      maxClaimPerUser: Number(campaignForm.maxClaimPerUser) || 1,
      startDate: campaignForm.startDate ? `${campaignForm.startDate}T00:00:00` : null,
      endDate: campaignForm.endDate ? `${campaignForm.endDate}T23:59:59` : null,
      applicableServiceCode: campaignForm.applicableServiceCode || null,
      applicableDays: campaignForm.applicableDays.length > 0 ? campaignForm.applicableDays.join(',') : null,
      maxDiscountAmount: campaignForm.discountType === 'percent' && campaignForm.maxDiscountAmount ? Number(campaignForm.maxDiscountAmount) : null,
      minOrderValue: campaignForm.minOrderValue ? Number(campaignForm.minOrderValue) : null
    };

    const isEditMode = Boolean(editingCampaign);
    const campaignId = editingCampaign ? (editingCampaign.id || editingCampaign.promotionId) : null;

    setConfirmDialog({
      title: isEditMode ? 'Xác nhận cập nhật chiến dịch khuyến mãi' : 'Xác nhận tạo chiến dịch khuyến mãi',
      confirmLabel: isEditMode ? 'Xác nhận cập nhật' : 'Xác nhận tạo',
      cancelLabel: 'Kiểm tra lại',
      summary: [
        { label: 'Mã voucher', value: campaignForm.code.toUpperCase() },
        { label: 'Tên voucher', value: campaignForm.name },
        { label: 'Mức giảm', value: discountLabel },
        { label: 'Cơ chế quy đổi', value: pointsRequired === -1 ? 'Tặng trực tiếp (-1)' : pointsRequired === 0 ? 'Miễn phí (0 Pts)' : `${pointsRequired} Pts (Đổi điểm)` },
        { label: 'Hạng tối thiểu', value: campaignForm.minTier },
        { label: 'Số ngày chưa ghé trạm', value: `${campaignForm.minRecencyDays} ngày` }
      ],
      onConfirm: async () => {
        try {
          if (isEditMode && campaignId) {
            await promotionApi.updatePromotion(campaignId, newCampaignData);
            await loadPromotionsFromApi();
            await loadPromotionKpi();
            showToast('Cập nhật chiến dịch khuyến mãi thành công!');
          } else {
            // 1. Tạo chiến dịch ở Backend
            const createdPromo = await promotionApi.createPromotion(newCampaignData);

            // Tải lại danh sách promotions từ API
            await loadPromotionsFromApi();
            await loadPromotionKpi();

            let promoTargetCount = 0;

            // 2. Nếu là Tặng trực tiếp (Cost Points = -1), phát hành trực tiếp vào ví khách
            if (pointsRequired === -1) {
              const targetList = customers.filter(c => {
                const customerLevel = tierLevels[c.tier] ?? 0;
                const targetLevel = tierLevels[campaignForm.minTier] ?? 0;
                const matchRank = customerLevel >= targetLevel;
                const matchRecency = c.lastVisitDays >= Number(campaignForm.minRecencyDays);
                return matchRank && matchRecency;
              });

              promoTargetCount = targetList.length;

              if (targetList.length > 0) {
                const customerIds = targetList.map(c => c.customerId).filter(Boolean);
                if (customerIds.length > 0) {
                  await promotionApi.grantDirect({
                    promotionId: createdPromo.id,
                    customerIds: customerIds
                  });
                }
              }
            }

            showToast('Tạo chiến dịch khuyến mãi thành công!');

            setNotificationModal({
              title: 'Tạo mới thành công!',
              content: pointsRequired === -1
                ? `Đã phát hành chiến dịch Voucher tiếp thị ${campaignForm.code.toUpperCase()}! Voucher đã được tặng trực tiếp (-1) vào ví của ${promoTargetCount} khách hàng thỏa mãn điều kiện.`
                : pointsRequired === 0
                  ? `Đã phát hành Voucher miễn phí (0 Pts) ${campaignForm.code.toUpperCase()}! Khách hàng có thể lấy miễn phí tại Kho Voucher.`
                  : `Đã khởi tạo quy định đổi điểm cho Voucher ${campaignForm.code.toUpperCase()}! Voucher trị giá ${discountLabel} (cần ${pointsRequired} Pts) đã xuất hiện tại Shop quy đổi.`,
              type: 'success'
            });
          }

          // Reset Form
          setEditingCampaign(null);
          setCampaignForm({
            code: '',
            name: '',
            description: '',
            discountType: 'cash',
            value: '',
            costPoints: '0',
            minTier: 'Member',
            minRecencyDays: '0',
            totalBudget: '100',
            maxClaimPerUser: '1',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
            applicableServiceCode: '',
            applicableDays: [],
            maxDiscountAmount: '',
            minOrderValue: ''
          });
          setIsCreateModalOpen(false);

        } catch (err) {
          console.error('Failed to save promotion campaign:', err);
          showToast('Đã xảy ra lỗi khi lưu chiến dịch khuyến mãi: ' + (err.response?.data?.message || err.message), 'error');
        }
      }
    });
  };

  // Toggle active campaign
  const handleToggleCampaign = async (id, code, currentActive) => {
    try {
      if (id) {
        const nextStatus = currentActive ? 'PAUSED' : 'ACTIVE';
        await promotionApi.updateStatus(id, nextStatus);
        showToast(`Đã ${!currentActive ? 'Kích hoạt' : 'Tạm dừng'} chiến dịch ${code}`);
        await loadPromotionsFromApi();
        await loadPromotionKpi();
      } else {
        const updated = campaigns.map(c => {
          if (c.code === code) {
            const nextState = !c.isActive;
            showToast(`Đã ${nextState ? 'Kích hoạt' : 'Tạm dừng'} chiến dịch ${code}`);
            return { ...c, isActive: nextState };
          }
          return c;
        });
        setCampaigns(updated);
        localStorage.setItem('autowash_campaigns', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Failed to toggle campaign status:', err);
      showToast('Không thể cập nhật trạng thái chiến dịch: ' + err.message, 'error');
    }
    window.dispatchEvent(new Event('storage'));
  };

  // Delete a campaign (Permanent Database Removal / Hard Delete)
  const handleDeleteCampaign = (id, code) => {
    setConfirmDialog({
      title: 'Xác nhận xóa vĩnh viễn chiến dịch khuyến mãi',
      confirmLabel: 'Xác nhận xóa vĩnh viễn',
      cancelLabel: 'Hủy bỏ',
      isDestructive: true,
      summary: [
        { label: 'Mã chiến dịch', value: code },
        { label: 'Cảnh báo', value: 'Hành động này không thể hoàn tác và sẽ xóa hoàn toàn chiến dịch khỏi hệ thống DB.' }
      ],
      onConfirm: async () => {
        try {
          if (id) {
            await promotionApi.deletePromotion(id);
          }
          const updated = campaigns.filter(c => (c.id || c.promotionId) !== id && c.code !== code);
          setCampaigns(updated);
          localStorage.setItem('autowash_campaigns', JSON.stringify(updated));
          showToast('Xóa vĩnh viễn chiến dịch thành công!');
          setNotificationModal({
            title: 'Xóa vĩnh viễn thành công!',
            content: `Đã xóa vĩnh viễn chiến dịch ${code} khỏi hệ thống DB thành công.`,
            type: 'success'
          });
          await loadPromotionKpi();
        } catch (err) {
          console.error('Failed to delete campaign:', err);
          showToast('Không thể xóa vĩnh viễn chiến dịch: ' + err.message, 'error');
        }
        window.dispatchEvent(new Event('storage'));
      }
    });
  };

  // Action: Direct gift a voucher to customer's wallet (No points cost)
  const handleGiftVoucher = (camp) => {
    const activeCustomer = customers.find(c => c.customerId === selectedCustomerId);
    if (!activeCustomer) return;

    setConfirmDialog({
      title: 'Xác nhận phát hành quà tặng',
      confirmLabel: 'Xác nhận',
      cancelLabel: 'Hủy bỏ',
      summary: [
        { label: 'Khách hàng nhận', value: activeCustomer.name },
        { label: 'Tên voucher', value: camp.name },
        { label: 'Hạng áp dụng tối thiểu', value: camp.minTier || 'Member' },
        { label: 'Hành động', value: `Bạn có chắc chắn muốn TẶNG voucher "${camp.name}" trực tiếp cho khách hàng ${activeCustomer.name} không? (Thao tác này hoàn toàn miễn phí và không tốn điểm ví của khách).` }
      ],
      onConfirm: async () => {
        try {
          setLoadingDetail(true);
          await promotionApi.grantDirect({
            promotionId: camp.id || camp.promotionId,
            customerIds: [activeCustomer.customerId]
          });
          showToast('Phát hành quà tặng thành công!');
          setNotificationModal({
            title: 'Phát hành quà tặng thành công!',
            content: `Voucher "${camp.name}" đã được phát trực tiếp vào ví của khách hàng ${activeCustomer.name} thành công.`,
            type: 'success'
          });

          // Reload customer profile detail vouchers
          const vouchers = await customerApi.getMyVouchers(activeCustomer.customerId, 'ISSUED');
          const formattedVouchers = vouchers.map(v => ({
            code: v.voucherCode,
            name: v.title || v.description || 'Ưu đãi VIP',
            value: v.discountType === 'FREE_SERVICE' ? 'Rửa miễn phí' :
              v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : `${Number(v.discountValue).toLocaleString('vi-VN')} đ`,
            status: v.status || 'ISSUED'
          }));
          setSelectedCustVouchers(formattedVouchers);
        } catch (err) {
          console.error('Failed to gift voucher:', err);
          showToast('Tặng voucher thất bại: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
          setLoadingDetail(false);
        }
      }
    });
  };

  // Action: Open Feedback Resolution Form
  const handleOpenFeedbackModal = (fb) => {
    setSelectedFeedbackId(fb.id);
    setInternalNote(fb.internalNotes || '');
    setIssueCompensation(false);
    setFeedbackModalOpen(true);
  };

  // Action: Resolve Customer Complaint
  const handleResolveFeedback = (e) => {
    e.preventDefault();
    if (!internalNote.trim()) {
      showToast('Vui lòng viết ghi chú xử lý khiếu nại!', 'warning');
      return;
    }

    const currentFeedback = feedbacks.find(f => f.id === selectedFeedbackId);
    if (!currentFeedback) return;

    setConfirmDialog({
      title: 'Xác nhận xử lý khiếu nại',
      confirmLabel: 'Xác nhận',
      cancelLabel: 'Hủy bỏ',
      summary: [
        { label: 'Khách hàng', value: currentFeedback.customer?.name || '' },
        { label: 'Ghi chú xử lý', value: internalNote.trim() },
        { label: 'Voucher đền bù', value: issueCompensation ? 'Có (Voucher COMPENSATE50 trị giá 50.000đ)' : 'Không' }
      ],
      onConfirm: async () => {
        try {
          // Gọi API Resolve khiếu nại ở backend
          await feedbackAdminApi.resolveFeedback(selectedFeedbackId, {
            resolutionNotes: internalNote,
            grantCompensationVoucher: issueCompensation,
            voucherCode: issueCompensation ? 'COMPENSATE50' : null,
            discountValue: issueCompensation ? 50000 : null
          });

          // Tải lại danh sách phản hồi và KPI khuyến mãi từ API
          await loadFeedbacksFromApi();
          await loadPromotionKpi();

          showToast('Đã xử lý khiếu nại thành công!');
          setNotificationModal({
            title: 'Xử lý khiếu nại thành công!',
            content: issueCompensation
              ? `Đã gửi tặng Voucher đền bù (COMPENSATE50 trị giá 50k) trực tiếp vào ví voucher của khách hàng ${currentFeedback.customer.name} thành công.`
              : 'Đã cập nhật trạng thái xử lý khiếu nại thành công.',
            type: 'success'
          });

          setFeedbackModalOpen(false);
        } catch (err) {
          console.error('Failed to resolve feedback:', err);
          showToast('Không thể xử lý khiếu nại: ' + (err.response?.data?.message || err.message), 'error');
        }
      }
    });
  };

  // Filter & Sort CRM Customers (Active first, Inactive pushed to bottom)
  const filteredCustomers = customers
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(crmSearch.toLowerCase()) || c.phone.includes(crmSearch);
      if (!matchesSearch) return false;

      if (crmStatusFilter === 'ACTIVE') {
        return c.status !== 'INACTIVE' && c.status !== 'Suspended';
      }
      if (crmStatusFilter === 'INACTIVE') {
        return c.status === 'INACTIVE' || c.status === 'Suspended';
      }
      return true;
    })
    .sort((a, b) => {
      const isInactiveA = a.status === 'INACTIVE' || a.status === 'Suspended';
      const isInactiveB = b.status === 'INACTIVE' || b.status === 'Suspended';

      // Ưu tiên đẩy các tài khoản bị Khóa/Hết hạn xuống cuối danh sách
      if (isInactiveA && !isInactiveB) return 1;
      if (!isInactiveA && isInactiveB) return -1;

      // Sắp xếp thứ tự ID tăng dần (C-01, C-02, C-03...)
      const idA = Number(a.customerId) || 0;
      const idB = Number(b.customerId) || 0;
      return idA - idB;
    });

  // Get current active profile customer
  const activeCustomer = customers.find(c => c.customerId === selectedCustomerId) || null;

  // Filter out Point-Redeemable campaigns active for the activeCustomer
  // Filter out active campaigns suitable for direct gifting (matching customer tier)
  const giftableVouchersForCustomer = campaigns.filter(camp => {
    const isCampActive = camp.status === 'ACTIVE' || camp.isActive;
    if (!isCampActive) return false;
    if (!activeCustomer) return false;

    const customerLevel = tierLevels[activeCustomer.tier] ?? 0;
    const targetLevel = tierLevels[camp.minTier] ?? 0;

    return customerLevel >= targetLevel;
  });

  return (
    <div className="flex flex-col h-full bg-[#f7fafd] text-slate-800 p-6 overflow-hidden">

      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#0047AB] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0047AB]/20 text-white">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              Quản Lý Khách Hàng & Loyalty (Customers & Loyalty)
              <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-[#0047AB] text-[10px] font-black rounded-full uppercase tracking-wider">
                CRM & Marketing
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Hồ sơ khách hàng, chiến dịch Voucher khuyến mãi và xử lý khiếu nại đánh giá.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border border-slate-200 rounded-xl p-1 flex gap-1 text-xs text-slate-600 shadow-sm self-end sm:self-auto shrink-0">
          {hasPermission('VIEW_CUSTOMERS') && (
            <button
              onClick={() => setActiveTab('crm')}
              className={`px-4 py-2 rounded-xl font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === 'crm'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <Users className="w-4 h-4" />
              <span>CRM Khách Hàng</span>
            </button>
          )}
          {hasPermission('VIEW_PROMOTIONS') && (
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-4 py-2 rounded-xl font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === 'campaigns'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <Gift className="w-4 h-4" />
              Chiến dịch Khuyến mãi
            </button>
          )}
          {hasPermission('VIEW_FEEDBACKS') && (
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-4.5 py-2 rounded-lg font-black transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'feedback'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'hover:text-slate-800 hover:bg-slate-55'
                }`}
            >
              <MessageSquare className="w-4 h-4" />
              Ý kiến phản hồi ({feedbacks.filter(f => f.status === 'New').length} mới)
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 pt-4 pr-1 space-y-6 no-scrollbar">

        {/* ======================================================== */}
        {/* 2. TAB CONTENT: CUSTOMER CRM                             */}
        {/* ======================================================== */}
        {activeTab === 'crm' && hasPermission('VIEW_CUSTOMERS') && (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            {/* Search Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
              <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm khách hàng, số điện thoại..."
                    value={crmSearch}
                    onChange={e => setCrmSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700 placeholder:text-slate-455 focus:outline-none focus:ring-2 focus:ring-indigo-650/10 focus:border-indigo-650 shadow-sm"
                  />
                </div>

                {/* Status Filters */}
                <div className="flex border border-slate-200/60 bg-slate-50 p-0.5 rounded-xl text-[10px] font-bold shadow-inner">
                  {[
                    { key: 'ACTIVE', label: 'Đang hoạt động' },
                    { key: 'INACTIVE', label: 'Tạm khóa' },
                    { key: 'ALL', label: 'Tất cả' }
                  ].map(f => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setCrmStatusFilter(f.key)}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${crmStatusFilter === f.key
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/20'
                        : 'text-slate-400 hover:text-slate-655'
                        }`}
                    >
                      {f.label} ({
                        f.key === 'ALL' ? customers.length :
                          f.key === 'ACTIVE' ? customers.filter(c => c.status !== 'INACTIVE' && c.status !== 'Suspended').length :
                            customers.filter(c => c.status === 'INACTIVE' || c.status === 'Suspended').length
                      })
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-bold bg-white px-3 py-1.5 border border-slate-200/50 rounded-xl">
                Tổng số thành viên: {customers.length} khách hàng
              </div>
            </div>

            {/* CRM Table */}
            <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider z-10">
                    <tr>
                      <th className="py-3 px-5">Mã thành viên</th>
                      <th className="py-3 px-4">Tên khách hàng</th>
                      <th className="py-3 px-4">Hạng thành viên</th>
                      <th className="py-3 px-4 text-right">Ví điểm Loyalty</th>
                      <th className="py-3 px-4 text-right">Tổng chi tiêu lũy kế</th>
                      <th className="py-3 px-4 text-center">Số lượt dọn rửa</th>
                      <th className="py-3 px-4 text-center">Vắng mặt (Ngày)</th>
                      <th className="py-3 px-4 text-center">Trạng thái</th>
                      <th className="py-3 px-5 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredCustomers.map(c => (
                      <tr key={c.id} className={`hover:bg-slate-50/50 transition-colors ${c.status === 'INACTIVE' || c.status === 'Suspended' ? 'bg-slate-50/40 opacity-75' : ''
                        }`}>
                        <td className="py-3.5 px-5 font-black text-slate-800">{c.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-850">
                          <div className="flex items-center gap-2">

                            <span>{c.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 font-bold rounded-lg text-[10px] border ${String(c.tier).toUpperCase() === 'PLATINUM' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                            String(c.tier).toUpperCase() === 'GOLD' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                              String(c.tier).toUpperCase() === 'SILVER' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-slate-100 text-slate-700 border-slate-300'
                            }`}>
                            {c.tier}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-amber-600">
                          {c.points.toLocaleString()} Pts
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-800">
                          {c.totalSpend.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-indigo-650">{c.visits} lần</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`font-semibold ${c.lastVisitDays >= 60 ? 'text-rose-600 font-extrabold' : 'text-slate-500'}`}>
                            {c.lastVisitDays} ngày trước
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${c.status === 'INACTIVE' || c.status === 'Suspended' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                            {c.status === 'INACTIVE' || c.status === 'Suspended' ? 'Tạm khóa (Hết hạn)' : 'Đang hoạt động'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <button
                            onClick={() => { setSelectedCustomerId(c.customerId); setProfileModalOpen(true); }}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-lg shadow-sm cursor-pointer"
                          >
                            Xem hồ sơ & Ví
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
        {/* 3. TAB CONTENT: MARKETING CAMPAIGNS & POINT SHOP         */}
        {/* ======================================================== */}
        {activeTab === 'campaigns' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-5 overflow-y-auto no-scrollbar">

            {/* 3.1. Campaign KPI Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 shrink-0">
              <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Giá trị ưu đãi đã phát</span>
                  <h4 className="text-lg font-black text-slate-850 mt-1">
                    {new Intl.NumberFormat('vi-VN').format(promotionKpi.totalPromoValueIssued)} đ
                  </h4>
                </div>
                <div className="w-8.5 h-8.5 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Coins className="w-4.5 h-4.5 text-indigo-600" />
                </div>
              </div>
              <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Chiến dịch kích hoạt</span>
                  <h4 className="text-lg font-black text-indigo-700 mt-1">{promotionKpi.activeCampaignsCount} chiến dịch</h4>
                </div>
                <div className="w-8.5 h-8.5 bg-slate-50 rounded-xl flex items-center justify-center">
                  <Gift className="w-4.5 h-4.5 text-slate-500" />
                </div>
              </div>
              <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Voucher khách đã lấy</span>
                  <h4 className="text-lg font-black text-emerald-700 mt-1">
                    {new Intl.NumberFormat('vi-VN').format(promotionKpi.totalVouchersClaimed)} mã
                  </h4>
                </div>
                <div className="w-8.5 h-8.5 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                </div>
              </div>
              <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Hiệu quả ROI tiếp thị</span>
                  <h4 className="text-lg font-black text-amber-700 mt-1">{promotionKpi.marketingRoi}x hiệu quả</h4>
                  <div className="text-[10px] text-slate-400 font-bold mt-0.5">Hiệu suất dùng: {promotionKpi.redemptionRate}%</div>
                </div>
                <div className="w-8.5 h-8.5 bg-amber-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4.5 h-4.5 text-amber-600" />
                </div>
              </div>
            </div>

            {/* 3.2. Full Width Campaign Ledger */}
            <div className="w-full">

              {/* Campaign Ledger (CRUD interface) */}
              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col w-full text-xs space-y-4 pb-4">
                <div className="p-4.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-black text-slate-700 uppercase tracking-wider text-[10px]">
                    Sổ cái quản lý Voucher & Chiến dịch Quy đổi điểm ví
                  </span>
                  {hasPermission('MANAGE_PROMOTIONS') && (
                    <button
                      onClick={handleOpenCreateModal}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black transition-all flex items-center gap-1 shadow-sm active:scale-[0.98] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tạo Chiến dịch mới
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-4">Mã Voucher</th>
                        <th className="py-2.5 px-3">Tên voucher</th>
                        <th className="py-2.5 px-3">Trị giá</th>
                        <th className="py-2.5 px-3">Ngân sách</th>
                        <th className="py-2.5 px-3">Yêu cầu điểm</th>
                        <th className="py-2.5 px-3">Hạng tối thiểu</th>
                        <th className="py-2.5 px-3">Gói/Thứ áp dụng</th>
                        <th className="py-2.5 px-3">Trần giảm</th>
                        <th className="py-2.5 px-3">Đơn tối thiểu</th>
                        <th className="py-2.5 px-3">Thời gian hiệu lực</th>
                        <th className="py-2.5 px-3 text-center">Trạng thái</th>
                        <th className="py-2.5 px-4 text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-655 font-semibold">
                      {campaigns.map((camp, idx) => {
                        const discountValueStr = camp.discountType === 'free_wash' || camp.discountType === 'FREE_SERVICE' ? 'Rửa xe miễn phí' :
                          camp.discountType === 'percent' || camp.discountType === 'PERCENTAGE' ? `${camp.value}%` : `${Number(camp.value).toLocaleString('vi-VN')} đ`;

                        const isCampActive = camp.status === 'ACTIVE' || camp.isActive;
                        const issued = camp.issuedCount || 0;
                        const budget = camp.totalBudget || 100;
                        const pct = Math.min(100, Math.round((issued / budget) * 100));

                        return (
                          <tr key={idx} className={`hover:bg-slate-50/50 transition-colors ${!isCampActive ? 'opacity-60 bg-slate-50/20' : ''}`}>
                            <td className="py-3 px-4 font-black text-slate-800 tracking-wider font-mono">{camp.code}</td>
                            <td className="py-3 px-3 font-bold text-slate-755">{camp.name}</td>
                            <td className="py-3 px-3 font-black text-indigo-700">{discountValueStr}</td>
                            <td className="py-3 px-3">
                              <div className="space-y-1 w-24">
                                <div className="flex justify-between text-[9px] text-slate-400 font-extrabold">
                                  <span>{issued}/{budget}</span>
                                  <span>{pct}%</span>
                                </div>
                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }}></div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-black">
                              {Number(camp.costPoints) === -1 ? (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-black text-[10px] border border-purple-200">
                                  Tặng trực tiếp (-1)
                                </span>
                              ) : Number(camp.costPoints) === 0 ? (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[10px] border border-emerald-200">
                                  Miễn phí (0 Pts)
                                </span>
                              ) : (
                                <span className="text-amber-600 font-mono font-extrabold text-xs">
                                  {camp.costPoints} Pts
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-bold">
                                {camp.minTier}+
                              </span>
                            </td>
                            <td className="py-3 px-3 text-[10px]">
                              <div className="space-y-0.5">
                                <div>
                                  {camp.applicableServiceCode ? (
                                    <span className="px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded text-[9px] font-bold">
                                      {camp.applicableServiceCode}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-medium">Mọi gói</span>
                                  )}
                                </div>
                                <div className="text-[9px] text-slate-400 font-extrabold tracking-wide">
                                  {camp.applicableDays ? (
                                    <span className="text-indigo-650 font-mono">{camp.applicableDays}</span>
                                  ) : (
                                    <span>Hàng ngày</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-black text-slate-700 font-mono text-[10px]">
                              {camp.maxDiscountAmount ? (
                                <span className="text-rose-600">{Number(camp.maxDiscountAmount).toLocaleString('vi-VN')} đ</span>
                              ) : (
                                <span className="text-slate-350">-</span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-black text-slate-700 font-mono text-[10px]">
                              {camp.minOrderValue ? (
                                <span className="text-blue-600">{Number(camp.minOrderValue).toLocaleString('vi-VN')} đ</span>
                              ) : (
                                <span className="text-slate-350">-</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-[10px] text-slate-500 font-medium">
                              {camp.startDate ? camp.startDate.split('T')[0] : ''} ~ {camp.endDate ? camp.endDate.split('T')[0] : ''}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {hasPermission('MANAGE_PROMOTIONS') ? (
                                <button
                                  onClick={() => handleToggleCampaign(camp.id || camp.promotionId, camp.code, isCampActive)}
                                  className="focus:outline-none inline-block hover:scale-[1.05]"
                                >
                                  {isCampActive ? (
                                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[8px] font-black rounded-full">Kích hoạt</span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-400 text-[8px] font-black rounded-full">Tạm dừng</span>
                                  )}
                                </button>
                              ) : (
                                isCampActive ? (
                                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[8px] font-black rounded-full cursor-not-allowed">Kích hoạt</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-400 text-[8px] font-black rounded-full cursor-not-allowed">Tạm dừng</span>
                                )
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {hasPermission('MANAGE_PROMOTIONS') && (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditModal(camp)}
                                    className="p-1.5 bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 rounded transition-all cursor-pointer inline-block"
                                    title="Chỉnh sửa voucher / chiến dịch"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCampaign(camp.id || camp.promotionId, camp.code)}
                                    className="p-1.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 rounded transition-all cursor-pointer inline-block"
                                    title="Xóa vĩnh viễn chiến dịch"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 4. TAB CONTENT: FEEDBACK & REVIEWS                       */}
        {/* ======================================================== */}
        {activeTab === 'feedback' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">

            {/* Feedback statistics */}
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Nhật ký đánh giá dịch vụ khách hàng</h3>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="text-rose-600 flex items-center gap-0.5 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100/50">
                  <Frown className="w-4 h-4 text-rose-500" />
                  {feedbacks.filter(f => f.sentiment === 'Negative').length} Tiêu cực
                </span>
                <span className="text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/50">
                  <Heart className="w-4 h-4 text-emerald-500" />
                  {feedbacks.filter(f => f.sentiment === 'Positive').length} Tích cực
                </span>
              </div>
            </div>

            {/* Feedback ledger table */}
            <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider z-10">
                    <tr>
                      <th className="py-3 px-5">Thời gian gửi</th>
                      <th className="py-3 px-4">Khách hàng</th>
                      <th className="py-3 px-4">Mức sao đánh giá</th>
                      <th className="py-3 px-4">Bình luận phản hồi của khách</th>
                      <th className="py-3 px-4 text-center">Nhãn cảm xúc AI</th>
                      <th className="py-3 px-4 text-center">Trạng thái giải quyết</th>
                      <th className="py-3 px-5 text-center">Xử lý</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {feedbacks.map(f => {
                      let sentimentBadge = '';
                      let sentimentText = '';
                      if (f.sentiment === 'Positive') {
                        sentimentBadge = 'bg-emerald-55 text-emerald-600 border-emerald-100';
                        sentimentText = '🟢 Tích cực';
                      } else if (f.sentiment === 'Negative') {
                        sentimentBadge = 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse';
                        sentimentText = '🔴 Tiêu cực (Cảnh báo)';
                      } else {
                        sentimentBadge = 'bg-amber-50 text-amber-600 border-amber-100';
                        sentimentText = '🟡 Trung lập';
                      }

                      let statusBadge = '';
                      if (f.status === 'Resolved' || f.status === 'RESOLVED') {
                        statusBadge = 'bg-emerald-100 text-emerald-700 border-transparent';
                      } else if (f.status === 'Reviewed' || f.status === 'REVIEWED') {
                        statusBadge = 'bg-blue-100 text-blue-700 border-transparent';
                      } else {
                        statusBadge = 'bg-amber-100 text-amber-700 border-transparent';
                      }

                      const isResolved = f.status === 'Resolved' || f.status === 'RESOLVED';

                      return (
                        <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-5 font-bold text-slate-500">{f.date}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-855">
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <span>{f.customer.name}</span>
                                <span className="text-[8px] text-slate-400 font-semibold">{f.customer.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-655 leading-relaxed font-semibold max-w-sm truncate" title={f.comment}>{f.comment}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 font-bold border rounded-lg text-[9px] ${sentimentBadge}`}>
                              {sentimentText}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 font-black rounded-lg text-[9px] ${statusBadge}`}>
                              {f.status === 'New' || f.status === 'NEW' ? 'Mới nhận' :
                                f.status === 'Reviewed' || f.status === 'REVIEWED' ? 'Đã xem' : 'Đã giải quyết'}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <button
                              onClick={() => handleOpenFeedbackModal(f)}
                              className={`px-3 py-1.5 text-[10px] font-black rounded-lg shadow-sm cursor-pointer transition-all ${isResolved
                                ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-650/10'
                                }`}
                            >
                              {isResolved ? 'Xem xử lý' : 'Xử lý khiếu nại'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 5. DIALOG / MODAL: CUSTOMER PROFILE CRM DETAIL           */}
        {/* ======================================================== */}
        {profileModalOpen && activeCustomer && (
          <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-3xl w-full shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto no-scrollbar">

              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-150">
                <div className="flex items-center gap-3.5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-base text-slate-800">{activeCustomer.name}</h3>
                      <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-lg border uppercase ${String(activeCustomer.tier).toUpperCase() === 'PLATINUM' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                        String(activeCustomer.tier).toUpperCase() === 'GOLD' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          String(activeCustomer.tier).toUpperCase() === 'SILVER' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-slate-100 text-slate-700 border-slate-300'
                        }`}>
                        Hạng {activeCustomer.tier}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${activeCustomer.status === 'INACTIVE' || activeCustomer.status === 'Suspended' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                        {activeCustomer.status === 'INACTIVE' || activeCustomer.status === 'Suspended' ? 'Tạm khóa (Hết hạn)' : 'Đang hoạt động'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">SĐT: {activeCustomer.phone} • ID: {activeCustomer.id}</p>
                  </div>
                </div>

                {/* Controls on the right: Toggle switch + Close button */}
                <div className="flex items-center gap-4">
                  {!isCashier && (
                    <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 px-3.5 py-1.5 rounded-xl shadow-sm">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tài khoản:</span>
                      <button
                        disabled={!hasManageStatusPermission}
                        onClick={() => handleToggleCustomerStatus(activeCustomer)}
                        className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none shadow-inner ${activeCustomer.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'
                          } ${!hasManageStatusPermission ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={!hasManageStatusPermission ? 'Bạn không có quyền quản lý trạng thái khách hàng' : ''}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-250 ease-in-out ${activeCustomer.status === 'ACTIVE' ? 'translate-x-4.5' : 'translate-x-0'
                            }`}
                        />
                      </button>
                      <span className={`text-[10px] font-black uppercase tracking-wide transition-colors ${activeCustomer.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-500'
                        }`}>
                        {activeCustomer.status === 'ACTIVE' ? 'Hoạt động' : 'Đang khóa'}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => setProfileModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Profile Navigation tabs */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-1 flex gap-1 text-xs text-slate-500 shadow-inner shrink-0">
                {[
                  { key: 'bookings', label: 'Lịch sử dọn rửa' },
                  { key: 'points', label: 'Nhật ký tích/đổi điểm' },
                  { key: 'vouchers', label: 'Ví Voucher sở hữu & Đổi Voucher' }
                ].map(sub => (
                  <button
                    key={sub.key}
                    onClick={() => setProfileActiveTab(sub.key)}
                    className={`flex-1 py-2 rounded-lg text-center font-bold transition-all cursor-pointer ${profileActiveTab === sub.key
                      ? 'bg-white text-slate-905 shadow-sm border border-slate-250/20'
                      : 'hover:text-slate-800'
                      }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* Profile Tab Contents */}
              <div className="max-h-[380px] overflow-y-auto no-scrollbar text-xs">

                {loadingDetail ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold text-xs">Đang tải dữ liệu từ API...</p>
                  </div>
                ) : (
                  <>
                    {/* Bookings */}
                    {profileActiveTab === 'bookings' && (
                      <div className="space-y-2">
                        {selectedCustBookings.length === 0 ? (
                          <p className="text-slate-400 text-center py-10 font-bold">Khách hàng chưa có lịch đặt dọn nào.</p>
                        ) : (
                          <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                            <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                  <th className="py-2.5 px-4">Mã đơn</th>
                                  <th className="py-2.5 px-3">Ngày rửa</th>
                                  <th className="py-2.5 px-3">Gói dịch vụ chính</th>
                                  <th className="py-2.5 px-3 text-right">Tổng thanh toán</th>
                                  <th className="py-2.5 px-4 text-center">Trạng thái</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-655 font-semibold">
                                {selectedCustBookings.map((b, idx) => (
                                  <tr key={idx}>
                                    <td className="py-2.5 px-4 font-black text-slate-800">{b.id}</td>
                                    <td className="py-2.5 px-3">{b.date}</td>
                                    <td className="py-2.5 px-3 font-bold text-slate-755">{b.service}</td>
                                    <td className="py-2.5 px-3 text-right font-bold text-slate-855">{b.amount.toLocaleString('vi-VN')} đ</td>
                                    <td className="py-2.5 px-4 text-center">
                                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${b.status === 'COMPLETED' || b.status === 'Completed' ? 'bg-emerald-55 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                        {b.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Points log */}
                    {profileActiveTab === 'points' && (
                      <div className="space-y-2">
                        {selectedCustPointsLog.length === 0 ? (
                          <p className="text-slate-400 text-center py-10 font-bold">Chưa phát sinh giao dịch điểm thưởng.</p>
                        ) : (
                          <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                            <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                  <th className="py-2.5 px-4">Thời gian</th>
                                  <th className="py-2.5 px-3">Loại giao dịch</th>
                                  <th className="py-2.5 px-3 text-right">Số điểm</th>
                                  <th className="py-2.5 px-4">Chi tiết nội dung</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-655 font-semibold">
                                {selectedCustPointsLog.map((log, idx) => (
                                  <tr key={idx}>
                                    <td className="py-2.5 px-4 text-slate-500">{log.date}</td>
                                    <td className="py-2.5 px-3">
                                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black ${log.type === 'EARN' ? 'bg-emerald-55 text-emerald-600' :
                                        log.type === 'REDEEM' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                        {log.type === 'EARN' ? 'Tích lũy' : log.type === 'REDEEM' ? 'Chi dùng' : 'Chờ tích'}
                                      </span>
                                    </td>
                                    <td className={`py-2.5 px-3 text-right font-black ${log.type === 'EARN' ? 'text-emerald-650' : 'text-rose-500'}`}>
                                      {log.type === 'EARN' ? `+${log.amount}` : `-${log.amount}`} Pts
                                    </td>
                                    <td className="py-2.5 px-4 text-slate-505">{log.reason}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Vouchers & Redeeming */}
                    {profileActiveTab === 'vouchers' && (
                      <div className="space-y-5">

                        {/* Direct Gifting Shop */}
                        {hasPermission('GRANT_PROMOTIONS') && (
                          <div className="bg-indigo-50/30 border border-indigo-200/50 p-4 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-indigo-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                                <Gift className="w-4 h-4 text-indigo-500 animate-bounce" />
                                Phát hành quà tặng & Voucher trực tiếp (Không tốn điểm ví)
                              </span>
                              <span className="text-[10px] text-indigo-600 font-bold bg-white px-2 py-0.5 rounded-lg border border-indigo-250/50 shadow-sm">
                                Hạng hiện tại: {activeCustomer.tier}
                              </span>
                            </div>

                            {giftableVouchersForCustomer.length === 0 ? (
                              <p className="text-[10px] text-slate-400 font-bold text-center py-2">Hiện tại không có voucher nào phù hợp với hạng của khách hàng.</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {giftableVouchersForCustomer.map(camp => {

                                  return (
                                    <div
                                      key={camp.code}
                                      className="p-3 rounded-xl border border-indigo-150/60 bg-white shadow-sm flex flex-col justify-between space-y-2"
                                    >
                                      <div>
                                        <div className="font-mono font-black text-slate-800 text-[10px] tracking-wider">{camp.code}</div>
                                        <p className="text-[9px] text-slate-400 font-bold leading-tight mt-0.5">{camp.name}</p>
                                      </div>

                                      <button
                                        onClick={() => handleGiftVoucher(camp)}
                                        className="w-full py-1.5 rounded-lg text-[9px] font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/10 active:scale-[0.98] transition-all text-center cursor-pointer"
                                      >
                                        Gửi tặng trực tiếp
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Owned Vouchers list */}
                        <div className="space-y-2.5">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ví Voucher đang sở hữu</h4>
                          {selectedCustVouchers.length === 0 ? (
                            <p className="text-slate-400 text-center py-10 font-bold">Khách hàng không sở hữu voucher nào.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              {selectedCustVouchers.map((vch, idx) => (
                                <div key={idx} className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm relative overflow-hidden">
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border-r border-slate-200/60" />
                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border-l border-slate-200/60" />

                                  <div className="pl-2 space-y-1">
                                    <div className="font-black text-slate-800 flex items-center gap-1.5">
                                      {vch.code}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold">{vch.name}</p>
                                  </div>

                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black mr-2 ${vch.status === 'ISSUED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                    vch.status === 'USED' ? 'bg-slate-200 text-slate-550' : 'bg-rose-50 text-rose-500'
                                    }`}>
                                    {vch.status === 'ISSUED' ? 'Có thể dùng' :
                                      vch.status === 'USED' ? 'Đã dùng' : 'Hết hạn'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                  </>
                )}

              </div>

              <div className="border-t border-slate-100 pt-4 text-right">
                <button
                  onClick={() => setProfileModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm text-xs cursor-pointer"
                >
                  Đóng hồ sơ khách
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 6. DIALOG / MODAL: COMPLAINT FEEDBACK RESOLUTION */}
        {feedbackModalOpen && (
          <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">

              <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                <h3 className="font-extrabold text-slate-850 flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />
                  Giải quyết ý kiến Phản hồi
                </h3>
                <button
                  onClick={() => setFeedbackModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-750 rounded-lg"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {(() => {
                const fb = feedbacks.find(f => f.id === selectedFeedbackId);
                if (!fb) return null;
                return (
                  <div className="space-y-4 text-xs">

                    <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-150">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-755">Người đánh giá: {fb.customer.name}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="italic text-slate-500 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                        "{fb.comment}"
                      </p>
                    </div>

                    {fb.status === 'Resolved' ? (
                      <div className="space-y-3 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
                        <div className="text-emerald-700 font-extrabold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Đã xử lý khiếu nại thành công!
                        </div>
                        <div className="space-y-1 font-semibold text-slate-600">
                          <span className="text-[10px] text-slate-455 font-bold block uppercase">Biện pháp xử lý:</span>
                          <p className="bg-white p-2.5 rounded-lg border border-slate-100">{fb.internalNotes}</p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleResolveFeedback} className="space-y-4">

                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">Nội dung ghi chú biện pháp xử lý *</label>
                          <textarea
                            required
                            placeholder="Ví dụ: Đã liên hệ xin lỗi và giải thích lỗi do nhân viên sấy xe chưa sạch, khách đã thông cảm..."
                            value={internalNote}
                            onChange={e => setInternalNote(e.target.value)}
                            rows="3"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 text-slate-700 resize-none"
                          />
                        </div>

                        {fb.sentiment === 'Negative' && hasPermission('RESOLVE_FEEDBACK') && (
                          <div className="bg-rose-50/30 border border-rose-100/60 p-3.5 rounded-xl flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              id="compensate"
                              checked={issueCompensation}
                              onChange={e => setIssueCompensation(e.target.checked)}
                              className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                            />
                            <div className="space-y-0.5 cursor-pointer" onClick={() => setIssueCompensation(!issueCompensation)}>
                              <label htmlFor="compensate" className="font-black text-rose-700 block cursor-pointer">
                                Gửi tặng Voucher Đền Bù tạ lỗi
                              </label>
                              <p className="text-[10px] text-slate-400">
                                Hệ thống sẽ tự động phát hành **Voucher Đền Bù Chăm Sóc Khách Hàng (COMPENSATE50 trị giá 50.000 đ)** vào ví của khách hàng này để tạ lỗi.
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2.5 pt-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setFeedbackModalOpen(false)}
                            className="px-4 py-2.5 bg-slate-100 text-slate-655 font-bold rounded-xl"
                          >
                            Bỏ qua
                          </button>
                          <button
                            type="submit"
                            className="px-4.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-md active:scale-[0.98]"
                          >
                            Xác nhận xử lý khiếu nại
                          </button>
                        </div>

                      </form>
                    )}

                  </div>
                );
              })()}

            </div>
          </div>
        )}

        {/* 7. DIALOG / MODAL: CREATE PROMOTION CAMPAIGN */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">

              {/* Fixed Modal Header */}
              <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-150 shrink-0">
                <h3 className="font-extrabold text-slate-850 flex items-center gap-1.5 text-sm uppercase tracking-wide text-indigo-700">
                  <Sparkles className="w-5 h-5 text-indigo-650 animate-pulse" />
                  {editingCampaign ? 'Cập nhật Chiến dịch Khuyến mãi & Voucher' : 'Tạo Chiến dịch Khuyến mãi & Quy đổi điểm mới'}
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleLaunchCampaign} className="flex flex-col flex-grow overflow-hidden text-xs">
                {/* Scrollable Fields Wrapper */}
                <div className="flex-grow overflow-y-auto p-6 space-y-4">

                  {/* Row 1: Code & Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Mã Voucher phát hành *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: DONGGIA30, FREEWASH..."
                        value={campaignForm.code}
                        onChange={e => setCampaignForm({ ...campaignForm, code: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-700 font-bold uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Tên voucher / Chiến dịch *</label>
                      <input
                        type="text"
                        required
                        placeholder="Mô tả ngắn (ví dụ: Voucher 50k tri ân...)"
                        value={campaignForm.name}
                        onChange={e => setCampaignForm({ ...campaignForm, name: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-700 font-bold"
                      />
                    </div>
                  </div>

                  {/* Row 2: Description */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Mô tả chi tiết chiến dịch</label>
                    <textarea
                      placeholder="Chi tiết chương trình tiếp thị/đổi điểm..."
                      value={campaignForm.description}
                      onChange={e => setCampaignForm({ ...campaignForm, description: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-700 h-14 resize-none"
                    />
                  </div>

                  {/* Row 3: Discount Type, Value, Max Discount */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Kiểu chiết khấu</label>
                      <select
                        value={campaignForm.discountType}
                        onChange={e => setCampaignForm({ ...campaignForm, discountType: e.target.value, value: '', maxDiscountAmount: '' })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-700 font-semibold"
                      >
                        <option value="cash">Trừ tiền mặt (đ)</option>
                        <option value="percent">Trừ % đơn hàng</option>
                        <option value="free_wash">Rửa miễn phí (Giảm 100%)</option>
                      </select>
                    </div>

                    {campaignForm.discountType !== 'free_wash' ? (
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">Giá trị giảm *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder={campaignForm.discountType === 'cash' ? 'Ví dụ: 30000' : 'Ví dụ: 10'}
                          value={campaignForm.value}
                          onChange={e => setCampaignForm({ ...campaignForm, value: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-700 font-bold"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1 opacity-50">
                        <label className="font-bold text-slate-400 block">Giá trị giảm</label>
                        <input
                          type="text"
                          disabled
                          placeholder="Miễn phí 100% gói chính"
                          className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 font-bold"
                        />
                      </div>
                    )}

                    {campaignForm.discountType === 'percent' ? (
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">
                          Mức giảm tối đa (Trần giảm) <span className="text-slate-400 font-normal text-xs">(Tùy chọn)</span>
                        </label>
                        <input
                          type="number"
                          placeholder="Để trống nếu không giới hạn trần giảm"
                          value={campaignForm.maxDiscountAmount}
                          onChange={e => setCampaignForm({ ...campaignForm, maxDiscountAmount: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-700 font-bold"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1 opacity-50">
                        <label className="font-bold text-slate-400 block">Mức giảm tối đa</label>
                        <input
                          type="text"
                          disabled
                          placeholder="Chỉ dùng khi giảm theo %"
                          className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 font-bold"
                        />
                      </div>
                    )}
                  </div>

                  {/* Row 3.5: Min Order Value Constraint */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="font-bold text-slate-600 block">
                        Giá trị đơn hàng tối thiểu (Min Order Value) <span className="text-slate-400 font-normal text-xs">(Tùy chọn)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Để trống nếu không giới hạn giá trị đơn hàng"
                        value={campaignForm.minOrderValue}
                        onChange={e => setCampaignForm({ ...campaignForm, minOrderValue: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 font-semibold bg-slate-50 border border-slate-200 text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Row 4: Points required, total budget, max claim */}

                  {/* Row 4: Points required, total budget, max claim */}
                  <div className="bg-indigo-50/20 border border-indigo-100/40 p-4 rounded-xl space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="font-bold text-indigo-800 block mb-1">Cài đặt quy đổi điểm ví *</label>
                        <input
                          type="number"
                          required
                          min="-1"
                          placeholder="Nhập -1: Tặng trực tiếp, 0: Miễn phí, >0: Đổi điểm"
                          value={campaignForm.costPoints}
                          onChange={e => {
                            const pts = e.target.value;
                            if (Number(pts) > 0) {
                              setCampaignForm({
                                ...campaignForm,
                                costPoints: pts,
                                minOrderValue: ''
                              });
                            } else {
                              setCampaignForm({
                                ...campaignForm,
                                costPoints: pts
                              });
                            }
                          }}
                          className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-slate-700 text-xs font-black text-center focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <span className="text-[9px] text-slate-500 block mt-1.5 leading-normal text-left">
                          Nhập <strong className="text-purple-700 font-black">'-1'</strong> để <strong className="text-purple-700 font-extrabold">"tặng trực tiếp"</strong>. Nhập <strong className="text-emerald-700 font-black">'0'</strong> để <strong className="text-emerald-700 font-extrabold">"miễn phí"</strong>. Nhập <strong className="text-amber-700 font-black">'{'>'} 0'</strong> nếu muốn khách <strong className="text-amber-700 font-extrabold">"đổi điểm"</strong>.
                        </span>
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Tổng ngân sách (vouchers)</label>
                        <input
                          type="number"
                          placeholder="Để trống nếu vô hạn"
                          value={campaignForm.totalBudget}
                          onChange={e => setCampaignForm({ ...campaignForm, totalBudget: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Lượt nhận tối đa / khách</label>
                        <input
                          type="number"
                          placeholder="Để trống nếu vô hạn"
                          value={campaignForm.maxClaimPerUser}
                          onChange={e => setCampaignForm({ ...campaignForm, maxClaimPerUser: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 5: Targeting Rules (Tier & Recency) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Hạng thành viên tối thiểu áp dụng *</label>
                      <select
                        value={campaignForm.minTier}
                        onChange={e => setCampaignForm({ ...campaignForm, minTier: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="Member">Tất cả các hạng (Từ Member trở lên)</option>
                        <option value="Silver">Từ hạng Silver trở lên</option>
                        <option value="Gold">Từ hạng Gold trở lên</option>
                        <option value="Platinum">Từ hạng Platinum trở lên</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Số ngày vắng mặt tối thiểu</label>
                      <select
                        value={campaignForm.minRecencyDays}
                        onChange={e => setCampaignForm({ ...campaignForm, minRecencyDays: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="0">Không lọc số ngày vắng mặt</option>
                        <option value="30">Vắng mặt {'>'} 30 ngày (Khách hàng vắng bóng)</option>
                        <option value="60">Vắng mặt {'>'} 60 ngày (Nguy cơ rời bỏ)</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 6: Business Constraints (Service Locking & Day Locking) */}
                  <div className="border-t border-slate-100 pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="font-bold text-slate-600 block">
                        Gói dịch vụ chính áp dụng (Service-Locking)
                        {campaignForm.discountType === 'free_wash' && <span className="text-rose-500 font-bold ml-1">* Bắt buộc</span>}
                      </label>
                      <select
                        value={campaignForm.applicableServiceCode}
                        onChange={e => setCampaignForm({ ...campaignForm, applicableServiceCode: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                      >
                        <option value="">Áp dụng cho mọi gói dịch vụ chính</option>
                        {availablePackages.map(pkg => (
                          <option key={pkg.serviceCode} value={pkg.serviceCode}>
                            {pkg.serviceCode} - {pkg.name} ({pkg.price.toLocaleString('vi-VN')} đ)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Thứ trong tuần áp dụng (Weekday/Weekend)</label>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => {
                          const dayLabel = day === 'MON' ? 'T2' :
                            day === 'TUE' ? 'T3' :
                              day === 'WED' ? 'T4' :
                                day === 'THU' ? 'T5' :
                                  day === 'FRI' ? 'T6' :
                                    day === 'SAT' ? 'T7' : 'CN';
                          const isChecked = campaignForm.applicableDays.includes(day);
                          return (
                            <button
                              type="button"
                              key={day}
                              onClick={() => handleDayCheckboxChange(day)}
                              className={`px-3 py-1.5 rounded-lg font-black transition-all border ${isChecked
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                              {dayLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Row 7: Start & End Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Ngày bắt đầu hiệu lực</label>
                      <input
                        type="date"
                        required
                        value={campaignForm.startDate}
                        onChange={e => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Ngày kết thúc hiệu lực</label>
                      <input
                        type="date"
                        required
                        value={campaignForm.endDate}
                        onChange={e => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Dynamic Audience Preview Counter */}
                  <div className="bg-indigo-50/40 border border-indigo-100/60 p-3.5 rounded-xl space-y-1">
                    <div className="text-[10px] text-indigo-700 font-extrabold uppercase flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Dự kiến tệp đối tượng nhận</span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-indigo-700">{getAudiencePreviewCount()}</span>
                      <span className="text-[10px] text-indigo-600 font-bold">khách hàng thỏa mãn điều kiện.</span>
                    </div>
                    <p className="text-[9px] text-slate-400">
                      {Number(campaignForm.costPoints) > 0
                        ? "Voucher sẽ hiển thị ở Quầy đổi điểm cho nhóm khách hàng đủ điều kiện."
                        : "Voucher phát tặng miễn phí sẽ tự động chuyển thẳng vào ví của nhóm khách hàng này."}
                    </p>
                  </div>

                </div>

                {/* Fixed Footer Actions */}
                <div className="flex gap-2.5 p-6 pt-4 justify-end border-t border-slate-100 shrink-0 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-655 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {editingCampaign ? 'Lưu cập nhật chiến dịch' : 'Kích hoạt & Phát hành chiến dịch'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* DYNAMIC CONFIRMATION MODAL */}
        {confirmDialog && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-[1px] animate-fade-in text-left">
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
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-655 font-bold rounded-xl text-xs transition-colors cursor-pointer"
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
                  className={`px-4.5 py-2 font-black rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${confirmDialog.isDestructive
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

        {/* NOTIFICATION MODAL (SUCCESS / WARNING / ERROR) */}
        {notificationModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[160] p-4 backdrop-blur-[1px] animate-fade-in text-center">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-100 animate-scale-up">
              <div className="flex justify-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold border ${
                  notificationModal.type === 'warning'
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : notificationModal.type === 'error'
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  {notificationModal.type === 'warning' ? (
                    <AlertTriangle className="w-7 h-7 text-amber-600" />
                  ) : notificationModal.type === 'error' ? (
                    <XCircle className="w-7 h-7 text-rose-600" />
                  ) : (
                    <CheckCircle className="w-7 h-7 text-emerald-600" />
                  )}
                </div>
              </div>
              <h3 className="font-extrabold text-slate-800 text-base">{notificationModal.title}</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">{notificationModal.content}</p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setNotificationModal(null)}
                  className={`w-full py-2.5 text-white font-black rounded-xl text-xs transition-colors cursor-pointer shadow-sm ${
                    notificationModal.type === 'warning'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : notificationModal.type === 'error'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  Đồng ý
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* DYNAMIC FLOATING TOAST */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-black shadow-xl animate-fade-in transition-all text-left ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-850 border-emerald-200' :
          toast.type === 'warning' ? 'bg-amber-50 text-amber-855 border-amber-250' :
            'bg-rose-50 text-rose-850 border-rose-200'
          }`}>
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${toast.type === 'success' ? 'bg-emerald-500' :
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
