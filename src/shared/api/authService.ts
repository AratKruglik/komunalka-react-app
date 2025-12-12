import axios from 'axios';
import { API_CONFIG } from './config';

/**
 * Типи для аутентифікації
 */
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
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiration: string; // API повертає "expiration", а не "expiresAt"
  userId?: number;
  username?: string;
  email?: string;
  role?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
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
});

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
  const path = options.path ?? '/';
  const sameSite = options.sameSite ?? 'Lax';
  const secure = options.secure ?? window.location.protocol === 'https:';

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}`;

  if (secure) {
    cookie += '; Secure';
  }
  if (options.expires) {
    cookie += `; Expires=${options.expires.toUTCString()}`;
  }
  if (typeof options.maxAge === 'number') {
    cookie += `; Max-Age=${options.maxAge}`;
  }

  document.cookie = cookie;
}

function getCookie(name: string): string | null {
  const encodedName = encodeURIComponent(name) + '=';
  const parts = document.cookie.split('; ');
  for (const part of parts) {
    if (part.startsWith(encodedName)) {
      return decodeURIComponent(part.substring(encodedName.length));
    }
  }
  return null;
}

function deleteCookie(name: string) {
  setCookie(name, '', { maxAge: -1 });
}

function saveAuthCookies(response: AuthResponse, rememberMe: boolean) {
  const expiresAtDate = new Date(response.expiration);

  if (rememberMe) {
    setCookie('remember_me', 'true', { maxAge: 60 * 60 * 24 * 30 });
    setCookie('jwt_token', response.token, { expires: expiresAtDate });
    setCookie('refresh_token', response.refreshToken, { expires: expiresAtDate });
    setCookie('expires_at', response.expiration, { expires: expiresAtDate });
  } else {
    deleteCookie('remember_me');
    setCookie('jwt_token', response.token);
    setCookie('refresh_token', response.refreshToken);
    setCookie('expires_at', response.expiration);
  }
}

function clearAuthCookies() {
  deleteCookie('jwt_token');
  deleteCookie('refresh_token');
  deleteCookie('expires_at');
  deleteCookie('remember_me');
}

export const authService = {
  /**
   * Реєстрація нового користувача
   */
  register: async (data: RegisterRequest, rememberMe = true): Promise<AuthResponse> => {
    const response = await authHttp.post<AuthResponse>('/auth/register', data);
    saveAuthCookies(response.data, rememberMe);
    return response.data;
  },

  /**
   * Вхід користувача
   */
  login: async (data: LoginRequest, rememberMe = false): Promise<AuthResponse> => {
    const response = await authHttp.post<AuthResponse>('/auth/login', data);
    saveAuthCookies(response.data, rememberMe);
    return response.data;
  },

  /**
   * Вихід користувача
   */
  logout: () => {
    clearAuthCookies();
  },

  /**
   * Оновлення JWT токена
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await authHttp.post<AuthResponse>('/auth/refresh-token', {
      refreshToken,
    });

    const rememberMe = getCookie('remember_me') === 'true';
    saveAuthCookies(response.data, rememberMe);

    return response.data;
  },

  /**
   * Відкликання refresh токена
   */
  revokeToken: (refreshToken: string) =>
    authHttp.post('/auth/revoke-token', { refreshToken }),

  /**
   * Валідація JWT токена
   */
  validateToken: () => authHttp.get<ValidateTokenResponse>('/auth/validate-token').then(r => r.data),

  /**
   * Перевірка, чи користувач залогінений
   */
  isAuthenticated: (): boolean => {
    return !!getCookie('jwt_token');
  },

  /**
   * Отримання токена
   */
  getToken: (): string | null => {
    return getCookie('jwt_token');
  },

  /**
   * Отримання refresh токена
   */
  getRefreshToken: (): string | null => {
    return getCookie('refresh_token');
  },

  /**
   * Отримання часу експірації access токена
   */
  getExpiresAt: (): string | null => {
    return getCookie('expires_at');
  },
};
