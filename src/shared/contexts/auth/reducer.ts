import type { AuthState, AuthAction } from './types';

/**
 * Initial authentication state
 */
export const initialState: AuthState = {
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
export function authReducer(state: AuthState, action: AuthAction): AuthState {
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
        isLoading: false,
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
        isLoading: false,
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
