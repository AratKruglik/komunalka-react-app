import { describe, it, expect } from 'vitest'
import { addressReducer, initialState } from './reducer'
import { AddressActionType } from './types'
import type { Address } from '@shared/types/entities'

const createMockAddress = (overrides: Partial<Address> = {}): Address => ({
  id: 1,
  city: 'Kyiv',
  street: 'Main St',
  buildingNumber: '1',
  apartmentNumber: '1',
  zipCode: '01001',
  notes: '',
  isPrimary: false,
  region: {
    id: 1,
    name: 'Kyiv Oblast',
  },
  addressType: {
    id: 1,
    name: 'Apartment',
    description: 'Apartment',
    icon: 'apartment',
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  ...overrides,
})

describe('addressReducer', () => {
  describe('SET_ADDRESSES', () => {
    it('should set addresses', () => {
      const addresses = [createMockAddress({ id: 1 }), createMockAddress({ id: 2 })]

      const result = addressReducer(initialState, {
        type: AddressActionType.SET_ADDRESSES,
        payload: addresses,
      })

      expect(result.addresses).toEqual(addresses)
      expect(result.isLoading).toBe(false)
      expect(result.error).toBeNull()
    })
  })

  describe('ADD_ADDRESS', () => {
    it('should add a new address', () => {
      const existingAddress = createMockAddress({ id: 1 })
      const newAddress = createMockAddress({ id: 2 })

      const state = { ...initialState, addresses: [existingAddress] }
      const result = addressReducer(state, {
        type: AddressActionType.ADD_ADDRESS,
        payload: newAddress,
      })

      expect(result.addresses).toHaveLength(2)
      expect(result.addresses[1]).toEqual(newAddress)
    })

    it('should reset isPrimary on other addresses when adding primary', () => {
      const existingAddress = createMockAddress({ id: 1, isPrimary: true })
      const newPrimaryAddress = createMockAddress({ id: 2, isPrimary: true })

      const state = { ...initialState, addresses: [existingAddress] }
      const result = addressReducer(state, {
        type: AddressActionType.ADD_ADDRESS,
        payload: newPrimaryAddress,
      })

      expect(result.addresses[0].isPrimary).toBe(false)
      expect(result.addresses[1].isPrimary).toBe(true)
    })
  })

  describe('UPDATE_ADDRESS', () => {
    it('should update an existing address', () => {
      const address = createMockAddress({ id: 1, city: 'Kyiv' })
      const updatedAddress = createMockAddress({ id: 1, city: 'Lviv' })

      const state = { ...initialState, addresses: [address] }
      const result = addressReducer(state, {
        type: AddressActionType.UPDATE_ADDRESS,
        payload: updatedAddress,
      })

      expect(result.addresses[0].city).toBe('Lviv')
    })

    it('should reset isPrimary on other addresses when updating to primary', () => {
      const address1 = createMockAddress({ id: 1, isPrimary: true })
      const address2 = createMockAddress({ id: 2, isPrimary: false })
      const updatedAddress2 = createMockAddress({ id: 2, isPrimary: true })

      const state = { ...initialState, addresses: [address1, address2] }
      const result = addressReducer(state, {
        type: AddressActionType.UPDATE_ADDRESS,
        payload: updatedAddress2,
      })

      expect(result.addresses[0].isPrimary).toBe(false)
      expect(result.addresses[1].isPrimary).toBe(true)
    })
  })

  describe('DELETE_ADDRESS', () => {
    it('should delete an address by id', () => {
      const address1 = createMockAddress({ id: 1 })
      const address2 = createMockAddress({ id: 2 })

      const state = { ...initialState, addresses: [address1, address2] }
      const result = addressReducer(state, {
        type: AddressActionType.DELETE_ADDRESS,
        payload: 1,
      })

      expect(result.addresses).toHaveLength(1)
      expect(result.addresses[0].id).toBe(2)
    })
  })

  describe('SET_LOADING', () => {
    it('should set loading state', () => {
      const result = addressReducer(initialState, {
        type: AddressActionType.SET_LOADING,
        payload: true,
      })

      expect(result.isLoading).toBe(true)
    })
  })

  describe('SET_ERROR', () => {
    it('should set error and stop loading', () => {
      const state = { ...initialState, isLoading: true }
      const result = addressReducer(state, {
        type: AddressActionType.SET_ERROR,
        payload: 'Something went wrong',
      })

      expect(result.error).toBe('Something went wrong')
      expect(result.isLoading).toBe(false)
    })
  })

  describe('CLEAR_ERROR', () => {
    it('should clear error', () => {
      const state = { ...initialState, error: 'Some error' }
      const result = addressReducer(state, {
        type: AddressActionType.CLEAR_ERROR,
      })

      expect(result.error).toBeNull()
    })
  })
})
