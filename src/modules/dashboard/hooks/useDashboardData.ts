import { useState, useMemo, useEffect } from 'react'
import { useAddresses } from '@modules/addresses/hooks'
import { useMetersByAddress } from '@modules/meters/hooks'
import { useReadingsByAddress } from '@modules/readings/hooks'
import type { ConsumptionCalculation } from '@shared/types/entities'
import {
  toDashboardAddressOptionViewModel,
  type DashboardAddressOptionViewModel,
  type ServiceDataViewModel,
  type ChartDataPointViewModel,
  type ExpenseDistributionByPeriod,
  type ReadingViewModel,
  type PaymentReminderViewModel,
  type PeriodFilter,
} from '@shared/viewModels'
import {
  adaptMeterToServiceData,
  adaptReadingsToChartData,
  adaptToExpenseDistribution,
  adaptToPaymentReminders,
  adaptToReadingViewModel,
} from '../adapters'

export interface DashboardData {
  addressOptions: DashboardAddressOptionViewModel[]
  services: ServiceDataViewModel[]
  chartData: ChartDataPointViewModel[]
  expenseDistributionByPeriod: ExpenseDistributionByPeriod
  recentReadings: ReadingViewModel[]
  paymentReminders: PaymentReminderViewModel[]
  isLoading: boolean
  selectedAddressId: number | null
  setSelectedAddressId: (id: number | null) => void
}

export function useDashboardData(): DashboardData {
  const { addresses } = useAddresses()
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)

  useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === null) {
      setSelectedAddressId(addresses[0].id)
    }
  }, [addresses, selectedAddressId])

  const { meters, isLoading: metersLoading } = useMetersByAddress(selectedAddressId)
  const { readings: allReadings, isLoading: readingsLoading } = useReadingsByAddress(selectedAddressId)

  const calculations = useMemo<Map<number, ConsumptionCalculation>>(() => {
    return new Map()
  }, [])

  const addressOptions = useMemo(
    () => addresses.map(toDashboardAddressOptionViewModel),
    [addresses]
  )

  const services = useMemo(() => {
    return meters
      .map((meter) => {
        const meterReadings = allReadings
          .filter((r) => r.meterId === meter.id)
          .sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime())

        const latestReading = meterReadings[0]
        const previousReading = meterReadings[1]
        const calculation = calculations.get(meter.id)

        return adaptMeterToServiceData(meter, latestReading, previousReading, calculation)
      })
      .filter(Boolean) as ServiceDataViewModel[]
  }, [meters, allReadings, calculations])

  const chartData = useMemo(() => {
    return [...adaptReadingsToChartData(allReadings, meters)]
  }, [allReadings, meters])

  const expenseDistributionByPeriod = useMemo<ExpenseDistributionByPeriod>(() => {
    const periods: PeriodFilter[] = ['3months', '6months', '1year']
    return periods.reduce((acc, period) => {
      acc[period] = adaptToExpenseDistribution(allReadings, meters, calculations, period)
      return acc
    }, {} as ExpenseDistributionByPeriod)
  }, [allReadings, meters, calculations])

  const recentReadings = useMemo(() => {
    return allReadings.slice(0, 5).map((reading) => {
      const meter = meters.find((m) => m.id === reading.meterId)
      if (!meter) return null

      const calculation = calculations.get(meter.id)
      return adaptToReadingViewModel(reading, meter, calculation)
    }).filter(Boolean) as ReadingViewModel[]
  }, [allReadings, meters, calculations])

  const paymentReminders = useMemo(() => {
    return [...adaptToPaymentReminders(meters, allReadings, calculations)]
  }, [meters, allReadings, calculations])

  const isLoading = metersLoading || readingsLoading

  return {
    addressOptions,
    services,
    chartData,
    expenseDistributionByPeriod,
    recentReadings,
    paymentReminders,
    isLoading,
    selectedAddressId,
    setSelectedAddressId,
  }
}
