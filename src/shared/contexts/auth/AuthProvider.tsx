import { createContext, useReducer, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { authService } from '../../api';
import { AuthActionType } from './actionTypes';
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
// eslint-disable-next-line react-refresh/only-export-components
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
   * Stable function - uses refs only
   */
  const logout = useCallback(() => {
    clearTokenRefreshTimeout(refreshTimeoutRef);
    authService.logout();
    dispatch({ type: AuthActionType.LOGOUT });
  }, []);

  /**
   * Schedule token refresh
   * Stable function - uses refs for callbacks to avoid circular dependencies
   */
  const scheduleRefresh = useCallback((expiresAt: string) => {
    scheduleTokenRefresh(
      expiresAt,
      refreshTimeoutRef,
      // Pass current callbacks via ref to avoid circular deps
      () => refreshTokenManuallyRef.current?.() ?? Promise.resolve(),
      logout
    );
  }, [logout]);

  /**
   * Manual token refresh
   * Stored in ref to avoid circular dependencies with scheduleRefresh
   */
  const refreshTokenManuallyRef = useRef<(() => Promise<void>) | null>(null);

  const refreshTokenManually = useCallback(async () => {
    await refreshToken(isRefreshingRef, state.refreshToken, dispatch, scheduleRefresh, logout);
  }, [state.refreshToken, scheduleRefresh, logout]);

  // Update ref when function changes
  refreshTokenManuallyRef.current = refreshTokenManually;

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
    void initializeAuth(dispatch, scheduleRefresh, refreshTokenManually);
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
