import { api } from './apiClient'
import { API_ENDPOINTS } from '../constants'
import type { User, UpdateUserRequest, CreateUserRequest, ChangePasswordRequest } from '../types/auth/user.types'
import type { PaginationParams, PaginatedResponse } from './types'

/**
 * Service for managing users
 * Provides CRUD operations for user management
 */
export const userService = {
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
   * Delete a user
   * @param id - User ID
   * @returns void
   */
  delete: async (id: number): Promise<void> => {
    return api.delete<void>(API_ENDPOINTS.USERS.DELETE(id))
  },

  /**
   * Change user password
   * @param data - Current and new password
   * @returns void
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    return api.post<void>(API_ENDPOINTS.USER.CHANGE_PASSWORD, data)
  },
}
