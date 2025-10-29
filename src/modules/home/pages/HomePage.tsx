import { AuthenticatedLayout } from '../../../shared/components/layout/AuthenticatedLayout'

export default function HomePage() {
  return (
    <AuthenticatedLayout
      pageTitle="Головна панель"
      pageSubtitle="Тут буде дашборд"
      notificationsCount={3}
    >
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Дашборд у розробці
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
