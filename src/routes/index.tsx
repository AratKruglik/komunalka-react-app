import { createFileRoute } from '@tanstack/react-router'
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
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
