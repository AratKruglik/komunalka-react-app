import { api } from './apiClient';

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
export const authService = {
  /**
   * Реєстрація нового користувача
   */
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),

  /**
   * Вхід користувача
   */
  login: async (data: LoginRequest, rememberMe = false): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);

    console.log('[authService] Login API response:', response);
    console.log('[authService] Token:', response.token);
    console.log('[authService] RefreshToken:', response.refreshToken);
    console.log('[authService] Expiration:', response.expiration);

    // Вибираємо storage залежно від "запам'ятати мене"
    const storage = rememberMe ? localStorage : sessionStorage;

    // Зберігаємо токени та expiration
    storage.setItem('jwt_token', response.token);
    storage.setItem('refresh_token', response.refreshToken);
    storage.setItem('expires_at', response.expiration);

    console.log('[authService] Tokens saved to', rememberMe ? 'localStorage' : 'sessionStorage');

    // Якщо rememberMe, також зберігаємо прапорець
    if (rememberMe) {
      localStorage.setItem('remember_me', 'true');
    }

    return response;
  },

  /**
   * Вихід користувача
   */
  logout: () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('remember_me');
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('expires_at');
  },

  /**
   * Оновлення JWT токена
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh-token', {
      refreshToken,
    });

    // Визначаємо, яке сховище використовувати
    const storage = localStorage.getItem('remember_me') === 'true'
      ? localStorage
      : sessionStorage;

    // Оновлюємо токени та expiration
    storage.setItem('jwt_token', response.token);
    storage.setItem('refresh_token', response.refreshToken);
    storage.setItem('expires_at', response.expiration);

    return response;
  },

  /**
   * Відкликання refresh токена
   */
  revokeToken: (refreshToken: string) =>
    api.post('/auth/revoke-token', { refreshToken }),

  /**
   * Валідація JWT токена
   */
  validateToken: () => api.get<ValidateTokenResponse>('/auth/validate-token'),

  /**
   * Перевірка, чи користувач залогінений
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    return !!token;
  },

  /**
   * Отримання токена
   */
  getToken: (): string | null => {
    return localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
  },

  /**
   * Отримання refresh токена
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
  },
};
