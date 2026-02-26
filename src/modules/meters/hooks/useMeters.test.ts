import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import {
  useMetersByAddress,
  useMeter,
  useCreateMeter,
  useUpdateMeter,
  useDeleteMeter,
} from './useMeters'
import { meterService } from '../api'
import type { Meter } from '@shared/types/entities'
import type { MeterResponse, CreateMeterRequest, UpdateMeterRequest } from '../types'

vi.mock('../api', () => ({
  meterService: {
    getByAddress: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockMeters: Meter[] = [
  {
    id: 1,
    addressId: 1,
    name: 'Electricity Meter',
    serialNumber: 'E-001',
    description: null,
    modelName: null,
    location: 'Entrance',
    installationDate: '2024-01-15T10:00:00Z',
    initialReading: null,
    notes: null,
    isActive: true,
    utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' },
    serviceProvider: { id: 1, name: 'Provider 1' },
    photoUrl: null,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    addressId: 1,
    name: 'Gas Meter',
    serialNumber: 'G-001',
    description: null,
    modelName: null,
    location: 'Kitchen',
    installationDate: '2024-01-15T10:00:00Z',
    initialReading: null,
    notes: null,
    isActive: true,
    utilityType: { id: 1, slug: 'gas', displayName: 'Газ', unit: 'м³' },
    serviceProvider: { id: 2, name: 'Provider 2' },
    photoUrl: null,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
]

const mockMeterResponse: MeterResponse = {
  id: 1,
  addressId: 1,
  name: 'Electricity Meter',
  serialNumber: 'E-001',
  description: null,
  modelName: 'Model X',
  location: 'Entrance',
  installationDate: '2024-01-15',
  initialReading: 0,
  notes: null,
  isActive: true,
  utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' },
  serviceProvider: { id: 1, name: 'Provider 1' },
  photoUrl: null,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
}

const createMeterData: CreateMeterRequest = {
  addressId: 1,
  utilityTypeId: 1,
  name: 'New Meter',
  serialNumber: 'N-001',
  installationDate: '2025-01-20',
  isActive: true,
  serviceProviderId: 1,
}

const updateMeterData: UpdateMeterRequest = {
  name: 'Updated Meter',
  location: 'New Location',
}

describe('useMetersByAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has correct initial state with null addressId', () => {
    const { result } = renderHook(() => useMetersByAddress(null))

    expect(result.current.meters).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(meterService.getByAddress).not.toHaveBeenCalled()
  })

  it('fetches meters when addressId is provided', async () => {
    vi.mocked(meterService.getByAddress).mockResolvedValueOnce(mockMeters)

    const { result } = renderHook(() => useMetersByAddress(1))

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.meters).toEqual(mockMeters)
    expect(result.current.error).toBeNull()
    expect(meterService.getByAddress).toHaveBeenCalledWith(1)
  })

  it('clears meters when addressId becomes null', async () => {
    vi.mocked(meterService.getByAddress).mockResolvedValueOnce(mockMeters)

    const { result, rerender } = renderHook(
      ({ addressId }) => useMetersByAddress(addressId),
      { initialProps: { addressId: 1 as number | null } }
    )

    await waitFor(() => {
      expect(result.current.meters).toEqual(mockMeters)
    })

    rerender({ addressId: null })

    expect(result.current.meters).toEqual([])
  })

  it('refetches when addressId changes', async () => {
    const meters1 = mockMeters
    const meters2 = [{ ...mockMeters[0], id: 3, addressId: 2 }]

    vi.mocked(meterService.getByAddress)
      .mockResolvedValueOnce(meters1)
      .mockResolvedValueOnce(meters2)

    const { result, rerender } = renderHook(
      ({ addressId }) => useMetersByAddress(addressId),
      { initialProps: { addressId: 1 as number | null } }
    )

    await waitFor(() => {
      expect(result.current.meters).toEqual(meters1)
    })

    rerender({ addressId: 2 })

    await waitFor(() => {
      expect(result.current.meters).toEqual(meters2)
    })

    expect(meterService.getByAddress).toHaveBeenCalledTimes(2)
  })

  it('handles fetch error', async () => {
    const errorMessage = 'Failed to load meters'
    vi.mocked(meterService.getByAddress).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useMetersByAddress(1))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.meters).toEqual([])
    expect(result.current.error).toBe(errorMessage)
  })

  it('handles non-Error error objects', async () => {
    vi.mocked(meterService.getByAddress).mockRejectedValueOnce('String error')

    const { result } = renderHook(() => useMetersByAddress(1))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Не вдалося завантажити лічильники')
  })

  it('refetch triggers new fetch', async () => {
    vi.mocked(meterService.getByAddress).mockResolvedValue(mockMeters)

    const { result } = renderHook(() => useMetersByAddress(1))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(meterService.getByAddress).toHaveBeenCalledTimes(2)
    })
  })
})

