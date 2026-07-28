import { getUserPermissions, hasPermission as checkPermission } from '../utils/rbac';

export const usePermission = () => {
  const permissions = getUserPermissions();

  const hasPermission = (permissionCode) => {
    return checkPermission(permissionCode);
  };

  const canAccess = (permissionCode) => {
    return checkPermission(permissionCode);
  };

  return {
    permissions,
    hasPermission,
    canAccess
  };
};

export default usePermission;
