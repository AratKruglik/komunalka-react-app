import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addressService } from './addressService'
import { api } from '@shared/api/apiClient'
import { API_ENDPOINTS } from '@shared/constants'
import type { Address } from '@shared/types/entities'
import type { PaginatedResponse } from '@shared/api/types'
import type { CreateAddressRequest, UpdateAddressRequest } from '../types'

vi.mock('@shared/api/apiClient', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockAddress: Address = {
  id: 1,
  street: 'Хрещатик',
  building: '1',
  apartment: '10',
  city: 'Київ',
  district: 'Шевченківський',
  isPrimary: true,
  createdAt: '2025-01-15T10:00:00Z',
}

const mockPaginatedResponse: PaginatedResponse<Address> = {
  data: [mockAddress],
  links: {
    first: '/addresses?page=1',
    last: '/addresses?page=5',
    prev: null,
    next: '/addresses?page=2',
  },
  meta: {
    current_page: 1,
    from: 1,
    last_page: 5,
    path: '/addresses',
    per_page: 10,
    to: 10,
    total: 50,
  },
}

describe('addressService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('returns paginated list of addresses without params', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      const result = await addressService.list()

      expect(result).toEqual(mockPaginatedResponse)
      expect(api.get).toHaveBeenCalledWith(API_ENDPOINTS.ADDRESSES.LIST)
    })

    it('builds query string with pagination params', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      await addressService.list({ page: 2, perPage: 20 })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.ADDRESSES.LIST}?page=2&perPage=20`)
    })

    it('includes sorting params in query string', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      await addressService.list({ sortBy: 'city', desc: true })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.ADDRESSES.LIST}?sortBy=city&desc=true`)
    })

    it('includes city filter in query string', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      await addressService.list({ city: 'Kyiv' })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.ADDRESSES.LIST}?city=Kyiv`)
    })

    it('includes district filter in query string', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      await addressService.list({ district: 'Shevchenkivskyi' })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.ADDRESSES.LIST}?district=Shevchenkivskyi`)
    })

    it('includes isPrimary filter in query string', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      await addressService.list({ isPrimary: true })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.ADDRESSES.LIST}?isPrimary=true`)
    })

    it('handles isPrimary=false correctly (falsy but defined)', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      await addressService.list({ isPrimary: false })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.ADDRESSES.LIST}?isPrimary=false`)
    })

    it('handles all params together', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      await addressService.list({
        page: 1,
        perPage: 10,
        sortBy: 'street',
        desc: false,
        city: 'Lviv',
        district: 'Halytskyi',
        isPrimary: true,
      })

      const expectedUrl = `${API_ENDPOINTS.ADDRESSES.LIST}?page=1&perPage=10&sortBy=street&desc=false&city=Lviv&district=Halytskyi&isPrimary=true`
      expect(api.get).toHaveBeenCalledWith(expectedUrl)
    })

    it('propagates API errors', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'))

      await expect(addressService.list()).rejects.toThrow('Network error')
    })
  })

  describe('getById', () => {
    it('returns address by id', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockAddress)

      const result = await addressService.getById(1)

      expect(result).toEqual(mockAddress)
      expect(api.get).toHaveBeenCalledWith(API_ENDPOINTS.ADDRESSES.GET(1))
    })

    it('throws error when address not found', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Address not found'))

      await expect(addressService.getById(999)).rejects.toThrow('Address not found')
    })

    it('calls correct endpoint with different ids', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockAddress)

      await addressService.getById(42)

      expect(api.get).toHaveBeenCalledWith('/addresses/42')
    })
  })

  describe('create', () => {
    const createData: CreateAddressRequest = {
      street: 'Нова вулиця',
      building: '5',
      apartment: '20',
      city: 'Одеса',
      district: 'Приморський',
      isPrimary: false,
    }

    it('creates new address and returns it', async () => {
      const createdAddress: Address = {
        ...mockAddress,
        ...createData,
        id: 2,
        createdAt: '2025-01-20T12:00:00Z',
      }
      vi.mocked(api.post).mockResolvedValueOnce(createdAddress)

      const result = await addressService.create(createData)

      expect(result).toEqual(createdAddress)
      expect(api.post).toHaveBeenCalledWith(API_ENDPOINTS.ADDRESSES.CREATE, createData)
    })

    it('throws error on validation failure', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Street is required'))

      await expect(addressService.create(createData)).rejects.toThrow('Street is required')
    })

    it('handles server error', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Internal server error'))

      await expect(addressService.create(createData)).rejects.toThrow('Internal server error')
    })
  })

  describe('update', () => {
    const updateData: UpdateAddressRequest = {
      street: 'Оновлена вулиця',
      building: '10',
    }

    it('updates address and returns updated data', async () => {
      const updatedAddress: Address = { ...mockAddress, ...updateData }
      vi.mocked(api.put).mockResolvedValueOnce(updatedAddress)

      const result = await addressService.update(1, updateData)

      expect(result).toEqual(updatedAddress)
      expect(api.put).toHaveBeenCalledWith(API_ENDPOINTS.ADDRESSES.UPDATE(1), updateData)
    })

    it('handles partial updates', async () => {
      const partialUpdate: UpdateAddressRequest = { city: 'Харків' }
      const updatedAddress: Address = { ...mockAddress, ...partialUpdate }
      vi.mocked(api.put).mockResolvedValueOnce(updatedAddress)

      const result = await addressService.update(1, partialUpdate)

      expect(result).toEqual(updatedAddress)
      expect(api.put).toHaveBeenCalledWith(API_ENDPOINTS.ADDRESSES.UPDATE(1), partialUpdate)
    })

    it('throws error when address not found', async () => {
      vi.mocked(api.put).mockRejectedValueOnce(new Error('Address not found'))

      await expect(addressService.update(999, updateData)).rejects.toThrow('Address not found')
    })

    it('calls correct endpoint with different ids', async () => {
      const updatedAddress: Address = { ...mockAddress, ...updateData }
      vi.mocked(api.put).mockResolvedValueOnce(updatedAddress)

      await addressService.update(42, updateData)

      expect(api.put).toHaveBeenCalledWith('/addresses/42', updateData)
    })
  })

  describe('delete', () => {
    it('deletes address successfully', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined)

      await expect(addressService.delete(1)).resolves.toBeUndefined()
      expect(api.delete).toHaveBeenCalledWith(API_ENDPOINTS.ADDRESSES.DELETE(1))
    })

    it('throws error when address not found', async () => {
      vi.mocked(api.delete).mockRejectedValueOnce(new Error('Address not found'))

      await expect(addressService.delete(999)).rejects.toThrow('Address not found')
    })

    it('throws error when address has associated meters', async () => {
      vi.mocked(api.delete).mockRejectedValueOnce(new Error('Cannot delete address with associated meters'))

      await expect(addressService.delete(1)).rejects.toThrow('Cannot delete address with associated meters')
    })

    it('calls correct endpoint with different ids', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined)

      await addressService.delete(42)

      expect(api.delete).toHaveBeenCalledWith('/addresses/42')
    })
  })

  describe('setPrimary', () => {
    it('sets address as primary', async () => {
      const primaryAddress: Address = { ...mockAddress, isPrimary: true }
      vi.mocked(api.put).mockResolvedValueOnce(primaryAddress)

      const result = await addressService.setPrimary(1)

      expect(result).toEqual(primaryAddress)
      expect(api.put).toHaveBeenCalledWith(API_ENDPOINTS.ADDRESSES.UPDATE(1), { isPrimary: true })
    })

    it('throws error when address not found', async () => {
      vi.mocked(api.put).mockRejectedValueOnce(new Error('Address not found'))

      await expect(addressService.setPrimary(999)).rejects.toThrow('Address not found')
    })

    it('calls correct endpoint with different ids', async () => {
      const primaryAddress: Address = { ...mockAddress, id: 42, isPrimary: true }
      vi.mocked(api.put).mockResolvedValueOnce(primaryAddress)

      await addressService.setPrimary(42)

      expect(api.put).toHaveBeenCalledWith('/addresses/42', { isPrimary: true })
    })

    it('unsets previous primary address implicitly (handled by API)', async () => {
      const primaryAddress: Address = { ...mockAddress, id: 2, isPrimary: true }
      vi.mocked(api.put).mockResolvedValueOnce(primaryAddress)

      const result = await addressService.setPrimary(2)

      expect(result.isPrimary).toBe(true)
    })
  })
})
