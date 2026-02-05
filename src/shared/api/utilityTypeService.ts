import axios from 'axios'
import { API_CONFIG } from './config'
import { API_ENDPOINTS } from '../constants/endpoints'
import { formatApiError } from './utils'
import type { ApiUtilityType, ApiDataResponse, ApiListResponse } from '../types/api'

/**
 * Public axios client (no auth required)
 */
const publicClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Service for Utility Types (reference data)
 * These endpoints are public and don't require authentication
 */
export const utilityTypeService = {
  /**
   * Get all active utility types
   */
  getAll: async (): Promise<ApiUtilityType[]> => {
    try {
      const response = await publicClient.get<ApiListResponse<ApiUtilityType>>(
        API_ENDPOINTS.UTILITY_TYPES.LIST
      )
      return response.data.data
    } catch (error) {
      throw formatApiError(error)
    }
  },

  /**
   * Get utility type by ID
   */
  getById: async (id: number): Promise<ApiUtilityType> => {
    try {
      const response = await publicClient.get<ApiDataResponse<ApiUtilityType>>(
        API_ENDPOINTS.UTILITY_TYPES.BY_ID(id)
      )
      return response.data.data
    } catch (error) {
      throw formatApiError(error)
    }
  },
}