describe('useMeter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has correct initial state with null meterId', () => {
    const { result } = renderHook(() => useMeter(null))

    expect(result.current.meter).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(meterService.getById).not.toHaveBeenCalled()
  })

  it('fetches meter when meterId is provided', async () => {
    vi.mocked(meterService.getById).mockResolvedValueOnce(mockMeterResponse)

    const { result } = renderHook(() => useMeter(1))

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.meter).toEqual(mockMeterResponse)
    expect(result.current.error).toBeNull()
    expect(meterService.getById).toHaveBeenCalledWith(1)
  })

  it('clears meter when meterId becomes null', async () => {
    vi.mocked(meterService.getById).mockResolvedValueOnce(mockMeterResponse)

    const { result, rerender } = renderHook(
      ({ meterId }) => useMeter(meterId),
      { initialProps: { meterId: 1 as number | null } }
    )

    await waitFor(() => {
      expect(result.current.meter).toEqual(mockMeterResponse)
    })

    rerender({ meterId: null })

    expect(result.current.meter).toBeNull()
  })

  it('refetches when meterId changes', async () => {
    const meter1 = mockMeterResponse
    const meter2 = { ...mockMeterResponse, id: 2, name: 'Gas Meter' }

    vi.mocked(meterService.getById)
      .mockResolvedValueOnce(meter1)
      .mockResolvedValueOnce(meter2)

    const { result, rerender } = renderHook(
      ({ meterId }) => useMeter(meterId),
      { initialProps: { meterId: 1 as number | null } }
    )

    await waitFor(() => {
      expect(result.current.meter).toEqual(meter1)
    })

    rerender({ meterId: 2 })

    await waitFor(() => {
      expect(result.current.meter).toEqual(meter2)
    })
  })

  it('handles fetch error', async () => {
    const errorMessage = 'Meter not found'
    vi.mocked(meterService.getById).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useMeter(999))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.meter).toBeNull()
    expect(result.current.error).toBe(errorMessage)
  })

  it('handles non-Error error objects', async () => {
    vi.mocked(meterService.getById).mockRejectedValueOnce('String error')

    const { result } = renderHook(() => useMeter(1))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Не вдалося завантажити лічильник')
  })

  it('refetch triggers new fetch', async () => {
    vi.mocked(meterService.getById).mockResolvedValue(mockMeterResponse)

    const { result } = renderHook(() => useMeter(1))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(meterService.getById).toHaveBeenCalledTimes(2)
    })
  })
})

describe('useCreateMeter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has correct initial state', () => {
    const { result } = renderHook(() => useCreateMeter())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.createdMeter).toBeNull()
  })

  it('creates meter successfully', async () => {
    vi.mocked(meterService.create).mockResolvedValueOnce(mockMeterResponse)

    const { result } = renderHook(() => useCreateMeter())

    let returnedMeter: MeterResponse | undefined

    await act(async () => {
      returnedMeter = await result.current.createMeter(createMeterData)
    })

    expect(returnedMeter).toEqual(mockMeterResponse)
    expect(result.current.createdMeter).toEqual(mockMeterResponse)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(meterService.create).toHaveBeenCalledWith(createMeterData)
  })

  it('sets loading state during creation', async () => {
    let resolvePromise: (value: MeterResponse) => void
    vi.mocked(meterService.create).mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve })
    )

    const { result } = renderHook(() => useCreateMeter())

    let createPromise: Promise<MeterResponse>
    act(() => {
      createPromise = result.current.createMeter(createMeterData)
    })

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      resolvePromise!(mockMeterResponse)
      await createPromise
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('handles creation error', async () => {
    const errorMessage = 'Validation failed'
    vi.mocked(meterService.create).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useCreateMeter())

    let thrownError: Error | undefined
    await act(async () => {
      try {
        await result.current.createMeter(createMeterData)
      } catch (err) {
        thrownError = err as Error
      }
    })

    expect(thrownError?.message).toBe(errorMessage)
    expect(result.current.error).toBe(errorMessage)
    expect(result.current.createdMeter).toBeNull()
  })

  it('handles non-Error error objects', async () => {
    vi.mocked(meterService.create).mockRejectedValueOnce('String error')

    const { result } = renderHook(() => useCreateMeter())

    let thrownError: unknown
    await act(async () => {
      try {
        await result.current.createMeter(createMeterData)
      } catch (err) {
        thrownError = err
      }
    })

    expect(thrownError).toBe('String error')
    expect(result.current.error).toBe('Не вдалося створити лічильник')
  })

  it('reset clears error and createdMeter states', async () => {
    vi.mocked(meterService.create).mockResolvedValueOnce(mockMeterResponse)

    const { result } = renderHook(() => useCreateMeter())

    await act(async () => {
      await result.current.createMeter(createMeterData)
    })

    expect(result.current.createdMeter).toEqual(mockMeterResponse)

    act(() => {
      result.current.reset()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.createdMeter).toBeNull()
  })

  it('clears previous state on new creation attempt', async () => {
    vi.mocked(meterService.create)
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce(mockMeterResponse)

    const { result } = renderHook(() => useCreateMeter())

    await act(async () => {
      try {
        await result.current.createMeter(createMeterData)
      } catch {
        // Expected to throw
      }
    })

    expect(result.current.error).toBe('First error')

    await act(async () => {
      await result.current.createMeter(createMeterData)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.createdMeter).toEqual(mockMeterResponse)
  })
})

