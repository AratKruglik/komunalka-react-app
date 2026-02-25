import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addressService } from './addressService'
import { api } from '@shared/api/apiClient'
import { API_ENDPOINTS } from '@shared/constants'
import type { Address, Region, AddressType } from '@shared/types/entities'
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

const mockRegion: Region = {
  id: 9,
  name: 'Київська область',
}

const mockAddressType: AddressType = {
  id: 1,
  name: 'Квартира',
  description: 'Багатоквартирний будинок у місті',
  icon: 'apartment',
}

const mockAddress: Address = {
  id: 1,
  city: 'Київ',
  street: 'вул. Хрещатик',
  buildingNumber: '1',
  apartmentNumber: '10',
  zipCode: '01001',
  notes: 'Центр міста',
  isPrimary: true,
  region: mockRegion,
  addressType: mockAddressType,
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
}

const mockPaginatedResponse: PaginatedResponse<Address> = {
  data: [mockAddress],
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
      expect(api.get).toHaveBeenCalledWith(API_ENDPOINTS.ADDRESS.LIST)
    })

    it('builds query string with pagination params', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      await addressService.list({ page: 2, perPage: 20 })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.ADDRESS.LIST}?page=2&perPage=20`)
    })

    it('includes sorting params in query string', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      await addressService.list({ sortBy: 'city', desc: true })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.ADDRESS.LIST}?sortBy=city&desc=true`)
    })

    it('includes city filter in query string', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      await addressService.list({ city: 'Kyiv' })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.ADDRESS.LIST}?city=Kyiv`)
    })

    it('includes regionId filter in query string', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      await addressService.list({ regionId: 9 })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.ADDRESS.LIST}?regionId=9`)
    })

    it('includes isPrimary filter in query string', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      await addressService.list({ isPrimary: true })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.ADDRESS.LIST}?isPrimary=true`)
    })

    it('handles isPrimary=false correctly (falsy but defined)', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      await addressService.list({ isPrimary: false })

      expect(api.get).toHaveBeenCalledWith(`${API_ENDPOINTS.ADDRESS.LIST}?isPrimary=false`)
    })

    it('handles all params together', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockPaginatedResponse)

      await addressService.list({
        page: 1,
        perPage: 10,
        sortBy: 'street',
        desc: false,
        city: 'Lviv',
        regionId: 13,
        isPrimary: true,
      })

      const expectedUrl = `${API_ENDPOINTS.ADDRESS.LIST}?page=1&perPage=10&sortBy=street&desc=false&city=Lviv&regionId=13&isPrimary=true`
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
      expect(api.get).toHaveBeenCalledWith(API_ENDPOINTS.ADDRESS.GET(1))
    })

    it('throws error when address not found', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Address not found'))

      await expect(addressService.getById(999)).rejects.toThrow('Address not found')
    })

    it('calls correct endpoint with different ids', async () => {
      vi.mocked(api.get).mockResolvedValueOnce(mockAddress)

      await addressService.getById(42)

      expect(api.get).toHaveBeenCalledWith('/address/42')
    })
  })

  describe('create', () => {
    const createData: CreateAddressRequest = {
      regionId: 9,
      city: 'Одеса',
      street: 'Нова вулиця',
      buildingNumber: '5',
      apartmentNumber: '20',
      zipCode: '65000',
      notes: 'Тестова примітка',
      isPrimary: false,
      addressTypeId: 1,
    }

    it('creates new address and returns it', async () => {
      const createdAddress: Address = {
        ...mockAddress,
        id: 2,
        city: createData.city,
        street: createData.street,
        buildingNumber: createData.buildingNumber,
        apartmentNumber: createData.apartmentNumber ?? null,
        zipCode: createData.zipCode ?? null,
        notes: createData.notes ?? null,
        isPrimary: createData.isPrimary,
        region: mockRegion,
        addressType: mockAddressType,
        createdAt: '2025-01-20T12:00:00Z',
        updatedAt: '2025-01-20T12:00:00Z',
      }
      vi.mocked(api.post).mockResolvedValueOnce(createdAddress)

      const result = await addressService.create(createData)

      expect(result).toEqual(createdAddress)
      expect(api.post).toHaveBeenCalledWith(API_ENDPOINTS.ADDRESS.CREATE, createData)
    })

    it('throws error on validation failure', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('City is required'))

      await expect(addressService.create(createData)).rejects.toThrow('City is required')
    })

    it('handles server error', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Internal server error'))

      await expect(addressService.create(createData)).rejects.toThrow('Internal server error')
    })
  })

  describe('update', () => {
    const updateData: UpdateAddressRequest = {
      street: 'Оновлена вулиця',
      buildingNumber: '10',
    }

    it('updates address and returns updated data', async () => {
      const updatedAddress: Address = { ...mockAddress, ...updateData }
      vi.mocked(api.put).mockResolvedValueOnce(updatedAddress)

      const result = await addressService.update(1, updateData)

      expect(result).toEqual(updatedAddress)
      expect(api.put).toHaveBeenCalledWith(API_ENDPOINTS.ADDRESS.UPDATE(1), updateData)
    })

    it('handles partial updates', async () => {
      const partialUpdate: UpdateAddressRequest = { city: 'Харків' }
      const updatedAddress: Address = { ...mockAddress, ...partialUpdate }
      vi.mocked(api.put).mockResolvedValueOnce(updatedAddress)

      const result = await addressService.update(1, partialUpdate)

      expect(result).toEqual(updatedAddress)
      expect(api.put).toHaveBeenCalledWith(API_ENDPOINTS.ADDRESS.UPDATE(1), partialUpdate)
    })

    it('throws error when address not found', async () => {
      vi.mocked(api.put).mockRejectedValueOnce(new Error('Address not found'))

      await expect(addressService.update(999, updateData)).rejects.toThrow('Address not found')
    })

    it('calls correct endpoint with different ids', async () => {
      const updatedAddress: Address = { ...mockAddress, ...updateData }
      vi.mocked(api.put).mockResolvedValueOnce(updatedAddress)

      await addressService.update(42, updateData)

      expect(api.put).toHaveBeenCalledWith('/address/42', updateData)
    })
  })

  describe('delete', () => {
    it('deletes address successfully', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined)

      await expect(addressService.delete(1)).resolves.toBeUndefined()
      expect(api.delete).toHaveBeenCalledWith(API_ENDPOINTS.ADDRESS.DELETE(1))
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

      expect(api.delete).toHaveBeenCalledWith('/address/42')
    })
  })

  describe('setPrimary', () => {
    it('sets address as primary', async () => {
      const primaryAddress: Address = { ...mockAddress, isPrimary: true }
      vi.mocked(api.put).mockResolvedValueOnce(primaryAddress)

      const result = await addressService.setPrimary(1)

      expect(result).toEqual(primaryAddress)
      expect(api.put).toHaveBeenCalledWith(API_ENDPOINTS.ADDRESS.UPDATE(1), { isPrimary: true })
    })

    it('throws error when address not found', async () => {
      vi.mocked(api.put).mockRejectedValueOnce(new Error('Address not found'))

      await expect(addressService.setPrimary(999)).rejects.toThrow('Address not found')
    })

    it('calls correct endpoint with different ids', async () => {
      const primaryAddress: Address = { ...mockAddress, id: 42, isPrimary: true }
      vi.mocked(api.put).mockResolvedValueOnce(primaryAddress)

      await addressService.setPrimary(42)

      expect(api.put).toHaveBeenCalledWith('/address/42', { isPrimary: true })
    })

    it('unsets previous primary address implicitly (handled by API)', async () => {
      const primaryAddress: Address = { ...mockAddress, id: 2, isPrimary: true }
      vi.mocked(api.put).mockResolvedValueOnce(primaryAddress)

      const result = await addressService.setPrimary(2)

      expect(result.isPrimary).toBe(true)
    })
  })
})
