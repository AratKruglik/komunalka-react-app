import { useState, useEffect, useCallback } from 'react'
import { readingService } from '../api'
import type { Reading, BatchReadingsResponse } from '@shared/types/entities'
import type { BatchReadingItem, ReadingsByAddressParams } from '../types'

/**
 * Hook for fetching readings by address ID
 * Automatically fetches on mount and when addressId changes
 *
 * @param addressId - Address ID to fetch readings for (null skips fetching)
 * @param params - Optional date range parameters
 * @returns Readings list state and methods
 */
export function useReadingsByAddress(
  addressId: number | null,
  params?: ReadingsByAddressParams
) {
  const [readings, setReadings] = useState<Reading[]>([])
  const [isLoading, setIsLoading] = useState(addressId !== null)
  const [error, setError] = useState<string | null>(null)

  const fetchReadings = useCallback(async () => {
    if (addressId === null) {
      setReadings([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await readingService.getByAddress(addressId, params)
      setReadings(Array.isArray(data) ? data : [])
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : (err as { message?: string })?.message ?? 'Не вдалося завантажити показання'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [addressId, params])

  const refetch = useCallback(() => {
    fetchReadings()
  }, [fetchReadings])

  useEffect(() => {
    fetchReadings()
  }, [fetchReadings])

  return {
    readings,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for creating batch readings
 * Returns mutation function and state
 *
 * @returns Create batch readings mutation state and methods
 */
export function useCreateBatchReadings() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdReadings, setCreatedReadings] = useState<BatchReadingsResponse | null>(null)

  const createBatchReadings = useCallback(async (
    addressId: number,
    readings: BatchReadingItem[],
    photos?: Map<number, File>
  ) => {
    setIsLoading(true)
    setError(null)
    setCreatedReadings(null)

    try {
      const result = await readingService.createBatch(addressId, readings, photos)
      setCreatedReadings(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не вдалося зберегти показання'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setCreatedReadings(null)
  }, [])

  return {
    createBatchReadings,
    isLoading,
    error,
    createdReadings,
    reset,
  }
}

/**
 * Hook for deleting a reading
 *
 * @returns Delete reading mutation state and methods
 */
export function useDeleteReading() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleted, setIsDeleted] = useState(false)

  const deleteReading = useCallback(async (id: number) => {
    setIsLoading(true)
    setError(null)
    setIsDeleted(false)

    try {
      await readingService.delete(id)
      setIsDeleted(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не вдалося видалити показання'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setIsDeleted(false)
  }, [])

  return {
    deleteReading,
    isLoading,
    error,
    isDeleted,
    reset,
  }
}
