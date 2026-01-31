import { useState, useCallback } from 'react'
import { useAddressContext } from '@shared/contexts'
import type { Address } from '@shared/types/entities'
import type { UpdateAddressRequest } from '../types'

/**
 * Hook for updating an existing address
 * Uses AddressContext to keep addresses in sync
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
  const { updateAddress: contextUpdateAddress, isLoading: contextLoading, error: contextError } = useAddressContext()
  const [isSuccess, setIsSuccess] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const updateAddress = useCallback(async (id: number, data: UpdateAddressRequest): Promise<Address> => {
    setIsSuccess(false)
    setLocalError(null)

    try {
      const address = await contextUpdateAddress(id, data)
      setIsSuccess(true)
      return address
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update address'
      setLocalError(errorMessage)
      throw err
    }
  }, [contextUpdateAddress])

  const reset = useCallback(() => {
    setLocalError(null)
    setIsSuccess(false)
  }, [])

  return {
    updateAddress,
    isLoading: contextLoading,
    error: localError || contextError,
    isSuccess,
    reset,
  }
}
