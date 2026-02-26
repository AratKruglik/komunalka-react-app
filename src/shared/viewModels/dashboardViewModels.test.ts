import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  toServiceDataViewModel,
  toReadingViewModel,
  toPaymentReminderViewModel,
  toChartDataViewModel,
  toDashboardAddressOptionViewModel,
  toExpenseDistributionViewModel,
} from './dashboardViewModels'
import type { Address, Meter, Reading, Provider, Region, AddressType } from '../types/entities'

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

function createMockReading(overrides: Partial<Reading> = {}): Reading {
  return {
    id: 1,
    readingDate: '2025-02-01',
    readingValue: 1234,
    previousReadingValue: null,
    consumption: 100,
    notes: null,
    isEstimated: false,
    meter: { id: 1, serialNumber: 'E-12345' },
    tariff: null,
    photos: [],
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-02-01T10:00:00Z',
    ...overrides,
  }
}

function createMockProvider(overrides: Partial<Provider> = {}): Provider {
  return {
    id: 1,
    name: 'YASNO',
    serviceType: 'electricity',
    serviceLabel: 'Електроенергія',
    unitLabel: 'грн/кВт·год',
    tariffs: [{ id: 'day', name: 'Денний', price: 2.64 }],
    billingCycle: 'monthly',
    ...overrides,
  }
}

