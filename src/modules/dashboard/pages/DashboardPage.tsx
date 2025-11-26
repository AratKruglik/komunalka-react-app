import { useState, useMemo } from 'react'
import { AuthenticatedLayout } from '../../../shared/components/layout/AuthenticatedLayout'
import { WelcomeHeader } from '../components/WelcomeHeader'
import { ServiceCard } from '../components/ServiceCard'
import { ConsumptionChart } from '../components/ConsumptionChart'
import { ExpenseDistribution } from '../components/ExpenseDistribution'
import { RecentReadingsTable } from '../components/RecentReadingsTable'
import { PaymentReminders } from '../components/PaymentReminders'
import { QuickActions } from '../components/QuickActions'
import {
  MOCK_ADDRESSES,
  MOCK_PROVIDERS,
  getMetersByAddressId,
  getReadingsByMeterId,
  getReadingsByAddressId,
  getProviderById,
} from '../../../shared/data/mockDatabase'
import {
  toDashboardAddressOptionViewModel,
  toServiceDataViewModel,
  toChartDataViewModel,
  toExpenseDistributionViewModel,
  toReadingViewModel,
  toPaymentReminderViewModel,
  type PeriodFilter,
  type ExpenseDistributionByPeriod,
} from '../../../shared/viewModels'

export default function DashboardPage() {
  const [selectedAddressId, setSelectedAddressId] = useState(
    MOCK_ADDRESSES[0]?.id ?? 1
  )

  // Generate address options for dropdown
  const addressOptions = useMemo(
    () => MOCK_ADDRESSES.map(toDashboardAddressOptionViewModel),
    []
  )

  // Get meters and readings for selected address
  const meters = useMemo(
    () => getMetersByAddressId(selectedAddressId),
    [selectedAddressId]
  )

  const allReadings = useMemo(
    () => getReadingsByAddressId(selectedAddressId),
    [selectedAddressId]
  )

  // Generate service cards data
  const services = useMemo(() => {
    return meters.map((meter) => {
      const readings = getReadingsByMeterId(meter.id)
      const provider = getProviderById(meter.providerId)
      if (!provider) return null

      const latestReading = readings[0] // Already sorted by date desc
      const previousReading = readings[1]

      return toServiceDataViewModel(meter, provider, latestReading, previousReading)
    }).filter(Boolean) as ReturnType<typeof toServiceDataViewModel>[]
  }, [meters])

  // Generate chart data (last 6 months)
  const chartData = useMemo(() => {
    return toChartDataViewModel(allReadings, meters)
  }, [allReadings, meters])

  // Generate expense distribution for all periods
  const expenseDistributionByPeriod = useMemo<ExpenseDistributionByPeriod>(() => {
    const periods: PeriodFilter[] = ['3months', '6months', '1year']
    return periods.reduce((acc, period) => {
      acc[period] = toExpenseDistributionViewModel(
        allReadings,
        meters,
        MOCK_PROVIDERS,
        period
      )
      return acc
    }, {} as ExpenseDistributionByPeriod)
  }, [allReadings, meters])

  // Generate recent readings (last 5)
  const recentReadings = useMemo(() => {
    return allReadings.slice(0, 5).map((reading) => {
      const meter = meters.find((m) => m.id === reading.meterId)
      if (!meter) return null

      const provider = getProviderById(meter.providerId)
      if (!provider) return null

      return toReadingViewModel(reading, meter, provider)
    }).filter(Boolean) as ReturnType<typeof toReadingViewModel>[]
  }, [allReadings, meters])

  // Generate payment reminders
  const paymentReminders = useMemo(() => {
    // Calculate due dates based on provider's reminderDay
    return meters.slice(0, 3).map((meter) => {
      const provider = getProviderById(meter.providerId)
      if (!provider || !provider.reminderDay) return null

      const readings = getReadingsByMeterId(meter.id)
      const latestReading = readings[0]

      // Calculate due date for current month
      const today = new Date()
      const dueDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        provider.reminderDay
      )

      return toPaymentReminderViewModel(
        provider,
        meter,
        latestReading,
        dueDate.toISOString().split('T')[0]
      )
    }).filter(Boolean) as ReturnType<typeof toPaymentReminderViewModel>[]
  }, [meters])

  return (
    <AuthenticatedLayout
      pageTitle="Головна"
      pageSubtitle="Огляд комунальних послуг"
      notificationsCount={3}
    >
      <div className="space-y-4 sm:space-y-5 lg:space-y-6">
        {/* Welcome Header */}
        <WelcomeHeader
          userName="Олена"
          addresses={addressOptions}
          selectedAddressId={selectedAddressId}
          onAddressChange={setSelectedAddressId}
        />

        {/* Current Month Expenses - Service Cards */}
        {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols, Wide: 4 cols */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-base font-semibold leading-6 text-neutral-800 dark:text-slate-100 sm:text-lg sm:leading-7 lg:text-xl">
            Витрати цього місяця
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        {/* Charts Section */}
        <section className="space-y-4 sm:space-y-5 lg:space-y-6">
          <ConsumptionChart data={chartData} />
          <ExpenseDistribution dataByPeriod={expenseDistributionByPeriod} />
        </section>

        {/* Recent Readings and Payment Reminders */}
        {/* Mobile: stack, Desktop: 2 columns */}
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
          <RecentReadingsTable readings={recentReadings} />
          <PaymentReminders reminders={paymentReminders} />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </AuthenticatedLayout>
  )
}
