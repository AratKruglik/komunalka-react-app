import { ProfileInfoSection } from '@modules/profile/components'
import { useProfile } from '@modules/profile/hooks'

export function ProfileTab() {
  const profile = useProfile()

  return <ProfileInfoSection profile={profile} />
}
