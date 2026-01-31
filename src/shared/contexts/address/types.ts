import type { Address } from '@shared/types/entities'
import type { CreateAddressRequest, UpdateAddressRequest } from '@modules/addresses/types'

export interface AddressState {
  addresses: Address[]
  isLoading: boolean
  error: string | null
}

export interface AddressContextValue {
  addresses: Address[]
  isLoading: boolean
  error: string | null

  addAddress: (data: CreateAddressRequest) => Promise<Address>
  updateAddress: (id: number, data: UpdateAddressRequest) => Promise<Address>
  deleteAddress: (id: number) => Promise<void>
  setAddresses: (addresses: Address[]) => void

  getPrimaryAddress: () => Address | undefined
  getAddressById: (id: number) => Address | undefined
}

export const AddressActionType = {
  SET_ADDRESSES: 'SET_ADDRESSES',
  ADD_ADDRESS: 'ADD_ADDRESS',
  UPDATE_ADDRESS: 'UPDATE_ADDRESS',
  DELETE_ADDRESS: 'DELETE_ADDRESS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
} as const

export type AddressActionTypeValue = (typeof AddressActionType)[keyof typeof AddressActionType]

export type AddressAction =
  | { type: typeof AddressActionType.SET_ADDRESSES; payload: Address[] }
  | { type: typeof AddressActionType.ADD_ADDRESS; payload: Address }
  | { type: typeof AddressActionType.UPDATE_ADDRESS; payload: Address }
  | { type: typeof AddressActionType.DELETE_ADDRESS; payload: number }
  | { type: typeof AddressActionType.SET_LOADING; payload: boolean }
  | { type: typeof AddressActionType.SET_ERROR; payload: string }
  | { type: typeof AddressActionType.CLEAR_ERROR }
