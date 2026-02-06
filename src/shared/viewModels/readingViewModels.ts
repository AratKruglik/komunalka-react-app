/**
 * Reading View Models and Mappers
 */

import type { Meter, Reading, Provider } from '../types/entities'
import type { ApiServiceProvider } from '../types/api'
import type { MeterType } from '../constants/meterTypes'
import {
  METER_TYPE_TO_SERVICE_LABEL,
  UTILITY_TYPE_ID_TO_METER_TYPE,
} from '../types/entities'
import { METER_TYPE_UNITS } from '../constants/meterTypes'
import { formatTariffLabel, formatApiTariffLabel, getApiPrimaryTariff } from '../utils/providerTariffs'

type ProviderInput = Provider | ApiServiceProvider

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

function isApiProvider(provider: ProviderInput): provider is ApiServiceProvider {
  return 'addressId' in provider && 'tariffs' in provider && provider.tariffs.length > 0 && 'utilityTypeId' in provider.tariffs[0]
}

const mapTariffs = (provider: ProviderInput): TariffOptionViewModel[] => {
  if (isApiProvider(provider)) {
    return provider.tariffs.map((tariff) => {
      const displayName = tariff.notes || tariff.utilityTypeName
      const nameWithModel =
        tariff.pricingModel && tariff.pricingModel !== 'fixed'
          ? `${displayName} (${tariff.pricingModel})`
          : displayName

      return {
        id: String(tariff.id),
        name: nameWithModel,
        price: tariff.baseRate,
        label: `${nameWithModel} · ${formatApiTariffLabel(tariff)}`,
      }
    })
  }

  return provider.tariffs.map((tariff) => ({
    id: tariff.id,
    name: tariff.name,
    price: tariff.price,
    label: `${tariff.name} · ${formatTariffLabel(tariff.price, provider.unitLabel)}`,
  }))
}

const getProviderUnit = (provider: ProviderInput): string => {
  if (isApiProvider(provider)) {
    const tariff = getApiPrimaryTariff(provider)
    if (tariff) {
      const unitMap: Record<number, string> = {
        1: 'кВт·год',
        2: 'м³',
        3: 'м³',
        4: 'м³',
        5: 'Гкал',
      }
      return unitMap[tariff.utilityTypeId] ?? 'од'
    }
    return 'од'
  }
  return provider.unitLabel.split('/')[1] || 'од'
}

const resolveTariff = (provider: ProviderInput, tariffId?: string) => {
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
  provider: ProviderInput | undefined,
): MeterReadingDraftViewModel {
  const meterType = getMeterType(meter)
  const serviceName = METER_TYPE_TO_SERVICE_LABEL[meterType]
  const defaultUnit = METER_TYPE_UNITS[meterType] ?? 'од'

  if (!provider) {
    return {
      id: meter.id,
      type: meterType,
      serviceName,
      meterLabel: meter.name,
      meterNumber: meter.serialNumber,
      unit: defaultUnit,
      previousValue: latestReading?.readingValue || 0,
      previousDate: latestReading?.readingDate || new Date().toISOString().split('T')[0],
      currentValue: latestReading?.readingValue || 0,
      readingDate: new Date().toISOString().split('T')[0],
      tariffId: '',
      tariff: 0,
      tariffLabel: `0 грн/${defaultUnit}`,
      tariffs: [],
      photo: {
        fileName: null,
        previewUrl: null,
      },
    }
  }

  const { tariffs, selected } = resolveTariff(provider)
  const unit = getProviderUnit(provider)

  return {
    id: meter.id,
    type: meterType,
    serviceName,
    meterLabel: meter.name,
    meterNumber: meter.serialNumber,
    unit,
    previousValue: latestReading?.readingValue || 0,
    previousDate: latestReading?.readingDate || new Date().toISOString().split('T')[0],
    currentValue: latestReading?.readingValue || 0,
    readingDate: new Date().toISOString().split('T')[0],
    tariffId: selected?.id ?? '',
    tariff: selected?.price ?? 0,
    tariffLabel: selected?.label ?? `0 грн/${unit}`,
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
  provider: ProviderInput | undefined,
  selectedTariffId?: string,
): MeterReadingSummaryRowViewModel {
  const meterType = getMeterType(meter)
  const serviceName = METER_TYPE_TO_SERVICE_LABEL[meterType]
  const defaultUnit = METER_TYPE_UNITS[meterType] ?? 'од'

  if (!provider) {
    return {
      id: meter.id,
      type: meterType,
      serviceName,
      previousValue: latestReading?.readingValue || null,
      currentValue,
      unit: defaultUnit,
      tariffId: '',
      tariff: 0,
      tariffLabel: `0 грн/${defaultUnit}`,
    }
  }

  const { selected } = resolveTariff(provider, selectedTariffId)
  const tariffPrice = selected?.price ?? 0
  const unit = getProviderUnit(provider)

  return {
    id: meter.id,
    type: meterType,
    serviceName,
    previousValue: latestReading?.readingValue || null,
    currentValue,
    unit,
    tariffId: selected?.id ?? '',
    tariff: tariffPrice,
    tariffLabel: selected?.label ?? `0 грн/${unit}`,
  }
}

/**
 * Mapper: Reading + Meter + Provider -> MeterReadingHistoryRecordViewModel
 */
export function toMeterReadingHistoryRecordViewModel(
  reading: Reading,
  meter: Meter,
  provider: ProviderInput | undefined,
  tariffId?: string,
): MeterReadingHistoryRecordViewModel {
  const meterType = getMeterType(meter)
  const serviceName = METER_TYPE_TO_SERVICE_LABEL[meterType]
  const consumption = reading.consumption || 0

  if (!provider) {
    return {
      id: reading.id,
      submittedAt: reading.createdAt,
      serviceName,
      type: meterType,
      currentValue: reading.readingValue,
      consumption,
      tariff: 0,
      cost: 0,
    }
  }

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
 * Supports both legacy Provider type and new ApiServiceProvider type
 */
export function toAddressReadingsSnapshotViewModel(
  addressId: number,
  meters: readonly Meter[],
  readings: readonly Reading[],
  providers: readonly ProviderInput[],
): AddressReadingsSnapshotViewModel {
  const meterDrafts: MeterReadingDraftViewModel[] = meters.map((meter) => {
    const provider = providers.find((p) => p.id === meter.serviceProviderId)

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
    const provider = providers.find((p) => p.id === meter.serviceProviderId)
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
