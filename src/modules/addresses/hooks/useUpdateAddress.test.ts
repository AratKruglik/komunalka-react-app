import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUpdateAddress } from './useUpdateAddress'
import type { Address } from '@shared/types/entities'
import type { UpdateAddressRequest } from '../types'
import { createMockAddress } from '@/test-utils/factories'

const mockContextUpdateAddress = vi.fn()
let mockContextLoading = false
let mockContextError: string | null = null

vi.mock('@shared/contexts', () => ({
  useAddressContext: () => ({
    updateAddress: mockContextUpdateAddress,
    get isLoading() {
      return mockContextLoading
    },
    get error() {
      return mockContextError
    },
    addresses: [],
    addAddress: vi.fn(),
    deleteAddress: vi.fn(),
    setAddresses: vi.fn(),
    getPrimaryAddress: vi.fn(),
    getAddressById: vi.fn(),
  }),
}))

const mockUpdatedAddress: Address = createMockAddress({
  id: 1,
  street: 'вул. Оновлена',
  buildingNumber: '20',
  isPrimary: true,
})

const updateData: UpdateAddressRequest = {
  street: 'вул. Оновлена',
  buildingNumber: '20',
}

describe('useUpdateAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockContextLoading = false
    mockContextError = null
  })

  it('has correct initial state', () => {
    const { result } = renderHook(() => useUpdateAddress())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.isSuccess).toBe(false)
  })

  it('updates address successfully', async () => {
    mockContextUpdateAddress.mockResolvedValueOnce(mockUpdatedAddress)

    const { result } = renderHook(() => useUpdateAddress())

    let returnedAddress: Address | undefined

    await act(async () => {
      returnedAddress = await result.current.updateAddress(1, updateData)
    })

    expect(returnedAddress).toEqual(mockUpdatedAddress)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.isSuccess).toBe(true)
    expect(mockContextUpdateAddress).toHaveBeenCalledWith(1, updateData)
  })

  it('sets loading state during update', async () => {
    let resolvePromise: (value: Address) => void
    mockContextUpdateAddress.mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve })
    )

    const { result } = renderHook(() => useUpdateAddress())

    let updatePromise: Promise<Address>
    act(() => {
      updatePromise = result.current.updateAddress(1, updateData)
    })

    expect(result.current.isSuccess).toBe(false)

    await act(async () => {
      resolvePromise!(mockUpdatedAddress)
      await updatePromise
    })

    expect(result.current.isSuccess).toBe(true)
  })

  it('handles update error', async () => {
    const errorMessage = 'Address not found'
    mockContextUpdateAddress.mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useUpdateAddress())

    let thrownError: Error | undefined
    await act(async () => {
      try {
        await result.current.updateAddress(999, updateData)
      } catch (err) {
        thrownError = err as Error
      }
    })

    expect(thrownError?.message).toBe(errorMessage)
    expect(result.current.error).toBe(errorMessage)
    expect(result.current.isSuccess).toBe(false)
  })

  it('handles non-Error error objects', async () => {
    mockContextUpdateAddress.mockRejectedValueOnce('String error')

    const { result } = renderHook(() => useUpdateAddress())

    let thrownError: unknown
    await act(async () => {
      try {
        await result.current.updateAddress(1, updateData)
      } catch (err) {
        thrownError = err
      }
    })

    expect(thrownError).toBe('String error')
    expect(result.current.error).toBe('Failed to update address')
  })

  it('clears error and success on new update attempt', async () => {
    mockContextUpdateAddress
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce(mockUpdatedAddress)

    const { result } = renderHook(() => useUpdateAddress())

    await act(async () => {
      try {
        await result.current.updateAddress(1, updateData)
      } catch { /* expected */ }
    })

    expect(result.current.error).toBe('First error')

    await act(async () => {
      await result.current.updateAddress(1, updateData)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.isSuccess).toBe(true)
  })

  it('reset clears error and success states', async () => {
    mockContextUpdateAddress.mockResolvedValueOnce(mockUpdatedAddress)

    const { result } = renderHook(() => useUpdateAddress())

    await act(async () => {
      await result.current.updateAddress(1, updateData)
    })

    expect(result.current.isSuccess).toBe(true)

    act(() => {
      result.current.reset()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.isSuccess).toBe(false)
  })

  it('reset clears error state after failure', async () => {
    mockContextUpdateAddress.mockRejectedValueOnce(new Error('Error'))

    const { result } = renderHook(() => useUpdateAddress())

    await act(async () => {
      try {
        await result.current.updateAddress(1, updateData)
      } catch { /* expected */ }
    })

    expect(result.current.error).toBe('Error')

    act(() => {
      result.current.reset()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.isSuccess).toBe(false)
  })

  it('returns stable function references', async () => {
    const { result, rerender } = renderHook(() => useUpdateAddress())

    const updateAddress1 = result.current.updateAddress
    const reset1 = result.current.reset

    rerender()

    expect(result.current.updateAddress).toBe(updateAddress1)
    expect(result.current.reset).toBe(reset1)
  })

  it('handles partial updates', async () => {
    const partialUpdate: UpdateAddressRequest = { city: 'Lviv' }
    const partialUpdatedAddress = { ...mockUpdatedAddress, city: 'Lviv' }
    mockContextUpdateAddress.mockResolvedValueOnce(partialUpdatedAddress)

    const { result } = renderHook(() => useUpdateAddress())

    let returnedAddress: Address | undefined

    await act(async () => {
      returnedAddress = await result.current.updateAddress(1, partialUpdate)
    })

    expect(returnedAddress).toEqual(partialUpdatedAddress)
    expect(mockContextUpdateAddress).toHaveBeenCalledWith(1, partialUpdate)
  })

  it('can update different addresses sequentially', async () => {
    const address1 = { ...mockUpdatedAddress, id: 1 }
    const address2 = { ...mockUpdatedAddress, id: 2 }

    mockContextUpdateAddress
      .mockResolvedValueOnce(address1)
      .mockResolvedValueOnce(address2)

    const { result } = renderHook(() => useUpdateAddress())

    await act(async () => {
      await result.current.updateAddress(1, updateData)
    })

    await act(async () => {
      await result.current.updateAddress(2, updateData)
    })

    expect(mockContextUpdateAddress).toHaveBeenCalledTimes(2)
    expect(mockContextUpdateAddress).toHaveBeenNthCalledWith(1, 1, updateData)
    expect(mockContextUpdateAddress).toHaveBeenNthCalledWith(2, 2, updateData)
  })
})
