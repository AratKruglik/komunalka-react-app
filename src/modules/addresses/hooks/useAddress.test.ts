import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAddress } from './useAddress'
import { addressService } from '../api'
import type { Address } from '@shared/types/entities'
import { createMockAddress } from '@/test-utils/factories'

vi.mock('../api', () => ({
  addressService: {
    getById: vi.fn(),
  },
}))

const mockAddress: Address = createMockAddress({ id: 1 })

describe('useAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has correct initial state without id', () => {
    const { result } = renderHook(() => useAddress())

    expect(result.current.address).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(addressService.getById).not.toHaveBeenCalled()
  })

  it('has correct initial state with undefined id', () => {
    const { result } = renderHook(() => useAddress(undefined))

    expect(result.current.address).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(addressService.getById).not.toHaveBeenCalled()
  })

  it('fetches address when id is provided', async () => {
    vi.mocked(addressService.getById).mockResolvedValueOnce(mockAddress)

    const { result } = renderHook(() => useAddress(1))

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.address).toEqual(mockAddress)
    expect(result.current.error).toBeNull()
    expect(addressService.getById).toHaveBeenCalledWith(1)
  })

  it('refetches when id changes', async () => {
    const address1 = mockAddress
    const address2 = { ...mockAddress, id: 2, street: 'Another Street' }

    vi.mocked(addressService.getById)
      .mockResolvedValueOnce(address1)
      .mockResolvedValueOnce(address2)

    const { result, rerender } = renderHook(
      ({ id }) => useAddress(id),
      { initialProps: { id: 1 as number | undefined } }
    )

    await waitFor(() => {
      expect(result.current.address).toEqual(address1)
    })

    rerender({ id: 2 })

    await waitFor(() => {
      expect(result.current.address).toEqual(address2)
    })

    expect(addressService.getById).toHaveBeenCalledTimes(2)
    expect(addressService.getById).toHaveBeenNthCalledWith(1, 1)
    expect(addressService.getById).toHaveBeenNthCalledWith(2, 2)
  })

  it('does not fetch when id becomes undefined', async () => {
    vi.mocked(addressService.getById).mockResolvedValueOnce(mockAddress)

    const { result, rerender } = renderHook(
      ({ id }) => useAddress(id),
      { initialProps: { id: 1 as number | undefined } }
    )

    await waitFor(() => {
      expect(result.current.address).toEqual(mockAddress)
    })

    rerender({ id: undefined })

    expect(addressService.getById).toHaveBeenCalledTimes(1)
  })

  it('handles fetch error', async () => {
    const errorMessage = 'Address not found'
    vi.mocked(addressService.getById).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useAddress(999))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.address).toBeNull()
    expect(result.current.error).toBe(errorMessage)
  })

  it('handles non-Error error objects', async () => {
    vi.mocked(addressService.getById).mockRejectedValueOnce('String error')

    const { result } = renderHook(() => useAddress(1))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch address')
  })

  it('clears error on successful fetch', async () => {
    vi.mocked(addressService.getById)
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce(mockAddress)

    const { result, rerender } = renderHook(
      ({ id }) => useAddress(id),
      { initialProps: { id: 1 as number | undefined } }
    )

    await waitFor(() => {
      expect(result.current.error).toBe('First error')
    })

    rerender({ id: 2 })

    await waitFor(() => {
      expect(result.current.error).toBeNull()
      expect(result.current.address).toEqual(mockAddress)
    })
  })

  it('fetchAddress can be called manually', async () => {
    vi.mocked(addressService.getById).mockResolvedValue(mockAddress)

    const { result } = renderHook(() => useAddress())

    await act(async () => {
      await result.current.fetchAddress(1)
    })

    expect(result.current.address).toEqual(mockAddress)
    expect(addressService.getById).toHaveBeenCalledWith(1)
  })

  it('fetchAddress updates loading state correctly', async () => {
    let resolvePromise: (value: Address) => void
    vi.mocked(addressService.getById).mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve })
    )

    const { result } = renderHook(() => useAddress())

    expect(result.current.isLoading).toBe(false)

    let fetchPromise: Promise<void>
    act(() => {
      fetchPromise = result.current.fetchAddress(1)
    })

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      resolvePromise!(mockAddress)
      await fetchPromise
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('returns stable fetchAddress reference', async () => {
    vi.mocked(addressService.getById).mockResolvedValue(mockAddress)

    const { result, rerender } = renderHook(() => useAddress(1))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const fetchAddress1 = result.current.fetchAddress

    rerender()

    expect(result.current.fetchAddress).toBe(fetchAddress1)
  })
})
