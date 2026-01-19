import { api, apiRequest } from '@shared/api/apiClient'
import { API_CONFIG } from '@shared/api/config'
import { API_ENDPOINTS } from '@shared/constants'
import type { Reading } from '@shared/types/entities'
import type {
  ReadingResponse,
  BatchReadingItem,
  ReadingsByAddressParams,
  ReadingPhotoType,
} from '../types'

/**
 * Service for managing meter readings
 * Provides operations for reading management
 */
export const readingService = {
  /**
   * Get readings for a specific address
   * @param addressId - Address ID
   * @param params - Optional date range parameters
   * @returns List of readings for the address
   */
  getByAddress: async (
    addressId: number,
    params?: ReadingsByAddressParams
  ): Promise<Reading[]> => {
    const queryParams = new URLSearchParams()

    if (params?.from) queryParams.append('from', params.from)
    if (params?.to) queryParams.append('to', params.to)

    const queryString = queryParams.toString()
    const baseUrl = API_ENDPOINTS.READINGS.BY_ADDRESS(addressId)
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl

    return api.get<Reading[]>(url)
  },

  /**
   * Get a specific reading by ID
   * @param id - Reading ID
   * @returns Reading data
   */
  getById: async (id: number): Promise<ReadingResponse> => {
    return api.get<ReadingResponse>(API_ENDPOINTS.READINGS.GET(id))
  },

  /**
   * Create multiple readings in a batch with optional photos
   * @param addressId - Address ID
   * @param readings - Array of readings to create
   * @param photos - Map of meterId to photo File
   * @returns Created readings
   */
  createBatch: async (
    addressId: number,
    readings: BatchReadingItem[],
    photos?: Map<number, File>
  ): Promise<Reading[]> => {
    const formData = new FormData()

    // Add address ID
    formData.append('AddressId', addressId.toString())

    // Add readings as JSON string
    const readingsJson = JSON.stringify(readings)
    formData.append('ReadingsJson', readingsJson)

    // Add photos if provided
    // Photos are named as photo_<meterId>.jpg for the backend to match
    if (photos && photos.size > 0) {
      photos.forEach((file, meterId) => {
        formData.append('Photos', file, `photo_${meterId}.jpg`)
      })
    }

    return apiRequest<Reading[]>({
      method: 'POST',
      url: API_ENDPOINTS.READINGS.BATCH_CREATE,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * Delete a reading
   * @param id - Reading ID
   * @returns void
   */
  delete: async (id: number): Promise<void> => {
    return api.delete<void>(API_ENDPOINTS.READINGS.DELETE(id))
  },

  /**
   * Get photo URL for a reading
   * @param readingId - Reading ID
   * @param type - Photo type (optimized or thumbnail)
   * @returns Full URL to the photo
   */
  getPhotoUrl: (readingId: number, type: ReadingPhotoType = 'optimized'): string => {
    const endpoint = type === 'thumbnail'
      ? API_ENDPOINTS.READINGS.PHOTO_THUMBNAIL(readingId)
      : API_ENDPOINTS.READINGS.PHOTO_OPTIMIZED(readingId)

    return `${API_CONFIG.baseURL}${endpoint}`
  },
}
