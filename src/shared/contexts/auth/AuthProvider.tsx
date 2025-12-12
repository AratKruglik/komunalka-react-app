import {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { authService } from '../../api';
import type { AuthContextValue } from './types';
import { authReducer, initialState } from './reducer';

/**
 * Auth context - separated for better performance
 * Export for use in custom hooks
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Authentication Provider Component
 * Manages authentication state, token refresh timers, and provides auth methods
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);

  /**
   * Schedule automatic token refresh before expiration
   * Refreshes 2 minutes before token expires
   */
  const scheduleTokenRefresh = useCallback((expiresAt: string) => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;

    // Refresh 2 minutes (120000ms) before expiration
    const refreshBuffer = 2 * 60 * 1000;
    const timeUntilRefresh = timeUntilExpiry - refreshBuffer;

    // Only schedule if we have time before expiry
    if (timeUntilRefresh > 0) {
      refreshTimeoutRef.current = setTimeout(async () => {
        await refreshTokenManually();
      }, timeUntilRefresh);
    } else if (timeUntilExpiry > 0) {
      // Token expires soon, try to refresh immediately
      refreshTokenManually();
    } else {
      // Token already expired
      logout();
    }
  }, []);

  /**
   * Refresh the authentication token
   */
  const refreshTokenManually = useCallback(async () => {
    // Prevent concurrent refresh requests
    if (isRefreshingRef.current) {
      return;
    }

    const currentRefreshToken = state.refreshToken || authService.getRefreshToken();

    if (!currentRefreshToken) {
      logout();
      return;
    }

    try {
      isRefreshingRef.current = true;
      dispatch({ type: 'REFRESH_START' });

      const response = await authService.refreshToken(currentRefreshToken);

      dispatch({
        type: 'REFRESH_SUCCESS',
        payload: {
          token: response.token,
          refreshToken: response.refreshToken,
          expiresAt: response.expiration,
          user: response.user,
        },
      });

      // Schedule next refresh
      scheduleTokenRefresh(response.expiration);
    } catch (error) {
      dispatch({ type: 'REFRESH_ERROR' });
      authService.logout();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [state.refreshToken, scheduleTokenRefresh]);

  /**
   * Login user with email and password
   */
  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authService.login({ email, password }, rememberMe);

      // Update state
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user || null,
          token: response.token,
          refreshToken: response.refreshToken,
          expiresAt: response.expiration,
        },
      });

      // Schedule token refresh
      scheduleTokenRefresh(response.expiration);
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error as { message: string }).message
        : 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  }, [scheduleTokenRefresh]);

  /**
   * Register new user
   */
  const register = useCallback(async (data: {
    username: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    password: string;
    confirmPassword: string;
  }, rememberMe = true) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authService.register(data, rememberMe);

      // Update state
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user || null,
          token: response.token,
          refreshToken: response.refreshToken,
          expiresAt: response.expiration,
        },
      });

      // Schedule token refresh
      scheduleTokenRefresh(response.expiration);
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error as { message: string }).message
        : 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  }, [scheduleTokenRefresh]);

  /**
   * Logout user and clear all data
   */
  const logout = useCallback(() => {
    // Clear refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    authService.logout();

    // Update state
    dispatch({ type: 'LOGOUT' });
  }, []);

  /**
   * Initialize auth state from storage on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getToken();
      const refreshToken = authService.getRefreshToken();
      const expiresAt = authService.getExpiresAt();

      if (token && refreshToken && expiresAt) {
        const expirationTime = new Date(expiresAt).getTime();
        const currentTime = Date.now();

        // Check if token is still valid
        if (expirationTime > currentTime) {
          // Token is valid, restore session
          dispatch({
            type: 'SET_TOKENS',
            payload: { token, refreshToken, expiresAt },
          });

          // Schedule refresh
          scheduleTokenRefresh(expiresAt);
        } else {
          // Token expired, try to refresh
          await refreshTokenManually();
        }
      } else {
        // No valid session
        dispatch({ type: 'LOGOUT' });
      }
    };

    initializeAuth();
  }, [scheduleTokenRefresh, refreshTokenManually]);

  /**
   * Handle visibility change (tab sleep/wake)
   * Check token validity when tab becomes visible
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.isAuthenticated && state.expiresAt) {
        const expirationTime = new Date(state.expiresAt).getTime();
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;

        // If token expires in less than 5 minutes, refresh immediately
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          refreshTokenManually();
        } else if (timeUntilExpiry <= 0) {
          logout();
        } else {
          // Reschedule refresh based on current time
          scheduleTokenRefresh(state.expiresAt);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.isAuthenticated, state.expiresAt, refreshTokenManually, logout, scheduleTokenRefresh]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
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
