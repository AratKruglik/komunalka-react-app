import { api } from './apiClient'
import { API_ENDPOINTS } from '../constants/endpoints'
import type {
  ApiServiceProvider,
  ApiTariff,
  ApiDataResponse,
  ApiListResponse,
  CreateServiceProviderRequest,
  UpdateServiceProviderRequest,
  CreateTariffRequest,
  UpdateTariffRequest,
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

  getTariffs: async (providerId: number): Promise<ApiTariff[]> => {
    const response = await api.get<ApiListResponse<ApiTariff>>(
      API_ENDPOINTS.SERVICE_PROVIDERS.TARIFFS(providerId)
    )
    return response.data
  },

  createTariff: async (providerId: number, data: CreateTariffRequest): Promise<ApiTariff> => {
    const response = await api.post<ApiDataResponse<ApiTariff>>(
      API_ENDPOINTS.SERVICE_PROVIDERS.TARIFFS(providerId),
      data
    )
    return response.data
  },

  updateTariff: async (
    providerId: number,
    tariffId: number,
    data: UpdateTariffRequest,
  ): Promise<ApiTariff> => {
    const response = await api.put<ApiDataResponse<ApiTariff>>(
      API_ENDPOINTS.SERVICE_PROVIDERS.TARIFF(providerId, tariffId),
      data
    )
    return response.data
  },

  deleteTariff: async (providerId: number, tariffId: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.SERVICE_PROVIDERS.TARIFF(providerId, tariffId))
  },
}
