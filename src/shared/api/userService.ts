import { api, apiRequest } from './apiClient'
import { API_CONFIG } from './config'
import { authService } from './authService'
import { API_ENDPOINTS } from '../constants'
import { getUserIdFromToken } from '../utils/jwt'
import type { User, UpdateUserRequest, UpdateProfilePayload, CreateUserRequest } from '../types/auth/user.types'
import type { PaginationParams, PaginatedResponse } from './types'

/**
 * Service for managing users
 * Provides CRUD operations for user management
 */
export const userService = {
  /**
   * Get current user profile by extracting userId from JWT token
   * @returns Current user data
   */
  getProfile: async (): Promise<User> => {
    const token = authService.getToken()
    if (!token) {
      throw new Error('No authentication token')
    }

    const userId = getUserIdFromToken(token)
    if (!userId) {
      throw new Error('Invalid token: no user ID')
    }

    return api.get<User>(API_ENDPOINTS.USERS.GET(userId))
  },

  /**
   * Get paginated list of users
   * @param params - Optional pagination and sorting parameters
   * @returns Paginated list of users
   */
  list: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.perPage) queryParams.append('perPage', params.perPage.toString())
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.desc !== undefined) queryParams.append('desc', params.desc.toString())

    const queryString = queryParams.toString()
    const url = queryString ? `${API_ENDPOINTS.USERS.LIST}?${queryString}` : API_ENDPOINTS.USERS.LIST

    return api.get<PaginatedResponse<User>>(url)
  },

  /**
   * Get a specific user by ID
   * @param id - User ID
   * @returns User data
   */
  getById: async (id: number): Promise<User> => {
    return api.get<User>(API_ENDPOINTS.USERS.GET(id))
  },

  /**
   * Create a new user
   * @param data - User creation data
   * @returns Created user
   */
  create: async (data: CreateUserRequest): Promise<User> => {
    return api.post<User>(API_ENDPOINTS.USERS.CREATE, data)
  },

  /**
   * Update an existing user
   * @param id - User ID
   * @param data - Fields to update
   * @returns Updated user
   */
  update: async (id: number, data: UpdateUserRequest): Promise<User> => {
    return api.put<User>(API_ENDPOINTS.USERS.UPDATE(id), data)
  },

  /**
   * Update user profile with optional avatar upload
   * Uses multipart/form-data when avatar is included, JSON otherwise
   * Password change is integrated into this endpoint
   * @param id - User ID
   * @param data - Profile update data including optional avatar and password fields
   * @returns Updated user
   */
  updateWithAvatar: async (id: number, data: UpdateProfilePayload): Promise<User> => {
    const { avatar, ...profileData } = data

    const formData = new FormData()

    if (profileData.username) formData.append('username', profileData.username)
    if (profileData.email) formData.append('email', profileData.email)
    if (profileData.firstName) formData.append('firstName', profileData.firstName)
    if (profileData.lastName) formData.append('lastName', profileData.lastName)
    if (profileData.phoneNumber) formData.append('phoneNumber', profileData.phoneNumber)
    if (profileData.currentPassword) formData.append('currentPassword', profileData.currentPassword)
    if (profileData.newPassword) formData.append('newPassword', profileData.newPassword)
    if (profileData.confirmNewPassword) formData.append('confirmNewPassword', profileData.confirmNewPassword)

    if (avatar) {
      formData.append('avatar', avatar)
    }

    return apiRequest<User>({
      method: 'PUT',
      url: API_ENDPOINTS.USERS.UPDATE(id),
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * Get avatar URL for a user
   * @param userId - User ID
   * @param type - Avatar type ('full' or 'thumbnail')
   * @returns Full URL to the avatar image
   */
  getAvatarUrl: (userId: number, type: 'full' | 'thumbnail' = 'full'): string => {
    const endpoint = type === 'thumbnail'
      ? API_ENDPOINTS.USERS.AVATAR_THUMBNAIL(userId)
      : API_ENDPOINTS.USERS.AVATAR(userId)

    return `${API_CONFIG.baseURL}${endpoint}`
  },

  /**
   * Delete a user
   * @param id - User ID
   * @returns void
   */
  delete: async (id: number): Promise<void> => {
    return api.delete<void>(API_ENDPOINTS.USERS.DELETE(id))
  },
}
