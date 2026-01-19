import { useState, useMemo, useEffect } from 'react'
import { AuthenticatedLayout } from '@shared/components/layout/AuthenticatedLayout'
import { WelcomeHeader } from '../components/WelcomeHeader'
import { ServiceCard } from '../components/ServiceCard'
import { ConsumptionChart } from '../components/ConsumptionChart'
import { ExpenseDistribution } from '../components/ExpenseDistribution'
import { RecentReadingsTable } from '../components/RecentReadingsTable'
import { PaymentReminders } from '../components/PaymentReminders'
import { QuickActions } from '../components/QuickActions'
import { useAddresses } from '@modules/addresses/hooks'
import { useMetersByAddress } from '@modules/meters/hooks'
import { useReadingsByAddress } from '@modules/readings/hooks'
import { useUser } from '@shared/hooks'
import { MOCK_PROVIDERS } from '@shared/data/mockDatabase'
import {
  toDashboardAddressOptionViewModel,
  toServiceDataViewModel,
  toChartDataViewModel,
  toExpenseDistributionViewModel,
  toReadingViewModel,
  toPaymentReminderViewModel,
  type PeriodFilter,
  type ExpenseDistributionByPeriod,
} from '@shared/viewModels'

export default function DashboardPage() {
  const user = useUser()
  const { addresses } = useAddresses()
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)

  // Get user's first name for greeting
  const userName = user?.firstName || user?.username || 'Користувач'

  // Set initial address when addresses load
  useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === null) {
      setSelectedAddressId(addresses[0].id)
    }
  }, [addresses, selectedAddressId])

  // Fetch meters and readings from API
  const { meters } = useMetersByAddress(selectedAddressId)
  const { readings: allReadings } = useReadingsByAddress(selectedAddressId)

  // Generate address options for dropdown
  const addressOptions = useMemo(
    () => addresses.map(toDashboardAddressOptionViewModel),
    [addresses]
  )

  // Generate service cards data
  const services = useMemo(() => {
    return meters.map((meter) => {
      // Get readings for this meter from all readings
      const meterReadings = allReadings
        .filter((r) => r.meterId === meter.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      const provider = MOCK_PROVIDERS.find((p) => p.id === meter.providerId)
      if (!provider) return null

      const latestReading = meterReadings[0]
      const previousReading = meterReadings[1]

      return toServiceDataViewModel(meter, provider, latestReading, previousReading)
    }).filter(Boolean) as ReturnType<typeof toServiceDataViewModel>[]
  }, [meters, allReadings])

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

      const provider = MOCK_PROVIDERS.find((p) => p.id === meter.providerId)
      if (!provider) return null

      return toReadingViewModel(reading, meter, provider)
    }).filter(Boolean) as ReturnType<typeof toReadingViewModel>[]
  }, [allReadings, meters])

  // Generate payment reminders
  const paymentReminders = useMemo(() => {
    // Calculate due dates based on provider's reminderDay
    return meters.slice(0, 3).map((meter) => {
      const provider = MOCK_PROVIDERS.find((p) => p.id === meter.providerId)
      if (!provider || !provider.reminderDay) return null

      // Get readings for this meter from allReadings
      const meterReadings = allReadings
        .filter((r) => r.meterId === meter.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      const latestReading = meterReadings[0]

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
  }, [meters, allReadings])

  return (
    <AuthenticatedLayout
      pageTitle="Головна"
      pageSubtitle="Огляд комунальних послуг"
      notificationsCount={3}
    >
      <div className="space-y-4 sm:space-y-5 lg:space-y-6">
        {/* Welcome Header */}
        <WelcomeHeader
          userName={userName}
          addresses={addressOptions}
          selectedAddressId={selectedAddressId ?? undefined}
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
