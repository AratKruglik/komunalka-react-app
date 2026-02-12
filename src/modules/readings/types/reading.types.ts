import type {
  Reading,
  ReadingPhoto,
  BatchReadingsResponse,
  ConsumptionCalculation,
} from '@shared/types/entities'

/**
 * Response from API for reading data
 * The base Reading interface already matches the API response exactly
 */
export type ReadingResponse = Reading

export interface BatchReadingItem {
  meterId: number
  readingValue: number
  readingDate: string
  notes?: string
  isEstimated?: boolean
  tariffId?: number
}

export interface BatchReadingsJsonPayload {
  addressId: number
  readings: BatchReadingItem[]
}

/**
 * Parameters for querying readings by address
 */
export interface ReadingsByAddressParams {
  from?: string
  to?: string
}

/**
 * Photo type for readings
 */
export type ReadingPhotoType = 'optimized' | 'thumbnail'

/**
 * Re-export types for convenience
 */
export type { Reading, ReadingPhoto, BatchReadingsResponse, ConsumptionCalculation }
