/**
 * Authentication action types
 * Centralizes all action type constants for the auth reducer
 */
export const AuthActionType = {
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_ERROR: 'AUTH_ERROR',
  SET_TOKENS: 'SET_TOKENS',
  LOGOUT: 'LOGOUT',
  REFRESH_START: 'REFRESH_START',
  REFRESH_SUCCESS: 'REFRESH_SUCCESS',
  REFRESH_ERROR: 'REFRESH_ERROR',
} as const;

/**
 * Type-safe action type values
 */
export type AuthActionTypeValue = (typeof AuthActionType)[keyof typeof AuthActionType];
