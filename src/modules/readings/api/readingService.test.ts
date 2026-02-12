import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readingService } from './readingService'
import { api, apiRequest } from '@shared/api/apiClient'
import { API_CONFIG } from '@shared/api/config'
import { API_ENDPOINTS } from '@shared/constants'
import type { Reading } from '@shared/types/entities'
import type { ReadingResponse, BatchReadingItem } from '../types'

vi.mock('@shared/api/apiClient', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  apiRequest: vi.fn(),
}))

vi.mock('@shared/api/config', () => ({
  API_CONFIG: {
    baseURL: 'http://localhost:3000/api/v1',
    timeout: 10000,
  },
}))

const mockReading: Reading = {
  id: 1,
  meterId: 1,
  date: '2025-01-20',
  value: 1234.5,
  consumption: 50.5,
  submittedAt: '2025-01-20T10:30:00Z',
  status: 'accepted',
  note: 'Monthly reading',
  photoUrl: 'https://api.example.com/photos/reading-1.jpg',
}

const mockReadingResponse: ReadingResponse = {
  ...mockReading,
  createdAt: '2025-01-20T10:30:00Z',
  updatedAt: '2025-01-20T10:30:00Z',
}

describe('readingService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getByAddress', () => {
    it('returns readings for a specific address without params', async () => {
      const mockReadings = [mockReading]
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockReadings })

      const result = await readingService.getByAddress(1)

      expect(result).toEqual(mockReadings)
      expect(api.get).toHaveBeenCalledWith(API_ENDPOINTS.READINGS.BY_ADDRESS(1))
    })

    it('calls correct endpoint with different address ids', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] })

      await readingService.getByAddress(42)

      expect(api.get).toHaveBeenCalledWith('/meter-readings/address/42')
    })

    it('builds query string with from param', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] })

      await readingService.getByAddress(1, { from: '2025-01-01' })

      expect(api.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.READINGS.BY_ADDRESS(1)}?from=2025-01-01`
      )
    })

    it('builds query string with to param', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] })

      await readingService.getByAddress(1, { to: '2025-01-31' })

      expect(api.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.READINGS.BY_ADDRESS(1)}?to=2025-01-31`
      )
    })

    it('builds query string with both from and to params', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] })

      await readingService.getByAddress(1, {
        from: '2025-01-01',
        to: '2025-01-31',
      })

      expect(api.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.READINGS.BY_ADDRESS(1)}?from=2025-01-01&to=2025-01-31`
      )
    })

    it('returns empty array when no readings found', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] })

      const result = await readingService.getByAddress(999)

      expect(result).toEqual([])
    })

    it('propagates 404 errors', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Address not found'))

      await expect(readingService.getByAddress(999)).rejects.toThrow('Address not found')
    })

    it('propagates 401 unauthorized errors', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(readingService.getByAddress(1)).rejects.toThrow('Unauthorized')
    })

    it('propagates network errors', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network Error'))

      await expect(readingService.getByAddress(1)).rejects.toThrow('Network Error')
    })

    it('propagates 500 server errors', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Internal Server Error'))

      await expect(readingService.getByAddress(1)).rejects.toThrow('Internal Server Error')
    })
  })

  describe('getById', () => {
    it('returns reading by id', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockReadingResponse)

      const result = await readingService.getById(1)

      expect(result).toEqual(mockReadingResponse)
      expect(api.get).toHaveBeenCalledWith(API_ENDPOINTS.READINGS.GET(1))
    })

    it('calls correct endpoint with different ids', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockReadingResponse)

      await readingService.getById(123)

      expect(api.get).toHaveBeenCalledWith('/meter-readings/123')
    })

    it('throws error when reading not found', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Reading not found'))

      await expect(readingService.getById(999)).rejects.toThrow('Reading not found')
    })

    it('propagates 403 forbidden errors', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Forbidden'))

      await expect(readingService.getById(1)).rejects.toThrow('Forbidden')
    })

    it('propagates 401 unauthorized errors', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(readingService.getById(1)).rejects.toThrow('Unauthorized')
    })
  })

  describe('createBatch', () => {
    const batchReadings: BatchReadingItem[] = [
      { meterId: 1, readingValue: 1234.5, readingDate: '2025-01-20', notes: 'Test note' },
      { meterId: 2, readingValue: 567.8, readingDate: '2025-01-20' },
    ]

    it('creates batch readings and returns created data', async () => {
      const createdReadings = [mockReading, { ...mockReading, id: 2, meterId: 2 }]
      vi.mocked(apiRequest).mockResolvedValueOnce(createdReadings)

      const result = await readingService.createBatch(1, batchReadings)

      expect(result).toEqual(createdReadings)
      expect(apiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: API_ENDPOINTS.READINGS.BATCH_CREATE,
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      )
    })

    it('sends FormData with AddressId', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce([])

      await readingService.createBatch(42, batchReadings)

      const callArg = vi.mocked(apiRequest).mock.calls[0][0]
      const formData = callArg.data as FormData

      expect(formData.get('AddressId')).toBe('42')
    })

    it('sends ReadingsJson as stringified JSON', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce([])

      await readingService.createBatch(1, batchReadings)

      const callArg = vi.mocked(apiRequest).mock.calls[0][0]
      const formData = callArg.data as FormData
      const readingsJson = formData.get('ReadingsJson')

      expect(readingsJson).toBe(JSON.stringify({ addressId: 1, readings: batchReadings }))
    })

    it('includes photos when provided', async () => {
      const photo1 = new File(['photo1'], 'meter1.jpg', { type: 'image/jpeg' })
      const photo2 = new File(['photo2'], 'meter2.jpg', { type: 'image/jpeg' })
      const photos = new Map<number, File>([
        [1, photo1],
        [2, photo2],
      ])
      vi.mocked(apiRequest).mockResolvedValueOnce([])

      await readingService.createBatch(1, batchReadings, photos)

      const callArg = vi.mocked(apiRequest).mock.calls[0][0]
      const formData = callArg.data as FormData
      const photosEntries = formData.getAll('Photos')

      expect(photosEntries).toHaveLength(2)
    })

    it('does not include photos when not provided', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce([])

      await readingService.createBatch(1, batchReadings)

      const callArg = vi.mocked(apiRequest).mock.calls[0][0]
      const formData = callArg.data as FormData
      const photosEntries = formData.getAll('Photos')

      expect(photosEntries).toHaveLength(0)
    })

    it('does not include photos when photos map is empty', async () => {
      const emptyPhotos = new Map<number, File>()
      vi.mocked(apiRequest).mockResolvedValueOnce([])

      await readingService.createBatch(1, batchReadings, emptyPhotos)

      const callArg = vi.mocked(apiRequest).mock.calls[0][0]
      const formData = callArg.data as FormData
      const photosEntries = formData.getAll('Photos')

      expect(photosEntries).toHaveLength(0)
    })

    it('handles empty readings array', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce([])

      await readingService.createBatch(1, [])

      const callArg = vi.mocked(apiRequest).mock.calls[0][0]
      const formData = callArg.data as FormData

      expect(formData.get('ReadingsJson')).toBe('{"addressId":1,"readings":[]}')
    })

    it('throws error on validation failure', async () => {
      vi.mocked(apiRequest).mockRejectedValueOnce(new Error('Value must be positive'))

      await expect(readingService.createBatch(1, batchReadings)).rejects.toThrow(
        'Value must be positive'
      )
    })

    it('propagates 400 bad request errors', async () => {
      vi.mocked(apiRequest).mockRejectedValueOnce(new Error('Bad Request'))

      await expect(readingService.createBatch(1, batchReadings)).rejects.toThrow('Bad Request')
    })

    it('propagates 401 unauthorized errors', async () => {
      vi.mocked(apiRequest).mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(readingService.createBatch(1, batchReadings)).rejects.toThrow('Unauthorized')
    })

    it('propagates 403 forbidden errors', async () => {
      vi.mocked(apiRequest).mockRejectedValueOnce(new Error('Forbidden'))

      await expect(readingService.createBatch(1, batchReadings)).rejects.toThrow('Forbidden')
    })

    it('propagates 500 server errors', async () => {
      vi.mocked(apiRequest).mockRejectedValueOnce(new Error('Internal Server Error'))

      await expect(readingService.createBatch(1, batchReadings)).rejects.toThrow(
        'Internal Server Error'
      )
    })

    it('propagates network errors', async () => {
      vi.mocked(apiRequest).mockRejectedValueOnce(new Error('Network Error'))

      await expect(readingService.createBatch(1, batchReadings)).rejects.toThrow('Network Error')
    })
  })

  describe('delete', () => {
    it('deletes reading successfully', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined)

      await expect(readingService.delete(1)).resolves.toBeUndefined()
      expect(api.delete).toHaveBeenCalledWith(API_ENDPOINTS.READINGS.DELETE(1))
    })

    it('calls correct endpoint with different ids', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined)

      await readingService.delete(42)

      expect(api.delete).toHaveBeenCalledWith('/meter-readings/42')
    })

    it('throws error when reading not found', async () => {
      vi.mocked(api.delete).mockRejectedValueOnce(new Error('Reading not found'))

      await expect(readingService.delete(999)).rejects.toThrow('Reading not found')
    })

    it('propagates 401 unauthorized errors', async () => {
      vi.mocked(api.delete).mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(readingService.delete(1)).rejects.toThrow('Unauthorized')
    })

    it('propagates 403 forbidden errors', async () => {
      vi.mocked(api.delete).mockRejectedValueOnce(new Error('Forbidden'))

      await expect(readingService.delete(1)).rejects.toThrow('Forbidden')
    })

    it('propagates 500 server errors', async () => {
      vi.mocked(api.delete).mockRejectedValueOnce(new Error('Internal Server Error'))

      await expect(readingService.delete(1)).rejects.toThrow('Internal Server Error')
    })
  })

  describe('getPhotoUrl', () => {
    it('returns optimized photo URL by default', () => {
      const result = readingService.getPhotoUrl(1)

      expect(result).toBe(`${API_CONFIG.baseURL}${API_ENDPOINTS.READINGS.PHOTO_OPTIMIZED(1)}`)
    })

    it('returns optimized photo URL when type is optimized', () => {
      const result = readingService.getPhotoUrl(1, 'optimized')

      expect(result).toBe(`${API_CONFIG.baseURL}/meter-readings/photos/1/optimized`)
    })

    it('returns thumbnail photo URL when type is thumbnail', () => {
      const result = readingService.getPhotoUrl(1, 'thumbnail')

      expect(result).toBe(`${API_CONFIG.baseURL}/meter-readings/photos/1/thumbnail`)
    })

    it('builds correct URL for different reading ids', () => {
      const result = readingService.getPhotoUrl(123)

      expect(result).toBe(`${API_CONFIG.baseURL}/meter-readings/photos/123/optimized`)
    })

    it('builds correct thumbnail URL for different reading ids', () => {
      const result = readingService.getPhotoUrl(456, 'thumbnail')

      expect(result).toBe(`${API_CONFIG.baseURL}/meter-readings/photos/456/thumbnail`)
    })
  })
})
