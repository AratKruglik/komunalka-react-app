import { useNavigate } from 'react-router'
import { AuthenticatedLayout } from '../../../shared/components/layout/AuthenticatedLayout'
import { AddressesListSection } from '../components/AddressesListSection'

export default function AddressesPage() {
  const navigate = useNavigate()

  return (
    <AuthenticatedLayout
      pageTitle="Мої адреси"
      pageSubtitle="Керуйте адресами для комунальних послуг"
      notificationsCount={3}
    >
      <AddressesListSection onAddAddress={() => navigate('/addresses/new')} />
    </AuthenticatedLayout>
  )
}
