import { createFileRoute } from '@tanstack/react-router'
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout'
import { AddressesListSection } from '../components/addresses/AddressesListSection'

export const Route = createFileRoute('/addresses')({
  component: Addresses,
})

function Addresses() {
  return (
    <AuthenticatedLayout
      pageTitle="Мої адреси"
      pageSubtitle="Керуйте адресами для комунальних послуг"
      notificationsCount={3}
    >
      <AddressesListSection />
    </AuthenticatedLayout>
  )
}
