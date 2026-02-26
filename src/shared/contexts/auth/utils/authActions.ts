import { AuthActionType } from '../actionTypes'
import { authService, userService } from '@shared/api'
import { resolveExpirationIso } from '@shared/api/authService'
import { formatApiError } from '@shared/api/utils'
import type { AuthDispatch, ScheduleTokenRefreshFn } from './types'
import type { User } from '@shared/types/auth/user.types'
import type { OAuthProvider } from '@shared/types/auth/oauth.types'

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

    const minimalUser: User = {
      id: response.userId,
      username: response.username,
      email: response.email,
      role: response.role,
      authProvider: response.authProvider,
      emailVerified: response.emailVerified,
      firstName: null,
      lastName: null,
      phoneNumber: null,
      lastLoginAt: null,
      avatarOptimizedUrl: null,
      avatarThumbnailUrl: null,
      addresses: [],
      createdAt: '',
      updatedAt: '',
    }

    dispatch({
      type: AuthActionType.AUTH_SUCCESS,
      payload: {
        user: minimalUser,
        token: response.token,
        refreshToken: response.refreshToken,
        expiresAt: resolveExpirationIso(response),
      },
    })

    scheduleTokenRefresh(resolveExpirationIso(response))

    try {
      const fullUser = await userService.getProfile()
      dispatch({ type: AuthActionType.UPDATE_USER, payload: fullUser })
    } catch {
      // Profile loading failed - minimal user data already set
    }
  } catch (error) {
    const apiError = formatApiError(error)
    const errorMessage =
      apiError && typeof apiError === 'object' && 'message' in apiError
        ? (apiError as { message: string }).message
        : 'Помилка входу'
    dispatch({ type: AuthActionType.AUTH_ERROR, payload: errorMessage })
    throw apiError
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

    const minimalUser: User = {
      id: response.userId,
      username: response.username,
      email: response.email,
      role: response.role,
      authProvider: response.authProvider,
      emailVerified: response.emailVerified,
      firstName: null,
      lastName: null,
      phoneNumber: null,
      lastLoginAt: null,
      avatarOptimizedUrl: null,
      avatarThumbnailUrl: null,
      addresses: [],
      createdAt: '',
      updatedAt: '',
    }

    dispatch({
      type: AuthActionType.AUTH_SUCCESS,
      payload: {
        user: minimalUser,
        token: response.token,
        refreshToken: response.refreshToken,
        expiresAt: resolveExpirationIso(response),
      },
    })

    scheduleTokenRefresh(resolveExpirationIso(response))

    try {
      const fullUser = await userService.getProfile()
      dispatch({ type: AuthActionType.UPDATE_USER, payload: fullUser })
    } catch {
      // Profile loading failed - minimal user data already set
    }
  } catch (error) {
    const apiError = formatApiError(error)
    const errorMessage =
      apiError && typeof apiError === 'object' && 'message' in apiError
        ? (apiError as { message: string }).message
        : 'Помилка реєстрації'
    dispatch({ type: AuthActionType.AUTH_ERROR, payload: errorMessage })
    throw apiError
  }
}

export interface OAuthCallbackParams {
  provider: OAuthProvider;
  code: string;
  state: string;
}

export async function oauthCallbackAction(
  params: OAuthCallbackParams,
  dispatch: AuthDispatch,
  scheduleTokenRefresh: ScheduleTokenRefreshFn
): Promise<void> {
  const { provider, code, state } = params

  try {
    dispatch({ type: AuthActionType.AUTH_START })

    const response = await authService.oauthCallback({ provider, code, state })

    const minimalUser: User = {
      id: response.userId,
      username: response.username,
      email: response.email,
      role: response.role,
      authProvider: response.authProvider,
      emailVerified: response.emailVerified,
      firstName: null,
      lastName: null,
      phoneNumber: null,
      lastLoginAt: null,
      avatarOptimizedUrl: null,
      avatarThumbnailUrl: null,
      addresses: [],
      createdAt: '',
      updatedAt: '',
    }

    dispatch({
      type: AuthActionType.AUTH_SUCCESS,
      payload: {
        user: minimalUser,
        token: response.token,
        refreshToken: response.refreshToken,
        expiresAt: resolveExpirationIso(response),
      },
    })

    scheduleTokenRefresh(resolveExpirationIso(response))

    try {
      const fullUser = await userService.getProfile()
      dispatch({ type: AuthActionType.UPDATE_USER, payload: fullUser })
    } catch {
      // Profile loading failed - minimal user data already set
    }
  } catch (error) {
    const apiError = formatApiError(error)
    const errorMessage =
      apiError && typeof apiError === 'object' && 'message' in apiError
        ? (apiError as { message: string }).message
        : 'Помилка авторизації через OAuth'
    dispatch({ type: AuthActionType.AUTH_ERROR, payload: errorMessage })
    throw apiError
  }
}
