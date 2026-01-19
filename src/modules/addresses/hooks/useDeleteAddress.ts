import { useState, useCallback } from 'react'
import { addressService } from '../api'

/**
 * Hook for deleting an address
 * Provides loading, error, and success states
 *
 * @returns Delete address state and methods
 *
 * @example
 * ```tsx
 * function AddressCard({ addressId }: { addressId: number }) {
 *   const { deleteAddress, isLoading, error, isSuccess, reset } = useDeleteAddress();
 *
 *   const handleDelete = async () => {
 *     if (confirm('Are you sure?')) {
 *       try {
 *         await deleteAddress(addressId);
 *         // Success - redirect or refresh list
 *       } catch (err) {
 *         // Error is automatically set in hook
 *       }
 *     }
 *   };
 *
 *   return <button onClick={handleDelete} disabled={isLoading}>Delete</button>;
 * }
 * ```
 */
export function useDeleteAddress() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  /**
   * Delete an address
   * @param id - Address ID
   * @throws {Error} if deletion fails
   */
  const deleteAddress = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      await addressService.delete(id)
      setIsSuccess(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete address'
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
    deleteAddress,
    isLoading,
    error,
    isSuccess,
    reset,
  }
}
