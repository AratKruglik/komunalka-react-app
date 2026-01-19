import { AuthActionType } from '../../contexts/auth/actionTypes'
import type { User } from './user.types'

/**
 * Action types for the auth reducer
 */
export type AuthAction =
  | { type: typeof AuthActionType.AUTH_START }
  | { type: typeof AuthActionType.AUTH_SUCCESS; payload: { user: User | null; token: string; refreshToken: string; expiresAt: string } }
  | { type: typeof AuthActionType.AUTH_ERROR; payload: string }
  | { type: typeof AuthActionType.SET_TOKENS; payload: { token: string; refreshToken: string; expiresAt: string } }
  | { type: typeof AuthActionType.LOGOUT }
  | { type: typeof AuthActionType.REFRESH_START }
  | { type: typeof AuthActionType.REFRESH_SUCCESS; payload: { token: string; refreshToken: string; expiresAt: string; user?: User } }
  | { type: typeof AuthActionType.REFRESH_ERROR }
  | { type: typeof AuthActionType.UPDATE_USER; payload: User };
