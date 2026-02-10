import { apiRequest } from '@shared/api/apiClient'
import { API_ENDPOINTS } from '@shared/constants'
import type { ExportMeterReadingsRequest } from '../types'

export const exportService = {
  exportMeterReadings: async (params: ExportMeterReadingsRequest): Promise<Blob> => {
    return apiRequest<Blob>({
      method: 'POST',
      url: API_ENDPOINTS.EXPORT.METER_READINGS,
      data: params,
      responseType: 'blob',
    })
  },
}
