import { RegisterForm } from '../components/RegisterForm'
import { GuestLayout } from '../../../shared/components/layout/GuestLayout'

export default function RegisterPage() {
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
