import { useState, useEffect, useCallback } from 'react'
import { meterService } from '../api'
import type { Meter } from '@shared/types/entities'
import type {
  MeterResponse,
  CreateMeterRequest,
  UpdateMeterRequest,
} from '../types'

/**
 * Hook for fetching meters by address ID
 * Automatically fetches on mount and when addressId changes
 *
 * @param addressId - Address ID to fetch meters for (null skips fetching)
 * @returns Meters list state and methods
 */
export function useMetersByAddress(addressId: number | null) {
  const [meters, setMeters] = useState<Meter[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMeters = useCallback(async () => {
    if (addressId === null) {
      setMeters([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await meterService.getByAddress(addressId)
      setMeters(Array.isArray(data) ? data : [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не вдалося завантажити лічильники'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [addressId])

  const refetch = useCallback(() => {
    fetchMeters()
  }, [fetchMeters])

  useEffect(() => {
    fetchMeters()
  }, [fetchMeters])

  return {
    meters,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching a single meter by ID
 *
 * @param meterId - Meter ID to fetch (null skips fetching)
 * @returns Meter state and methods
 */
export function useMeter(meterId: number | null) {
  const [meter, setMeter] = useState<MeterResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMeter = useCallback(async () => {
    if (meterId === null) {
      setMeter(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await meterService.getById(meterId)
      setMeter(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не вдалося завантажити лічильник'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [meterId])

  const refetch = useCallback(() => {
    fetchMeter()
  }, [fetchMeter])

  useEffect(() => {
    fetchMeter()
  }, [fetchMeter])

  return {
    meter,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for creating a new meter
 * Returns mutation function and state
 *
 * @returns Create meter mutation state and methods
 */
export function useCreateMeter() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdMeter, setCreatedMeter] = useState<MeterResponse | null>(null)

  const createMeter = useCallback(async (data: CreateMeterRequest, photo?: File) => {
    setIsLoading(true)
    setError(null)
    setCreatedMeter(null)

    try {
      const result = await meterService.create(data, photo)
      setCreatedMeter(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не вдалося створити лічильник'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setCreatedMeter(null)
  }, [])

  return {
    createMeter,
    isLoading,
    error,
    createdMeter,
    reset,
  }
}

/**
 * Hook for updating an existing meter
 *
 * @returns Update meter mutation state and methods
 */
export function useUpdateMeter() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatedMeter, setUpdatedMeter] = useState<MeterResponse | null>(null)

  const updateMeter = useCallback(async (id: number, data: UpdateMeterRequest) => {
    setIsLoading(true)
    setError(null)
    setUpdatedMeter(null)

    try {
      const result = await meterService.update(id, data)
      setUpdatedMeter(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не вдалося оновити лічильник'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setUpdatedMeter(null)
  }, [])

  return {
    updateMeter,
    isLoading,
    error,
    updatedMeter,
    reset,
  }
}

/**
 * Hook for deleting a meter
 *
 * @returns Delete meter mutation state and methods
 */
export function useDeleteMeter() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleted, setIsDeleted] = useState(false)

  const deleteMeter = useCallback(async (id: number) => {
    setIsLoading(true)
    setError(null)
    setIsDeleted(false)

    try {
      await meterService.delete(id)
      setIsDeleted(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не вдалося видалити лічильник'
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
    deleteMeter,
    isLoading,
    error,
    isDeleted,
    reset,
  }
}
