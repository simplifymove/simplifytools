export {
  adminAuthResponse,
  checkAdminSync,
  getAdminAuthState,
  getAdminSession,
  getSession,
  isAdminRole,
  isAdminUser,
  requireAdmin,
  requireAdminApi,
} from '@/lib/auth/admin';

export type { AdminAuthState, AdminAuthStatus } from '@/lib/auth/admin';
