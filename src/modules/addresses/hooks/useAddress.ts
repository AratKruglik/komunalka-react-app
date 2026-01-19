import { useState, useCallback, useEffect } from 'react'
import { addressService } from '../api'
import type { Address } from '@shared/types/entities'

/**
 * Hook for fetching a single address by ID
 * Only fetches when ID is provided
 *
 * @param id - Optional address ID to fetch
 * @returns Address state and fetch method
 *
 * @example
 * ```tsx
 * function AddressDetails({ addressId }: { addressId?: number }) {
 *   const { address, isLoading, error, fetchAddress } = useAddress(addressId);
 *
 *   if (!address) return <div>No address selected</div>;
 *   return <AddressCard address={address} />;
 * }
 * ```
 */
export function useAddress(id?: number) {
  const [address, setAddress] = useState<Address | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch address by ID
   * @param addressId - Address ID to fetch
   */
  const fetchAddress = useCallback(async (addressId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await addressService.getById(addressId)
      setAddress(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch address'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch when id changes
  useEffect(() => {
    if (id) {
      fetchAddress(id)
    }
  }, [id, fetchAddress])

  return {
    address,
    isLoading,
    error,
    fetchAddress,
  }
}
