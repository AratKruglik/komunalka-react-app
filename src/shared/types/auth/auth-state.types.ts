import type { User } from './user.types';

/**
 * Authentication state interface
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
