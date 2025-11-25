/**
 * Reading View Models and Mappers
 *
 * : AV :;NGV 0=3;V9AL:>N, C:@0W=AL:V B5:AB8 BV;L:8 2 label/name ?>;OE
 */

import type { Meter, Reading, Provider } from '../types/entities'
import type { MeterType } from '../constants/meterTypes'
import { METER_TYPE_TO_SERVICE_LABEL } from '../types/entities'
import { formatTariffLabel } from '../utils/providerTariffs'

// =============================================================================
// View Model Types
// =============================================================================

export interface MeterReadingDraftViewModel {
  readonly id: number
  readonly type: MeterType //  0=3;V9AL:>N
  readonly serviceName: string // ";5:B@>5=5@3VO" - C:@0W=AL:>N 4;O UI
  readonly meterLabel: string // "A=>2=89 B0@8D" - C:@0W=AL:>N
  readonly meterNumber: string
  readonly unit: string
  readonly previousValue: number
  readonly previousDate: string
  readonly currentValue: number
  readonly readingDate: string
  readonly tariffId: string
  readonly tariff: number
  readonly tariffLabel: string
  readonly tariffs: readonly TariffOptionViewModel[]
  readonly photo?: {
    fileName: string | null
    previewUrl: string | null
  }
}

export interface TariffOptionViewModel {
  readonly id: string
  readonly name: string
  readonly price: number
  readonly label: string
}

export interface MeterReadingSummaryRowViewModel {
  readonly id: number
  readonly type: MeterType //  0=3;V9AL:>N
  readonly serviceName: string // ";5:B@>5=5@3VO" - C:@0W=AL:>N
  readonly previousValue: number | null
  readonly currentValue: number | null
  readonly unit: string
  readonly tariffId: string
  readonly tariff: number
  readonly tariffLabel: string
}

export interface MeterReadingHistoryRecordViewModel {
  readonly id: number
  readonly submittedAt: string
  readonly serviceName: string // ";5:B@>5=5@3VO" - C:@0W=AL:>N
  readonly type: MeterType //  0=3;V9AL:>N
  readonly currentValue: number
  readonly consumption: number
  readonly tariff: number
  readonly cost: number
}

export interface AddressReadingsSnapshotViewModel {
  readonly addressId: number
  readonly meterDrafts: readonly MeterReadingDraftViewModel[]
  readonly summaryRows: readonly MeterReadingSummaryRowViewModel[]
}

const mapTariffs = (provider: Provider): TariffOptionViewModel[] => {
  return provider.tariffs.map((tariff) => ({
    id: tariff.id,
    name: tariff.name,
    price: tariff.price,
    label: `${tariff.name} · ${formatTariffLabel(tariff.price, provider.unitLabel)}`,
  }))
}

const resolveTariff = (provider: Provider, tariffId?: string) => {
  const tariffs = mapTariffs(provider)
  const selected = tariffs.find((tariff) => tariff.id === tariffId) ?? tariffs[0]

  return {
    tariffs,
    selected,
  }
}

// =============================================================================
// Mapper Functions
// =============================================================================

/**
 * Mapper: Meter + Reading + Provider � MeterReadingDraftViewModel
 */
export function toMeterReadingDraftViewModel(
  meter: Meter,
  latestReading: Reading | undefined,
  _previousReading: Reading | undefined,
  provider: Provider,
): MeterReadingDraftViewModel {
  const serviceName = METER_TYPE_TO_SERVICE_LABEL[meter.type]
  const { tariffs, selected } = resolveTariff(provider)

  return {
    id: meter.id,
    type: meter.type,
    serviceName,
    meterLabel: meter.name,
    meterNumber: meter.meterNumber,
    unit: provider.unitLabel.split('/')[1] || '>4',
    previousValue: latestReading?.value || 0,
    previousDate: latestReading?.date || new Date().toISOString().split('T')[0],
    currentValue: latestReading?.value || 0,
    readingDate: new Date().toISOString().split('T')[0],
    tariffId: selected?.id ?? '',
    tariff: selected?.price ?? 0,
    tariffLabel: selected?.label ?? provider.unitLabel,
    tariffs,
    photo: {
      fileName: null,
      previewUrl: null,
    },
  }
}

/**
 * Mapper: Meter + Reading + Provider � MeterReadingSummaryRowViewModel
 */
export function toMeterReadingSummaryRowViewModel(
  meter: Meter,
  latestReading: Reading | undefined,
  currentValue: number | null,
  provider: Provider,
  selectedTariffId?: string,
): MeterReadingSummaryRowViewModel {
  const serviceName = METER_TYPE_TO_SERVICE_LABEL[meter.type]
  const { selected } = resolveTariff(provider, selectedTariffId)
  const tariffPrice = selected?.price ?? 0

  return {
    id: meter.id,
    type: meter.type,
    serviceName,
    previousValue: latestReading?.value || null,
    currentValue,
    unit: provider.unitLabel.split('/')[1] || '>4',
    tariffId: selected?.id ?? '',
    tariff: tariffPrice,
    tariffLabel: selected?.label ?? provider.unitLabel,
  }
}

/**
 * Mapper: Reading + Meter + Provider � MeterReadingHistoryRecordViewModel
 */
export function toMeterReadingHistoryRecordViewModel(
  reading: Reading,
  meter: Meter,
  provider: Provider,
  tariffId?: string,
): MeterReadingHistoryRecordViewModel {
  const serviceName = METER_TYPE_TO_SERVICE_LABEL[meter.type]
  const consumption = reading.consumption || 0
  const { selected } = resolveTariff(provider, tariffId)
  const tariffPrice = selected?.price ?? 0
  const cost = consumption * tariffPrice

  return {
    id: reading.id,
    submittedAt: reading.submittedAt,
    serviceName,
    type: meter.type,
    currentValue: reading.value,
    consumption,
    tariff: tariffPrice,
    cost: Math.round(cost * 100) / 100,
  }
}

/**
 * Creates AddressReadingsSnapshotViewModel for entire address
 */
export function toAddressReadingsSnapshotViewModel(
  addressId: number,
  meters: readonly Meter[],
  readings: readonly Reading[],
  providers: readonly Provider[],
): AddressReadingsSnapshotViewModel {
  const meterDrafts: MeterReadingDraftViewModel[] = meters.map((meter) => {
    const provider = providers.find((p) => p.id === meter.providerId)
    if (!provider) {
      throw new Error(`Provider not found for meter ${meter.id}`)
    }

    const meterReadings = readings
      .filter((r) => r.meterId === meter.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return toMeterReadingDraftViewModel(
      meter,
      meterReadings[0],
      meterReadings[1],
      provider,
    )
  })

  const summaryRows: MeterReadingSummaryRowViewModel[] = meterDrafts.map((draft) => {
    const meter = meters.find((m) => m.id === draft.id)!
    const provider = providers.find((p) => p.id === meter.providerId)!
    const latestReading = readings
      .filter((r) => r.meterId === meter.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    return toMeterReadingSummaryRowViewModel(
      meter,
      latestReading,
      draft.currentValue,
      provider,
      draft.tariffId,
    )
  })

  return {
    addressId,
    meterDrafts,
    summaryRows,
  }
}
