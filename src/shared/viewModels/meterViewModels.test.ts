import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  toMeterDeviceViewModel,
  toMeterLatestReadingViewModel,
  toMeterHistoryRecordViewModel,
  formatMonthLabel,
  toMeterTypeGroupViewModel,
} from './meterViewModels'
import type { Meter, Reading, Provider } from '../types/entities'

function createMockMeter(overrides: Partial<Meter> = {}): Meter {
  return {
    id: 1,
    addressId: 1,
    utilityTypeId: 1,
    serialNumber: 'E-12345',
    name: 'Основний тариф',
    location: 'Щитова, коридор',
    installationDate: '2023-01-15',
    isActive: true,
    serviceProviderId: 1,
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z',
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
    tariffs: [{ id: 'day', name: 'Денний', price: 2.64 }],
    billingCycle: 'monthly',
    ...overrides,
  }
}

describe('meterViewModels', () => {
  describe('toMeterDeviceViewModel', () => {
    it('transforms meter to device view model', () => {
      const meter = createMockMeter()
      const provider = createMockProvider()

      const result = toMeterDeviceViewModel(meter, provider, 'Лютий 2025')

      expect(result.id).toBe(1)
      expect(result.name).toBe('Основний тариф')
      expect(result.meterNumber).toBe('E-12345')
      expect(result.location).toBe('Щитова, коридор')
      expect(result.installedAt).toBe('2023-01-15')
      expect(result.providerName).toBe('YASNO')
      expect(result.status).toBe('active')
      expect(result.lastSubmission).toBe('Лютий 2025')
      expect(result.nextCheckDate).toBeUndefined()
    })

    it('handles meter without optional fields', () => {
      const meter = createMockMeter({ location: null })
      const provider = createMockProvider()

      const result = toMeterDeviceViewModel(meter, provider, 'Лютий 2025')

      expect(result.location).toBe('')
      expect(result.nextCheckDate).toBeUndefined()
    })

    it('handles different meter statuses', () => {
      const provider = createMockProvider()

      const activeMeter = createMockMeter({ isActive: true })
      const inactiveMeter = createMockMeter({ isActive: false })

      expect(toMeterDeviceViewModel(activeMeter, provider, '').status).toBe('active')
      expect(toMeterDeviceViewModel(inactiveMeter, provider, '').status).toBe('inactive')
    })
  })

  describe('toMeterLatestReadingViewModel', () => {
    it('transforms reading to latest reading view model', () => {
      const reading = createMockReading({ readingValue: 1234, consumption: 56 })

      const result = toMeterLatestReadingViewModel(reading, 'Лютий 2025')

      expect(result.id).toBe(1)
      expect(result.monthLabel).toBe('Лютий 2025')
      expect(result.value).toBe(1234)
      expect(result.delta).toBe(56)
      expect(result.trend).toBe('up')
    })

    it('sets trend to up for positive consumption', () => {
      const reading = createMockReading({ consumption: 100 })

      const result = toMeterLatestReadingViewModel(reading, 'Січень 2025')

      expect(result.trend).toBe('up')
    })

    it('sets trend to up for zero consumption', () => {
      const reading = createMockReading({ consumption: 0 })

      const result = toMeterLatestReadingViewModel(reading, 'Січень 2025')

      expect(result.trend).toBe('up')
    })

    it('sets trend to down for negative consumption', () => {
      const reading = createMockReading({ consumption: -10 })

      const result = toMeterLatestReadingViewModel(reading, 'Січень 2025')

      expect(result.trend).toBe('down')
      expect(result.delta).toBe(10)
    })

    it('handles undefined consumption', () => {
      const reading = createMockReading({ consumption: undefined })

      const result = toMeterLatestReadingViewModel(reading, 'Січень 2025')

      expect(result.delta).toBe(0)
      expect(result.trend).toBe('up')
    })
  })

  describe('toMeterHistoryRecordViewModel', () => {
    it('transforms reading to history record view model', () => {
      const reading = createMockReading({
        readingValue: 1234,
        consumption: 56,
        createdAt: '2025-02-01T10:00:00Z',
        notes: 'Передано вчасно',
      })

      const result = toMeterHistoryRecordViewModel(reading, 'Лютий 2025')

      expect(result.id).toBe(1)
      expect(result.periodLabel).toBe('Лютий 2025')
      expect(result.submittedAt).toBe('2025-02-01T10:00:00Z')
      expect(result.value).toBe(1234)
      expect(result.consumption).toBe(56)
      expect(result.status).toBe('accepted')
      expect(result.note).toBe('Передано вчасно')
    })

    it('always returns accepted status', () => {
      const reading = createMockReading()

      const result = toMeterHistoryRecordViewModel(reading, 'Лютий 2025')

      expect(result.status).toBe('accepted')
    })

    it('handles undefined consumption', () => {
      const reading = createMockReading({ consumption: undefined })

      const result = toMeterHistoryRecordViewModel(reading, 'Лютий 2025')

      expect(result.consumption).toBe(0)
    })

    it('handles undefined notes', () => {
      const reading = createMockReading({ notes: undefined })

      const result = toMeterHistoryRecordViewModel(reading, 'Лютий 2025')

      expect(result.note).toBeUndefined()
    })
  })

  describe('formatMonthLabel', () => {
    it('formats January correctly', () => {
      expect(formatMonthLabel('2025-01-15')).toBe('Січень 2025')
    })

    it('formats February correctly', () => {
      expect(formatMonthLabel('2025-02-01')).toBe('Лютий 2025')
    })

    it('formats March correctly', () => {
      expect(formatMonthLabel('2025-03-20')).toBe('Березень 2025')
    })

    it('formats April correctly', () => {
      expect(formatMonthLabel('2025-04-10')).toBe('Квітень 2025')
    })

    it('formats May correctly', () => {
      expect(formatMonthLabel('2025-05-05')).toBe('Травень 2025')
    })

    it('formats June correctly', () => {
      expect(formatMonthLabel('2025-06-15')).toBe('Червень 2025')
    })

    it('formats July correctly', () => {
      expect(formatMonthLabel('2025-07-22')).toBe('Липень 2025')
    })

    it('formats August correctly', () => {
      expect(formatMonthLabel('2025-08-31')).toBe('Серпень 2025')
    })

    it('formats September correctly', () => {
      expect(formatMonthLabel('2025-09-01')).toBe('Вересень 2025')
    })

    it('formats October correctly', () => {
      expect(formatMonthLabel('2025-10-15')).toBe('Жовтень 2025')
    })

    it('formats November correctly', () => {
      expect(formatMonthLabel('2025-11-30')).toBe('Листопад 2025')
    })

    it('formats December correctly', () => {
      expect(formatMonthLabel('2025-12-25')).toBe('Грудень 2025')
    })

    it('handles ISO datetime strings', () => {
      expect(formatMonthLabel('2025-06-15T12:30:00Z')).toBe('Червень 2025')
    })
  })

  describe('toMeterTypeGroupViewModel', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-03-15'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('creates group view model with correct type and name', () => {
      const meters = [createMockMeter({ utilityTypeId: 1 })]
      const readings = [createMockReading()]
      const provider = createMockProvider()

      const result = toMeterTypeGroupViewModel('electricity', meters, readings, provider)

      expect(result.type).toBe('electricity')
      expect(result.typeName).toBe('Електроенергія')
    })

    it('creates meter devices from meters array', () => {
      const meters = [
        createMockMeter({ id: 1, name: 'Лічильник 1' }),
        createMockMeter({ id: 2, name: 'Лічильник 2' }),
      ]
      const readings = [
        createMockReading({ meterId: 1, readingDate: '2025-02-01' }),
        createMockReading({ meterId: 2, readingDate: '2025-01-15' }),
      ]
      const provider = createMockProvider()

      const result = toMeterTypeGroupViewModel('electricity', meters, readings, provider)

      expect(result.meters).toHaveLength(2)
      expect(result.meters[0].name).toBe('Лічильник 1')
      expect(result.meters[1].name).toBe('Лічильник 2')
    })

    it('sets correct lastSubmission for each meter', () => {
      const meters = [createMockMeter({ id: 1 })]
      const readings = [
        createMockReading({ meterId: 1, readingDate: '2025-02-15' }),
        createMockReading({ meterId: 1, readingDate: '2025-01-10' }),
      ]
      const provider = createMockProvider()

      const result = toMeterTypeGroupViewModel('electricity', meters, readings, provider)

      expect(result.meters[0].lastSubmission).toBe('Лютий 2025')
    })

    it('sets "Ще не передано" when meter has no readings', () => {
      const meters = [createMockMeter({ id: 1 })]
      const readings: Reading[] = []
      const provider = createMockProvider()

      const result = toMeterTypeGroupViewModel('electricity', meters, readings, provider)

      expect(result.meters[0].lastSubmission).toBe('Ще не передано')
    })

    it('creates latest readings from first 3 readings', () => {
      const meters = [createMockMeter()]
      const readings = [
        createMockReading({ id: 1, readingDate: '2025-03-01' }),
        createMockReading({ id: 2, readingDate: '2025-02-01' }),
        createMockReading({ id: 3, readingDate: '2025-01-01' }),
        createMockReading({ id: 4, readingDate: '2024-12-01' }),
      ]
      const provider = createMockProvider()

      const result = toMeterTypeGroupViewModel('electricity', meters, readings, provider)

      expect(result.latestReadings).toHaveLength(3)
      expect(result.latestReadings[0].id).toBe(1)
      expect(result.latestReadings[2].id).toBe(3)
    })

    it('creates history from first 3 readings', () => {
      const meters = [createMockMeter()]
      const readings = [
        createMockReading({ id: 1 }),
        createMockReading({ id: 2 }),
        createMockReading({ id: 3 }),
        createMockReading({ id: 4 }),
      ]
      const provider = createMockProvider()

      const result = toMeterTypeGroupViewModel('electricity', meters, readings, provider)

      expect(result.history).toHaveLength(3)
    })

    it('creates quick draft with current month label', () => {
      const meters = [createMockMeter({ id: 5 })]
      const readings = [createMockReading({ readingValue: 1000 })]
      const provider = createMockProvider({ unitLabel: 'грн/кВт·год' })

      const result = toMeterTypeGroupViewModel('electricity', meters, readings, provider)

      expect(result.quickDraft.meterId).toBe(5)
      expect(result.quickDraft.monthLabel).toBe('Березень 2025')
      expect(result.quickDraft.previousValue).toBe(1000)
      expect(result.quickDraft.unit).toBe('кВт·год')
    })

    it('sets previousValue to 0 when no readings', () => {
      const meters = [createMockMeter({ id: 5 })]
      const readings: Reading[] = []
      const provider = createMockProvider()

      const result = toMeterTypeGroupViewModel('electricity', meters, readings, provider)

      expect(result.quickDraft.previousValue).toBe(0)
    })

    it('handles empty meters array', () => {
      const meters: Meter[] = []
      const readings: Reading[] = []
      const provider = createMockProvider()

      const result = toMeterTypeGroupViewModel('electricity', meters, readings, provider)

      expect(result.meters).toEqual([])
      expect(result.quickDraft.meterId).toBe(0)
    })

    it('extracts correct unit from provider unitLabel', () => {
      const meters = [createMockMeter()]
      const readings: Reading[] = []
      const provider = createMockProvider({ unitLabel: 'грн/м³' })

      const result = toMeterTypeGroupViewModel('gas', meters, readings, provider)

      expect(result.quickDraft.unit).toBe('м³')
    })

    it('uses default unit when unitLabel has no separator', () => {
      const meters = [createMockMeter()]
      const readings: Reading[] = []
      const provider = createMockProvider({ unitLabel: 'грн' })

      const result = toMeterTypeGroupViewModel('gas', meters, readings, provider)

      expect(result.quickDraft.unit).toBe('од')
    })

    it('creates view model for gas type', () => {
      const meters = [createMockMeter({ utilityTypeId: 2 })]
      const readings: Reading[] = []
      const provider = createMockProvider({ serviceType: 'gas' })

      const result = toMeterTypeGroupViewModel('gas', meters, readings, provider)

      expect(result.type).toBe('gas')
      expect(result.typeName).toBe('Газ')
    })

    it('creates view model for coldWater type', () => {
      const meters = [createMockMeter({ utilityTypeId: 3 })]
      const readings: Reading[] = []
      const provider = createMockProvider({ serviceType: 'coldWater' })

      const result = toMeterTypeGroupViewModel('coldWater', meters, readings, provider)

      expect(result.type).toBe('coldWater')
      expect(result.typeName).toBe('Холодна вода')
    })

    it('creates view model for hotWater type', () => {
      const meters = [createMockMeter({ utilityTypeId: 4 })]
      const readings: Reading[] = []
      const provider = createMockProvider({ serviceType: 'hotWater' })

      const result = toMeterTypeGroupViewModel('hotWater', meters, readings, provider)

      expect(result.type).toBe('hotWater')
      expect(result.typeName).toBe('Гаряча вода')
    })

    it('creates view model for heat type', () => {
      const meters = [createMockMeter({ utilityTypeId: 5 })]
      const readings: Reading[] = []
      const provider = createMockProvider({ serviceType: 'heat' })

      const result = toMeterTypeGroupViewModel('heat', meters, readings, provider)

      expect(result.type).toBe('heat')
      expect(result.typeName).toBe('Опалення')
    })
  })
})
