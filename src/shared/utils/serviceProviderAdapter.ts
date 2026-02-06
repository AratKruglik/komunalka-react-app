/**
 * Adapter functions for mapping between API types and legacy UI types
 * Provides backward compatibility during migration to new API structure
 */

import type { ApiServiceProvider, ApiTariff, ApiUtilityType } from '../types/api'
import type { Provider, ServiceLabel } from '../types/entities'
import type { ProviderTariff } from '../types/providers'
import type { MeterType } from '../constants/meterTypes'
import { UTILITY_TYPE_ID_TO_METER_TYPE, METER_TYPE_TO_SERVICE_LABEL } from '../types/entities'

// =============================================================================
// Utility Type Mapping
// =============================================================================

const UTILITY_SLUG_TO_METER_TYPE: Record<string, MeterType> = {
  electricity: 'electricity',
  gas: 'gas',
  cold_water: 'coldWater',
  coldwater: 'coldWater',
  hot_water: 'hotWater',
  hotwater: 'hotWater',
  heat: 'heat',
  heating: 'heat',
}

export function utilityTypeToMeterType(utilityType: ApiUtilityType): MeterType {
  return UTILITY_SLUG_TO_METER_TYPE[utilityType.slug] ?? 'electricity'
}

export function utilityTypeIdToMeterType(utilityTypeId: number): MeterType {
  return UTILITY_TYPE_ID_TO_METER_TYPE[utilityTypeId] ?? 'electricity'
}

export function meterTypeToServiceLabel(meterType: MeterType): ServiceLabel {
  return METER_TYPE_TO_SERVICE_LABEL[meterType]
}

// =============================================================================
// Tariff Adapters
// =============================================================================

export function adaptApiTariffToLegacy(tariff: ApiTariff): ProviderTariff {
  return {
    id: String(tariff.id),
    name: tariff.name,
    price: tariff.baseRate,
  }
}

export function formatApiTariffLabel(tariff: ApiTariff): string {
  const price = tariff.baseRate.toFixed(2)
  const symbol = tariff.currencySymbol
  const unit = getUnitForUtilityType(tariff.utilityTypeId)
  return `${price} ${symbol}/${unit}`
}

function getUnitForUtilityType(utilityTypeId: number): string {
  const units: Record<number, string> = {
    1: 'кВт·год',
    2: 'м³',
    3: 'м³',
    4: 'м³',
    5: 'Гкал',
  }
  return units[utilityTypeId] ?? 'од'
}

// =============================================================================
// Service Provider Adapters
// =============================================================================

export function adaptApiProviderToLegacy(apiProvider: ApiServiceProvider): Provider {
  const primaryTariff = apiProvider.tariffs[0]
  const utilityTypeId = primaryTariff?.utilityTypeId ?? 1
  const meterType = utilityTypeIdToMeterType(utilityTypeId)
  const serviceLabel = meterTypeToServiceLabel(meterType)
  const unit = getUnitForUtilityType(utilityTypeId)

  return {
    id: apiProvider.id,
    name: apiProvider.name,
    serviceType: meterType,
    serviceLabel: serviceLabel,
    unitLabel: unit,
    tariffs: apiProvider.tariffs.map(adaptApiTariffToLegacy),
    billingCycle: 'monthly',
    supportPhone: apiProvider.phone ?? undefined,
    supportEmail: apiProvider.email ?? undefined,
    website: apiProvider.website ?? undefined,
    description: apiProvider.description ?? undefined,
  }
}

export function adaptApiProvidersToLegacy(apiProviders: ApiServiceProvider[]): Provider[] {
  return apiProviders.map(adaptApiProviderToLegacy)
}

// =============================================================================
// Utility Functions for API Providers
// =============================================================================

export function getPrimaryTariffFromApiProvider(
  provider: ApiServiceProvider
): ApiTariff | undefined {
  return provider.tariffs[0]
}

export function getActiveTariff(
  provider: ApiServiceProvider,
  date: Date = new Date()
): ApiTariff | undefined {
  const dateStr = date.toISOString()

  return provider.tariffs.find((tariff) => {
    const isAfterStart = tariff.effectiveFrom <= dateStr
    const isBeforeEnd = !tariff.effectiveTo || tariff.effectiveTo >= dateStr
    return isAfterStart && isBeforeEnd
  })
}

export function calculateCost(consumption: number, tariff: ApiTariff): number {
  const consumptionCost = consumption * tariff.baseRate
  const serviceFee = tariff.serviceFee
  return consumptionCost + serviceFee
}
