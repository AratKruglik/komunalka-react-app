import type { Dispatch } from 'react'
import type { AuthAction } from '../types'

/**
 * Type for the dispatch function used in auth utils
 */
export type AuthDispatch = Dispatch<AuthAction>;

/**
 * Ref types for managing timeouts and flags
 */
export interface RefreshTimeoutRef {
  current: ReturnType<typeof setTimeout> | null;
}

export interface IsRefreshingRef {
  current: boolean;
}

/**
 * Callback types for utility functions
 */
export type ScheduleTokenRefreshFn = (expiresAt: string) => void;
export type RefreshTokenManuallyFn = () => Promise<void>;
export type LogoutFn = () => void;
