import { RegisterForm } from '../components/RegisterForm'
import { GuestLayout } from '@shared/components/layout/GuestLayout'
import { Card } from '@shared/components/ui'

export default function RegisterPage() {
  return (
    <GuestLayout>
      <Card className="w-full max-w-4xl overflow-hidden border border-[var(--color-border-primary)] shadow-lg">
        <RegisterForm className="max-w-none" />
      </Card>
    </GuestLayout>
  )
}
