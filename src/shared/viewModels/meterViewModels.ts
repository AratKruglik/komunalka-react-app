/**
 * Meter View Models and Mappers
 *
 * ВАЖЛИВО: Всі ключі англійською, українські тексти тільки в label/name полях
 */

import type { Meter, Reading, Provider } from '../types/entities'
import type { MeterType } from '../constants/meterTypes'
import { METER_TYPE_TO_SERVICE_LABEL } from '../types/entities'

// =============================================================================
// View Model Types
// =============================================================================

export type MeterStatusType = 'active' | 'maintenance' | 'pending' | 'inactive'
export type ReadingStatusType = 'accepted' | 'processing' | 'error'

export interface MeterDeviceViewModel {
  readonly id: number
  readonly name: string // "Основний тариф" - українською для UI
  readonly meterNumber: string
  readonly location: string // "Щитова, коридор" - українською
  readonly installedAt: string
  readonly providerName: string // "YASNO" - назва провайдера
  readonly status: MeterStatusType
  readonly lastSubmission: string
  readonly nextCheckDate?: string
}

export interface MeterLatestReadingViewModel {
  readonly id: number
  readonly monthLabel: string // "Лютий 2025" - українською
  readonly value: number
  readonly delta: number
  readonly trend: 'up' | 'down'
}

export interface MeterHistoryRecordViewModel {
  readonly id: number
  readonly periodLabel: string // "Лютий 2025" - українською
  readonly submittedAt: string
  readonly value: number
  readonly consumption: number
  readonly status: ReadingStatusType
  readonly note?: string
}

export interface MeterQuickDraftViewModel {
  readonly meterId: number
  readonly monthLabel: string // "Березень 2025" - українською
  readonly previousValue: number
  readonly unit: string
}

export interface MeterTypeGroupViewModel {
  readonly type: MeterType // англійською: 'electricity', 'gas', etc.
  readonly typeName: string // "Електроенергія" - українською для UI
  readonly meters: readonly MeterDeviceViewModel[]
  readonly latestReadings: readonly MeterLatestReadingViewModel[]
  readonly quickDraft: MeterQuickDraftViewModel
  readonly history: readonly MeterHistoryRecordViewModel[]
}

export interface AddressMetersSummaryViewModel {
  readonly totalMeters: number
  readonly activeMeters: number
  readonly pendingReadings: number
}

export interface AddressMetersSnapshotViewModel {
  readonly addressId: number
  readonly summary: AddressMetersSummaryViewModel
  readonly groups: Readonly<Partial<Record<MeterType, MeterTypeGroupViewModel>>>
}

// =============================================================================
// Mapper Functions
// =============================================================================

/**
 * Mapper: Meter + Provider → MeterDeviceViewModel
 */
export function toMeterDeviceViewModel(
  meter: Meter,
  provider: Provider,
  lastSubmission: string,
): MeterDeviceViewModel {
  return {
    id: meter.id,
    name: meter.name,
    meterNumber: meter.meterNumber,
    location: meter.location,
    installedAt: meter.installedAt,
    providerName: provider.name,
    status: meter.status,
    lastSubmission,
    nextCheckDate: meter.nextCheckDate,
  }
}

/**
 * Mapper: Reading → MeterLatestReadingViewModel
 */
export function toMeterLatestReadingViewModel(
  reading: Reading,
  monthLabel: string,
): MeterLatestReadingViewModel {
  const trend: 'up' | 'down' = (reading.consumption || 0) >= 0 ? 'up' : 'down'

  return {
    id: reading.id,
    monthLabel,
    value: reading.value,
    delta: Math.abs(reading.consumption || 0),
    trend,
  }
}

/**
 * Mapper: Reading → MeterHistoryRecordViewModel
 */
