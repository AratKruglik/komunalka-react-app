import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { API_CONFIG } from './config'
import { authService } from './authService'
import { formatApiError, withAuthHeader, snakeToCamelKeys, camelToSnakeKeys } from './utils'
import { ROUTES } from '../constants'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use((response) => {
  if (response.data != null && typeof response.data === 'object') {
    response.data = snakeToCamelKeys(response.data)
  }
  return response
})

apiClient.interceptors.request.use((config) => {
  if (config.data != null && !(config.data instanceof FormData)) {
    config.data = camelToSnakeKeys(config.data)
  }
  return config
})

async function performRequest<T>(config: AxiosRequestConfig, token?: string | null): Promise<AxiosResponse<T>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const headersWithAuth = withAuthHeader(config.headers as any, token)
  return apiClient<T>({
    ...config,
    headers: headersWithAuth,
  })
}

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

export async function apiRequest<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  let hasRetried = false

  try {
    const token = authService.getToken()
    const response = await performRequest<T>(config, token)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401 && !hasRetried) {
      hasRetried = true
      const retryResponse = await refreshAndRetry<T>(config)
      return retryResponse.data
    }

    throw formatApiError(error)
  }
}

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
