import { describe, it, expect, vi, beforeEach } from 'vitest'
import { meterService } from './meterService'
import { api } from '@shared/api/apiClient'
import { API_ENDPOINTS } from '@shared/constants'
import type { Meter } from '@shared/types/entities'
import type { MeterResponse, CreateMeterRequest, UpdateMeterRequest } from '../types'

vi.mock('@shared/api/apiClient', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockMeter: Meter = {
  id: 1,
  addressId: 1,
  name: 'Лічильник електроенергії',
  serialNumber: 'E-12345',
  description: null,
  modelName: null,
  location: 'Кухня',
  installationDate: '2024-01-15',
  initialReading: null,
  notes: null,
  isActive: true,
  utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' },
  serviceProvider: { id: 1, name: 'Provider 1' },
  photoUrl: null,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
}

const mockMeterResponse: MeterResponse = {
  ...mockMeter,
  photoUrl: 'https://api.example.com/photos/meter-1.jpg',
  updatedAt: '2025-01-20T15:30:00Z',
}

describe('meterService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('returns list of meters without params', async () => {
      const mockMeters = [mockMeter]
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockMeters })

      const result = await meterService.list()

      expect(result).toEqual(mockMeters)
      expect(api.get).toHaveBeenCalledWith(API_ENDPOINTS.METERS.LIST)
    })

    it('builds query string with page param', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] })

      await meterService.list({ page: 2 })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.METERS.LIST}?page=2`)
    })

    it('builds query string with perPage param', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] })

      await meterService.list({ perPage: 20 })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.METERS.LIST}?perPage=20`)
    })

    it('builds query string with addressId param', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] })

      await meterService.list({ addressId: 5 })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.METERS.LIST}?addressId=5`)
    })

    it('builds query string with utilityTypeId param', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] })

      await meterService.list({ utilityTypeId: 1 })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.METERS.LIST}?utilityTypeId=1`)
    })

    it('builds query string with isActive=true', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] })

      await meterService.list({ isActive: true })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.METERS.LIST}?isActive=true`)
    })

    it('builds query string with isActive=false', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] })

      await meterService.list({ isActive: false })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.METERS.LIST}?isActive=false`)
    })

    it('combines multiple params in query string', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] })

      await meterService.list({
        page: 1,
        perPage: 10,
        addressId: 2,
        utilityTypeId: 3,
        isActive: true,
      })

      expect(api.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.METERS.LIST}?page=1&perPage=10&addressId=2&utilityTypeId=3&isActive=true`
      )
    })

    it('propagates network errors', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network Error'))

      await expect(meterService.list()).rejects.toThrow('Network Error')
    })

    it('propagates server errors', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Internal Server Error'))

      await expect(meterService.list()).rejects.toThrow('Internal Server Error')
    })
  })

  describe('getByAddress', () => {
    it('returns meters for a specific address', async () => {
      const mockMeters = [mockMeter, { ...mockMeter, id: 2, utilityType: { id: 1, slug: 'gas', displayName: 'Газ', unit: 'м³' } }]
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockMeters })

      const result = await meterService.getByAddress(1)

      expect(result).toEqual(mockMeters)
      expect(api.get).toHaveBeenCalledWith(API_ENDPOINTS.METERS.BY_ADDRESS(1))
    })

    it('calls correct endpoint with different address ids', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] })

      await meterService.getByAddress(42)

      expect(api.get).toHaveBeenCalledWith('/meter/address/42')
    })

    it('returns empty array when no meters found', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] })

      const result = await meterService.getByAddress(999)

      expect(result).toEqual([])
    })

    it('propagates 404 errors', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Address not found'))

      await expect(meterService.getByAddress(999)).rejects.toThrow('Address not found')
    })

    it('propagates 401 unauthorized errors', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(meterService.getByAddress(1)).rejects.toThrow('Unauthorized')
    })
  })

  describe('getActive', () => {
    it('returns all active meters', async () => {
      const activeMeters = [mockMeter]
      vi.mocked(api.get).mockResolvedValueOnce({ data: activeMeters })

      const result = await meterService.getActive()

      expect(result).toEqual(activeMeters)
      expect(api.get).toHaveBeenCalledWith(API_ENDPOINTS.METERS.ACTIVE)
    })

    it('returns empty array when no active meters', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] })

      const result = await meterService.getActive()

      expect(result).toEqual([])
    })

    it('propagates errors', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Server error'))

      await expect(meterService.getActive()).rejects.toThrow('Server error')
    })
  })

  describe('getById', () => {
    it('returns meter by id', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockMeterResponse })

      const result = await meterService.getById(1)

      expect(result).toEqual(mockMeterResponse)
      expect(api.get).toHaveBeenCalledWith(API_ENDPOINTS.METERS.GET(1))
    })

    it('calls correct endpoint with different ids', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockMeterResponse })

      await meterService.getById(123)

      expect(api.get).toHaveBeenCalledWith('/meter/123')
    })

    it('throws error when meter not found', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Meter not found'))

      await expect(meterService.getById(999)).rejects.toThrow('Meter not found')
    })

    it('propagates 403 forbidden errors', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Forbidden'))

      await expect(meterService.getById(1)).rejects.toThrow('Forbidden')
    })
  })

  describe('create', () => {
    const createData: CreateMeterRequest = {
      addressId: 1,
      utilityTypeId: 1,
      name: 'Новий лічильник',
      serialNumber: 'SN-12345',
      installationDate: '2025-01-20',
      isActive: true,
      serviceProviderId: 1,
    }

    it('creates meter via api.post with JSON payload', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockMeterResponse })

      const result = await meterService.create(createData)

      expect(result).toEqual(mockMeterResponse)
      expect(api.post).toHaveBeenCalledWith(API_ENDPOINTS.METERS.CREATE, createData)
    })

    it('includes optional fields when provided', async () => {
      const dataWithOptional: CreateMeterRequest = {
        ...createData,
        modelName: 'Model X',
        location: 'Коридор',
        initialReading: 1000.5,
        notes: 'Test notes',
      }
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockMeterResponse })

      await meterService.create(dataWithOptional)

      expect(api.post).toHaveBeenCalledWith(API_ENDPOINTS.METERS.CREATE, dataWithOptional)
    })

    it('throws error on validation failure', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('serialNumber is required'))

      await expect(meterService.create(createData)).rejects.toThrow('serialNumber is required')
    })

    it('propagates 400 bad request errors', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Bad Request'))

      await expect(meterService.create(createData)).rejects.toThrow('Bad Request')
    })

    it('propagates 500 server errors', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Internal Server Error'))

      await expect(meterService.create(createData)).rejects.toThrow('Internal Server Error')
    })
  })

  describe('update', () => {
    const updateData: UpdateMeterRequest = {
      name: 'Оновлений лічильник',
      location: 'Ванна кімната',
    }

    it('updates meter and returns updated data', async () => {
      const updatedMeter: MeterResponse = { ...mockMeterResponse, ...updateData }
      vi.mocked(api.put).mockResolvedValueOnce({ data: updatedMeter })

      const result = await meterService.update(1, updateData)

      expect(result).toEqual(updatedMeter)
      expect(api.put).toHaveBeenCalledWith(API_ENDPOINTS.METERS.UPDATE(1), updateData)
    })

    it('handles partial updates', async () => {
      const partialUpdate: UpdateMeterRequest = { isActive: false }
      const updatedMeter: MeterResponse = { ...mockMeterResponse, isActive: false }
      vi.mocked(api.put).mockResolvedValueOnce({ data: updatedMeter })

      const result = await meterService.update(1, partialUpdate)

      expect(result).toEqual(updatedMeter)
      expect(api.put).toHaveBeenCalledWith(API_ENDPOINTS.METERS.UPDATE(1), partialUpdate)
    })

    it('calls correct endpoint with different ids', async () => {
      vi.mocked(api.put).mockResolvedValueOnce({ data: mockMeterResponse })

      await meterService.update(42, updateData)

      expect(api.put).toHaveBeenCalledWith('/meter/42', updateData)
    })

    it('throws error when meter not found', async () => {
      vi.mocked(api.put).mockRejectedValueOnce(new Error('Meter not found'))

      await expect(meterService.update(999, updateData)).rejects.toThrow('Meter not found')
    })

    it('propagates 401 unauthorized errors', async () => {
      vi.mocked(api.put).mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(meterService.update(1, updateData)).rejects.toThrow('Unauthorized')
    })

    it('propagates 403 forbidden errors', async () => {
      vi.mocked(api.put).mockRejectedValueOnce(new Error('Forbidden'))

      await expect(meterService.update(1, updateData)).rejects.toThrow('Forbidden')
    })
  })

  describe('delete', () => {
    it('deletes meter successfully', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined)

      await expect(meterService.delete(1)).resolves.toBeUndefined()
      expect(api.delete).toHaveBeenCalledWith(API_ENDPOINTS.METERS.DELETE(1))
    })

    it('calls correct endpoint with different ids', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined)

      await meterService.delete(42)

      expect(api.delete).toHaveBeenCalledWith('/meter/42')
    })

    it('throws error when meter not found', async () => {
      vi.mocked(api.delete).mockRejectedValueOnce(new Error('Meter not found'))

      await expect(meterService.delete(999)).rejects.toThrow('Meter not found')
    })

    it('throws error when meter has associated readings', async () => {
      vi.mocked(api.delete).mockRejectedValueOnce(
        new Error('Cannot delete meter with associated readings')
      )

      await expect(meterService.delete(1)).rejects.toThrow(
        'Cannot delete meter with associated readings'
      )
    })

    it('propagates 401 unauthorized errors', async () => {
      vi.mocked(api.delete).mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(meterService.delete(1)).rejects.toThrow('Unauthorized')
    })

    it('propagates 403 forbidden errors', async () => {
      vi.mocked(api.delete).mockRejectedValueOnce(new Error('Forbidden'))

      await expect(meterService.delete(1)).rejects.toThrow('Forbidden')
    })

    it('propagates 500 server errors', async () => {
      vi.mocked(api.delete).mockRejectedValueOnce(new Error('Internal Server Error'))

      await expect(meterService.delete(1)).rejects.toThrow('Internal Server Error')
    })
  })
})