describe('dashboardViewModels', () => {
  describe('toServiceDataViewModel', () => {
    it('transforms meter data to service card format', () => {
      const meter = createMockMeter({ id: 5, utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' } })
      const provider = createMockProvider({
        unitLabel: 'грн/кВт·год',
        tariffs: [{ id: 'day', name: 'Денний', price: 2.64 }],
      })
      const latestReading = createMockReading({ consumption: 100 })

      const result = toServiceDataViewModel(meter, provider, latestReading, undefined)

      expect(result.id).toBe(5)
      expect(result.name).toBe('Електроенергія')
      expect(result.consumption).toBe(100)
      expect(result.unit).toBe('кВт·год')
      expect(result.rate).toBe(2.64)
    })

    it('calculates cost based on consumption and rate', () => {
      const meter = createMockMeter()
      const provider = createMockProvider({
        tariffs: [{ id: 'day', name: 'Денний', price: 2.5 }],
      })
      const latestReading = createMockReading({ consumption: 100 })

      const result = toServiceDataViewModel(meter, provider, latestReading, undefined)

      expect(result.cost).toBe(250)
    })

    it('rounds cost to 2 decimal places', () => {
      const meter = createMockMeter()
      const provider = createMockProvider({
        tariffs: [{ id: 'day', name: 'Денний', price: 2.64 }],
      })
      const latestReading = createMockReading({ consumption: 33 })

      const result = toServiceDataViewModel(meter, provider, latestReading, undefined)

      expect(result.cost).toBe(87.12)
    })

    it('calculates positive change percentage when consumption increased', () => {
      const meter = createMockMeter()
      const provider = createMockProvider()
      const latestReading = createMockReading({ consumption: 120 })
      const previousReading = createMockReading({ consumption: 100 })

      const result = toServiceDataViewModel(meter, provider, latestReading, previousReading)

      expect(result.change).toBe(20)
    })

    it('calculates negative change percentage when consumption decreased', () => {
      const meter = createMockMeter()
      const provider = createMockProvider()
      const latestReading = createMockReading({ consumption: 80 })
      const previousReading = createMockReading({ consumption: 100 })

      const result = toServiceDataViewModel(meter, provider, latestReading, previousReading)

      expect(result.change).toBe(-20)
    })

    it('sets change to 0 when no previous reading', () => {
      const meter = createMockMeter()
      const provider = createMockProvider()
      const latestReading = createMockReading({ consumption: 100 })

      const result = toServiceDataViewModel(meter, provider, latestReading, undefined)

      expect(result.change).toBe(0)
    })

    it('sets change to 0 when previous consumption is 0', () => {
      const meter = createMockMeter()
      const provider = createMockProvider()
      const latestReading = createMockReading({ consumption: 100 })
      const previousReading = createMockReading({ consumption: 0 })

      const result = toServiceDataViewModel(meter, provider, latestReading, previousReading)

      expect(result.change).toBe(0)
    })

    it('handles undefined latest reading', () => {
      const meter = createMockMeter()
      const provider = createMockProvider()

      const result = toServiceDataViewModel(meter, provider, undefined, undefined)

      expect(result.consumption).toBe(0)
      expect(result.cost).toBe(0)
      expect(result.change).toBe(0)
    })

    it('extracts unit from provider unitLabel', () => {
      const meter = createMockMeter()
      const provider = createMockProvider({ unitLabel: 'грн/м³' })

      const result = toServiceDataViewModel(meter, provider, undefined, undefined)

      expect(result.unit).toBe('м³')
    })

    it('uses default unit when provider unitLabel has no separator', () => {
      const meter = createMockMeter()
      const provider = createMockProvider({ unitLabel: 'грн' })

      const result = toServiceDataViewModel(meter, provider, undefined, undefined)

      expect(result.unit).toBe('од')
    })

    it('includes icon configuration from SERVICE_CONFIG', () => {
      const meter = createMockMeter({ utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' } })
      const provider = createMockProvider()

      const result = toServiceDataViewModel(meter, provider, undefined, undefined)

      expect(result.icon).toBeDefined()
      expect(result.iconBg).toContain('bg-sky')
      expect(result.iconColor).toContain('text-sky')
    })

    it('handles different meter types', () => {
      const provider = createMockProvider({ serviceType: 'gas' })

      const gasMeter = createMockMeter({ utilityType: { id: 1, slug: 'gas', displayName: 'Газ', unit: 'м³' } })
      const result = toServiceDataViewModel(gasMeter, provider, undefined, undefined)

      expect(result.name).toBe('Газ')
    })

    it('handles empty tariffs array with fallback to 0', () => {
      const meter = createMockMeter()
      const provider = createMockProvider({ tariffs: [] })
      const latestReading = createMockReading({ consumption: 100 })

      const result = toServiceDataViewModel(meter, provider, latestReading, undefined)

      expect(result.rate).toBe(0)
      expect(result.cost).toBe(0)
    })
  })

  describe('toReadingViewModel', () => {
    it('transforms reading to view model for table', () => {
      const reading = createMockReading({
        id: 10,
        readingDate: '2025-02-15',
        readingValue: 1500,
        consumption: 75,
      })
      const meter = createMockMeter({ id: 5, utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' } })
      const provider = createMockProvider({ unitLabel: 'грн/кВт·год' })

      const result = toReadingViewModel(reading, meter, provider)

      expect(result.id).toBe(10)
      expect(result.serviceId).toBe(5)
      expect(result.serviceName).toBe('Електроенергія')
      expect(result.date).toBe('2025-02-15')
      expect(result.value).toBe(1500)
      expect(result.unit).toBe('кВт·год')
      expect(result.difference).toBe(75)
    })

    it('includes service icon configuration', () => {
      const reading = createMockReading()
      const meter = createMockMeter({ utilityType: { id: 1, slug: 'gas', displayName: 'Газ', unit: 'м³' } })
      const provider = createMockProvider()

      const result = toReadingViewModel(reading, meter, provider)

      expect(result.serviceIcon).toBeDefined()
      expect(result.serviceIconBg).toContain('bg-amber')
      expect(result.serviceIconColor).toContain('text-amber')
    })

    it('handles undefined consumption', () => {
      const reading = createMockReading({ consumption: undefined })
      const meter = createMockMeter()
      const provider = createMockProvider()

      const result = toReadingViewModel(reading, meter, provider)

      expect(result.difference).toBe(0)
    })

    it('handles zero consumption', () => {
      const reading = createMockReading({ consumption: 0 })
      const meter = createMockMeter()
      const provider = createMockProvider()

      const result = toReadingViewModel(reading, meter, provider)

      expect(result.difference).toBe(0)
    })
  })

  describe('toPaymentReminderViewModel', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-03-15'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('creates payment reminder with high urgency for due in 3 days', () => {
      const provider = createMockProvider({
        tariffs: [{ id: 'day', name: 'Денний', price: 2.64 }],
      })
      const meter = createMockMeter({ utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' } })
      const latestReading = createMockReading({ consumption: 100 })

      const result = toPaymentReminderViewModel(provider, meter, latestReading, '2025-03-18')

      expect(result.urgency).toBe('high')
      expect(result.daysUntilDue).toBe(3)
    })

    it('creates payment reminder with high urgency for due in 5 days', () => {
      const provider = createMockProvider()
      const meter = createMockMeter()
      const latestReading = createMockReading({ consumption: 100 })

      const result = toPaymentReminderViewModel(provider, meter, latestReading, '2025-03-20')

      expect(result.urgency).toBe('high')
      expect(result.daysUntilDue).toBe(5)
    })

    it('creates payment reminder with medium urgency for due in 7 days', () => {
      const provider = createMockProvider()
      const meter = createMockMeter()
      const latestReading = createMockReading({ consumption: 100 })

      const result = toPaymentReminderViewModel(provider, meter, latestReading, '2025-03-22')

      expect(result.urgency).toBe('medium')
      expect(result.daysUntilDue).toBe(7)
    })

    it('creates payment reminder with medium urgency for due in 10 days', () => {
      const provider = createMockProvider()
      const meter = createMockMeter()
      const latestReading = createMockReading({ consumption: 100 })

      const result = toPaymentReminderViewModel(provider, meter, latestReading, '2025-03-25')

      expect(result.urgency).toBe('medium')
      expect(result.daysUntilDue).toBe(10)
    })

    it('creates payment reminder with low urgency for due in 15 days', () => {
      const provider = createMockProvider()
      const meter = createMockMeter()
      const latestReading = createMockReading({ consumption: 100 })

      const result = toPaymentReminderViewModel(provider, meter, latestReading, '2025-03-30')

      expect(result.urgency).toBe('low')
      expect(result.daysUntilDue).toBe(15)
    })

    it('calculates amount based on consumption and rate', () => {
      const provider = createMockProvider({
        tariffs: [{ id: 'day', name: 'Денний', price: 2.5 }],
      })
      const meter = createMockMeter()
      const latestReading = createMockReading({ consumption: 100 })

      const result = toPaymentReminderViewModel(provider, meter, latestReading, '2025-03-30')

      expect(result.amount).toBe(250)
    })

    it('rounds amount to 2 decimal places', () => {
      const provider = createMockProvider({
        tariffs: [{ id: 'day', name: 'Денний', price: 2.64 }],
      })
      const meter = createMockMeter()
      const latestReading = createMockReading({ consumption: 33 })

      const result = toPaymentReminderViewModel(provider, meter, latestReading, '2025-03-30')

      expect(result.amount).toBe(87.12)
    })

    it('handles undefined latest reading', () => {
      const provider = createMockProvider()
      const meter = createMockMeter()

      const result = toPaymentReminderViewModel(provider, meter, undefined, '2025-03-30')

      expect(result.amount).toBe(0)
    })

    it('includes meter type and service name', () => {
      const provider = createMockProvider()
      const meter = createMockMeter({ id: 5, utilityType: { id: 1, slug: 'gas', displayName: 'Газ', unit: 'м³' } })
      const latestReading = createMockReading()

      const result = toPaymentReminderViewModel(provider, meter, latestReading, '2025-03-30')

      expect(result.id).toBe(5)
      expect(result.type).toBe('gas')
      expect(result.serviceName).toBe('Газ')
    })

    it('handles overdue payments with negative days', () => {
      const provider = createMockProvider()
      const meter = createMockMeter()
      const latestReading = createMockReading()

      const result = toPaymentReminderViewModel(provider, meter, latestReading, '2025-03-10')

      expect(result.daysUntilDue).toBe(-5)
      expect(result.urgency).toBe('high')
    })
  })

  describe('toChartDataViewModel', () => {
    it('groups readings by month', () => {
      const readings: Reading[] = [
        createMockReading({ meter: { id: 1, serialNumber: 'E-12345' }, readingDate: '2025-01-15', consumption: 100 }),
        createMockReading({ meter: { id: 1, serialNumber: 'E-12345' }, readingDate: '2025-02-15', consumption: 120 }),
      ]
      const meters: Meter[] = [createMockMeter({ id: 1, utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' } })]

      const result = toChartDataViewModel(readings, meters)

      expect(result).toHaveLength(2)
    })

    it('aggregates consumption by meter type within month', () => {
      const readings: Reading[] = [
        createMockReading({ meter: { id: 1, serialNumber: 'E-12345' }, readingDate: '2025-01-15', consumption: 100 }),
        createMockReading({ meter: { id: 2, serialNumber: 'E-12346' }, readingDate: '2025-01-20', consumption: 50 }),
      ]
      const meters: Meter[] = [
        createMockMeter({ id: 1, utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' } }),
        createMockMeter({ id: 2, utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' } }),
      ]

      const result = toChartDataViewModel(readings, meters)

      expect(result).toHaveLength(1)
      expect(result[0].electricity).toBe(150)
    })

    it('creates separate values for different meter types', () => {
      const readings: Reading[] = [
        createMockReading({ meter: { id: 1, serialNumber: 'E-12345' }, readingDate: '2025-01-15', consumption: 100 }),
        createMockReading({ meter: { id: 2, serialNumber: 'G-12345' }, readingDate: '2025-01-15', consumption: 50 }),
      ]
      const meters: Meter[] = [
        createMockMeter({ id: 1, utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' } }),
        createMockMeter({ id: 2, utilityType: { id: 1, slug: 'gas', displayName: 'Газ', unit: 'м³' } }),
      ]

      const result = toChartDataViewModel(readings, meters)

      expect(result[0].electricity).toBe(100)
      expect(result[0].gas).toBe(50)
    })

    it('combines coldWater and hotWater into water total', () => {
      const readings: Reading[] = [
        createMockReading({ meter: { id: 1, serialNumber: 'CW-12345' }, readingDate: '2025-01-15', consumption: 5 }),
        createMockReading({ meter: { id: 2, serialNumber: 'HW-12345' }, readingDate: '2025-01-15', consumption: 3 }),
      ]
      const meters: Meter[] = [
        createMockMeter({ id: 1, utilityType: { id: 3, slug: 'coldWater', displayName: 'Холодна вода', unit: 'м³' } }),
        createMockMeter({ id: 2, utilityType: { id: 4, slug: 'hotWater', displayName: 'Гаряча вода', unit: 'м³' } }),
      ]

      const result = toChartDataViewModel(readings, meters)

      expect(result[0].coldWater).toBe(5)
      expect(result[0].hotWater).toBe(3)
      expect(result[0].water).toBe(8)
    })

    it('maps heat meter type to heating', () => {
      const readings: Reading[] = [
        createMockReading({ meter: { id: 1, serialNumber: 'H-12345' }, readingDate: '2025-01-15', consumption: 2.5 }),
      ]
      const meters: Meter[] = [createMockMeter({ id: 1, utilityType: { id: 5, slug: 'heat', displayName: 'Опалення', unit: 'Гкал' } })]

      const result = toChartDataViewModel(readings, meters)

      expect(result[0].heating).toBe(2.5)
    })

    it('returns empty array for no readings', () => {
      const readings: Reading[] = []
      const meters: Meter[] = []

      const result = toChartDataViewModel(readings, meters)

      expect(result).toEqual([])
    })

    it('skips readings without matching meter', () => {
      const readings: Reading[] = [createMockReading({ meter: { id: 999, serialNumber: 'X-999' }, consumption: 100 })]
      const meters: Meter[] = [createMockMeter({ id: 1 })]

      const result = toChartDataViewModel(readings, meters)

      expect(result).toEqual([])
    })

    it('handles undefined consumption', () => {
      const readings: Reading[] = [
        createMockReading({ meter: { id: 1, serialNumber: 'E-12345' }, readingDate: '2025-01-15', consumption: undefined }),
      ]
      const meters: Meter[] = [createMockMeter({ id: 1, utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' } })]

      const result = toChartDataViewModel(readings, meters)

      expect(result[0].electricity).toBe(0)
    })
  })

  describe('toDashboardAddressOptionViewModel', () => {
    it('transforms address to dropdown option', () => {
      const address = createMockAddress({
        id: 42,
        street: 'вул. Хрещатик',
        buildingNumber: '22',
        apartmentNumber: '15',
        city: 'Київ',
      })

      const result = toDashboardAddressOptionViewModel(address)

      expect(result.id).toBe(42)
      expect(result.label).toBe('вул. Хрещатик, 22, кв. 15')
      expect(result.description).toBe('м. Київ, м. Київ')
    })

    it('preserves address id', () => {
      const address = createMockAddress({ id: 123 })

      const result = toDashboardAddressOptionViewModel(address)

      expect(result.id).toBe(123)
    })
  })

  describe('toExpenseDistributionViewModel', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-03-15'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('calculates expenses by service type for 3 months period', () => {
      const readings: Reading[] = [
        createMockReading({ meter: { id: 1, serialNumber: 'E-12345' }, readingDate: '2025-02-01', consumption: 100 }),
        createMockReading({ meter: { id: 2, serialNumber: 'G-12345' }, readingDate: '2025-02-01', consumption: 50 }),
      ]
      const meters: Meter[] = [
        createMockMeter({ id: 1, serviceProvider: { id: 1, name: 'YASNO' }, utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' } }),
        createMockMeter({ id: 2, serviceProvider: { id: 2, name: 'GasProvider' }, utilityType: { id: 1, slug: 'gas', displayName: 'Газ', unit: 'м³' } }),
      ]
      const providers: Provider[] = [
        createMockProvider({
          id: 1,
          tariffs: [{ id: 'day', name: 'Денний', price: 2.64 }],
        }),
        createMockProvider({
          id: 2,
          serviceType: 'gas',
          tariffs: [{ id: 'single', name: 'Єдиний', price: 8.0 }],
        }),
      ]

      const result = toExpenseDistributionViewModel(readings, meters, providers, '3months')

      expect(result).toHaveLength(2)
      const electricity = result.find((item) => item.name === 'Електроенергія')
      const gas = result.find((item) => item.name === 'Газ')
      expect(electricity?.value).toBe(264)
      expect(gas?.value).toBe(400)
    })

    it('filters readings by 6 months period', () => {
      const readings: Reading[] = [
        createMockReading({ meter: { id: 1, serialNumber: 'E-12345' }, readingDate: '2025-02-01', consumption: 100 }),
        createMockReading({ meter: { id: 1, serialNumber: 'E-12345' }, readingDate: '2024-08-01', consumption: 100 }),
      ]
      const meters: Meter[] = [createMockMeter({ id: 1, serviceProvider: { id: 1, name: 'YASNO' }, utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' } })]
      const providers: Provider[] = [
        createMockProvider({
          id: 1,
          tariffs: [{ id: 'day', name: 'Денний', price: 2.64 }],
        }),
      ]

      const result = toExpenseDistributionViewModel(readings, meters, providers, '6months')

      expect(result[0].value).toBe(264)
    })

    it('filters readings by 1 year period', () => {
      const readings: Reading[] = [
        createMockReading({ meter: { id: 1, serialNumber: 'E-12345' }, readingDate: '2025-02-01', consumption: 100 }),
        createMockReading({ meter: { id: 1, serialNumber: 'E-12345' }, readingDate: '2024-05-01', consumption: 100 }),
        createMockReading({ meter: { id: 1, serialNumber: 'E-12345' }, readingDate: '2024-01-01', consumption: 100 }),
      ]
      const meters: Meter[] = [createMockMeter({ id: 1, serviceProvider: { id: 1, name: 'YASNO' }, utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' } })]
      const providers: Provider[] = [
        createMockProvider({
          id: 1,
          tariffs: [{ id: 'day', name: 'Денний', price: 2.64 }],
        }),
      ]

      const result = toExpenseDistributionViewModel(readings, meters, providers, '1year')

      expect(result[0].value).toBe(528)
    })

    it('rounds values to 2 decimal places', () => {
      const readings: Reading[] = [
        createMockReading({ meter: { id: 1, serialNumber: 'E-12345' }, readingDate: '2025-02-01', consumption: 33 }),
      ]
      const meters: Meter[] = [createMockMeter({ id: 1, serviceProvider: { id: 1, name: 'YASNO' }, utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' } })]
      const providers: Provider[] = [
        createMockProvider({
          id: 1,
          tariffs: [{ id: 'day', name: 'Денний', price: 2.64 }],
        }),
      ]

      const result = toExpenseDistributionViewModel(readings, meters, providers, '3months')

      expect(result[0].value).toBe(87.12)
    })

    it('includes chart color from SERVICE_CONFIG', () => {
      const readings: Reading[] = [
        createMockReading({ meter: { id: 1, serialNumber: 'E-12345' }, readingDate: '2025-02-01', consumption: 100 }),
      ]
      const meters: Meter[] = [createMockMeter({ id: 1, serviceProvider: { id: 1, name: 'YASNO' }, utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' } })]
      const providers: Provider[] = [createMockProvider({ id: 1 })]

      const result = toExpenseDistributionViewModel(readings, meters, providers, '3months')

      expect(result[0].color).toBe('#7DD3FC')
    })

    it('returns empty array when no readings in period', () => {
      const readings: Reading[] = [
        createMockReading({ meter: { id: 1, serialNumber: 'E-12345' }, readingDate: '2024-01-01', consumption: 100 }),
      ]
      const meters: Meter[] = [createMockMeter({ id: 1, serviceProvider: { id: 1, name: 'YASNO' } })]
      const providers: Provider[] = [createMockProvider({ id: 1 })]

      const result = toExpenseDistributionViewModel(readings, meters, providers, '3months')

      expect(result).toEqual([])
    })

    it('skips readings without matching meter', () => {
      const readings: Reading[] = [
        createMockReading({ meter: { id: 999, serialNumber: 'X-999' }, readingDate: '2025-02-01', consumption: 100 }),
      ]
      const meters: Meter[] = [createMockMeter({ id: 1, serviceProvider: { id: 1, name: 'YASNO' } })]
      const providers: Provider[] = [createMockProvider({ id: 1 })]

      const result = toExpenseDistributionViewModel(readings, meters, providers, '3months')

      expect(result).toEqual([])
    })

    it('skips readings without matching provider', () => {
      const readings: Reading[] = [
        createMockReading({ meter: { id: 1, serialNumber: 'E-12345' }, readingDate: '2025-02-01', consumption: 100 }),
      ]
      const meters: Meter[] = [createMockMeter({ id: 1, serviceProvider: { id: 999, name: 'Unknown' } })]
      const providers: Provider[] = [createMockProvider({ id: 1 })]

      const result = toExpenseDistributionViewModel(readings, meters, providers, '3months')

      expect(result).toEqual([])
    })

    it('handles undefined consumption', () => {
      const readings: Reading[] = [
        createMockReading({ meter: { id: 1, serialNumber: 'E-12345' }, readingDate: '2025-02-01', consumption: undefined }),
      ]
      const meters: Meter[] = [createMockMeter({ id: 1, serviceProvider: { id: 1, name: 'YASNO' } })]
      const providers: Provider[] = [createMockProvider({ id: 1 })]

      const result = toExpenseDistributionViewModel(readings, meters, providers, '3months')

      expect(result[0].value).toBe(0)
    })
  })
})
