/**
 * View Models для модуля Dashboard
 * Mapper функції для трансформації entity → view model
 */

import type { Address, Meter, Reading, Provider } from '../types/entities'
import type { MeterType } from '../constants/meterTypes'
import { METER_TYPE_TO_SERVICE_LABEL } from '../types/entities'
import { SERVICE_CONFIG } from '../constants/services'
import type { LucideIcon } from 'lucide-react'
import { getPrimaryTariff } from '../utils/providerTariffs'

// =============================================================================
// View Model Types
// =============================================================================

export interface ServiceDataViewModel {
  readonly id: number
  readonly name: string
  readonly icon: LucideIcon
  readonly iconBg: string
  readonly iconColor: string
  readonly cost: number
  readonly consumption: number
  readonly unit: string
  readonly rate: number
  readonly change: number // percentage
}

export interface ReadingViewModel {
  readonly id: number
  readonly serviceId: number
  readonly serviceName: string
  readonly serviceIcon: LucideIcon
  readonly serviceIconBg: string
  readonly serviceIconColor: string
  readonly date: string
  readonly value: number
  readonly unit: string
  readonly difference: number
}

export interface PaymentReminderViewModel {
  readonly id: number
  readonly serviceId: number
  readonly type: MeterType
  readonly serviceName: string
  readonly amount: number
  readonly dueDate: string
  readonly daysUntilDue: number
  readonly urgency: 'high' | 'medium' | 'low'
}

export interface ChartDataPointViewModel {
  readonly month: string
  readonly electricity?: number
  readonly gas?: number
  readonly water?: number
  readonly hotWater?: number
  readonly coldWater?: number
  readonly heating?: number
}

export interface ExpenseDistributionItemViewModel {
  readonly name: string
  readonly value: number
  readonly color: string
  readonly [key: string]: string | number
}

export type PeriodFilter = '3months' | '6months' | '1year'

export type ExpenseDistributionByPeriod = Record<
  PeriodFilter,
  readonly ExpenseDistributionItemViewModel[]
>

export interface DashboardAddressOptionViewModel {
  readonly id: number
  readonly label: string
  readonly description?: string
}

// =============================================================================
// Mapper Functions
// =============================================================================

/**
 * Перетворює Meter + Provider + Latest Reading на ServiceDataViewModel
 */
export function toServiceDataViewModel(
  meter: Meter,
  provider: Provider,
  latestReading: Reading | undefined,
  previousReading: Reading | undefined,
): ServiceDataViewModel {
  const config = SERVICE_CONFIG[meter.type]
  const consumption = latestReading?.consumption || 0
  const primaryTariff = getPrimaryTariff(provider)
  const cost = consumption * (primaryTariff?.price ?? 0)

  // Розрахунок зміни споживання у відсотках
  let change = 0
  if (previousReading && previousReading.consumption) {
    const currentConsumption = latestReading?.consumption || 0
    const previousConsumption = previousReading.consumption
    change = ((currentConsumption - previousConsumption) / previousConsumption) * 100
  }

  return {
    id: meter.id,
    name: METER_TYPE_TO_SERVICE_LABEL[meter.type],
    icon: config.icon,
    iconBg: config.iconBg,
    iconColor: config.iconColor,
    cost: Math.round(cost * 100) / 100,
    consumption,
    unit: provider.unitLabel.split('/')[1] || 'од',
    rate: primaryTariff?.price ?? 0,
    change: Math.round(change),
  }
}

/**
 * Перетворює Reading на ReadingViewModel для таблиці показань
 */
export function toReadingViewModel(
  reading: Reading,
  meter: Meter,
  provider: Provider,
): ReadingViewModel {
  const config = SERVICE_CONFIG[meter.type]

  return {
    id: reading.id,
    serviceId: meter.id,
    serviceName: METER_TYPE_TO_SERVICE_LABEL[meter.type],
    serviceIcon: config.icon,
    serviceIconBg: config.iconBg,
    serviceIconColor: config.iconColor,
    date: reading.date,
    value: reading.value,
    unit: provider.unitLabel.split('/')[1] || 'од',
    difference: reading.consumption || 0,
  }
}

/**
 * Перетворює Provider на PaymentReminderViewModel
 */
