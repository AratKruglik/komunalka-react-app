import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import {
  useReadingsByAddress,
  useCreateBatchReadings,
  useDeleteReading,
} from './useReadings'
import { readingService } from '../api'
import type { Reading } from '@shared/types/entities'
import type { BatchReadingItem } from '../types'

vi.mock('../api', () => ({
  readingService: {
    getByAddress: vi.fn(),
    createBatch: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockReadings: Reading[] = [
  {
    id: 1,
    meterId: 1,
    date: '2025-01-15',
    value: 1500,
    consumption: 50,
    submittedAt: '2025-01-15T10:00:00Z',
    status: 'accepted',
    note: undefined,
    photoUrl: undefined,
  },
  {
    id: 2,
    meterId: 2,
    date: '2025-01-15',
    value: 350,
    consumption: 25,
    submittedAt: '2025-01-15T10:00:00Z',
    status: 'accepted',
    note: undefined,
    photoUrl: undefined,
  },
]

const batchReadingItems: BatchReadingItem[] = [
  {
    MeterId: 1,
    Value: 1550,
    ReadingDate: '2025-01-20',
  },
  {
    MeterId: 2,
    Value: 375,
    ReadingDate: '2025-01-20',
  },
]

describe('useReadingsByAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has correct initial state with null addressId', () => {
    const { result } = renderHook(() => useReadingsByAddress(null))

    expect(result.current.readings).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(readingService.getByAddress).not.toHaveBeenCalled()
  })

  it('fetches readings when addressId is provided', async () => {
    vi.mocked(readingService.getByAddress).mockResolvedValueOnce(mockReadings)

    const { result } = renderHook(() => useReadingsByAddress(1))

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.readings).toEqual(mockReadings)
    expect(result.current.error).toBeNull()
    expect(readingService.getByAddress).toHaveBeenCalledWith(1, undefined)
  })

  it('fetches readings with date parameters', async () => {
    vi.mocked(readingService.getByAddress).mockResolvedValueOnce(mockReadings)
    const params = { from: '2025-01-01', to: '2025-01-31' }

    const { result } = renderHook(() => useReadingsByAddress(1, params))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(readingService.getByAddress).toHaveBeenCalledWith(1, params)
  })

  it('clears readings when addressId becomes null', async () => {
    vi.mocked(readingService.getByAddress).mockResolvedValueOnce(mockReadings)

    const { result, rerender } = renderHook(
      ({ addressId }) => useReadingsByAddress(addressId),
      { initialProps: { addressId: 1 as number | null } }
    )

    await waitFor(() => {
      expect(result.current.readings).toEqual(mockReadings)
    })

    rerender({ addressId: null })

    expect(result.current.readings).toEqual([])
  })

  it('refetches when addressId changes', async () => {
    const readings1 = mockReadings
    const readings2 = [{ ...mockReadings[0], id: 3, meterId: 3 }]

    vi.mocked(readingService.getByAddress)
      .mockResolvedValueOnce(readings1)
      .mockResolvedValueOnce(readings2)

    const { result, rerender } = renderHook(
      ({ addressId }) => useReadingsByAddress(addressId),
      { initialProps: { addressId: 1 as number | null } }
    )

    await waitFor(() => {
      expect(result.current.readings).toEqual(readings1)
    })

    rerender({ addressId: 2 })

    await waitFor(() => {
      expect(result.current.readings).toEqual(readings2)
    })

    expect(readingService.getByAddress).toHaveBeenCalledTimes(2)
  })

  it('handles fetch error', async () => {
    const errorMessage = 'Failed to load readings'
    vi.mocked(readingService.getByAddress).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useReadingsByAddress(1))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.readings).toEqual([])
    expect(result.current.error).toBe(errorMessage)
  })

  it('handles non-Error error objects', async () => {
    vi.mocked(readingService.getByAddress).mockRejectedValueOnce('String error')

    const { result } = renderHook(() => useReadingsByAddress(1))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Не вдалося завантажити показання')
  })

  it('refetch triggers new fetch', async () => {
    vi.mocked(readingService.getByAddress).mockResolvedValue(mockReadings)

    const { result } = renderHook(() => useReadingsByAddress(1))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(readingService.getByAddress).toHaveBeenCalledTimes(2)
    })
  })

  it('returns empty array when addressId is null on refetch', async () => {
    const { result } = renderHook(() => useReadingsByAddress(null))

    await act(async () => {
      result.current.refetch()
    })

    expect(result.current.readings).toEqual([])
    expect(readingService.getByAddress).not.toHaveBeenCalled()
  })

  it('sets loading state during fetch', async () => {
    let resolvePromise: (value: Reading[]) => void
    vi.mocked(readingService.getByAddress).mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve })
    )

    const { result } = renderHook(() => useReadingsByAddress(1))

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      resolvePromise!(mockReadings)
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })
})

