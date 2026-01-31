import { useState, useEffect, useCallback } from 'react'
import { referenceService } from '../api/referenceService'
import type { AddressType } from '../types/entities'

/**
 * Hook for fetching list of address types
 * Automatically fetches on mount and provides refetch functionality
 *
 * @returns Address types list state and methods
 *
 * @example
 * ```tsx
 * function AddressForm() {
 *   const { addressTypes, isLoading, error } = useAddressTypes();
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ErrorMessage message={error} />;
 *
 *   return (
 *     <Select>
 *       {addressTypes.map(type => (
 *         <Option key={type.id} value={type.id}>{type.name}</Option>
 *       ))}
 *     </Select>
 *   );
 * }
 * ```
 */
export function useAddressTypes() {
  const [addressTypes, setAddressTypes] = useState<AddressType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAddressTypes = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await referenceService.getAddressTypes()
      setAddressTypes(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch address types'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    fetchAddressTypes()
  }, [fetchAddressTypes])

  useEffect(() => {
    fetchAddressTypes()
  }, [fetchAddressTypes])

  return {
    addressTypes,
    isLoading,
    error,
    refetch,
  }
}
