import { describe, it, expect } from 'vitest'
import {
  toAddressCardViewModel,
  toAddressSelectViewModel,
  toAddressCardViewModels,
} from './addressViewModels'
import type { Address, Meter, Region, AddressType } from '../types/entities'
import { Star } from 'lucide-react'

const mockRegion: Region = {
  id: 25,
  name: 'м. Київ',
}

const mockAddressType: AddressType = {
  id: 1,
  name: 'Квартира',
  description: 'Багатоквартирний будинок у місті',
  icon: 'apartment',
}

function createMockAddress(overrides: Partial<Address> = {}): Address {
  return {
    id: 1,
    city: 'Київ',
    street: 'вул. Хрещатик',
    buildingNumber: '22',
    apartmentNumber: '15',
    zipCode: '01001',
    notes: null,
    isPrimary: false,
    region: overrides.region || mockRegion,
    addressType: overrides.addressType || mockAddressType,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function createMockMeter(overrides: Partial<Meter> = {}): Meter {
  return {
    id: 1,
    addressId: 1,
    serialNumber: 'E-12345',
    name: 'Основний лічильник',
    description: null,
    modelName: null,
    location: 'Щитова',
    installationDate: '2023-01-01',
    initialReading: null,
    notes: null,
    isActive: true,
    utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' },
    serviceProvider: { id: 1, name: 'YASNO' },
    photoUrl: null,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('addressViewModels', () => {
  describe('toAddressCardViewModel', () => {
    it('transforms address to card view model with correct title', () => {
      const address = createMockAddress()
      const meters: Meter[] = []

      const result = toAddressCardViewModel(address, meters)

      expect(result.title).toBe('вул. Хрещатик, 22, кв. 15')
    })

    it('transforms address to card view model with correct subtitle', () => {
      const address = createMockAddress()
      const meters: Meter[] = []

      const result = toAddressCardViewModel(address, meters)

      expect(result.subtitle).toBe('Квартира | м. Київ, м. Київ')
    })

    it('includes addressType in view model', () => {
      const address = createMockAddress()
      const meters: Meter[] = []

      const result = toAddressCardViewModel(address, meters)

      expect(result.addressType).toEqual({
        name: 'Квартира',
        icon: 'apartment',
      })
    })

    it('includes primary badge when address is primary', () => {
      const address = createMockAddress({ isPrimary: true })
      const meters: Meter[] = []

      const result = toAddressCardViewModel(address, meters)

      expect(result.isPrimary).toBe(true)
      expect(result.badges[0]).toEqual({
        label: 'Основна адреса',
        variant: 'primary',
      })
    })

    it('includes "make primary" badge with icon when address is not primary', () => {
      const address = createMockAddress({ isPrimary: false })
      const meters: Meter[] = []

      const result = toAddressCardViewModel(address, meters)

      expect(result.isPrimary).toBe(false)
      expect(result.badges[0]).toEqual({
        label: 'Зробити основною',
        variant: 'outline',
        icon: Star,
      })
    })

    it('includes meter count badge for single meter', () => {
      const address = createMockAddress()
      const meters: Meter[] = [createMockMeter()]

      const result = toAddressCardViewModel(address, meters)

      expect(result.badges).toContainEqual({
        label: '1 лічильник',
        variant: 'muted',
      })
    })

    it('includes meter count badge for multiple meters', () => {
      const address = createMockAddress()
      const meters: Meter[] = [
        createMockMeter({ id: 1 }),
        createMockMeter({ id: 2 }),
        createMockMeter({ id: 3 }),
      ]

      const result = toAddressCardViewModel(address, meters)

      expect(result.badges).toContainEqual({
        label: '3 лічильників',
        variant: 'muted',
      })
    })

    it('includes meter count badge for zero meters', () => {
      const address = createMockAddress()
      const meters: Meter[] = []

      const result = toAddressCardViewModel(address, meters)

      expect(result.badges).toContainEqual({
        label: '0 лічильників',
        variant: 'muted',
      })
    })

    it('creates services from unique meter types', () => {
      const address = createMockAddress()
      const meters: Meter[] = [
        createMockMeter({ id: 1, utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' } }),
        createMockMeter({ id: 2, utilityType: { id: 1, slug: 'gas', displayName: 'Газ', unit: 'м³' } }),
        createMockMeter({ id: 3, utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' } }),
      ]

      const result = toAddressCardViewModel(address, meters)

      expect(result.services).toHaveLength(2)
      expect(result.services).toContainEqual({
        type: 'electricity',
        label: 'Електроенергія',
      })
      expect(result.services).toContainEqual({
        type: 'gas',
        label: 'Газ',
      })
    })

    it('returns empty services array when no meters', () => {
      const address = createMockAddress()
      const meters: Meter[] = []

      const result = toAddressCardViewModel(address, meters)

      expect(result.services).toEqual([])
    })

    it('includes all meter types with correct labels', () => {
      const address = createMockAddress()
      const meters: Meter[] = [
        createMockMeter({ id: 1, utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' } }),
        createMockMeter({ id: 2, utilityType: { id: 1, slug: 'gas', displayName: 'Газ', unit: 'м³' } }),
        createMockMeter({ id: 3, utilityType: { id: 3, slug: 'coldWater', displayName: 'Холодна вода', unit: 'м³' } }),
        createMockMeter({ id: 4, utilityType: { id: 4, slug: 'hotWater', displayName: 'Гаряча вода', unit: 'м³' } }),
        createMockMeter({ id: 5, utilityType: { id: 5, slug: 'heat', displayName: 'Опалення', unit: 'Гкал' } }),
      ]

      const result = toAddressCardViewModel(address, meters)

      expect(result.services).toHaveLength(5)
      const labels = result.services.map((s) => s.label)
      expect(labels).toContain('Електроенергія')
      expect(labels).toContain('Газ')
      expect(labels).toContain('Холодна вода')
      expect(labels).toContain('Гаряча вода')
      expect(labels).toContain('Опалення')
    })
  })

  describe('toAddressSelectViewModel', () => {
    it('transforms address to select option with correct label', () => {
      const address = createMockAddress()

      const result = toAddressSelectViewModel(address)

      expect(result.label).toBe('вул. Хрещатик, 22, кв. 15')
    })

    it('transforms address to select option with correct description', () => {
      const address = createMockAddress()

      const result = toAddressSelectViewModel(address)

      expect(result.description).toBe('Квартира | м. Київ, м. Київ')
    })

    it('preserves address id', () => {
      const address = createMockAddress({ id: 42 })

      const result = toAddressSelectViewModel(address)

      expect(result.id).toBe(42)
    })
  })

  describe('toAddressCardViewModels', () => {
    it('transforms array of addresses with their meters', () => {
      const addresses: Address[] = [
        createMockAddress({ id: 1 }),
        createMockAddress({ id: 2, street: 'вул. Грушевського' }),
      ]
      const metersMap = new Map<number, readonly Meter[]>([
        [1, [createMockMeter({ id: 1, addressId: 1 })]],
        [2, [createMockMeter({ id: 2, addressId: 2 })]],
      ])

      const result = toAddressCardViewModels(addresses, metersMap)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(2)
    })

    it('returns empty array for empty addresses', () => {
      const addresses: Address[] = []
      const metersMap = new Map<number, readonly Meter[]>()

      const result = toAddressCardViewModels(addresses, metersMap)

      expect(result).toEqual([])
    })

    it('handles addresses with no meters in map', () => {
      const addresses: Address[] = [createMockAddress({ id: 1 })]
      const metersMap = new Map<number, readonly Meter[]>()

      const result = toAddressCardViewModels(addresses, metersMap)

      expect(result).toHaveLength(1)
      expect(result[0].services).toEqual([])
    })

    it('preserves order of addresses', () => {
      const addresses: Address[] = [
        createMockAddress({ id: 3 }),
        createMockAddress({ id: 1 }),
        createMockAddress({ id: 2 }),
      ]
      const metersMap = new Map<number, readonly Meter[]>()

      const result = toAddressCardViewModels(addresses, metersMap)

      expect(result.map((a) => a.id)).toEqual([3, 1, 2])
    })
  })
})
