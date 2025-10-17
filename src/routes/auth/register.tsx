import { createFileRoute } from '@tanstack/react-router'
import { RegisterForm } from '../../components/auth/RegisterForm'
import { GuestLayout } from '../../components/layout/GuestLayout'
import { Logo } from '../../components/common/Logo'

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <GuestLayout>
      <div className="w-[896px]">
        <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] overflow-hidden">
          {/* Registration Form with integrated Benefits section */}
          <RegisterForm />
        </div>
      </div>
    </GuestLayout>
  )
}
