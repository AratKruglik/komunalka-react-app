import { AddressActionType } from './types'
import type { AddressState, AddressAction } from './types'

export const initialState: AddressState = {
  addresses: [],
  isLoading: false,
  error: null,
}

export function addressReducer(state: AddressState, action: AddressAction): AddressState {
  switch (action.type) {
    case AddressActionType.SET_ADDRESSES:
      return {
        ...state,
        addresses: action.payload,
        isLoading: false,
        error: null,
      }

    case AddressActionType.ADD_ADDRESS:
      return {
        ...state,
        addresses: handlePrimaryFlag([...state.addresses, action.payload], action.payload),
        isLoading: false,
        error: null,
      }

    case AddressActionType.UPDATE_ADDRESS:
      return {
        ...state,
        addresses: handlePrimaryFlag(
          state.addresses.map((addr) =>
            addr.id === action.payload.id ? action.payload : addr
          ),
          action.payload
        ),
        isLoading: false,
        error: null,
      }

    case AddressActionType.DELETE_ADDRESS:
      return {
        ...state,
        addresses: state.addresses.filter((addr) => addr.id !== action.payload),
        isLoading: false,
        error: null,
      }

    case AddressActionType.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }

    case AddressActionType.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }

    case AddressActionType.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    default:
      return state
  }
}

function handlePrimaryFlag(
  addresses: AddressState['addresses'],
  changedAddress: AddressState['addresses'][number]
): AddressState['addresses'] {
  if (!changedAddress.isPrimary) {
    return addresses
  }

  return addresses.map((addr) =>
    addr.id === changedAddress.id ? addr : { ...addr, isPrimary: false }
  )
}
