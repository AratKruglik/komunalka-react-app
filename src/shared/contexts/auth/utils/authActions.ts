import { AuthActionType } from '../actionTypes'
import { authService } from '@shared/api'
import type { AuthDispatch, ScheduleTokenRefreshFn } from './types'

/**
 * Parameters for login action
 */
export interface LoginParams {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Parameters for register action
 */
export interface RegisterParams {
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  rememberMe?: boolean;
}

/**
 * Login user with email and password
 *
 * @param params - Login parameters (email, password, rememberMe)
 * @param dispatch - Auth reducer dispatch function
 * @param scheduleTokenRefresh - Function to schedule token refresh after successful login
 * @throws Error if login fails
 */
export async function loginAction(
  params: LoginParams,
  dispatch: AuthDispatch,
  scheduleTokenRefresh: ScheduleTokenRefreshFn
): Promise<void> {
  const { email, password, rememberMe = false } = params

  try {
    dispatch({ type: AuthActionType.AUTH_START })

    const response = await authService.login({ email, password }, rememberMe)

    // Update state
    dispatch({
      type: AuthActionType.AUTH_SUCCESS,
      payload: {
        user: response.user || null,
        token: response.token,
        refreshToken: response.refreshToken,
        expiresAt: response.expiration,
      },
    })

    // Schedule token refresh
    scheduleTokenRefresh(response.expiration)
  } catch (error) {
    const errorMessage =
      error && typeof error === 'object' && 'message' in error
        ? (error as { message: string }).message
        : 'Login failed'
    dispatch({ type: AuthActionType.AUTH_ERROR, payload: errorMessage })
    throw error
  }
}

/**
 * Register new user
 *
 * @param params - Registration parameters (username, firstName, lastName, etc.)
 * @param dispatch - Auth reducer dispatch function
 * @param scheduleTokenRefresh - Function to schedule token refresh after successful registration
 * @throws Error if registration fails
 */
export async function registerAction(
  params: RegisterParams,
  dispatch: AuthDispatch,
  scheduleTokenRefresh: ScheduleTokenRefreshFn
): Promise<void> {
  const { rememberMe = true, ...registrationData } = params

  try {
    dispatch({ type: AuthActionType.AUTH_START })

    const response = await authService.register(registrationData, rememberMe)

    // Update state
    dispatch({
      type: AuthActionType.AUTH_SUCCESS,
      payload: {
        user: response.user || null,
        token: response.token,
        refreshToken: response.refreshToken,
        expiresAt: response.expiration,
      },
    })

    // Schedule token refresh
    scheduleTokenRefresh(response.expiration)
  } catch (error) {
    const errorMessage =
      error && typeof error === 'object' && 'message' in error
        ? (error as { message: string }).message
        : 'Registration failed'
    dispatch({ type: AuthActionType.AUTH_ERROR, payload: errorMessage })
    throw error
  }
}
