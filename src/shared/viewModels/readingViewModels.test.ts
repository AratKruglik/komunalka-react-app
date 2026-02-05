import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  toMeterReadingDraftViewModel,
  toMeterReadingSummaryRowViewModel,
  toMeterReadingHistoryRecordViewModel,
  toAddressReadingsSnapshotViewModel,
} from './readingViewModels'
import type { Meter, Reading, Provider } from '../types/entities'

function createMockMeter(overrides: Partial<Meter> = {}): Meter {
  return {
    id: 1,
    addressId: 1,
    utilityTypeId: 1,
    serialNumber: 'E-12345',
    name: 'Основний тариф',
    location: 'Щитова',
    installationDate: '2023-01-01',
    isActive: true,
    serviceProviderId: 1,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    utilityTypeName: 'Електроенергія',
    ...overrides,
  }
}

function createMockReading(overrides: Partial<Reading> = {}): Reading {
  return {
    id: 1,
    meterId: 1,
    readingDate: '2025-02-01',
    readingValue: 1234,
    consumption: 56,
    isEstimated: false,
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-02-01T10:00:00Z',
    meterName: 'Основний тариф',
    utilityTypeName: 'Електроенергія',
    unit: 'кВт·год',
    photos: [],
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
    tariffs: [
      { id: 'day', name: 'Денний', price: 2.64 },
      { id: 'night', name: 'Нічний', price: 1.32 },
    ],
    billingCycle: 'monthly',
    ...overrides,
  }
}

