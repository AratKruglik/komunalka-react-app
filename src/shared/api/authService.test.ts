import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'
import type { AxiosResponse } from 'axios'

const mockPost = vi.fn()
const mockGet = vi.fn()

vi.mock('axios', async () => {
  return {
    default: {
      create: vi.fn(() => ({
        post: mockPost,
        get: mockGet,
      })),
    },
  }
})

vi.mock('./config', () => ({
  API_CONFIG: {
    baseURL: 'http://localhost:3000/api/v1',
    timeout: 10000,
  },
}))

const { authService } = await import('./authService')

interface AuthResponseType {
  token: string
  refreshToken: string
  expiration: string
  userId: number
  username: string
  email: string
  role: string
  authProvider: 'Local' | 'Google' | 'GitHub'
  emailVerified: boolean
}

interface LoginRequestType {
  email: string
  password: string
}

interface RegisterRequestType {
  username: string
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  password: string
  confirmPassword: string
}

const mockAuthResponse: AuthResponseType = {
  token: 'test-jwt-token',
  refreshToken: 'test-refresh-token',
  expiration: '2030-12-31T23:59:59Z',
  userId: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'User',
  authProvider: 'Local',
  emailVerified: true,
}

function createAxiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: {} as never },
  }
}

function clearCookies() {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const name = cookie.split('=')[0].trim()
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
  }
}

