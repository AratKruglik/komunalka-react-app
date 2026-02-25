import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userService } from './userService'
import { api } from './apiClient'
import { authService } from './authService'
import { API_ENDPOINTS } from '../constants'
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/auth/user.types'
import type { PaginatedResponse } from './types'

vi.mock('./apiClient', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('./authService', () => ({
  authService: {
    getToken: vi.fn(),
  },
}))

vi.mock('../utils/jwt', () => ({
  getUserIdFromToken: vi.fn(),
}))

import { getUserIdFromToken } from '../utils/jwt'

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+380501234567',
  role: 'user',
  authProvider: null,
  emailVerified: false,
  lastLoginAt: null,
  avatarOptimizedUrl: null,
  avatarThumbnailUrl: null,
  addresses: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockPaginatedResponse: PaginatedResponse<User> = {
  data: [mockUser],
  links: {
    first: '/users?page=1',
    last: '/users?page=10',
    prev: null,
    next: '/users?page=2',
  },
  meta: {
    current_page: 1,
    from: 1,
    last_page: 10,
    path: '/users',
    per_page: 10,
    to: 10,
    total: 100,
  },
}

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProfile', () => {
    it('returns user profile when authenticated', async () => {
      vi.mocked(authService.getToken).mockReturnValue('valid-jwt-token')
      vi.mocked(getUserIdFromToken).mockReturnValue(1)
      vi.mocked(api.get).mockResolvedValueOnce(mockUser)

      const result = await userService.getProfile()

      expect(result).toEqual(mockUser)
      expect(authService.getToken).toHaveBeenCalled()
      expect(getUserIdFromToken).toHaveBeenCalledWith('valid-jwt-token')
      expect(api.get).toHaveBeenCalledWith(API_ENDPOINTS.USERS.GET(1))
    })

    it('throws error when no authentication token', async () => {
      vi.mocked(authService.getToken).mockReturnValue(null)

      await expect(userService.getProfile()).rejects.toThrow('No authentication token')
    })

    it('throws error when token has no user ID', async () => {
      vi.mocked(authService.getToken).mockReturnValue('invalid-token')
      vi.mocked(getUserIdFromToken).mockReturnValue(null)

      await expect(userService.getProfile()).rejects.toThrow('Invalid token: no user ID')
    })

    it('propagates API errors', async () => {
      vi.mocked(authService.getToken).mockReturnValue('valid-jwt-token')
      vi.mocked(getUserIdFromToken).mockReturnValue(1)
      vi.mocked(api.get).mockRejectedValueOnce(new Error('User not found'))

      await expect(userService.getProfile()).rejects.toThrow('User not found')
    })
  })

  describe('list', () => {
    it('returns paginated list of users without params', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      const result = await userService.list()

      expect(result).toEqual(mockPaginatedResponse)
      expect(api.get).toHaveBeenCalledWith(API_ENDPOINTS.USERS.LIST)
    })

    it('builds query string with pagination params', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      await userService.list({ page: 2, perPage: 20 })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.USERS.LIST}?page=2&perPage=20`)
    })

    it('includes sorting params in query string', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      await userService.list({ sortBy: 'email', desc: true })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.USERS.LIST}?sortBy=email&desc=true`)
    })

    it('handles all pagination params together', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      await userService.list({ page: 3, perPage: 50, sortBy: 'username', desc: false })

      expect(api.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.USERS.LIST}?page=3&perPage=50&sortBy=username&desc=false`
      )
    })

    it('handles desc=false correctly (falsy but defined)', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      await userService.list({ desc: false })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.USERS.LIST}?desc=false`)
    })
  })

  describe('getById', () => {
    it('returns user by id', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockUser)

      const result = await userService.getById(1)

      expect(result).toEqual(mockUser)
      expect(api.get).toHaveBeenCalledWith(API_ENDPOINTS.USERS.GET(1))
    })

    it('throws error when user not found', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('User not found'))

      await expect(userService.getById(999)).rejects.toThrow('User not found')
    })

    it('calls correct endpoint with different ids', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockUser)

      await userService.getById(42)

      expect(api.get).toHaveBeenCalledWith('/users/42')
    })
  })

  describe('create', () => {
    const createData: CreateUserRequest = {
      username: 'newuser',
      email: 'new@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+380509876543',
      password: 'securePassword123',
    }

    it('creates new user and returns it', async () => {
      const createdUser: User = { ...mockUser, ...createData, id: 2 }
      vi.mocked(api.post).mockResolvedValueOnce(createdUser)

      const result = await userService.create(createData)

      expect(result).toEqual(createdUser)
      expect(api.post).toHaveBeenCalledWith(API_ENDPOINTS.USERS.CREATE, createData)
    })

    it('throws error on validation failure', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Email already exists'))

      await expect(userService.create(createData)).rejects.toThrow('Email already exists')
    })
  })

  describe('update', () => {
    const updateData: UpdateUserRequest = {
      firstName: 'Updated',
      lastName: 'Name',
    }

    it('updates user and returns updated data', async () => {
      const updatedUser: User = { ...mockUser, ...updateData }
      vi.mocked(api.put).mockResolvedValueOnce(updatedUser)

      const result = await userService.update(1, updateData)

      expect(result).toEqual(updatedUser)
      expect(api.put).toHaveBeenCalledWith(API_ENDPOINTS.USERS.UPDATE(1), updateData)
    })

    it('handles partial updates', async () => {
      const partialUpdate: UpdateUserRequest = { email: 'newemail@example.com' }
      const updatedUser: User = { ...mockUser, ...partialUpdate }
      vi.mocked(api.put).mockResolvedValueOnce(updatedUser)

      const result = await userService.update(1, partialUpdate)

      expect(result).toEqual(updatedUser)
      expect(api.put).toHaveBeenCalledWith(API_ENDPOINTS.USERS.UPDATE(1), partialUpdate)
    })

    it('throws error when user not found', async () => {
      vi.mocked(api.put).mockRejectedValueOnce(new Error('User not found'))

      await expect(userService.update(999, updateData)).rejects.toThrow('User not found')
    })
  })

  describe('delete', () => {
    it('deletes user successfully', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined)

      await expect(userService.delete(1)).resolves.toBeUndefined()
      expect(api.delete).toHaveBeenCalledWith(API_ENDPOINTS.USERS.DELETE(1))
    })

    it('throws error when user not found', async () => {
      vi.mocked(api.delete).mockRejectedValueOnce(new Error('User not found'))

      await expect(userService.delete(999)).rejects.toThrow('User not found')
    })

    it('calls correct endpoint with different ids', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined)

      await userService.delete(42)

      expect(api.delete).toHaveBeenCalledWith('/users/42')
    })
  })

})
