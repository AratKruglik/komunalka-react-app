/**
 * Reading View Models and Mappers
 */

import type { Meter, Reading, Provider } from '../types/entities'
import type { MeterType } from '../constants/meterTypes'
import {
  METER_TYPE_TO_SERVICE_LABEL,
  UTILITY_TYPE_ID_TO_METER_TYPE,
} from '../types/entities'
import { formatTariffLabel } from '../utils/providerTariffs'

function getMeterType(meter: Meter): MeterType {
  return UTILITY_TYPE_ID_TO_METER_TYPE[meter.utilityTypeId] ?? 'electricity'
}

// =============================================================================
// View Model Types
// =============================================================================

export interface MeterReadingDraftViewModel {
  readonly id: number
  readonly type: MeterType
  readonly serviceName: string
  readonly meterLabel: string
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
  readonly type: MeterType
  readonly serviceName: string
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
  readonly serviceName: string
  readonly type: MeterType
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
 * Mapper: Meter + Reading + Provider -> MeterReadingDraftViewModel
 */
export function toMeterReadingDraftViewModel(
  meter: Meter,
  latestReading: Reading | undefined,
  _previousReading: Reading | undefined,
  provider: Provider,
): MeterReadingDraftViewModel {
  const meterType = getMeterType(meter)
  const serviceName = METER_TYPE_TO_SERVICE_LABEL[meterType]
  const { tariffs, selected } = resolveTariff(provider)

  return {
    id: meter.id,
    type: meterType,
    serviceName,
    meterLabel: meter.name,
    meterNumber: meter.serialNumber,
    unit: provider.unitLabel.split('/')[1] || 'од',
    previousValue: latestReading?.readingValue || 0,
    previousDate: latestReading?.readingDate || new Date().toISOString().split('T')[0],
    currentValue: latestReading?.readingValue || 0,
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
 * Mapper: Meter + Reading + Provider -> MeterReadingSummaryRowViewModel
 */
export function toMeterReadingSummaryRowViewModel(
  meter: Meter,
  latestReading: Reading | undefined,
  currentValue: number | null,
  provider: Provider,
  selectedTariffId?: string,
): MeterReadingSummaryRowViewModel {
  const meterType = getMeterType(meter)
  const serviceName = METER_TYPE_TO_SERVICE_LABEL[meterType]
  const { selected } = resolveTariff(provider, selectedTariffId)
  const tariffPrice = selected?.price ?? 0

  return {
    id: meter.id,
    type: meterType,
    serviceName,
    previousValue: latestReading?.readingValue || null,
    currentValue,
    unit: provider.unitLabel.split('/')[1] || 'од',
    tariffId: selected?.id ?? '',
    tariff: tariffPrice,
    tariffLabel: selected?.label ?? provider.unitLabel,
  }
}

/**
 * Mapper: Reading + Meter + Provider -> MeterReadingHistoryRecordViewModel
 */
export function toMeterReadingHistoryRecordViewModel(
  reading: Reading,
  meter: Meter,
  provider: Provider,
  tariffId?: string,
): MeterReadingHistoryRecordViewModel {
  const meterType = getMeterType(meter)
  const serviceName = METER_TYPE_TO_SERVICE_LABEL[meterType]
  const consumption = reading.consumption || 0
  const { selected } = resolveTariff(provider, tariffId)
  const tariffPrice = selected?.price ?? 0
  const cost = consumption * tariffPrice

  return {
    id: reading.id,
    submittedAt: reading.createdAt,
    serviceName,
    type: meterType,
    currentValue: reading.readingValue,
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
    const provider = providers.find((p) => p.id === meter.serviceProviderId)
    if (!provider) {
      throw new Error(`Provider not found for meter ${meter.id}`)
    }

    const meterReadings = readings
      .filter((r) => r.meterId === meter.id)
      .sort(
        (a, b) =>
          new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime(),
      )

    return toMeterReadingDraftViewModel(meter, meterReadings[0], meterReadings[1], provider)
  })

  const summaryRows: MeterReadingSummaryRowViewModel[] = meterDrafts.map((draft) => {
    const meter = meters.find((m) => m.id === draft.id)!
    const provider = providers.find((p) => p.id === meter.serviceProviderId)!
    const latestReading = readings
      .filter((r) => r.meterId === meter.id)
      .sort(
        (a, b) =>
          new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime(),
      )[0]

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