describe('useCreateBatchReadings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has correct initial state', () => {
    const { result } = renderHook(() => useCreateBatchReadings())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.createdReadings).toBeNull()
  })

  it('creates batch readings successfully without photos', async () => {
    vi.mocked(readingService.createBatch).mockResolvedValueOnce(mockReadings)

    const { result } = renderHook(() => useCreateBatchReadings())

    let returnedReadings: Reading[] | undefined

    await act(async () => {
      returnedReadings = await result.current.createBatchReadings(1, batchReadingItems)
    })

    expect(returnedReadings).toEqual(mockReadings)
    expect(result.current.createdReadings).toEqual(mockReadings)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(readingService.createBatch).toHaveBeenCalledWith(1, batchReadingItems, undefined)
  })

  it('creates batch readings successfully with photos', async () => {
    vi.mocked(readingService.createBatch).mockResolvedValueOnce(mockReadings)
    const photos = new Map<number, File>([
      [1, new File([''], 'meter1.jpg', { type: 'image/jpeg' })],
      [2, new File([''], 'meter2.jpg', { type: 'image/jpeg' })],
    ])

    const { result } = renderHook(() => useCreateBatchReadings())

    await act(async () => {
      await result.current.createBatchReadings(1, batchReadingItems, photos)
    })

    expect(readingService.createBatch).toHaveBeenCalledWith(1, batchReadingItems, photos)
    expect(result.current.createdReadings).toEqual(mockReadings)
  })

  it('sets loading state during creation', async () => {
    let resolvePromise: (value: Reading[]) => void
    vi.mocked(readingService.createBatch).mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve })
    )

    const { result } = renderHook(() => useCreateBatchReadings())

    let createPromise: Promise<Reading[]>
    act(() => {
      createPromise = result.current.createBatchReadings(1, batchReadingItems)
    })

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      resolvePromise!(mockReadings)
      await createPromise
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('handles creation error', async () => {
    const errorMessage = 'Validation failed'
    vi.mocked(readingService.createBatch).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useCreateBatchReadings())

    let thrownError: Error | undefined
    await act(async () => {
      try {
        await result.current.createBatchReadings(1, batchReadingItems)
      } catch (err) {
        thrownError = err as Error
      }
    })

    expect(thrownError?.message).toBe(errorMessage)
    expect(result.current.error).toBe(errorMessage)
    expect(result.current.createdReadings).toBeNull()
  })

  it('handles non-Error error objects', async () => {
    vi.mocked(readingService.createBatch).mockRejectedValueOnce('String error')

    const { result } = renderHook(() => useCreateBatchReadings())

    let thrownError: unknown
    await act(async () => {
      try {
        await result.current.createBatchReadings(1, batchReadingItems)
      } catch (err) {
        thrownError = err
      }
    })

    expect(thrownError).toBe('String error')
    expect(result.current.error).toBe('Не вдалося зберегти показання')
  })

  it('reset clears error and createdReadings states', async () => {
    vi.mocked(readingService.createBatch).mockResolvedValueOnce(mockReadings)

    const { result } = renderHook(() => useCreateBatchReadings())

    await act(async () => {
      await result.current.createBatchReadings(1, batchReadingItems)
    })

    expect(result.current.createdReadings).toEqual(mockReadings)

    act(() => {
      result.current.reset()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.createdReadings).toBeNull()
  })

  it('clears previous state on new creation attempt', async () => {
    vi.mocked(readingService.createBatch)
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce(mockReadings)

    const { result } = renderHook(() => useCreateBatchReadings())

    await act(async () => {
      try {
        await result.current.createBatchReadings(1, batchReadingItems)
      } catch {
        // Expected to throw
      }
    })

    expect(result.current.error).toBe('First error')

    await act(async () => {
      await result.current.createBatchReadings(1, batchReadingItems)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.createdReadings).toEqual(mockReadings)
  })

  it('returns stable function references', async () => {
    const { result, rerender } = renderHook(() => useCreateBatchReadings())

    const createBatchReadings1 = result.current.createBatchReadings
    const reset1 = result.current.reset

    rerender()

    expect(result.current.createBatchReadings).toBe(createBatchReadings1)
    expect(result.current.reset).toBe(reset1)
  })
})

