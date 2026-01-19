import { useState, useCallback } from 'react'
import { addressService } from '../api'
import type { Address } from '@shared/types/entities'
import type { UpdateAddressRequest } from '../types'

/**
 * Hook for updating an existing address
 * Provides loading, error, and success states
 *
 * @returns Update address state and methods
 *
 * @example
 * ```tsx
 * function EditAddressForm({ addressId }: { addressId: number }) {
 *   const { updateAddress, isLoading, error, isSuccess, reset } = useUpdateAddress();
 *
 *   const handleSubmit = async (data: UpdateAddressRequest) => {
 *     try {
 *       await updateAddress(addressId, data);
 *       // Success - redirect or show message
 *     } catch (err) {
 *       // Error is automatically set in hook
 *     }
 *   };
 *
 *   return <AddressForm onSubmit={handleSubmit} />;
 * }
 * ```
 */
export function useUpdateAddress() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  /**
   * Update an existing address
   * @param id - Address ID
   * @param data - Fields to update
   * @returns Updated address
   * @throws {Error} if update fails
   */
  const updateAddress = useCallback(async (id: number, data: UpdateAddressRequest): Promise<Address> => {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      const address = await addressService.update(id, data)
      setIsSuccess(true)
      return address
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update address'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Reset error and success states
   */
  const reset = useCallback(() => {
    setError(null)
    setIsSuccess(false)
  }, [])

  return {
    updateAddress,
    isLoading,
    error,
    isSuccess,
    reset,
  }
}
