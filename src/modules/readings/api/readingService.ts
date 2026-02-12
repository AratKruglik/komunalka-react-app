import { api, apiRequest } from '@shared/api/apiClient'
import { API_CONFIG } from '@shared/api/config'
import { API_ENDPOINTS } from '@shared/constants'
import type { Reading } from '@shared/types/entities'
import type { ApiListResponse } from '@shared/types/api'
import type {
  ReadingResponse,
  BatchReadingItem,
  BatchReadingsJsonPayload,
  ReadingsByAddressParams,
  ReadingPhotoType,
} from '../types'

export const readingService = {
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

    const response = await api.get<ApiListResponse<Reading>>(url)
    return response.data
  },

  getById: async (id: number): Promise<ReadingResponse> => {
    return api.get<ReadingResponse>(API_ENDPOINTS.READINGS.GET(id))
  },

  createBatch: async (
    addressId: number,
    readings: BatchReadingItem[],
    photos?: Map<number, File>
  ): Promise<Reading[]> => {
    const formData = new FormData()

    // Add address ID
    formData.append('AddressId', addressId.toString())

    const payload: BatchReadingsJsonPayload = { addressId, readings }
    formData.append('ReadingsJson', JSON.stringify(payload))

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

  delete: async (id: number): Promise<void> => {
    return api.delete<void>(API_ENDPOINTS.READINGS.DELETE(id))
  },

  getPhotoUrl: (readingId: number, type: ReadingPhotoType = 'optimized'): string => {
    const endpoint = type === 'thumbnail'
      ? API_ENDPOINTS.READINGS.PHOTO_THUMBNAIL(readingId)
      : API_ENDPOINTS.READINGS.PHOTO_OPTIMIZED(readingId)

    return `${API_CONFIG.baseURL}${endpoint}`
  },
}