describe('useUpdateMeter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has correct initial state', () => {
    const { result } = renderHook(() => useUpdateMeter())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.updatedMeter).toBeNull()
  })

  it('updates meter successfully', async () => {
    const updatedResponse = { ...mockMeterResponse, name: 'Updated Meter' }
    vi.mocked(meterService.update).mockResolvedValueOnce(updatedResponse)

    const { result } = renderHook(() => useUpdateMeter())

    let returnedMeter: MeterResponse | undefined

    await act(async () => {
      returnedMeter = await result.current.updateMeter(1, updateMeterData)
    })

    expect(returnedMeter).toEqual(updatedResponse)
    expect(result.current.updatedMeter).toEqual(updatedResponse)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(meterService.update).toHaveBeenCalledWith(1, updateMeterData)
  })

  it('sets loading state during update', async () => {
    let resolvePromise: (value: MeterResponse) => void
    vi.mocked(meterService.update).mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve })
    )

    const { result } = renderHook(() => useUpdateMeter())

    let updatePromise: Promise<MeterResponse>
    act(() => {
      updatePromise = result.current.updateMeter(1, updateMeterData)
    })

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      resolvePromise!(mockMeterResponse)
      await updatePromise
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('handles update error', async () => {
    const errorMessage = 'Meter not found'
    vi.mocked(meterService.update).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useUpdateMeter())

    let thrownError: Error | undefined
    await act(async () => {
      try {
        await result.current.updateMeter(999, updateMeterData)
      } catch (err) {
        thrownError = err as Error
      }
    })

    expect(thrownError?.message).toBe(errorMessage)
    expect(result.current.error).toBe(errorMessage)
    expect(result.current.updatedMeter).toBeNull()
  })

  it('handles non-Error error objects', async () => {
    vi.mocked(meterService.update).mockRejectedValueOnce('String error')

    const { result } = renderHook(() => useUpdateMeter())

    let thrownError: unknown
    await act(async () => {
      try {
        await result.current.updateMeter(1, updateMeterData)
      } catch (err) {
        thrownError = err
      }
    })

    expect(thrownError).toBe('String error')
    expect(result.current.error).toBe('Не вдалося оновити лічильник')
  })

  it('reset clears error and updatedMeter states', async () => {
    vi.mocked(meterService.update).mockResolvedValueOnce(mockMeterResponse)

    const { result } = renderHook(() => useUpdateMeter())

    await act(async () => {
      await result.current.updateMeter(1, updateMeterData)
    })

    expect(result.current.updatedMeter).toEqual(mockMeterResponse)

    act(() => {
      result.current.reset()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.updatedMeter).toBeNull()
  })
})

describe('useDeleteMeter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has correct initial state', () => {
    const { result } = renderHook(() => useDeleteMeter())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('deletes meter successfully', async () => {
    vi.mocked(meterService.delete).mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteMeter())

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.deleteMeter(1)
    })

    expect(success).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(meterService.delete).toHaveBeenCalledWith(1)
  })

  it('sets loading state during deletion', async () => {
    let resolvePromise: () => void
    vi.mocked(meterService.delete).mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve })
    )

    const { result } = renderHook(() => useDeleteMeter())

    let deletePromise: Promise<boolean>
    act(() => {
      deletePromise = result.current.deleteMeter(1)
    })

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      resolvePromise!()
      await deletePromise
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('handles deletion error', async () => {
    const errorMessage = 'Meter not found'
    vi.mocked(meterService.delete).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useDeleteMeter())

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.deleteMeter(999)
    })

    expect(success).toBe(false)
    expect(result.current.error).toBe(errorMessage)
  })

  it('handles non-Error error objects', async () => {
    vi.mocked(meterService.delete).mockRejectedValueOnce('String error')

    const { result } = renderHook(() => useDeleteMeter())

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.deleteMeter(1)
    })

    expect(success).toBe(false)
    expect(result.current.error).toBe('Не вдалося видалити лічильник')
  })

  it('reset clears error state', async () => {
    vi.mocked(meterService.delete).mockRejectedValueOnce(new Error('Some error'))

    const { result } = renderHook(() => useDeleteMeter())

    await act(async () => {
      await result.current.deleteMeter(1)
    })

    expect(result.current.error).toBe('Some error')

    act(() => {
      result.current.reset()
    })

    expect(result.current.error).toBeNull()
  })

  it('clears previous state on new deletion attempt', async () => {
    vi.mocked(meterService.delete)
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteMeter())

    await act(async () => {
      await result.current.deleteMeter(1)
    })

    expect(result.current.error).toBe('First error')

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.deleteMeter(1)
    })

    expect(success).toBe(true)
    expect(result.current.error).toBeNull()
  })
})
