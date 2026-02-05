import { api } from './apiClient'
import { API_ENDPOINTS } from '../constants/endpoints'
import type {
  ApiServiceProvider,
  ApiDataResponse,
  ApiListResponse,
  CreateServiceProviderRequest,
  UpdateServiceProviderRequest,
} from '../types/api'

/**
 * Service for Service Provider CRUD operations
 * All endpoints require authentication
 */
export const serviceProviderService = {
  /**
   * Get all service providers for current user's addresses
   */
  getAll: async (): Promise<ApiServiceProvider[]> => {
    const response = await api.get<ApiListResponse<ApiServiceProvider>>(
      API_ENDPOINTS.SERVICE_PROVIDERS.LIST
    )
    return response.data
  },

  /**
   * Get service provider by ID
   */
  getById: async (id: number): Promise<ApiServiceProvider> => {
    const response = await api.get<ApiDataResponse<ApiServiceProvider>>(
      API_ENDPOINTS.SERVICE_PROVIDERS.BY_ID(id)
    )
    return response.data
  },

  /**
   * Get service providers for a specific address
   */
  getByAddress: async (addressId: number): Promise<ApiServiceProvider[]> => {
    const response = await api.get<ApiListResponse<ApiServiceProvider>>(
      API_ENDPOINTS.SERVICE_PROVIDERS.BY_ADDRESS(addressId)
    )
    return response.data
  },

  /**
   * Create a new service provider with tariffs
   */
  create: async (data: CreateServiceProviderRequest): Promise<ApiServiceProvider> => {
    const response = await api.post<ApiDataResponse<ApiServiceProvider>>(
      API_ENDPOINTS.SERVICE_PROVIDERS.CREATE,
      data
    )
    return response.data
  },

  /**
   * Update a service provider (partial update)
   */
  update: async (id: number, data: UpdateServiceProviderRequest): Promise<ApiServiceProvider> => {
    const response = await api.put<ApiDataResponse<ApiServiceProvider>>(
      API_ENDPOINTS.SERVICE_PROVIDERS.UPDATE(id),
      data
    )
    return response.data
  },

  /**
   * Delete a service provider
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.SERVICE_PROVIDERS.DELETE(id))
  },
}
