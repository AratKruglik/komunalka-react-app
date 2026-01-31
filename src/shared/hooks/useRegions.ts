import { useState, useEffect, useCallback } from 'react'
import { referenceService } from '../api/referenceService'
import type { Region } from '../types/entities'

/**
 * Hook for fetching list of regions
 * Automatically fetches on mount and provides refetch functionality
 *
 * @returns Region list state and methods
 *
 * @example
 * ```tsx
 * function AddressForm() {
 *   const { regions, isLoading, error } = useRegions();
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ErrorMessage message={error} />;
 *
 *   return (
 *     <Select>
 *       {regions.map(region => (
 *         <Option key={region.id} value={region.id}>{region.name}</Option>
 *       ))}
 *     </Select>
 *   );
 * }
 * ```
 */
export function useRegions() {
  const [regions, setRegions] = useState<Region[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRegions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await referenceService.getRegions()
      setRegions(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch regions'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    fetchRegions()
  }, [fetchRegions])

  useEffect(() => {
    fetchRegions()
  }, [fetchRegions])

  return {
    regions,
    isLoading,
    error,
    refetch,
  }
}
