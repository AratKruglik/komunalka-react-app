import { api } from '@shared/api/apiClient'
import { API_ENDPOINTS } from '@shared/constants'
import type { Address } from '@shared/types/entities'
import type { PaginatedResponse } from '@shared/api/types'
import type {
  CreateAddressRequest,
  UpdateAddressRequest,
  AddressListParams,
} from '../types'

/**
 * Service for managing addresses
 * Provides CRUD operations for address management
 */
export const addressService = {
  /**
   * Get paginated list of addresses
   * @param params - Optional pagination and filtering parameters
   * @returns Paginated list of addresses
   */
  list: async (params?: AddressListParams): Promise<PaginatedResponse<Address>> => {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.perPage) queryParams.append('perPage', params.perPage.toString())
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.desc !== undefined) queryParams.append('desc', params.desc.toString())
    if (params?.city) queryParams.append('city', params.city)
    if (params?.regionId) queryParams.append('regionId', params.regionId.toString())
    if (params?.isPrimary !== undefined) queryParams.append('isPrimary', params.isPrimary.toString())

    const queryString = queryParams.toString()
    const url = queryString ? `${API_ENDPOINTS.ADDRESS.LIST}?${queryString}` : API_ENDPOINTS.ADDRESS.LIST

    return api.get<PaginatedResponse<Address>>(url)
  },

  /**
   * Get a specific address by ID
   * @param id - Address ID
   * @returns Address data
   */
  getById: async (id: number): Promise<Address> => {
    return api.get<Address>(API_ENDPOINTS.ADDRESS.GET(id))
  },

  /**
   * Create a new address
   * @param data - Address creation data
   * @returns Created address
   */
  create: async (data: CreateAddressRequest): Promise<Address> => {
    return api.post<Address>(API_ENDPOINTS.ADDRESS.CREATE, data)
  },

  /**
   * Update an existing address
   * @param id - Address ID
   * @param data - Fields to update
   * @returns Updated address
   */
  update: async (id: number, data: UpdateAddressRequest): Promise<Address> => {
    return api.put<Address>(API_ENDPOINTS.ADDRESS.UPDATE(id), data)
  },

  /**
   * Delete an address
   * @param id - Address ID
   * @returns void
   */
  delete: async (id: number): Promise<void> => {
    return api.delete<void>(API_ENDPOINTS.ADDRESS.DELETE(id))
  },

  /**
   * Set an address as primary
   * @param id - Address ID
   * @returns Updated address with isPrimary set to true
   */
  setPrimary: async (id: number): Promise<Address> => {
    return api.put<Address>(API_ENDPOINTS.ADDRESS.UPDATE(id), { isPrimary: true })
  },
}
