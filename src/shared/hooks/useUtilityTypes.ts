import { useState, useEffect, useCallback } from 'react'
import { utilityTypeService } from '../api/utilityTypeService'
import type { ApiUtilityType } from '../types/api'

let cachedData: ApiUtilityType[] | null = null
let fetchPromise: Promise<ApiUtilityType[]> | null = null

/**
 * Hook for fetching utility types with in-memory caching
 * Data is cached after first successful fetch and reused across components
 *
 * @param skipCache - Force fresh fetch, ignoring cache
 * @returns Utility types list state and methods
 */
export function useUtilityTypes(skipCache = false) {
  const [utilityTypes, setUtilityTypes] = useState<ApiUtilityType[]>(cachedData ?? [])
  const [isLoading, setIsLoading] = useState(!cachedData)
  const [error, setError] = useState<string | null>(null)

  const fetchUtilityTypes = useCallback(async (forceRefetch = false) => {
    if (!forceRefetch && cachedData) {
      setUtilityTypes(cachedData)
      setIsLoading(false)
      return
    }

    if (!forceRefetch && fetchPromise) {
      try {
        const data = await fetchPromise
        setUtilityTypes(data)
        setIsLoading(false)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch utility types'
        setError(errorMessage)
        setIsLoading(false)
      }
      return
    }

    setIsLoading(true)
    setError(null)

    fetchPromise = utilityTypeService.getAll()

    try {
      const data = await fetchPromise
      cachedData = data
      setUtilityTypes(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch utility types'
      setError(errorMessage)
      fetchPromise = null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    cachedData = null
    fetchPromise = null
    fetchUtilityTypes(true)
  }, [fetchUtilityTypes])

  useEffect(() => {
    fetchUtilityTypes(skipCache)
  }, [fetchUtilityTypes, skipCache])

  return {
    utilityTypes,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Get utility type by ID from cached data
 * Returns undefined if not found or cache is empty
 */
export function getUtilityTypeById(id: number): ApiUtilityType | undefined {
  return cachedData?.find((ut) => ut.id === id)
}

/**
 * Clear utility types cache
 * Useful for testing or forced refresh scenarios
 */
export function clearUtilityTypesCache(): void {
  cachedData = null
  fetchPromise = null
}
