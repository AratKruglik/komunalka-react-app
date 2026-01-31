import { useState, useCallback } from 'react'
import { useAddressContext } from '@shared/contexts'
import type { Address } from '@shared/types/entities'
import type { CreateAddressRequest } from '../types'

/**
 * Hook for creating a new address
 * Uses AddressContext to keep addresses in sync
 *
 * @returns Create address state and methods
 *
 * @example
 * ```tsx
 * function CreateAddressForm() {
 *   const { createAddress, isLoading, error, isSuccess, reset } = useCreateAddress();
 *
 *   const handleSubmit = async (data: CreateAddressRequest) => {
 *     try {
 *       await createAddress(data);
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
export function useCreateAddress() {
  const { addAddress, isLoading: contextLoading, error: contextError } = useAddressContext()
  const [isSuccess, setIsSuccess] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const createAddress = useCallback(async (data: CreateAddressRequest): Promise<Address> => {
    setIsSuccess(false)
    setLocalError(null)

    try {
      const address = await addAddress(data)
      setIsSuccess(true)
      return address
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create address'
      setLocalError(errorMessage)
      throw err
    }
  }, [addAddress])

  const reset = useCallback(() => {
    setLocalError(null)
    setIsSuccess(false)
  }, [])

  return {
    createAddress,
    isLoading: contextLoading,
    error: localError || contextError,
    isSuccess,
    reset,
  }
}
