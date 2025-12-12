import { Navigate } from 'react-router'
import { RegisterForm } from '../components/RegisterForm'
import { GuestLayout } from '../../../shared/components/layout/GuestLayout'
import { Card } from '../../../shared/components/ui'
import { useAuth } from '../../../shared/hooks'

export default function RegisterPage() {
  const { state } = useAuth()

  if (state.isLoading) {
    return null
  }

  if (state.isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <GuestLayout>
      <Card className="w-full max-w-4xl overflow-hidden border border-[var(--color-border-primary)] shadow-lg">
        <RegisterForm className="max-w-none" />
      </Card>
    </GuestLayout>
  )
}
