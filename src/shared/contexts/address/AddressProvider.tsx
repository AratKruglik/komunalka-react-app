import { createContext, useReducer, useCallback, type ReactNode } from 'react'
import { addressService } from '@modules/addresses/api'
import { addressReducer, initialState } from './reducer'
import { AddressActionType } from './types'
import type { AddressContextValue } from './types'
import type { Address } from '@shared/types/entities'
import type { CreateAddressRequest, UpdateAddressRequest } from '@modules/addresses/types'

// eslint-disable-next-line react-refresh/only-export-components
export const AddressContext = createContext<AddressContextValue | undefined>(undefined)

export function AddressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(addressReducer, initialState)

  const setAddresses = useCallback((addresses: Address[]) => {
    dispatch({ type: AddressActionType.SET_ADDRESSES, payload: addresses })
  }, [])

  const addAddress = useCallback(async (data: CreateAddressRequest): Promise<Address> => {
    dispatch({ type: AddressActionType.SET_LOADING, payload: true })
    dispatch({ type: AddressActionType.CLEAR_ERROR })

    try {
      const newAddress = await addressService.create(data)
      dispatch({ type: AddressActionType.ADD_ADDRESS, payload: newAddress })
      return newAddress
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create address'
      dispatch({ type: AddressActionType.SET_ERROR, payload: errorMessage })
      throw error
    }
  }, [])

  const updateAddress = useCallback(async (id: number, data: UpdateAddressRequest): Promise<Address> => {
    dispatch({ type: AddressActionType.SET_LOADING, payload: true })
    dispatch({ type: AddressActionType.CLEAR_ERROR })

    try {
      const updatedAddress = await addressService.update(id, data)
      dispatch({ type: AddressActionType.UPDATE_ADDRESS, payload: updatedAddress })
      return updatedAddress
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update address'
      dispatch({ type: AddressActionType.SET_ERROR, payload: errorMessage })
      throw error
    }
  }, [])

  const deleteAddress = useCallback(async (id: number): Promise<void> => {
    dispatch({ type: AddressActionType.SET_LOADING, payload: true })
    dispatch({ type: AddressActionType.CLEAR_ERROR })

    try {
      await addressService.delete(id)
      dispatch({ type: AddressActionType.DELETE_ADDRESS, payload: id })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete address'
      dispatch({ type: AddressActionType.SET_ERROR, payload: errorMessage })
      throw error
    }
  }, [])

  const getPrimaryAddress = useCallback((): Address | undefined => {
    return state.addresses.find((addr) => addr.isPrimary)
  }, [state.addresses])

  const getAddressById = useCallback((id: number): Address | undefined => {
    return state.addresses.find((addr) => addr.id === id)
  }, [state.addresses])

  const value: AddressContextValue = {
    addresses: state.addresses,
    isLoading: state.isLoading,
    error: state.error,
    addAddress,
    updateAddress,
    deleteAddress,
    setAddresses,
    getPrimaryAddress,
    getAddressById,
  }

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
}
