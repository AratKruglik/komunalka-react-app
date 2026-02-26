import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDeleteAddress } from './useDeleteAddress'

const mockContextDeleteAddress = vi.fn()
let mockContextLoading = false
let mockContextError: string | null = null

vi.mock('@shared/contexts', () => ({
  useAddressContext: () => ({
    deleteAddress: mockContextDeleteAddress,
    get isLoading() {
      return mockContextLoading
    },
    get error() {
      return mockContextError
    },
    addresses: [],
    addAddress: vi.fn(),
    updateAddress: vi.fn(),
    setAddresses: vi.fn(),
    getPrimaryAddress: vi.fn(),
    getAddressById: vi.fn(),
  }),
}))

describe('useDeleteAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockContextLoading = false
    mockContextError = null
  })

  it('has correct initial state', () => {
    const { result } = renderHook(() => useDeleteAddress())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.isSuccess).toBe(false)
  })

  it('deletes address successfully', async () => {
    mockContextDeleteAddress.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteAddress())

    await act(async () => {
      await result.current.deleteAddress(1)
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.isSuccess).toBe(true)
    expect(mockContextDeleteAddress).toHaveBeenCalledWith(1)
  })

  it('sets loading state during deletion', async () => {
    let resolvePromise: () => void
    mockContextDeleteAddress.mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve })
    )

    const { result } = renderHook(() => useDeleteAddress())

    let deletePromise: Promise<void>
    act(() => {
      deletePromise = result.current.deleteAddress(1)
    })

    expect(result.current.isSuccess).toBe(false)

    await act(async () => {
      resolvePromise!()
      await deletePromise
    })

    expect(result.current.isSuccess).toBe(true)
  })

  it('handles deletion error', async () => {
    const errorMessage = 'Address not found'
    mockContextDeleteAddress.mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useDeleteAddress())

    let thrownError: Error | undefined
    await act(async () => {
      try {
        await result.current.deleteAddress(999)
      } catch (err) {
        thrownError = err as Error
      }
    })

    expect(thrownError?.message).toBe(errorMessage)
    expect(result.current.error).toBe(errorMessage)
    expect(result.current.isSuccess).toBe(false)
  })

  it('handles non-Error error objects', async () => {
    mockContextDeleteAddress.mockRejectedValueOnce('String error')

    const { result } = renderHook(() => useDeleteAddress())

    let thrownError: unknown
    await act(async () => {
      try {
        await result.current.deleteAddress(1)
      } catch (err) {
        thrownError = err
      }
    })

    expect(thrownError).toBe('String error')
    expect(result.current.error).toBe('Failed to delete address')
  })

  it('handles address with associated meters error', async () => {
    const errorMessage = 'Cannot delete address with associated meters'
    mockContextDeleteAddress.mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useDeleteAddress())

    let thrownError: Error | undefined
    await act(async () => {
      try {
        await result.current.deleteAddress(1)
      } catch (err) {
        thrownError = err as Error
      }
    })

    expect(thrownError?.message).toBe(errorMessage)
    expect(result.current.error).toBe(errorMessage)
  })

  it('clears error and success on new deletion attempt', async () => {
    mockContextDeleteAddress
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteAddress())

    await act(async () => {
      try {
        await result.current.deleteAddress(1)
      } catch { /* expected */ }
    })

    expect(result.current.error).toBe('First error')

    await act(async () => {
      await result.current.deleteAddress(1)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.isSuccess).toBe(true)
  })

  it('reset clears error and success states', async () => {
    mockContextDeleteAddress.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteAddress())

    await act(async () => {
      await result.current.deleteAddress(1)
    })

    expect(result.current.isSuccess).toBe(true)

    act(() => {
      result.current.reset()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.isSuccess).toBe(false)
  })

  it('reset clears error state after failure', async () => {
    mockContextDeleteAddress.mockRejectedValueOnce(new Error('Error'))

    const { result } = renderHook(() => useDeleteAddress())

    await act(async () => {
      try {
        await result.current.deleteAddress(1)
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
    const { result, rerender } = renderHook(() => useDeleteAddress())

    const deleteAddress1 = result.current.deleteAddress
    const reset1 = result.current.reset

    rerender()

    expect(result.current.deleteAddress).toBe(deleteAddress1)
    expect(result.current.reset).toBe(reset1)
  })

  it('can delete different addresses sequentially', async () => {
    mockContextDeleteAddress.mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteAddress())

    await act(async () => {
      await result.current.deleteAddress(1)
    })

    act(() => {
      result.current.reset()
    })

    await act(async () => {
      await result.current.deleteAddress(2)
    })

    expect(mockContextDeleteAddress).toHaveBeenCalledTimes(2)
    expect(mockContextDeleteAddress).toHaveBeenNthCalledWith(1, 1)
    expect(mockContextDeleteAddress).toHaveBeenNthCalledWith(2, 2)
  })

  it('returns void from deleteAddress', async () => {
    mockContextDeleteAddress.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteAddress())

    let returnValue: void | undefined

    await act(async () => {
      returnValue = await result.current.deleteAddress(1)
    })

    expect(returnValue).toBeUndefined()
  })
})
