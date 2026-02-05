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

/**
 * Single reading item for batch creation
 * Uses PascalCase field names as expected by the API
 * Matches the JSON structure in ReadingsJson FormData field
 */
export interface BatchReadingItem {
  MeterId: number
  ReadingValue: number
  ReadingDate: string
  Notes?: string
  IsEstimated?: boolean
}

/**
 * Inner structure for the ReadingsJson field
 */
export interface BatchReadingsJsonPayload {
  addressId: number
  readings: Array<{
    meterId: number
    readingValue: number
    readingDate: string
    notes?: string
    isEstimated?: boolean
  }>
}

/**
 * Request payload for batch creating readings
 * Sent as FormData with ReadingsJson field containing JSON string
 */
export interface CreateBatchReadingsRequest {
  AddressId: number
  ReadingsJson: string
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
