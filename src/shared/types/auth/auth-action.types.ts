import type { User } from './user.types';

/**
 * Action types for the auth reducer
 */
export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User | null; token: string; refreshToken: string; expiresAt: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'SET_TOKENS'; payload: { token: string; refreshToken: string; expiresAt: string } }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_START' }
  | { type: 'REFRESH_SUCCESS'; payload: { token: string; refreshToken: string; expiresAt: string; user?: User } }
  | { type: 'REFRESH_ERROR' };
