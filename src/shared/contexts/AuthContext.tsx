import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { authService } from '../api/authService';

/**
 * User information interface
 */
interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

/**
 * Authentication state interface
 */
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Action types for the auth reducer
 */
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User | null; token: string; refreshToken: string; expiresAt: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'SET_TOKENS'; payload: { token: string; refreshToken: string; expiresAt: string } }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_START' }
  | { type: 'REFRESH_SUCCESS'; payload: { token: string; refreshToken: string; expiresAt: string; user?: User } }
  | { type: 'REFRESH_ERROR' };

/**
 * Authentication context value interface
 */
interface AuthContextValue {
  state: AuthState;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  register: (data: {
    username: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  refreshTokenManually: () => Promise<void>;
}

/**
 * Initial authentication state
 */
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  expiresAt: null,
  isAuthenticated: false,
  isLoading: true, // Start as true to check for existing session
  error: null,
};

/**
 * Auth reducer function following React best practices
 * Pure function that returns a new state object
 */
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        expiresAt: action.payload.expiresAt,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        expiresAt: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'SET_TOKENS':
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        expiresAt: action.payload.expiresAt,
        isAuthenticated: true,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };

    case 'REFRESH_START':
      return {
        ...state,
        error: null,
      };

    case 'REFRESH_SUCCESS':
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        expiresAt: action.payload.expiresAt,
        user: action.payload.user || state.user,
        isAuthenticated: true,
        error: null,
      };

    case 'REFRESH_ERROR':
      return {
        ...initialState,
        isLoading: false,
      };

    default:
      return state;
  }
}

/**
 * Auth context - separated for better performance
 * Export for use in custom hooks (src/shared/hooks/)
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Storage utility functions
 */
const storage = {
  /**
   * Get the appropriate storage based on remember me flag
   */
  getStorage: (): Storage => {
    const rememberMe = localStorage.getItem('remember_me');
    return rememberMe === 'true' ? localStorage : sessionStorage;
  },

  /**
   * Save authentication data to storage
   */
  saveAuth: (token: string, refreshToken: string, expiresAt: string, rememberMe: boolean) => {
    const storageToUse = rememberMe ? localStorage : sessionStorage;
    storageToUse.setItem('jwt_token', token);
    storageToUse.setItem('refresh_token', refreshToken);
    storageToUse.setItem('expires_at', expiresAt);
    if (rememberMe) {
      localStorage.setItem('remember_me', 'true');
    }
  },

  /**
   * Load authentication data from storage
   */
  loadAuth: () => {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
    const expiresAt = localStorage.getItem('expires_at') || sessionStorage.getItem('expires_at');
    return { token, refreshToken, expiresAt };
  },

  /**
   * Clear all authentication data from storage
   */
  clearAuth: () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('remember_me');
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('expires_at');
  },
};

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

    console.log('[AuthContext] Scheduling token refresh:', {
      expiresAt,
      timeUntilExpiry: Math.round(timeUntilExpiry / 1000) + 's',
      timeUntilRefresh: Math.round(timeUntilRefresh / 1000) + 's',
    });

    // Only schedule if we have time before expiry
    if (timeUntilRefresh > 0) {
      refreshTimeoutRef.current = setTimeout(async () => {
        console.log('[AuthContext] Proactive token refresh triggered');
        await refreshTokenManually();
      }, timeUntilRefresh);
    } else if (timeUntilExpiry > 0) {
      // Token expires soon, try to refresh immediately
      console.log('[AuthContext] Token expires soon, refreshing immediately');
      refreshTokenManually();
    } else {
      // Token already expired
      console.log('[AuthContext] Token already expired, logging out');
      logout();
    }
  }, []);

  /**
   * Refresh the authentication token
   */
  const refreshTokenManually = useCallback(async () => {
    // Prevent concurrent refresh requests
    if (isRefreshingRef.current) {
      console.log('[AuthContext] Refresh already in progress, skipping');
      return;
    }

    const currentRefreshToken = state.refreshToken || storage.loadAuth().refreshToken;

    if (!currentRefreshToken) {
      console.log('[AuthContext] No refresh token available');
      logout();
      return;
    }

    try {
      isRefreshingRef.current = true;
      dispatch({ type: 'REFRESH_START' });

      console.log('[AuthContext] Refreshing token...');
      const response = await authService.refreshToken(currentRefreshToken);

      // Determine which storage to use
      const rememberMe = localStorage.getItem('remember_me') === 'true';
      storage.saveAuth(response.token, response.refreshToken, response.expiration, rememberMe);

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

      console.log('[AuthContext] Token refreshed successfully');
    } catch (error) {
      console.error('[AuthContext] Token refresh failed:', error);
      dispatch({ type: 'REFRESH_ERROR' });
      storage.clearAuth();
      // The 401 interceptor in apiClient will handle redirect
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

      // Save to storage
      storage.saveAuth(response.token, response.refreshToken, response.expiration, rememberMe);

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

      console.log('[AuthContext] Login successful');
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
  }) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authService.register(data);

      // Save to storage (default to session storage for registration)
      storage.saveAuth(response.token, response.refreshToken, response.expiration, false);

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

      console.log('[AuthContext] Registration successful');
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

    // Clear storage
    storage.clearAuth();

    // Update state
    dispatch({ type: 'LOGOUT' });

    console.log('[AuthContext] Logout successful');
  }, []);

  /**
   * Initialize auth state from storage on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const { token, refreshToken, expiresAt } = storage.loadAuth();

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

          console.log('[AuthContext] Session restored from storage');
        } else {
          // Token expired, try to refresh
          console.log('[AuthContext] Token expired, attempting refresh');
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
          console.log('[AuthContext] Tab active, token expires soon, refreshing');
          refreshTokenManually();
        } else if (timeUntilExpiry <= 0) {
          console.log('[AuthContext] Tab active, token expired, logging out');
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
