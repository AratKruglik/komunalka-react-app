import { AuthenticatedLayout } from '@shared/components/layout/AuthenticatedLayout'
import { WelcomeHeader } from '../components/WelcomeHeader'
import { ServiceCard } from '../components/ServiceCard'
import { ConsumptionChart } from '@modules/dashboard/components'
import { ExpenseDistribution } from '@modules/dashboard/components'
import { RecentReadingsTable } from '@modules/dashboard/components'
import { PaymentReminders } from '@modules/dashboard/components'
import { QuickActions } from '../components/QuickActions'
import { useUser } from '@shared/hooks'
import { useDashboardData } from '../hooks'

export default function DashboardPage() {
  const user = useUser()
  const {
    addressOptions,
    services,
    chartData,
    expenseDistributionByPeriod,
    recentReadings,
    paymentReminders,
    selectedAddressId,
    setSelectedAddressId,
  } = useDashboardData()

  const userName = user?.firstName || user?.username || 'Користувач'

  return (
    <AuthenticatedLayout
      pageTitle="Головна"
      pageSubtitle="Огляд комунальних послуг"
      notificationsCount={3}
    >
      <div className="space-y-4 sm:space-y-5 lg:space-y-6">
        <WelcomeHeader
          userName={userName}
          addresses={addressOptions}
          selectedAddressId={selectedAddressId ?? undefined}
          onAddressChange={setSelectedAddressId}
        />

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

        <section className="space-y-4 sm:space-y-5 lg:space-y-6">
          <ConsumptionChart data={chartData} />
          <ExpenseDistribution dataByPeriod={expenseDistributionByPeriod} />
        </section>

        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
          <RecentReadingsTable readings={recentReadings} />
          <PaymentReminders reminders={paymentReminders} />
        </div>

        <QuickActions />
      </div>
    </AuthenticatedLayout>
  )
}
