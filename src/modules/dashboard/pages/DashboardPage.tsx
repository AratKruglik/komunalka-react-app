import { useState } from 'react'
import { AuthenticatedLayout } from '../../../shared/components/layout/AuthenticatedLayout'
import { WelcomeHeader } from '../components/WelcomeHeader'
import { ServiceCard } from '../components/ServiceCard'
import { ConsumptionChart } from '../components/ConsumptionChart'
import { ExpenseDistribution } from '../components/ExpenseDistribution'
import { RecentReadingsTable } from '../components/RecentReadingsTable'
import { PaymentReminders } from '../components/PaymentReminders'
import { QuickActions } from '../components/QuickActions'
import {
  mockServices,
  mockChartData,
  mockExpenseDistributionByPeriod,
  mockRecentReadings,
  mockPaymentReminders,
  mockDashboardAddresses,
} from '../data/mockData'

export default function DashboardPage() {
  const [selectedAddressId, setSelectedAddressId] = useState(
    mockDashboardAddresses[0]?.id ?? ''
  )

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
          addresses={mockDashboardAddresses}
          selectedAddressId={selectedAddressId}
          onAddressChange={setSelectedAddressId}
        />

        {/* Current Month Expenses - Service Cards */}
        {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols, Wide: 4 cols */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-base font-semibold leading-6 text-neutral-800 sm:text-lg sm:leading-7 lg:text-xl">
            Витрати цього місяця
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
            {mockServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        {/* Charts Section */}
        <section className="space-y-4 sm:space-y-5 lg:space-y-6">
          <ConsumptionChart data={mockChartData} />
          <ExpenseDistribution dataByPeriod={mockExpenseDistributionByPeriod} />
        </section>

        {/* Recent Readings and Payment Reminders */}
        {/* Mobile: stack, Desktop: 2 columns */}
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
          <RecentReadingsTable readings={mockRecentReadings} />
          <PaymentReminders reminders={mockPaymentReminders} />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </AuthenticatedLayout>
  )
}
