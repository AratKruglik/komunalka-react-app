import type { Reading } from '@shared/types/entities'

/**
 * Response from API for reading data
 * Extends base Reading with additional server-provided fields
 */
export interface ReadingResponse extends Reading {
  createdAt?: string
  updatedAt?: string
}

/**
 * Single reading item for batch creation
 * Uses PascalCase field names as expected by the API
 */
export interface BatchReadingItem {
  MeterId: number
  Value: number
  ReadingDate: string
  Notes?: string
}

/**
 * Request payload for batch creating readings
 * Sent as JSON string in FormData
 */
export interface CreateBatchReadingsRequest {
  AddressId: number
  Readings: BatchReadingItem[]
}

/**
 * Parameters for querying readings by address
 */
export interface ReadingsByAddressParams {
  from?: string // ISO date string
  to?: string // ISO date string
}

/**
 * Photo type for readings
 */
export type ReadingPhotoType = 'optimized' | 'thumbnail'

/**
 * Re-export Reading type for convenience
 */
export type { Reading }
