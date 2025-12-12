import axios from 'axios';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosRequestHeaders,
} from 'axios';
import { API_CONFIG } from './config';
import { authService } from './authService';

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

const withAuthHeader = (headers: AxiosRequestHeaders | undefined, token?: string | null | undefined) => {
  if (!token) return headers;
  return {
    ...(headers || {}),
    Authorization: `Bearer ${token}`,
  };
};

const formatApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data,
    };
  }
  return error;
};

/**
 * Generic API request wrapper without interceptors.
 * Adds Authorization header from authService and retries once on 401 with refresh flow.
 */
export const apiRequest = async <T = unknown>(
  config: AxiosRequestConfig
): Promise<T> => {
  let hasRetried = false;

  const performRequest = async (token?: string | null): Promise<AxiosResponse<T>> => {
    const headersWithAuth = withAuthHeader(config.headers as AxiosRequestHeaders | undefined, token);
    return apiClient({
      ...config,
      headers: headersWithAuth,
    });
  };

  const tryRefreshAndRetry = async () => {
    if (hasRetried) {
      throw formatApiError(new Error('Unauthorized'));
    }
    hasRetried = true;

    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) {
      authService.logout();
      window.location.href = '/login';
      throw formatApiError(new Error('No refresh token'));
    }

    try {
      const refreshResponse = await authService.refreshToken(refreshToken);
      return performRequest(refreshResponse.token);
    } catch (refreshError) {
      authService.logout();
      window.location.href = '/login';
      throw formatApiError(refreshError);
    }
  };

  try {
    const token = authService.getToken();
    const response = await performRequest(token);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const retryResponse = await tryRefreshAndRetry();
      return retryResponse.data;
    }

    throw formatApiError(error);
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
