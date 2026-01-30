import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

const mockAuthServiceGetToken = vi.fn()
const mockAuthServiceGetRefreshToken = vi.fn()
const mockAuthServiceRefreshToken = vi.fn()
const mockAuthServiceLogout = vi.fn()

vi.mock('./authService', () => ({
  authService: {
    getToken: () => mockAuthServiceGetToken(),
    getRefreshToken: () => mockAuthServiceGetRefreshToken(),
    refreshToken: (token: string) => mockAuthServiceRefreshToken(token),
    logout: () => mockAuthServiceLogout(),
  },
}))

vi.mock('./config', () => ({
  API_CONFIG: {
    baseURL: 'http://localhost:3000/api/v1',
    timeout: 10000,
  },
}))

vi.mock('../constants', () => ({
  ROUTES: {
    LOGIN: '/login',
    HOME: '/',
  },
}))

const mockAxiosInstance = vi.fn()

vi.mock('axios', async () => {
  const actualAxios = await vi.importActual('axios')
  return {
    ...actualAxios,
    default: {
      ...(actualAxios as object),
      create: vi.fn(() => mockAxiosInstance),
      isAxiosError: (error: unknown): error is AxiosError => {
        return error !== null && typeof error === 'object' && 'isAxiosError' in error
      },
    },
  }
})

function createAxiosError(status: number, message = 'Error'): AxiosError {
  const error = new Error(message) as AxiosError
  error.isAxiosError = true
  error.response = {
    status,
    statusText: message,
    data: { message },
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  }
  error.config = {} as InternalAxiosRequestConfig
  return error
}

function createMockResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  }
}

describe('apiClient', () => {
  let originalLocation: Location

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()

    originalLocation = window.location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })

    mockAuthServiceGetToken.mockReturnValue('test-token')
    mockAuthServiceGetRefreshToken.mockReturnValue('test-refresh-token')
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    })
  })

  describe('Token injection', () => {
    it('adds Authorization header when token exists', async () => {
      mockAxiosInstance.mockResolvedValueOnce(createMockResponse({ success: true }))
      mockAuthServiceGetToken.mockReturnValue('my-jwt-token')

      const { apiRequest } = await import('./apiClient')
      await apiRequest({ method: 'GET', url: '/test' })

      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-jwt-token',
          }),
        })
      )
    })

    it('does not add Authorization header when token is null', async () => {
      mockAxiosInstance.mockResolvedValueOnce(createMockResponse({ success: true }))
      mockAuthServiceGetToken.mockReturnValue(null)

      const { apiRequest } = await import('./apiClient')
      await apiRequest({ method: 'GET', url: '/test' })

      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      )
    })
  })

  describe('401 handling with token refresh', () => {
    it('retries request after successful token refresh on 401', async () => {
      const error401 = createAxiosError(401, 'Unauthorized')
      mockAxiosInstance
        .mockRejectedValueOnce(error401)
        .mockResolvedValueOnce(createMockResponse({ data: 'success' }))

      mockAuthServiceRefreshToken.mockResolvedValueOnce({
        token: 'new-token',
        refreshToken: 'new-refresh-token',
        expiration: '2030-12-31T23:59:59Z',
      })

      const { apiRequest } = await import('./apiClient')
      const result = await apiRequest({ method: 'GET', url: '/protected' })

      expect(mockAuthServiceRefreshToken).toHaveBeenCalledWith('test-refresh-token')
      expect(result).toEqual({ data: 'success' })
      expect(mockAxiosInstance).toHaveBeenCalledTimes(2)
    })

    it('redirects to login when no refresh token available', async () => {
      const error401 = createAxiosError(401, 'Unauthorized')
      mockAxiosInstance.mockRejectedValueOnce(error401)
      mockAuthServiceGetRefreshToken.mockReturnValue(null)

      const { apiRequest } = await import('./apiClient')

      await expect(apiRequest({ method: 'GET', url: '/protected' })).rejects.toBeDefined()

      expect(mockAuthServiceLogout).toHaveBeenCalled()
      expect(window.location.href).toBe('/login')
    })

    it('redirects to login when refresh token request fails', async () => {
      const error401 = createAxiosError(401, 'Unauthorized')
      mockAxiosInstance.mockRejectedValueOnce(error401)
      mockAuthServiceRefreshToken.mockRejectedValueOnce(new Error('Refresh failed'))

      const { apiRequest } = await import('./apiClient')

      await expect(apiRequest({ method: 'GET', url: '/protected' })).rejects.toBeDefined()

      expect(mockAuthServiceLogout).toHaveBeenCalled()
      expect(window.location.href).toBe('/login')
    })
  })

  describe('Error handling', () => {
    it('formats axios errors with message and status', async () => {
      const error500 = createAxiosError(500, 'Internal Server Error')
      mockAxiosInstance.mockRejectedValueOnce(error500)

      const { apiRequest } = await import('./apiClient')

      try {
        await apiRequest({ method: 'GET', url: '/test' })
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toMatchObject({
          message: 'Internal Server Error',
          status: 500,
        })
      }
    })

    it('handles network errors without response', async () => {
      const networkError = new Error('Network Error') as AxiosError
      networkError.isAxiosError = true
      networkError.config = {} as InternalAxiosRequestConfig
      mockAxiosInstance.mockRejectedValueOnce(networkError)

      const { apiRequest } = await import('./apiClient')

      try {
        await apiRequest({ method: 'GET', url: '/test' })
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toMatchObject({
          message: 'Network Error',
        })
      }
    })

    it('does not retry on non-401 errors', async () => {
      const error400 = createAxiosError(400, 'Bad Request')
      mockAxiosInstance.mockRejectedValueOnce(error400)

      const { apiRequest } = await import('./apiClient')

      await expect(apiRequest({ method: 'GET', url: '/test' })).rejects.toBeDefined()

      expect(mockAuthServiceRefreshToken).not.toHaveBeenCalled()
      expect(mockAxiosInstance).toHaveBeenCalledTimes(1)
    })
  })

  describe('api convenience methods', () => {
    beforeEach(() => {
      mockAxiosInstance.mockResolvedValue(createMockResponse({ success: true }))
    })

    it('api.get makes GET request', async () => {
      const { api } = await import('./apiClient')
      await api.get('/users')

      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/users',
        })
      )
    })

    it('api.post makes POST request with data', async () => {
      const { api } = await import('./apiClient')
      const data = { name: 'Test' }
      await api.post('/users', data)

      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/users',
          data,
        })
      )
    })

    it('api.put makes PUT request with data', async () => {
      const { api } = await import('./apiClient')
      const data = { name: 'Updated' }
      await api.put('/users/1', data)

      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: '/users/1',
          data,
        })
      )
    })

    it('api.patch makes PATCH request with data', async () => {
      const { api } = await import('./apiClient')
      const data = { name: 'Patched' }
      await api.patch('/users/1', data)

      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          url: '/users/1',
          data,
        })
      )
    })

    it('api.delete makes DELETE request', async () => {
      const { api } = await import('./apiClient')
      await api.delete('/users/1')

      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: '/users/1',
        })
      )
    })
  })
})
