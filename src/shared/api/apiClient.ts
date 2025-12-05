import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * API Configuration from environment variables
 */
const API_CONFIG = {
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/${import.meta.env.VITE_API_VERSION}`,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
};

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - добавляє JWT токен до кожного запиту
 */
apiClient.interceptors.request.use(
  (config) => {
    // Шукаємо токен в обох сховищах
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - обробляє помилки авторизації
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Якщо отримали 401 помилку і це не повторний запит
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Спроба оновити токен
        const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');

        if (refreshToken) {
          const response = await axios.post(
            `${API_CONFIG.baseURL}/auth/refresh-token`,
            { refreshToken }
          );

          const { token, refreshToken: newRefreshToken, expiration } = response.data;

          // Зберігаємо новий токен у те ж сховище, де був старий
          const storage = localStorage.getItem('jwt_token') ? localStorage : sessionStorage;
          storage.setItem('jwt_token', token);
          storage.setItem('refresh_token', newRefreshToken);
          storage.setItem('expires_at', expiration);

          // Повторити оригінальний запит з новим токеном
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Якщо оновлення токена не вдалося, очистити токени і перенаправити на логін
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_at');
        localStorage.removeItem('remember_me');
        sessionStorage.removeItem('jwt_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('expires_at');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Generic API request wrapper
 */
export const apiRequest = async <T = unknown>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Обробка специфічних помилок API
      throw {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      };
    }
    throw error;
  }
};

/**
 * Helper methods для різних HTTP методів
 */
export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'GET', url }),

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'POST', url, data }),

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }),

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'DELETE', url }),
};

export default apiClient;
