import { useState, useCallback } from 'react'
import { addressService } from '../api'
import type { Address } from '@shared/types/entities'
import type { CreateAddressRequest } from '../types'

/**
 * Hook for creating a new address
 * Provides loading, error, and success states
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  /**
   * Create a new address
   * @param data - Address creation data
   * @returns Created address
   * @throws {Error} if creation fails
   */
  const createAddress = useCallback(async (data: CreateAddressRequest): Promise<Address> => {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      const address = await addressService.create(data)
      setIsSuccess(true)
      return address
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create address'
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
    createAddress,
    isLoading,
    error,
    isSuccess,
    reset,
  }
}
