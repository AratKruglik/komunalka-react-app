import type { Provider } from '../types/entities'
import type { ApiServiceProvider, ApiTariff } from '../types/api'

export const getPrimaryTariff = (provider: Provider) => {
  return provider.tariffs[0]
}

export const formatTariffLabel = (tariffPrice: number, unitLabel: string) => {
  return `${tariffPrice.toFixed(2)} ${unitLabel}`
}

/**
 * Get primary tariff from API service provider
 */
export const getApiPrimaryTariff = (provider: ApiServiceProvider): ApiTariff | undefined => {
  return provider.tariffs[0]
}

/**
 * Format API tariff as display label (e.g., "2.64 ₴/кВт·год")
 */
export const formatApiTariffLabel = (tariff: ApiTariff, unit?: string): string => {
  const price = tariff.baseRate.toFixed(2)
  const symbol = tariff.currencySymbol
  const displayUnit = unit ?? getUnitByUtilityTypeId(tariff.utilityTypeId)
  return `${price} ${symbol}/${displayUnit}`
}

/**
 * Get unit string by utility type ID
 */
const getUnitByUtilityTypeId = (utilityTypeId: number): string => {
  const units: Record<number, string> = {
    1: 'кВт·год',
    2: 'м³',
    3: 'м³',
    4: 'м³',
    5: 'Гкал',
  }
  return units[utilityTypeId] ?? 'од'
}