export function toMeterHistoryRecordViewModel(
  reading: Reading,
  periodLabel: string,
): MeterHistoryRecordViewModel {
  let status: ReadingStatusType = 'accepted'
  if (reading.status === 'processing') status = 'processing'
  if (reading.status === 'rejected') status = 'error'

  return {
    id: reading.id,
    periodLabel,
    submittedAt: reading.submittedAt,
    value: reading.value,
    consumption: reading.consumption || 0,
    status,
    note: reading.note,
  }
}

/**
 * Helper: Format date to Ukrainian month label
 */
export function formatMonthLabel(dateString: string): string {
  const date = new Date(dateString)
  const months = [
    'Січень',
    'Лютий',
    'Березень',
    'Квітень',
    'Травень',
    'Червень',
    'Липень',
    'Серпень',
    'Вересень',
    'Жовтень',
    'Листопад',
    'Грудень',
  ]
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * Створює MeterTypeGroupViewModel з meters та readings
 */
export function toMeterTypeGroupViewModel(
  type: MeterType,
  meters: readonly Meter[],
  readings: readonly Reading[],
  provider: Provider,
): MeterTypeGroupViewModel {
  const typeName = METER_TYPE_TO_SERVICE_LABEL[type]

  // Mapper для devices
  const meterDevices = meters.map((meter) => {
    const lastReading = readings
      .filter((r) => r.meterId === meter.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    const lastSubmission = lastReading
      ? formatMonthLabel(lastReading.date)
      : 'Ще не передано'

    return toMeterDeviceViewModel(meter, provider, lastSubmission)
  })

  // Latest readings (останні 3 місяці)
  const latestReadings = readings
    .slice(0, 3)
    .map((r) => toMeterLatestReadingViewModel(r, formatMonthLabel(r.date)))

  // History (останні 3 записи)
  const history = readings
    .slice(0, 3)
    .map((r) => toMeterHistoryRecordViewModel(r, formatMonthLabel(r.date)))

  // Quick draft
  const previousReading = readings[0]
  const quickDraft: MeterQuickDraftViewModel = {
    meterId: meters[0]?.id || 0,
    monthLabel: formatMonthLabel(new Date().toISOString()),
    previousValue: previousReading?.value || 0,
    unit: provider.unitLabel.split('/')[1] || 'од',
  }

  return {
    type,
    typeName,
    meters: meterDevices,
    latestReadings,
    quickDraft,
    history,
  }
}

/**
 * Створює AddressMetersSnapshotViewModel з meters та readings
 * Групує лічильники за типом і формує viewModel для UI
 */
export function toAddressMetersSnapshotViewModel(
  addressId: number,
  meters: readonly Meter[],
  readings: readonly Reading[],
  providers: readonly Provider[],
): AddressMetersSnapshotViewModel {
  // Групуємо лічильники за типом
  const metersByType = meters.reduce(
    (acc, meter) => {
      if (!acc[meter.type]) {
        acc[meter.type] = []
      }
      acc[meter.type].push(meter)
      return acc
    },
    {} as Record<MeterType, Meter[]>,
  )

  // Створюємо groups
  const groups: Partial<Record<MeterType, MeterTypeGroupViewModel>> = {}

  for (const [type, typeMeters] of Object.entries(metersByType)) {
    const meterType = type as MeterType

    // Отримуємо readings для цих лічильників
    const meterIds = typeMeters.map((m) => m.id)
    const typeReadings = readings
      .filter((r) => meterIds.includes(r.meterId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Знаходимо провайдера
    const provider = providers.find((p) => p.id === typeMeters[0]?.providerId)
    if (!provider) continue

    groups[meterType] = toMeterTypeGroupViewModel(
      meterType,
      typeMeters,
      typeReadings,
      provider,
    )
  }

  // Рахуємо summary
  const activeMeters = meters.filter((m) => m.status === 'active').length
  const pendingReadings = readings.filter((r) => r.status === 'processing').length

  return {
    addressId,
    summary: {
      totalMeters: meters.length,
      activeMeters,
      pendingReadings,
    },
    groups,
  }
}
