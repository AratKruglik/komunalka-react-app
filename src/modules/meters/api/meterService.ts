import { api } from '@shared/api/apiClient'
import { API_ENDPOINTS } from '@shared/constants'
import type { Meter } from '@shared/types/entities'
import type { ApiListResponse } from '@shared/types/api'
import type {
  MeterResponse,
  CreateMeterRequest,
  UpdateMeterRequest,
  MeterListParams,
} from '../types'

export const meterService = {
  list: async (params?: MeterListParams): Promise<Meter[]> => {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.perPage) queryParams.append('perPage', params.perPage.toString())
    if (params?.addressId) queryParams.append('addressId', params.addressId.toString())
    if (params?.utilityTypeId) queryParams.append('utilityTypeId', params.utilityTypeId.toString())
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())

    const queryString = queryParams.toString()
    const url = queryString ? `${API_ENDPOINTS.METERS.LIST}?${queryString}` : API_ENDPOINTS.METERS.LIST

    const response = await api.get<ApiListResponse<Meter>>(url)
    return response.data
  },

  getByAddress: async (addressId: number): Promise<Meter[]> => {
    const response = await api.get<ApiListResponse<Meter>>(API_ENDPOINTS.METERS.BY_ADDRESS(addressId))
    return response.data
  },

  getActive: async (): Promise<Meter[]> => {
    const response = await api.get<ApiListResponse<Meter>>(API_ENDPOINTS.METERS.ACTIVE)
    return response.data
  },

  getById: async (id: number): Promise<MeterResponse> => {
    return api.get<MeterResponse>(API_ENDPOINTS.METERS.GET(id))
  },

  create: async (data: CreateMeterRequest): Promise<MeterResponse> => {
    return api.post<MeterResponse>(API_ENDPOINTS.METERS.CREATE, data)
  },

  update: async (id: number, data: UpdateMeterRequest): Promise<MeterResponse> => {
    return api.put<MeterResponse>(API_ENDPOINTS.METERS.UPDATE(id), data)
  },

  delete: async (id: number): Promise<void> => {
    return api.delete<void>(API_ENDPOINTS.METERS.DELETE(id))
  },
}
