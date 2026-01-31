import { api } from './apiClient'
import { API_ENDPOINTS } from '../constants/endpoints'
import type { Region, AddressType } from '../types/entities'

/**
 * Service for fetching reference data (dictionaries)
 * Provides read-only access to regions and address types
 */
export const referenceService = {
  /**
   * Get list of all regions
   * @returns Array of regions
   */
  getRegions: async (): Promise<Region[]> => {
    return api.get<Region[]>(API_ENDPOINTS.REGION.LIST)
  },

  /**
   * Get a specific region by ID
   * @param id - Region ID
   * @returns Region data
   */
  getRegionById: async (id: number): Promise<Region> => {
    return api.get<Region>(API_ENDPOINTS.REGION.GET(id))
  },

  /**
   * Get list of all address types
   * @returns Array of address types
   */
  getAddressTypes: async (): Promise<AddressType[]> => {
    return api.get<AddressType[]>(API_ENDPOINTS.ADDRESS_TYPE.LIST)
  },

  /**
   * Get a specific address type by ID
   * @param id - Address type ID
   * @returns Address type data
   */
  getAddressTypeById: async (id: number): Promise<AddressType> => {
    return api.get<AddressType>(API_ENDPOINTS.ADDRESS_TYPE.GET(id))
  },
}
