import axios from 'axios'
import { API_CONFIG } from './config'
import { API_ENDPOINTS } from '../constants'
import { snakeToCamelKeys, camelToSnakeKeys } from './utils'
import type {
  OAuthProvider,
  OAuthAuthorizationResponse,
  OAuthCallbackRequest,
  OAuthLoginRequest,
  OAuthLinkRequest,
  OAuthLinkResponse,
  OAuthUnlinkRequest,
  OAuthUnlinkResponse,
} from '../types/auth'

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export type AuthProvider = 'Local' | 'Google' | 'GitHub';

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiration?: string;
  expiresIn?: string | number;
  userId: number;
  username: string;
  email: string;
  role: string;
  authProvider: AuthProvider;
  emailVerified: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ValidateTokenResponse {
  isValid: boolean;
  expiresAt: string;
  claims: string[];
}

/**
 * Сервіс для роботи з аутентифікацією
 */
const authHttp = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

authHttp.interceptors.request.use((config) => {
  if (config.data != null && !(config.data instanceof FormData)) {
    config.data = camelToSnakeKeys(config.data)
  }
  return config
})

authHttp.interceptors.response.use((response) => {
  if (response.data != null && typeof response.data === 'object') {
    response.data = snakeToCamelKeys(response.data)
  }
  return response
})

type SameSite = 'Lax' | 'Strict' | 'None';

function setCookie(
  name: string,
  value: string,
  options: {
    expires?: Date;
    maxAge?: number;
    path?: string;
    sameSite?: SameSite;
    secure?: boolean;
  } = {}
) {
  const path = options.path ?? '/'
  const sameSite = options.sameSite ?? 'Lax'
  const secure = options.secure ?? window.location.protocol === 'https:'

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}`

  if (secure) {
    cookie += '; Secure'
  }
  if (options.expires) {
    cookie += `; Expires=${options.expires.toUTCString()}`
  }
  if (typeof options.maxAge === 'number') {
    cookie += `; Max-Age=${options.maxAge}`
  }

  document.cookie = cookie
}

function getCookie(name: string): string | null {
  const encodedName = encodeURIComponent(name) + '='
  const parts = document.cookie.split('; ')
  const cookie = parts.find(part => part.startsWith(encodedName))
  return cookie ? decodeURIComponent(cookie.substring(encodedName.length)) : null
}

function deleteCookie(name: string) {
  setCookie(name, '', { maxAge: -1 })
}

export function resolveExpirationIso(response: AuthResponse): string {
  if (response.expiration) {
    return response.expiration
  }
  if (response.expiresIn != null) {
    const seconds = Number(response.expiresIn)
    return new Date(Date.now() + seconds * 1000).toISOString()
  }
  return new Date(Date.now() + 3600 * 1000).toISOString()
}

function saveAuthCookies(response: AuthResponse, rememberMe: boolean) {
  const expirationIso = resolveExpirationIso(response)
  const expiresAtDate = new Date(expirationIso)
  const cookieOptions = rememberMe ? { expires: expiresAtDate } : {}

  if (rememberMe) {
    setCookie('remember_me', 'true', { maxAge: 60 * 60 * 24 * 30 })
  } else {
    deleteCookie('remember_me')
  }

  setCookie('jwt_token', response.token, cookieOptions)
  setCookie('refresh_token', response.refreshToken, cookieOptions)
  setCookie('expires_at', expirationIso, cookieOptions)
}

function clearAuthCookies() {
  deleteCookie('jwt_token')
  deleteCookie('refresh_token')
  deleteCookie('expires_at')
  deleteCookie('remember_me')
}

export const authService = {
  /**
   * Реєстрація нового користувача
   */
  register: async (data: RegisterRequest, rememberMe = true): Promise<AuthResponse> => {
    const response = await authHttp.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data)
    saveAuthCookies(response.data, rememberMe)
    return response.data
  },

  /**
   * Вхід користувача
   */
  login: async (data: LoginRequest, rememberMe = false): Promise<AuthResponse> => {
    const response = await authHttp.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data)
    saveAuthCookies(response.data, rememberMe)
    return response.data
  },

  /**
   * Вихід користувача
   */
  logout: () => {
    clearAuthCookies()
  },

  /**
   * Оновлення JWT токена
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await authHttp.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    })

    const rememberMe = getCookie('remember_me') === 'true'
    saveAuthCookies(response.data, rememberMe)

    return response.data
  },

  /**
   * Відкликання refresh токена
   */
  revokeToken: (refreshToken: string) =>
    authHttp.post(API_ENDPOINTS.AUTH.REVOKE, { refreshToken }),

  /**
   * Валідація JWT токена
   */
  validateToken: () => authHttp.get<ValidateTokenResponse>(API_ENDPOINTS.AUTH.VALIDATE).then(r => r.data),

  /**
   * Перевірка, чи користувач залогінений
   */
  isAuthenticated: (): boolean => {
    return !!getCookie('jwt_token')
  },

  /**
   * Отримання токена
   */
  getToken: (): string | null => {
    return getCookie('jwt_token')
  },

  /**
   * Отримання refresh токена
   */
  getRefreshToken: (): string | null => {
    return getCookie('refresh_token')
  },

  /**
   * Отримання часу експірації access токена
   */
  getExpiresAt: (): string | null => {
    return getCookie('expires_at')
  },

  getGoogleAuthUrl: async (): Promise<string> => {
    const response = await authHttp.get<OAuthAuthorizationResponse>(API_ENDPOINTS.OAUTH.GOOGLE_AUTHORIZE)
    return response.data.authorizationUrl
  },

  getGithubAuthUrl: async (): Promise<string> => {
    const response = await authHttp.get<OAuthAuthorizationResponse>(API_ENDPOINTS.OAUTH.GITHUB_AUTHORIZE)
    return response.data.authorizationUrl
  },

  oauthCallback: async (data: OAuthCallbackRequest, rememberMe = true): Promise<AuthResponse> => {
    const response = await authHttp.post<AuthResponse>(API_ENDPOINTS.OAUTH.CALLBACK, data)
    saveAuthCookies(response.data, rememberMe)
    return response.data
  },

  oauthLogin: async (data: OAuthLoginRequest, rememberMe = true): Promise<AuthResponse> => {
    const response = await authHttp.post<AuthResponse>(API_ENDPOINTS.OAUTH.LOGIN, data)
    saveAuthCookies(response.data, rememberMe)
    return response.data
  },

  linkProvider: async (data: OAuthLinkRequest): Promise<OAuthLinkResponse> => {
    const token = getCookie('jwt_token')
    const response = await authHttp.post<OAuthLinkResponse>(API_ENDPOINTS.OAUTH.LINK, data, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  unlinkProvider: async (provider: OAuthProvider, data: OAuthUnlinkRequest): Promise<OAuthUnlinkResponse> => {
    const token = getCookie('jwt_token')
    const response = await authHttp.delete<OAuthUnlinkResponse>(API_ENDPOINTS.OAUTH.UNLINK(provider), {
      headers: { Authorization: `Bearer ${token}` },
      data,
    })
    return response.data
  },
}
