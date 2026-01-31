import { useEffect, useRef, type ReactNode } from 'react'
import { useAuthContext } from '@shared/contexts/auth'
import { useAddressContext } from './useAddressContext'

interface AddressSyncProviderProps {
  children: ReactNode
}

export function AddressSyncProvider({ children }: AddressSyncProviderProps) {
  const { state: authState } = useAuthContext()
  const { setAddresses, addresses } = useAddressContext()
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!authState.isAuthenticated) {
      if (addresses.length > 0) {
        setAddresses([])
      }
      hasInitialized.current = false
      return
    }

    if (hasInitialized.current) {
      return
    }

    const userAddresses = authState.user?.addresses
    if (userAddresses && userAddresses.length > 0) {
      setAddresses(userAddresses)
      hasInitialized.current = true
    }
  }, [authState.isAuthenticated, authState.user?.addresses, setAddresses, addresses.length])

  return <>{children}</>
}
