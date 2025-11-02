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
      <div className="space-y-6">
        {/* Welcome Header */}
        <WelcomeHeader
          userName="Олена"
          addresses={mockDashboardAddresses}
          selectedAddressId={selectedAddressId}
          onAddressChange={setSelectedAddressId}
        />

        {/* Current Month Expenses - Service Cards */}
        <section>
          <h2 className="mb-4 text-lg font-semibold leading-7 text-neutral-800">
            Витрати цього місяця
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {mockServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        {/* Charts Section */}
        <section className="space-y-6">
          <ConsumptionChart data={mockChartData} />
          <ExpenseDistribution dataByPeriod={mockExpenseDistributionByPeriod} />
        </section>

        {/* Recent Readings and Payment Reminders */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentReadingsTable readings={mockRecentReadings} />
          <PaymentReminders reminders={mockPaymentReminders} />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </AuthenticatedLayout>
  )
}
