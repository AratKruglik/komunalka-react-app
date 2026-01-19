import { useState, useEffect, useCallback } from 'react'
import { addressService } from '../api'
import type { Address } from '@shared/types/entities'
import type { PaginatedResponse } from '@shared/api/types'
import type { AddressListParams } from '../types'

/**
 * Hook for fetching paginated list of addresses
 * Automatically fetches on mount and provides refetch functionality
 *
 * @returns Address list state and methods
 *
 * @example
 * ```tsx
 * function AddressList() {
 *   const { addresses, pagination, isLoading, error, fetchAddresses, refetch } = useAddresses();
 *
 *   const handleNextPage = () => {
 *     fetchAddresses({ page: pagination.current_page + 1 });
 *   };
 *
 *   return <AddressGrid addresses={addresses} onNextPage={handleNextPage} />;
 * }
 * ```
 */
export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [pagination, setPagination] = useState<PaginatedResponse<Address>['meta'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch addresses with optional parameters
   * @param params - Pagination and filtering parameters
   */
  const fetchAddresses = useCallback(async (params?: AddressListParams) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await addressService.list(params)
      setAddresses(response.data)
      setPagination(response.meta)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch addresses'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Refetch with current parameters
   */
  const refetch = useCallback(() => {
    fetchAddresses()
  }, [fetchAddresses])

  // Fetch on mount
  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  return {
    addresses,
    pagination,
    isLoading,
    error,
    fetchAddresses,
    refetch,
  }
}
