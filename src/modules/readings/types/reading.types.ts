import type {
  Reading,
  ReadingPhoto,
  BatchReadingsResponse,
  ConsumptionCalculation,
} from '@shared/types/entities'

export type ReadingResponse = Reading

export interface BatchReadingItem {
  meterId: number
  readingValue: number
  readingDate: string
  notes?: string
  isEstimated?: boolean
}

export interface BatchReadingsJsonPayload {
  readings: BatchReadingItem[]
}

export interface ReadingsByAddressParams {
  from?: string
  to?: string
}

export type ReadingPhotoType = 'optimized' | 'thumbnail'

export type { Reading, ReadingPhoto, BatchReadingsResponse, ConsumptionCalculation }
