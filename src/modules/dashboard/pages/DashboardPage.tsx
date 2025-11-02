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
  mockExpenseDistribution,
  mockRecentReadings,
  mockPaymentReminders,
} from '../data/mockData'

export default function DashboardPage() {
  return (
    <AuthenticatedLayout
      pageTitle="Головна"
      pageSubtitle="Огляд комунальних послуг"
      notificationsCount={3}
    >
      <div className="space-y-6">
        {/* Welcome Header */}
        <WelcomeHeader userName="Олена" />

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
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ConsumptionChart data={mockChartData} />
          </div>
          <div className="lg:col-span-1">
            <ExpenseDistribution data={mockExpenseDistribution} />
          </div>
        </div>

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
