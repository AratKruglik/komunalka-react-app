import { Button } from '@shared/components/ui'
import { useProfile } from '../hooks'
import { ProfileInfoSection } from './ProfileInfoSection'
import { PasswordChangeSection } from './PasswordChangeSection'

interface ProfileFormProps {
  onCancel?: () => void
}

export function ProfileForm({ onCancel }: ProfileFormProps) {
  const profile = useProfile()

  return (
    <div className="w-full space-y-6">
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        <ProfileInfoSection profile={profile} />
        <PasswordChangeSection profile={profile} />
      </div>

      {onCancel ? (
        <div className="flex w-full justify-end">
          <Button
            type="button"
            variant="outline"
            tone="neutral"
            onClick={onCancel}
            disabled={profile.isLoading}
          >
            Скасувати
          </Button>
        </div>
      ) : null}
    </div>
  )
}
