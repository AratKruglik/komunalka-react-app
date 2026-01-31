import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAddresses } from './useAddresses'
import { addressService } from '../api'
import type { Address } from '@shared/types/entities'
import type { PaginatedResponse } from '@shared/api/types'
import { createMockAddress, createMockRegion } from '@/test-utils/factories'

vi.mock('../api', () => ({
  addressService: {
    list: vi.fn(),
  },
}))

const mockAddresses: Address[] = [
  createMockAddress({ id: 1, isPrimary: true }),
  createMockAddress({
    id: 2,
    street: 'вул. Франка',
    city: 'Львів',
    regionId: 12,
    region: createMockRegion({ id: 12, name: 'Львівська область' }),
    isPrimary: false,
  }),
]

const mockPaginatedResponse: PaginatedResponse<Address> = {
  data: mockAddresses,
  links: {
    first: '/address?page=1',
    last: '/address?page=5',
    prev: null,
    next: '/address?page=2',
  },
  meta: {
    current_page: 1,
    from: 1,
    last_page: 5,
    path: '/address',
    per_page: 10,
    to: 2,
    total: 50,
  },
}

describe('useAddresses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has correct initial state before fetch completes', () => {
    vi.mocked(addressService.list).mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useAddresses())

    expect(result.current.addresses).toEqual([])
    expect(result.current.pagination).toBeNull()
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('fetches addresses on mount', async () => {
    vi.mocked(addressService.list).mockResolvedValueOnce(mockPaginatedResponse)

    const { result } = renderHook(() => useAddresses())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.addresses).toEqual(mockAddresses)
    expect(result.current.pagination).toEqual(mockPaginatedResponse.meta)
    expect(result.current.error).toBeNull()
    expect(addressService.list).toHaveBeenCalledOnce()
  })

  it('handles fetch error', async () => {
    const errorMessage = 'Network error'
    vi.mocked(addressService.list).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useAddresses())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.addresses).toEqual([])
    expect(result.current.error).toBe(errorMessage)
    expect(result.current.pagination).toBeNull()
  })

  it('handles non-Error error objects', async () => {
    vi.mocked(addressService.list).mockRejectedValueOnce('String error')

    const { result } = renderHook(() => useAddresses())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch addresses')
  })

  it('fetches with pagination parameters', async () => {
    vi.mocked(addressService.list).mockResolvedValueOnce(mockPaginatedResponse)

    const { result } = renderHook(() => useAddresses())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    vi.mocked(addressService.list).mockResolvedValueOnce({
      ...mockPaginatedResponse,
      meta: { ...mockPaginatedResponse.meta, current_page: 2 },
    })

    await act(async () => {
      await result.current.fetchAddresses({ page: 2, perPage: 20 })
    })

    expect(addressService.list).toHaveBeenLastCalledWith({ page: 2, perPage: 20 })
  })

  it('clears error on new fetch', async () => {
    vi.mocked(addressService.list).mockRejectedValueOnce(new Error('First error'))

    const { result } = renderHook(() => useAddresses())

    await waitFor(() => {
      expect(result.current.error).toBe('First error')
    })

    vi.mocked(addressService.list).mockResolvedValueOnce(mockPaginatedResponse)

    await act(async () => {
      await result.current.fetchAddresses()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.addresses).toEqual(mockAddresses)
  })

  it('refetch calls fetchAddresses without parameters', async () => {
    vi.mocked(addressService.list).mockResolvedValue(mockPaginatedResponse)

    const { result } = renderHook(() => useAddresses())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(addressService.list).toHaveBeenCalledTimes(2)
    })
  })

  it('sets loading state during fetch', async () => {
    let resolvePromise: (value: PaginatedResponse<Address>) => void
    vi.mocked(addressService.list).mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve })
    )

    const { result } = renderHook(() => useAddresses())

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      resolvePromise!(mockPaginatedResponse)
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('returns stable function references', async () => {
    vi.mocked(addressService.list).mockResolvedValue(mockPaginatedResponse)

    const { result, rerender } = renderHook(() => useAddresses())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const fetchAddresses1 = result.current.fetchAddresses
    const refetch1 = result.current.refetch

    rerender()

    expect(result.current.fetchAddresses).toBe(fetchAddresses1)
    expect(result.current.refetch).toBe(refetch1)
  })
})