export function toPaymentReminderViewModel(
  provider: Provider,
  meter: Meter,
  latestReading: Reading | undefined,
  dueDate: string,
): PaymentReminderViewModel {
  const consumption = latestReading?.consumption || 0
  const primaryTariff = getPrimaryTariff(provider)
  const amount = consumption * (primaryTariff?.price ?? 0)

  // Розрахунок днів до сплати
  const today = new Date()
  const dueDateObj = new Date(dueDate)
  const daysUntilDue = Math.ceil(
    (dueDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )

  // Визначаємо urgency
  let urgency: 'high' | 'medium' | 'low'
  if (daysUntilDue <= 5) {
    urgency = 'high'
  } else if (daysUntilDue <= 10) {
    urgency = 'medium'
  } else {
    urgency = 'low'
  }

  return {
    id: meter.id,
    serviceId: provider.id,
    type: meter.type,
    serviceName: METER_TYPE_TO_SERVICE_LABEL[meter.type],
    amount: Math.round(amount * 100) / 100,
    dueDate,
    daysUntilDue,
    urgency,
  }
}

/**
 * Перетворює масив readings на ChartDataPointViewModel для графіка споживання
 */
export function toChartDataViewModel(
  readings: readonly Reading[],
  meters: readonly Meter[],
): readonly ChartDataPointViewModel[] {
  // Групуємо readings по місяцях
  const monthsMap = new Map<string, Map<MeterType, number>>()

  readings.forEach((reading) => {
    const meter = meters.find((m) => m.id === reading.meterId)
    if (!meter) return

    const date = new Date(reading.date)
    const monthKey = date.toLocaleString('uk-UA', { month: 'short' })

    if (!monthsMap.has(monthKey)) {
      monthsMap.set(monthKey, new Map())
    }

    const monthData = monthsMap.get(monthKey)!
    const currentValue = monthData.get(meter.type) || 0
    monthData.set(meter.type, currentValue + (reading.consumption || 0))
  })

  // Перетворюємо в масив ChartDataPointViewModel
  const chartData: ChartDataPointViewModel[] = []
  monthsMap.forEach((monthData, month) => {
    const dataPoint: ChartDataPointViewModel = { month }

    monthData.forEach((value, meterType) => {
      switch (meterType) {
        case 'electricity':
          dataPoint.electricity = value
          break
        case 'gas':
          dataPoint.gas = value
          break
        case 'coldWater':
          dataPoint.coldWater = value
          dataPoint.water = (dataPoint.water || 0) + value
          break
        case 'hotWater':
          dataPoint.hotWater = value
          dataPoint.water = (dataPoint.water || 0) + value
          break
        case 'heat':
          dataPoint.heating = value
          break
      }
    })

    chartData.push(dataPoint)
  })

  return chartData
}

/**
 * Перетворює Address на DashboardAddressOptionViewModel
 */
export function toDashboardAddressOptionViewModel(
  address: Address,
): DashboardAddressOptionViewModel {
  const label = `${address.street}, ${address.building}, кв. ${address.apartment}`
  const description = `м. ${address.city}, ${address.district} район`

  return {
    id: address.id,
    label,
    description,
  }
}

/**
 * Створює ExpenseDistributionByPeriod з readings та providers
 */
export function toExpenseDistributionViewModel(
  readings: readonly Reading[],
  meters: readonly Meter[],
  providers: readonly Provider[],
  period: PeriodFilter,
): readonly ExpenseDistributionItemViewModel[] {
  // Визначаємо кількість місяців для фільтрації
  const monthsCount = period === '1year' ? 12 : period === '6months' ? 6 : 3

  // Фільтруємо readings по періоду
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - monthsCount, 1)

  const filteredReadings = readings.filter((r) => new Date(r.date) >= startDate)

  // Групуємо витрати по типу послуги
  const expensesByType = new Map<MeterType, number>()

  filteredReadings.forEach((reading) => {
    const meter = meters.find((m) => m.id === reading.meterId)
    if (!meter) return

    const provider = providers.find((p) => p.id === meter.providerId)
    if (!provider) return

    const primaryTariff = getPrimaryTariff(provider)
    const cost = (reading.consumption || 0) * (primaryTariff?.price ?? 0)
    const currentValue = expensesByType.get(meter.type) || 0
    expensesByType.set(meter.type, currentValue + cost)
  })

  // Перетворюємо в масив ExpenseDistributionItemViewModel
  const distribution: ExpenseDistributionItemViewModel[] = []

  expensesByType.forEach((value, meterType) => {
    const config = SERVICE_CONFIG[meterType]
    distribution.push({
      name: METER_TYPE_TO_SERVICE_LABEL[meterType],
      value: Math.round(value * 100) / 100,
      color: config.chartColor,
    })
  })

  return distribution
}
