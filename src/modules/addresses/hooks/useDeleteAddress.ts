import { useState, useCallback } from 'react'
import { useAddressContext } from '@shared/contexts'

/**
 * Hook for deleting an address
 * Uses AddressContext to keep addresses in sync
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
  const { deleteAddress: contextDeleteAddress, isLoading: contextLoading, error: contextError } = useAddressContext()
  const [isSuccess, setIsSuccess] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const deleteAddress = useCallback(async (id: number): Promise<void> => {
    setIsSuccess(false)
    setLocalError(null)

    try {
      await contextDeleteAddress(id)
      setIsSuccess(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete address'
      setLocalError(errorMessage)
      throw err
    }
  }, [contextDeleteAddress])

  const reset = useCallback(() => {
    setLocalError(null)
    setIsSuccess(false)
  }, [])

  return {
    deleteAddress,
    isLoading: contextLoading,
    error: localError || contextError,
    isSuccess,
    reset,
  }
}
