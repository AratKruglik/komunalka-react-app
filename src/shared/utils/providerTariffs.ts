import type { Provider } from '../types/entities'

export const getPrimaryTariff = (provider: Provider) => {
  return provider.tariffs[0]
}

export const formatTariffLabel = (tariffPrice: number, unitLabel: string) => {
  return `${tariffPrice.toFixed(2)} ${unitLabel}`
}
