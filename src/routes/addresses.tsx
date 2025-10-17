import { createFileRoute } from '@tanstack/react-router'
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout'

export const Route = createFileRoute('/addresses')({
  component: Addresses,
})

function Addresses() {
  return (
    <AuthenticatedLayout>
      <div>
        <h1 className="text-3xl font-bold text-[#333333] mb-4">Мої адреси</h1>
        <p className="text-gray-600">Тут буде список ваших адрес та лічильників.</p>
      </div>
    </AuthenticatedLayout>
  )
}