describe('readingViewModels', () => {
  describe('toMeterReadingDraftViewModel', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-03-15'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('transforms meter to draft view model', () => {
      const meter = createMockMeter({ id: 5, name: 'Основний тариф', serialNumber: 'E-12345' })
      const latestReading = createMockReading({ readingValue: 1234 })
      const provider = createMockProvider()

      const result = toMeterReadingDraftViewModel(meter, latestReading, undefined, provider)

      expect(result.id).toBe(5)
      expect(result.type).toBe('electricity')
      expect(result.serviceName).toBe('Електроенергія')
      expect(result.meterLabel).toBe('Основний тариф')
      expect(result.meterNumber).toBe('E-12345')
    })

    it('extracts unit from provider unitLabel', () => {
      const meter = createMockMeter()
      const provider = createMockProvider({ unitLabel: 'грн/кВт·год' })

      const result = toMeterReadingDraftViewModel(meter, undefined, undefined, provider)

      expect(result.unit).toBe('кВт·год')
    })

    it('uses previous reading value', () => {
      const meter = createMockMeter()
      const latestReading = createMockReading({ readingValue: 1500, readingDate: '2025-02-15' })
      const provider = createMockProvider()

      const result = toMeterReadingDraftViewModel(meter, latestReading, undefined, provider)

      expect(result.previousValue).toBe(1500)
      expect(result.previousDate).toBe('2025-02-15')
      expect(result.currentValue).toBe(1500)
    })

    it('uses default values when no latest reading', () => {
      const meter = createMockMeter()
      const provider = createMockProvider()

      const result = toMeterReadingDraftViewModel(meter, undefined, undefined, provider)

      expect(result.previousValue).toBe(0)
      expect(result.previousDate).toBe('2025-03-15')
      expect(result.currentValue).toBe(0)
    })

    it('sets readingDate to current date', () => {
      const meter = createMockMeter()
      const provider = createMockProvider()

      const result = toMeterReadingDraftViewModel(meter, undefined, undefined, provider)

      expect(result.readingDate).toBe('2025-03-15')
    })

    it('selects first tariff from provider', () => {
      const meter = createMockMeter()
      const provider = createMockProvider({
        tariffs: [
          { id: 'day', name: 'Денний', price: 2.64 },
          { id: 'night', name: 'Нічний', price: 1.32 },
        ],
      })

      const result = toMeterReadingDraftViewModel(meter, undefined, undefined, provider)

      expect(result.tariffId).toBe('day')
      expect(result.tariff).toBe(2.64)
      expect(result.tariffLabel).toBe('Денний · 2.64 грн/кВт·год')
    })

    it('includes all tariffs as options', () => {
      const meter = createMockMeter()
      const provider = createMockProvider({
        tariffs: [
          { id: 'day', name: 'Денний', price: 2.64 },
          { id: 'night', name: 'Нічний', price: 1.32 },
        ],
      })

      const result = toMeterReadingDraftViewModel(meter, undefined, undefined, provider)

      expect(result.tariffs).toHaveLength(2)
      expect(result.tariffs[0]).toEqual({
        id: 'day',
        name: 'Денний',
        price: 2.64,
        label: 'Денний · 2.64 грн/кВт·год',
      })
      expect(result.tariffs[1]).toEqual({
        id: 'night',
        name: 'Нічний',
        price: 1.32,
        label: 'Нічний · 1.32 грн/кВт·год',
      })
    })

    it('initializes photo with null values', () => {
      const meter = createMockMeter()
      const provider = createMockProvider()

      const result = toMeterReadingDraftViewModel(meter, undefined, undefined, provider)

      expect(result.photo).toEqual({
        fileName: null,
        previewUrl: null,
      })
    })

    it('handles different meter types', () => {
      const provider = createMockProvider({ serviceType: 'gas', serviceLabel: 'Газ' })

      const gasMeter = createMockMeter({ utilityTypeId: 2 })
      const result = toMeterReadingDraftViewModel(gasMeter, undefined, undefined, provider)

      expect(result.type).toBe('gas')
      expect(result.serviceName).toBe('Газ')
    })

    it('uses fallback unit when provider unitLabel has no separator', () => {
      const meter = createMockMeter()
      const provider = createMockProvider({ unitLabel: 'грн' })

      const result = toMeterReadingDraftViewModel(meter, undefined, undefined, provider)

      expect(result.unit).toBe('од')
    })
  })

  describe('toMeterReadingSummaryRowViewModel', () => {
    it('transforms meter to summary row view model', () => {
      const meter = createMockMeter({ id: 3, utilityTypeId: 2 })
      const latestReading = createMockReading({ readingValue: 500 })
      const provider = createMockProvider({ unitLabel: 'грн/м³' })

      const result = toMeterReadingSummaryRowViewModel(meter, latestReading, 550, provider)

      expect(result.id).toBe(3)
      expect(result.type).toBe('gas')
      expect(result.serviceName).toBe('Газ')
      expect(result.previousValue).toBe(500)
      expect(result.currentValue).toBe(550)
      expect(result.unit).toBe('м³')
    })

    it('uses null for previousValue when no latest reading', () => {
      const meter = createMockMeter()
      const provider = createMockProvider()

      const result = toMeterReadingSummaryRowViewModel(meter, undefined, 100, provider)

      expect(result.previousValue).toBeNull()
    })

    it('accepts null currentValue', () => {
      const meter = createMockMeter()
      const provider = createMockProvider()

      const result = toMeterReadingSummaryRowViewModel(meter, undefined, null, provider)

      expect(result.currentValue).toBeNull()
    })

    it('selects tariff by id when provided', () => {
      const meter = createMockMeter()
      const provider = createMockProvider({
        tariffs: [
          { id: 'day', name: 'Денний', price: 2.64 },
          { id: 'night', name: 'Нічний', price: 1.32 },
        ],
      })

      const result = toMeterReadingSummaryRowViewModel(meter, undefined, 100, provider, 'night')

      expect(result.tariffId).toBe('night')
      expect(result.tariff).toBe(1.32)
      expect(result.tariffLabel).toBe('Нічний · 1.32 грн/кВт·год')
    })

    it('falls back to first tariff when tariffId not found', () => {
      const meter = createMockMeter()
      const provider = createMockProvider({
        tariffs: [{ id: 'day', name: 'Денний', price: 2.64 }],
      })

      const result = toMeterReadingSummaryRowViewModel(
        meter,
        undefined,
        100,
        provider,
        'nonexistent',
      )

      expect(result.tariffId).toBe('day')
      expect(result.tariff).toBe(2.64)
    })

    it('uses fallback unit when provider unitLabel has no separator', () => {
      const meter = createMockMeter()
      const provider = createMockProvider({ unitLabel: 'грн' })

      const result = toMeterReadingSummaryRowViewModel(meter, undefined, 100, provider)

      expect(result.unit).toBe('од')
    })
  })

  describe('toMeterReadingHistoryRecordViewModel', () => {
    it('transforms reading to history record view model', () => {
      const reading = createMockReading({
        id: 10,
        readingValue: 1500,
        consumption: 100,
        createdAt: '2025-02-15T14:30:00Z',
      })
      const meter = createMockMeter({ utilityTypeId: 1 })
      const provider = createMockProvider()

      const result = toMeterReadingHistoryRecordViewModel(reading, meter, provider)

      expect(result.id).toBe(10)
      expect(result.submittedAt).toBe('2025-02-15T14:30:00Z')
      expect(result.serviceName).toBe('Електроенергія')
      expect(result.type).toBe('electricity')
      expect(result.currentValue).toBe(1500)
      expect(result.consumption).toBe(100)
    })

    it('calculates cost based on consumption and tariff', () => {
      const reading = createMockReading({ consumption: 100 })
      const meter = createMockMeter()
      const provider = createMockProvider({
        tariffs: [{ id: 'day', name: 'Денний', price: 2.5 }],
      })

      const result = toMeterReadingHistoryRecordViewModel(reading, meter, provider)

      expect(result.tariff).toBe(2.5)
      expect(result.cost).toBe(250)
    })

    it('rounds cost to 2 decimal places', () => {
      const reading = createMockReading({ consumption: 33 })
      const meter = createMockMeter()
      const provider = createMockProvider({
        tariffs: [{ id: 'day', name: 'Денний', price: 2.64 }],
      })

      const result = toMeterReadingHistoryRecordViewModel(reading, meter, provider)

      expect(result.cost).toBe(87.12)
    })

    it('uses specific tariff when tariffId provided', () => {
      const reading = createMockReading({ consumption: 100 })
      const meter = createMockMeter()
      const provider = createMockProvider({
        tariffs: [
          { id: 'day', name: 'Денний', price: 2.64 },
          { id: 'night', name: 'Нічний', price: 1.32 },
        ],
      })

      const result = toMeterReadingHistoryRecordViewModel(reading, meter, provider, 'night')

      expect(result.tariff).toBe(1.32)
      expect(result.cost).toBe(132)
    })

    it('handles undefined consumption', () => {
      const reading = createMockReading({ consumption: undefined })
      const meter = createMockMeter()
      const provider = createMockProvider()

      const result = toMeterReadingHistoryRecordViewModel(reading, meter, provider)

      expect(result.consumption).toBe(0)
      expect(result.cost).toBe(0)
    })

    it('handles zero consumption', () => {
      const reading = createMockReading({ consumption: 0 })
      const meter = createMockMeter()
      const provider = createMockProvider({
        tariffs: [{ id: 'day', name: 'Денний', price: 2.64 }],
      })

      const result = toMeterReadingHistoryRecordViewModel(reading, meter, provider)

      expect(result.consumption).toBe(0)
      expect(result.cost).toBe(0)
    })
  })

  describe('toAddressReadingsSnapshotViewModel', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-03-15'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('creates snapshot view model with address id', () => {
      const meters = [createMockMeter({ id: 1, serviceProviderId: 1 })]
      const readings = [createMockReading({ meterId: 1 })]
      const providers = [createMockProvider({ id: 1 })]

      const result = toAddressReadingsSnapshotViewModel(42, meters, readings, providers)

      expect(result.addressId).toBe(42)
    })

    it('creates meter drafts for each meter', () => {
      const meters = [
        createMockMeter({ id: 1, serviceProviderId: 1 }),
        createMockMeter({ id: 2, serviceProviderId: 1, utilityTypeId: 2 }),
      ]
      const readings: Reading[] = []
      const providers = [createMockProvider({ id: 1 })]

      const result = toAddressReadingsSnapshotViewModel(1, meters, readings, providers)

      expect(result.meterDrafts).toHaveLength(2)
      expect(result.meterDrafts[0].id).toBe(1)
      expect(result.meterDrafts[1].id).toBe(2)
    })

    it('creates summary rows for each meter', () => {
      const meters = [
        createMockMeter({ id: 1, serviceProviderId: 1 }),
        createMockMeter({ id: 2, serviceProviderId: 1 }),
      ]
      const readings: Reading[] = []
      const providers = [createMockProvider({ id: 1 })]

      const result = toAddressReadingsSnapshotViewModel(1, meters, readings, providers)

      expect(result.summaryRows).toHaveLength(2)
    })

    it('uses latest reading for each meter', () => {
      const meters = [createMockMeter({ id: 1, serviceProviderId: 1 })]
      const readings = [
        createMockReading({ id: 1, meterId: 1, readingDate: '2025-01-01', readingValue: 100 }),
        createMockReading({ id: 2, meterId: 1, readingDate: '2025-02-01', readingValue: 150 }),
        createMockReading({ id: 3, meterId: 1, readingDate: '2025-03-01', readingValue: 200 }),
      ]
      const providers = [createMockProvider({ id: 1 })]

      const result = toAddressReadingsSnapshotViewModel(1, meters, readings, providers)

      expect(result.meterDrafts[0].previousValue).toBe(200)
    })

    it('throws error when provider not found for meter', () => {
      const meters = [createMockMeter({ id: 1, serviceProviderId: 999 })]
      const readings: Reading[] = []
      const providers = [createMockProvider({ id: 1 })]

      expect(() => toAddressReadingsSnapshotViewModel(1, meters, readings, providers)).toThrow(
        'Provider not found for meter 1',
      )
    })

    it('handles empty meters array', () => {
      const meters: Meter[] = []
      const readings: Reading[] = []
      const providers: Provider[] = []

      const result = toAddressReadingsSnapshotViewModel(1, meters, readings, providers)

      expect(result.meterDrafts).toEqual([])
      expect(result.summaryRows).toEqual([])
    })

    it('filters readings by meter id', () => {
      const meters = [
        createMockMeter({ id: 1, serviceProviderId: 1 }),
        createMockMeter({ id: 2, serviceProviderId: 1 }),
      ]
      const readings = [
        createMockReading({ meterId: 1, readingValue: 100, readingDate: '2025-01-01' }),
        createMockReading({ meterId: 2, readingValue: 200, readingDate: '2025-02-01' }),
        createMockReading({ meterId: 1, readingValue: 150, readingDate: '2025-02-15' }),
      ]
      const providers = [createMockProvider({ id: 1 })]

      const result = toAddressReadingsSnapshotViewModel(1, meters, readings, providers)

      expect(result.meterDrafts[0].previousValue).toBe(150)
      expect(result.meterDrafts[1].previousValue).toBe(200)
    })
  })
})
