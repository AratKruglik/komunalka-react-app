import type { Meter, Reading, ConsumptionCalculation } from '@shared/types/entities'
import type { MeterType } from '@shared/constants/meterTypes'
import {
  METER_TYPE_TO_SERVICE_LABEL,
  UTILITY_TYPE_ID_TO_METER_TYPE,
} from '@shared/types/entities'
import { METER_TYPE_UNITS } from '@shared/constants/meterTypes'
import { SERVICE_CONFIG } from '@shared/constants/services'
import type { CostSource } from './types'
import type {
  ServiceDataViewModel,
  ChartDataPointViewModel,
  ExpenseDistributionItemViewModel,
  PaymentReminderViewModel,
  ReadingViewModel,
  PeriodFilter,
} from '@shared/viewModels'

function getMeterType(meter: Meter): MeterType {
  return UTILITY_TYPE_ID_TO_METER_TYPE[meter.utilityType.id] ?? 'electricity'
}

function getDefaultUnit(meter: Meter): string {
  const meterType = getMeterType(meter)
  return METER_TYPE_UNITS[meterType] ?? 'од'
}

export function resolveCostSource(
  meter: Meter,
  _reading: Reading | undefined,
  calculation: ConsumptionCalculation | undefined
): CostSource {
  if (calculation) {
    return {
      type: 'api',
      cost: calculation.totalCost,
      rate: calculation.baseRate,
      unit: calculation.unit,
    }
  }

  return {
    type: 'fallback',
    cost: 0,
    rate: 0,
    unit: getDefaultUnit(meter),
  }
}

export function adaptMeterToServiceData(
  meter: Meter,
  latestReading: Reading | undefined,
  previousReading: Reading | undefined,
  calculation: ConsumptionCalculation | undefined
): ServiceDataViewModel {
  const meterType = getMeterType(meter)
  const config = SERVICE_CONFIG[meterType]
  const consumption = latestReading?.consumption ?? 0

  const costSource = resolveCostSource(meter, latestReading, calculation)

  let change = 0
  if (previousReading?.consumption) {
    const currentConsumption = latestReading?.consumption ?? 0
    change = ((currentConsumption - previousReading.consumption) / previousReading.consumption) * 100
  }

  return {
    id: meter.id,
    name: METER_TYPE_TO_SERVICE_LABEL[meterType],
    icon: config.icon,
    iconBg: config.iconBg,
    iconColor: config.iconColor,
    cost: Math.round(costSource.cost * 100) / 100,
    consumption,
    unit: costSource.unit,
    rate: costSource.rate,
    change: Math.round(change),
  }
}

export function adaptReadingsToChartData(
  readings: readonly Reading[],
  meters: readonly Meter[]
): readonly ChartDataPointViewModel[] {
  const monthsMap = new Map<string, Map<MeterType, number>>()

  readings.forEach((reading) => {
    const meter = meters.find((m) => m.id === reading.meter.id)
    if (!meter) return

    const meterType = getMeterType(meter)
    const date = new Date(reading.readingDate)
    const monthKey = date.toLocaleString('uk-UA', { month: 'short' })

    if (!monthsMap.has(monthKey)) {
      monthsMap.set(monthKey, new Map())
    }

    const monthData = monthsMap.get(monthKey)!
    const currentValue = monthData.get(meterType) || 0
    monthData.set(meterType, currentValue + (reading.consumption || 0))
  })

  type MutableDataPoint = {
    month: string
    electricity?: number
    gas?: number
    water?: number
    hotWater?: number
    coldWater?: number
    heating?: number
  }

  const chartData: ChartDataPointViewModel[] = []
  monthsMap.forEach((monthData, month) => {
    const dataPoint: MutableDataPoint = { month }

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

    chartData.push(dataPoint as ChartDataPointViewModel)
  })

  return chartData
}

export function adaptToExpenseDistribution(
  readings: readonly Reading[],
  meters: readonly Meter[],
  calculations: Map<number, ConsumptionCalculation>,
  period: PeriodFilter
): readonly ExpenseDistributionItemViewModel[] {
  const monthsCount = period === '1year' ? 12 : period === '6months' ? 6 : 3

  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - monthsCount, 1)

  const filteredReadings = readings.filter((r) => new Date(r.readingDate) >= startDate)

  const expensesByType = new Map<MeterType, number>()

  filteredReadings.forEach((reading) => {
    const meter = meters.find((m) => m.id === reading.meter.id)
    if (!meter) return

    const meterType = getMeterType(meter)
    const calculation = calculations.get(meter.id)
    const costSource = resolveCostSource(meter, reading, calculation)

    const currentValue = expensesByType.get(meterType) || 0
    expensesByType.set(meterType, currentValue + costSource.cost)
  })

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

export function adaptToPaymentReminders(
  ..._args: [readonly Meter[], readonly Reading[], Map<number, ConsumptionCalculation>]
): readonly PaymentReminderViewModel[] {
  return []
}

export function adaptToReadingViewModel(
  reading: Reading,
  meter: Meter,
  calculation: ConsumptionCalculation | undefined
): ReadingViewModel {
  const meterType = getMeterType(meter)
  const config = SERVICE_CONFIG[meterType]
  const costSource = resolveCostSource(meter, reading, calculation)

  return {
    id: reading.id,
    serviceId: meter.id,
    serviceName: METER_TYPE_TO_SERVICE_LABEL[meterType],
    serviceIcon: config.icon,
    serviceIconBg: config.iconBg,
    serviceIconColor: config.iconColor,
    date: reading.readingDate,
    value: reading.readingValue,
    unit: costSource.unit,
    difference: reading.consumption || 0,
  }
}