describe('authService', () => {
  beforeAll(() => {
    clearCookies()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    clearCookies()
  })

  afterEach(() => {
    clearCookies()
  })

  describe('register', () => {
    const registerData: RegisterRequestType = {
      username: 'newuser',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+380501234567',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    }

    it('saves tokens to cookies on success', async () => {
      mockPost.mockResolvedValueOnce(createAxiosResponse(mockAuthResponse))

      const result = await authService.register(registerData, true)

      expect(result).toEqual(mockAuthResponse)
      expect(document.cookie).toContain('jwt_token=test-jwt-token')
      expect(document.cookie).toContain('refresh_token=test-refresh-token')
      expect(document.cookie).toContain('expires_at=2030-12-31T23%3A59%3A59Z')
    })

    it('saves remember_me cookie when rememberMe is true', async () => {
      mockPost.mockResolvedValueOnce(createAxiosResponse(mockAuthResponse))

      await authService.register(registerData, true)

      expect(document.cookie).toContain('remember_me=true')
    })

    it('does not save remember_me cookie when rememberMe is false', async () => {
      mockPost.mockResolvedValueOnce(createAxiosResponse(mockAuthResponse))

      await authService.register(registerData, false)

      expect(document.cookie).not.toContain('remember_me=true')
    })

    it('calls correct API endpoint', async () => {
      mockPost.mockResolvedValueOnce(createAxiosResponse(mockAuthResponse))

      await authService.register(registerData)

      expect(mockPost).toHaveBeenCalledWith('/auth/register', registerData)
    })

    it('throws error on API failure', async () => {
      const error = new Error('Network error')
      mockPost.mockRejectedValueOnce(error)

      await expect(authService.register(registerData)).rejects.toThrow('Network error')
    })
  })

  describe('login', () => {
    const loginData: LoginRequestType = {
      email: 'test@example.com',
      password: 'password123',
    }

    it('saves tokens to cookies on success', async () => {
      mockPost.mockResolvedValueOnce(createAxiosResponse(mockAuthResponse))

      const result = await authService.login(loginData, true)

      expect(result).toEqual(mockAuthResponse)
      expect(document.cookie).toContain('jwt_token=test-jwt-token')
      expect(document.cookie).toContain('refresh_token=test-refresh-token')
    })

    it('does not set remember_me cookie when rememberMe is false', async () => {
      mockPost.mockResolvedValueOnce(createAxiosResponse(mockAuthResponse))

      await authService.login(loginData, false)

      expect(document.cookie).not.toContain('remember_me=true')
    })

    it('sets remember_me cookie when rememberMe is true', async () => {
      mockPost.mockResolvedValueOnce(createAxiosResponse(mockAuthResponse))

      await authService.login(loginData, true)

      expect(document.cookie).toContain('remember_me=true')
    })

    it('calls correct API endpoint', async () => {
      mockPost.mockResolvedValueOnce(createAxiosResponse(mockAuthResponse))

      await authService.login(loginData)

      expect(mockPost).toHaveBeenCalledWith('/auth/login', loginData)
    })

    it('throws error on invalid credentials', async () => {
      const error = new Error('Invalid credentials')
      mockPost.mockRejectedValueOnce(error)

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials')
    })
  })

  describe('logout', () => {
    it('clears all auth cookies', () => {
      document.cookie = 'jwt_token=test-token; Path=/'
      document.cookie = 'refresh_token=test-refresh; Path=/'
      document.cookie = 'expires_at=2025-12-31; Path=/'
      document.cookie = 'remember_me=true; Path=/'

      authService.logout()

      expect(authService.getToken()).toBeNull()
      expect(authService.getRefreshToken()).toBeNull()
      expect(authService.getExpiresAt()).toBeNull()
    })
  })

  describe('refreshToken', () => {
    it('updates tokens on success', async () => {
      const newAuthResponse: AuthResponseType = {
        ...mockAuthResponse,
        token: 'new-jwt-token',
        refreshToken: 'new-refresh-token',
      }
      mockPost.mockResolvedValueOnce(createAxiosResponse(newAuthResponse))

      const result = await authService.refreshToken('old-refresh-token')

      expect(result).toEqual(newAuthResponse)
      expect(document.cookie).toContain('jwt_token=new-jwt-token')
      expect(document.cookie).toContain('refresh_token=new-refresh-token')
    })

    it('preserves remember_me setting when refreshing', async () => {
      document.cookie = 'remember_me=true; Path=/'
      mockPost.mockResolvedValueOnce(createAxiosResponse(mockAuthResponse))

      await authService.refreshToken('old-refresh-token')

      expect(document.cookie).toContain('remember_me=true')
    })

    it('calls correct API endpoint with refresh token', async () => {
      mockPost.mockResolvedValueOnce(createAxiosResponse(mockAuthResponse))

      await authService.refreshToken('test-refresh-token')

      expect(mockPost).toHaveBeenCalledWith('/auth/refresh-token', {
        refreshToken: 'test-refresh-token',
      })
    })

    it('throws error on expired refresh token', async () => {
      const error = new Error('Refresh token expired')
      mockPost.mockRejectedValueOnce(error)

      await expect(authService.refreshToken('expired-token')).rejects.toThrow('Refresh token expired')
    })
  })

  describe('isAuthenticated', () => {
    it('returns true when jwt_token cookie exists', () => {
      document.cookie = 'jwt_token=test-token; Path=/'

      expect(authService.isAuthenticated()).toBe(true)
    })

    it('returns false when jwt_token cookie does not exist', () => {
      expect(authService.isAuthenticated()).toBe(false)
    })

    it('returns false after logout', () => {
      document.cookie = 'jwt_token=test-token; Path=/'
      authService.logout()

      expect(authService.isAuthenticated()).toBe(false)
    })
  })

  describe('getToken', () => {
    it('returns token when jwt_token cookie exists', () => {
      document.cookie = 'jwt_token=my-jwt-token; Path=/'

      expect(authService.getToken()).toBe('my-jwt-token')
    })

    it('returns null when jwt_token cookie does not exist', () => {
      expect(authService.getToken()).toBeNull()
    })

    it('decodes URL-encoded token values', () => {
      document.cookie = 'jwt_token=token%20with%20spaces; Path=/'

      expect(authService.getToken()).toBe('token with spaces')
    })
  })

  describe('getRefreshToken', () => {
    it('returns refresh token when cookie exists', () => {
      document.cookie = 'refresh_token=my-refresh-token; Path=/'

      expect(authService.getRefreshToken()).toBe('my-refresh-token')
    })

    it('returns null when refresh_token cookie does not exist', () => {
      expect(authService.getRefreshToken()).toBeNull()
    })
  })

  describe('getExpiresAt', () => {
    it('returns expiration time when cookie exists', () => {
      document.cookie = 'expires_at=2030-12-31T23%3A59%3A59Z; Path=/'

      expect(authService.getExpiresAt()).toBe('2030-12-31T23:59:59Z')
    })

    it('returns null when expires_at cookie does not exist', () => {
      expect(authService.getExpiresAt()).toBeNull()
    })
  })

  describe('revokeToken', () => {
    it('calls correct API endpoint', async () => {
      mockPost.mockResolvedValueOnce(createAxiosResponse({}))

      await authService.revokeToken('test-refresh-token')

      expect(mockPost).toHaveBeenCalledWith('/auth/revoke-token', {
        refreshToken: 'test-refresh-token',
      })
    })
  })

  describe('validateToken', () => {
    it('returns validation response on success', async () => {
      const validationResponse = {
        isValid: true,
        expiresAt: '2030-12-31T23:59:59Z',
        claims: ['user', 'admin'],
      }
      mockGet.mockResolvedValueOnce(createAxiosResponse(validationResponse))

      const result = await authService.validateToken()

      expect(result).toEqual(validationResponse)
      expect(mockGet).toHaveBeenCalledWith('/auth/validate-token')
    })
  })
})
