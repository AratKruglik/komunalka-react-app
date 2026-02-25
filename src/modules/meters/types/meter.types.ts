import type { MeterType } from '@shared/constants/meterTypes'
import type { Meter } from '@shared/types/entities'
import type { PaginationParams } from '@shared/api/types'

/**
 * Utility type ID mapping for API communication
 * API uses numeric IDs for utility types
 */
export const UTILITY_TYPE_ID_MAP: Record<MeterType, number> = {
  gas: 1,
  electricity: 2,
  coldWater: 3,
  hotWater: 4,
  heat: 5,
}

export const UTILITY_TYPE_FROM_ID: Record<number, MeterType> = {
  1: 'gas',
  2: 'electricity',
  3: 'coldWater',
  4: 'hotWater',
  5: 'heat',
}

/**
 * Response from API for meter data
 * The base Meter interface already matches the API response exactly
 */
export type MeterResponse = Meter

/**
 * Request payload for creating a new meter
 * Uses camelCase field names matching the JSON API format
 */
export interface CreateMeterRequest {
  addressId: number
  utilityTypeId: number
  name: string
  serialNumber: string
  description?: string
  modelName?: string
  location?: string
  installationDate: string
  initialReading?: number
  serviceProviderId?: number
  notes?: string
  isActive: boolean
}

/**
 * Request payload for updating an existing meter
 * All fields are optional
 */
export type UpdateMeterRequest = Partial<Omit<CreateMeterRequest, 'addressId'>>

/**
 * Parameters for filtering and paginating meter list
 */
export interface MeterListParams extends PaginationParams {
  addressId?: number
  utilityTypeId?: number
  isActive?: boolean
}

/**
 * Helper to convert internal meter type to API utility type ID
 */
export function toUtilityTypeId(meterType: MeterType): number {
  return UTILITY_TYPE_ID_MAP[meterType]
}

/**
 * Helper to convert API utility type ID to internal meter type
 */
export function fromUtilityTypeId(utilityTypeId: number): MeterType {
  return UTILITY_TYPE_FROM_ID[utilityTypeId] ?? 'electricity'
}

/**
 * Re-export Meter type for convenience
 */
export type { Meter }
