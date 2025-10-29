import { AuthenticatedLayout } from '../../../shared/components/layout/AuthenticatedLayout'
import { AddressesListSection } from '../components/AddressesListSection'

export default function AddressesPage() {
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