describe('useDeleteReading', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has correct initial state', () => {
    const { result } = renderHook(() => useDeleteReading())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.isDeleted).toBe(false)
  })

  it('deletes reading successfully', async () => {
    vi.mocked(readingService.delete).mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteReading())

    await act(async () => {
      await result.current.deleteReading(1)
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.isDeleted).toBe(true)
    expect(readingService.delete).toHaveBeenCalledWith(1)
  })

  it('sets loading state during deletion', async () => {
    let resolvePromise: () => void
    vi.mocked(readingService.delete).mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve })
    )

    const { result } = renderHook(() => useDeleteReading())

    let deletePromise: Promise<void>
    act(() => {
      deletePromise = result.current.deleteReading(1)
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isDeleted).toBe(false)

    await act(async () => {
      resolvePromise!()
      await deletePromise
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isDeleted).toBe(true)
  })

  it('handles deletion error', async () => {
    const errorMessage = 'Reading not found'
    vi.mocked(readingService.delete).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useDeleteReading())

    let thrownError: Error | undefined
    await act(async () => {
      try {
        await result.current.deleteReading(999)
      } catch (err) {
        thrownError = err as Error
      }
    })

    expect(thrownError?.message).toBe(errorMessage)
    expect(result.current.error).toBe(errorMessage)
    expect(result.current.isDeleted).toBe(false)
  })

  it('handles non-Error error objects', async () => {
    vi.mocked(readingService.delete).mockRejectedValueOnce('String error')

    const { result } = renderHook(() => useDeleteReading())

    let thrownError: unknown
    await act(async () => {
      try {
        await result.current.deleteReading(1)
      } catch (err) {
        thrownError = err
      }
    })

    expect(thrownError).toBe('String error')
    expect(result.current.error).toBe('Не вдалося видалити показання')
  })

  it('reset clears error and isDeleted states', async () => {
    vi.mocked(readingService.delete).mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteReading())

    await act(async () => {
      await result.current.deleteReading(1)
    })

    expect(result.current.isDeleted).toBe(true)

    act(() => {
      result.current.reset()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.isDeleted).toBe(false)
  })

  it('clears previous state on new deletion attempt', async () => {
    vi.mocked(readingService.delete)
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteReading())

    await act(async () => {
      try {
        await result.current.deleteReading(1)
      } catch {
        // Expected to throw
      }
    })

    expect(result.current.error).toBe('First error')

    await act(async () => {
      await result.current.deleteReading(1)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.isDeleted).toBe(true)
  })

  it('can delete different readings sequentially', async () => {
    vi.mocked(readingService.delete).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteReading())

    await act(async () => {
      await result.current.deleteReading(1)
    })

    act(() => {
      result.current.reset()
    })

    await act(async () => {
      await result.current.deleteReading(2)
    })

    expect(readingService.delete).toHaveBeenCalledTimes(2)
    expect(readingService.delete).toHaveBeenNthCalledWith(1, 1)
    expect(readingService.delete).toHaveBeenNthCalledWith(2, 2)
  })

  it('returns stable function references', async () => {
    const { result, rerender } = renderHook(() => useDeleteReading())

    const deleteReading1 = result.current.deleteReading
    const reset1 = result.current.reset

    rerender()

    expect(result.current.deleteReading).toBe(deleteReading1)
    expect(result.current.reset).toBe(reset1)
  })
})
