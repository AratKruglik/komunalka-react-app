import { api, apiRequest } from '@shared/api/apiClient'
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

  /**
   * Create a new meter with optional photo
   * @param data - Meter creation data
   * @param photo - Optional photo file
   * @returns Created meter
   */
  create: async (data: CreateMeterRequest, photo?: File): Promise<MeterResponse> => {
    const formData = new FormData()

    // Append all required fields
    formData.append('AddressId', data.AddressId.toString())
    formData.append('UtilityTypeId', data.UtilityTypeId.toString())
    formData.append('Name', data.Name)
    formData.append('SerialNumber', data.SerialNumber)
    formData.append('InstallationDate', data.InstallationDate)
    formData.append('IsActive', data.IsActive.toString())

    // Append optional fields
    if (data.ModelName) formData.append('ModelName', data.ModelName)
    if (data.Location) formData.append('Location', data.Location)
    if (data.InitialReading !== undefined) formData.append('InitialReading', data.InitialReading.toString())
    if (data.ServiceProviderId) formData.append('ServiceProviderId', data.ServiceProviderId.toString())
    if (data.Notes) formData.append('Notes', data.Notes)

    // Append photo if provided
    if (photo) {
      formData.append('photo', photo)
    }

    return apiRequest<MeterResponse>({
      method: 'POST',
      url: API_ENDPOINTS.METERS.CREATE,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
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
