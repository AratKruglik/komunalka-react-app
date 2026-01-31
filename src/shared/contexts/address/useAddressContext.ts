import { useContext } from 'react'
import { AddressContext } from './AddressProvider'

export function useAddressContext() {
  const context = useContext(AddressContext)
  if (context === undefined) {
    throw new Error('useAddressContext must be used within an AddressProvider')
  }
  return context
}
