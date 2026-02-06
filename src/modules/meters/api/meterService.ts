import { api } from '@shared/api/apiClient'
import { API_ENDPOINTS } from '@shared/constants'
import type { Meter } from '@shared/types/entities'
import type {
  MeterResponse,
  CreateMeterRequest,
  UpdateMeterRequest,
  MeterListParams,
} from '../types'

/**
 * Service for managing meters
 * Provides CRUD operations for meter management
 */
export const meterService = {
  /**
   * Get list of all meters
   * @param params - Optional pagination and filtering parameters
   * @returns List of meters
   */
  list: async (params?: MeterListParams): Promise<Meter[]> => {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.perPage) queryParams.append('perPage', params.perPage.toString())
    if (params?.addressId) queryParams.append('addressId', params.addressId.toString())
    if (params?.utilityTypeId) queryParams.append('utilityTypeId', params.utilityTypeId.toString())
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())

    const queryString = queryParams.toString()
    const url = queryString ? `${API_ENDPOINTS.METERS.LIST}?${queryString}` : API_ENDPOINTS.METERS.LIST

    return api.get<Meter[]>(url)
  },

  /**
   * Get meters for a specific address
   * @param addressId - Address ID
   * @returns List of meters for the address
   */
  getByAddress: async (addressId: number): Promise<Meter[]> => {
    return api.get<Meter[]>(API_ENDPOINTS.METERS.BY_ADDRESS(addressId))
  },

  /**
   * Get all active meters
   * @returns List of active meters
   */
  getActive: async (): Promise<Meter[]> => {
    return api.get<Meter[]>(API_ENDPOINTS.METERS.ACTIVE)
  },

  /**
   * Get a specific meter by ID
   * @param id - Meter ID
   * @returns Meter data
   */
  getById: async (id: number): Promise<MeterResponse> => {
    return api.get<MeterResponse>(API_ENDPOINTS.METERS.GET(id))
  },

  create: async (data: CreateMeterRequest): Promise<MeterResponse> => {
    return api.post<MeterResponse>(API_ENDPOINTS.METERS.CREATE, data)
  },

  /**
   * Update an existing meter
   * @param id - Meter ID
   * @param data - Fields to update
   * @returns Updated meter
   */
  update: async (id: number, data: UpdateMeterRequest): Promise<MeterResponse> => {
    return api.put<MeterResponse>(API_ENDPOINTS.METERS.UPDATE(id), data)
  },

  /**
   * Delete a meter
   * @param id - Meter ID
   * @returns void
   */
  delete: async (id: number): Promise<void> => {
    return api.delete<void>(API_ENDPOINTS.METERS.DELETE(id))
  },
}
