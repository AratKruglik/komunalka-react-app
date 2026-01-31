import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCreateAddress } from './useCreateAddress'
import { addressService } from '../api'
import type { Address } from '@shared/types/entities'
import type { CreateAddressRequest } from '../types'
import { createMockAddress } from '@/test-utils/factories'

vi.mock('../api', () => ({
  addressService: {
    create: vi.fn(),
  },
}))

const mockCreatedAddress: Address = createMockAddress({ id: 1, isPrimary: false })

const createData: CreateAddressRequest = {
  regionId: 9,
  city: 'Київ',
  street: 'вул. Нова',
  buildingNumber: '10',
  apartmentNumber: '5',
  zipCode: '01001',
  notes: '',
  isPrimary: false,
  addressTypeId: 1,
}

describe('useCreateAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has correct initial state', () => {
    const { result } = renderHook(() => useCreateAddress())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.isSuccess).toBe(false)
  })

  it('creates address successfully', async () => {
    vi.mocked(addressService.create).mockResolvedValueOnce(mockCreatedAddress)

    const { result } = renderHook(() => useCreateAddress())

    let returnedAddress: Address | undefined

    await act(async () => {
      returnedAddress = await result.current.createAddress(createData)
    })

    expect(returnedAddress).toEqual(mockCreatedAddress)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.isSuccess).toBe(true)
    expect(addressService.create).toHaveBeenCalledWith(createData)
  })

  it('sets loading state during creation', async () => {
    let resolvePromise: (value: Address) => void
    vi.mocked(addressService.create).mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve })
    )

    const { result } = renderHook(() => useCreateAddress())

    let createPromise: Promise<Address>
    act(() => {
      createPromise = result.current.createAddress(createData)
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isSuccess).toBe(false)

    await act(async () => {
      resolvePromise!(mockCreatedAddress)
      await createPromise
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isSuccess).toBe(true)
  })

  it('handles creation error', async () => {
    const errorMessage = 'Validation failed'
    vi.mocked(addressService.create).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useCreateAddress())

    let thrownError: Error | undefined
    await act(async () => {
      try {
        await result.current.createAddress(createData)
      } catch (err) {
        thrownError = err as Error
      }
    })

    expect(thrownError?.message).toBe(errorMessage)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(errorMessage)
    expect(result.current.isSuccess).toBe(false)
  })

  it('handles non-Error error objects', async () => {
    vi.mocked(addressService.create).mockRejectedValueOnce('String error')

    const { result } = renderHook(() => useCreateAddress())

    let thrownError: unknown
    await act(async () => {
      try {
        await result.current.createAddress(createData)
      } catch (err) {
        thrownError = err
      }
    })

    expect(thrownError).toBe('String error')
    expect(result.current.error).toBe('Failed to create address')
  })

  it('clears error and success on new creation attempt', async () => {
    vi.mocked(addressService.create)
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce(mockCreatedAddress)

    const { result } = renderHook(() => useCreateAddress())

    await act(async () => {
      try {
        await result.current.createAddress(createData)
      } catch {
        // Expected to throw
      }
    })

    expect(result.current.error).toBe('First error')

    await act(async () => {
      await result.current.createAddress(createData)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.isSuccess).toBe(true)
  })

  it('reset clears error and success states', async () => {
    vi.mocked(addressService.create).mockResolvedValueOnce(mockCreatedAddress)

    const { result } = renderHook(() => useCreateAddress())

    await act(async () => {
      await result.current.createAddress(createData)
    })

    expect(result.current.isSuccess).toBe(true)

    act(() => {
      result.current.reset()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.isSuccess).toBe(false)
  })

  it('reset clears error state after failure', async () => {
    vi.mocked(addressService.create).mockRejectedValueOnce(new Error('Error'))

    const { result } = renderHook(() => useCreateAddress())

    await act(async () => {
      try {
        await result.current.createAddress(createData)
      } catch {
        // Expected to throw
      }
    })

    expect(result.current.error).toBe('Error')

    act(() => {
      result.current.reset()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.isSuccess).toBe(false)
  })

  it('returns stable function references', async () => {
    const { result, rerender } = renderHook(() => useCreateAddress())

    const createAddress1 = result.current.createAddress
    const reset1 = result.current.reset

    rerender()

    expect(result.current.createAddress).toBe(createAddress1)
    expect(result.current.reset).toBe(reset1)
  })

  it('can be called multiple times', async () => {
    const address1 = { ...mockCreatedAddress, id: 1 }
    const address2 = { ...mockCreatedAddress, id: 2 }

    vi.mocked(addressService.create)
      .mockResolvedValueOnce(address1)
      .mockResolvedValueOnce(address2)

    const { result } = renderHook(() => useCreateAddress())

    let returned1: Address | undefined
    let returned2: Address | undefined

    await act(async () => {
      returned1 = await result.current.createAddress(createData)
    })

    await act(async () => {
      returned2 = await result.current.createAddress(createData)
    })

    expect(returned1).toEqual(address1)
    expect(returned2).toEqual(address2)
    expect(addressService.create).toHaveBeenCalledTimes(2)
  })
})
