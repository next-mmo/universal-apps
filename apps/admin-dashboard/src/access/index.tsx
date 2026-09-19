import { Access } from '@package/pro/access';
import { useAuth, ROLE_PERMISSIONS } from '../store/auth';

export { Access };

export interface AccessResult {
  role: string;
  isAdmin: boolean;
  isEditor: boolean;
  isUser: boolean;
  canAccess: (permission: string) => boolean;
  canDelete: boolean;
  canExport: boolean;
  canManageUsers: boolean;
  canAccessSystem: boolean;
}

export function useAccess(): AccessResult {
  const { currentUser } = useAuth();
  const permissions = ROLE_PERMISSIONS[currentUser.role] || [];

  const canAccess = (permission: string) => {
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  };

  return {
    role: currentUser.role,
    isAdmin: currentUser.role === 'admin',
    isEditor: currentUser.role === 'editor',
    isUser: currentUser.role === 'user',
    canAccess,
    canDelete: canAccess('*') || canAccess('user:delete'),
    canExport: canAccess('*') || canAccess('list:export'),
    canManageUsers: canAccess('*') || canAccess('user:manage'),
    canAccessSystem: currentUser.role === 'admin',
  };
}
