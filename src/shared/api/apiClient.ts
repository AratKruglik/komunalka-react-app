import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { API_CONFIG } from './config'
import { authService } from './authService'
import { formatApiError, withAuthHeader } from './utils'
import { ROUTES } from '../constants'

/**
 * Create axios instance with default configuration
 * This is a singleton - created once and reused
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Perform API request with automatic token injection and 401 handling
 * Attempts to refresh token on 401 and retries once
 *
 * @param config - Axios request configuration
 * @returns Response data
 * @throws Formatted API error
 */
async function performRequest<T>(config: AxiosRequestConfig, token?: string | null): Promise<AxiosResponse<T>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const headersWithAuth = withAuthHeader(config.headers as any, token)
  return apiClient<T>({
    ...config,
    headers: headersWithAuth,
  })
}

/**
 * Attempt to refresh token and retry request
 *
 * @param config - Original request configuration
 * @throws Error if refresh fails or no refresh token available
 */
async function refreshAndRetry<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  const refreshToken = authService.getRefreshToken()

  if (!refreshToken) {
    authService.logout()
    window.location.href = ROUTES.LOGIN
    throw formatApiError(new Error('No refresh token'))
  }

  try {
    const refreshResponse = await authService.refreshToken(refreshToken)
    return performRequest<T>(config, refreshResponse.token)
  } catch (refreshError) {
    authService.logout()
    window.location.href = ROUTES.LOGIN
    throw formatApiError(refreshError)
  }
}

/**
 * Generic API request wrapper
 * Adds Authorization header from authService and retries once on 401 with refresh flow
 *
 * @param config - Axios request configuration
 * @returns Promise with response data
 * @throws Formatted error object
 */
export async function apiRequest<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  let hasRetried = false

  try {
    const token = authService.getToken()
    const response = await performRequest<T>(config, token)
    return response.data
  } catch (error) {
    // Handle 401 Unauthorized - attempt token refresh
    if (axios.isAxiosError(error) && error.response?.status === 401 && !hasRetried) {
      hasRetried = true
      const retryResponse = await refreshAndRetry<T>(config)
      return retryResponse.data
    }

    throw formatApiError(error)
  }
}

/**
 * Convenience methods for different HTTP verbs
 * These wrap apiRequest with specific method configurations
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
}

export default apiClient
