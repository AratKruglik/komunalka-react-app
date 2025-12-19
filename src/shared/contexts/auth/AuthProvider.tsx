import { createContext, useReducer, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { authService } from '../../api';
import type { AuthContextValue } from './types';
import { authReducer, initialState } from './reducer';
import {
  scheduleTokenRefresh,
  clearTokenRefreshTimeout,
  refreshToken,
  loginAction,
  registerAction,
  initializeAuth,
  handleVisibilityChange,
} from './utils';

/**
 * Auth context - separated for better performance
 * Export for use in custom hooks
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Authentication Provider Component
 * Manages authentication state, token refresh timers, and provides auth methods
 *
 * This component is now streamlined - all business logic is extracted into utility functions
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);

  /**
   * Logout user and clear all data
   * Stable reference - no dependencies needed
   */
  const logout = useCallback(() => {
    clearTokenRefreshTimeout(refreshTimeoutRef);
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  /**
   * Wrapper for refreshToken that captures refs, state, and callbacks
   * Note: circular dependency with scheduleRefresh is resolved via ref pattern
   */
  const refreshTokenManually = useCallback(async () => {
    // We'll pass scheduleRefresh via the ref pattern in scheduleTokenRefresh
    const scheduleRefreshFn = (expiresAt: string) => {
      scheduleTokenRefresh(expiresAt, refreshTimeoutRef, refreshTokenManually, logout);
    };
    await refreshToken(isRefreshingRef, state.refreshToken, dispatch, scheduleRefreshFn, logout);
  }, [state.refreshToken, logout]);

  /**
   * Wrapper for scheduleTokenRefresh that captures refs and callbacks
   */
  const scheduleRefresh = useCallback(
    (expiresAt: string) => {
      scheduleTokenRefresh(expiresAt, refreshTimeoutRef, refreshTokenManually, logout);
    },
    [refreshTokenManually, logout]
  );

  /**
   * Login user with email and password
   */
  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      await loginAction({ email, password, rememberMe }, dispatch, scheduleRefresh);
    },
    [scheduleRefresh]
  );

  /**
   * Register new user
   */
  const register = useCallback(
    async (
      data: {
        username: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        email: string;
        password: string;
        confirmPassword: string;
      },
      rememberMe = true
    ) => {
      await registerAction({ ...data, rememberMe }, dispatch, scheduleRefresh);
    },
    [scheduleRefresh]
  );

  /**
   * Initialize auth state from storage on mount
   */
  useEffect(() => {
    initializeAuth(dispatch, scheduleRefresh, refreshTokenManually);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  /**
   * Handle visibility change (tab sleep/wake)
   * Check token validity when tab becomes visible
   */
  useEffect(() => {
    const visibilityChangeHandler = () => {
      handleVisibilityChange(
        state.isAuthenticated,
        state.expiresAt,
        refreshTokenManually,
        logout,
        scheduleRefresh
      );
    };

    document.addEventListener('visibilitychange', visibilityChangeHandler);
    return () => document.removeEventListener('visibilitychange', visibilityChangeHandler);
  }, [state.isAuthenticated, state.expiresAt, refreshTokenManually, logout, scheduleRefresh]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearTokenRefreshTimeout(refreshTimeoutRef);
    };
  }, []);

  const value: AuthContextValue = {
    state,
    login,
    logout,
    register,
    refreshTokenManually,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
