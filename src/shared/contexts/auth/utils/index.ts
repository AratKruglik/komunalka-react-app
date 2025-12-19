/**
 * Auth utilities barrel export
 * Centralizes all auth utility functions for easy importing
 */

export { scheduleTokenRefresh, clearTokenRefreshTimeout } from './tokenRefreshScheduler';
export { refreshToken } from './tokenRefresher';
export { loginAction, registerAction } from './authActions';
export { initializeAuth } from './authInitializer';
export { handleVisibilityChange } from './visibilityHandler';

export type {
  AuthDispatch,
  RefreshTimeoutRef,
  IsRefreshingRef,
  ScheduleTokenRefreshFn,
  RefreshTokenManuallyFn,
  LogoutFn,
} from './types';
