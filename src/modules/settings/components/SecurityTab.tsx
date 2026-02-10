import { PasswordChangeSection } from '@modules/profile/components'
import { useProfile } from '@modules/profile/hooks'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components/ui'
import { ConnectedAccountCard } from './ConnectedAccountCard'
import { useConnectedAccounts } from '../hooks/useConnectedAccounts'

export function SecurityTab() {
  const profile = useProfile()
  const { accounts, linkProvider, unlinkProvider } = useConnectedAccounts()

  return (
    <div className="space-y-6">
      <PasswordChangeSection profile={profile} />

      <Card className="border border-gray-200 shadow-lg dark:border-slate-800">
        <CardHeader>
          <CardTitle>Під&apos;єднані акаунти</CardTitle>
          <CardDescription>
            Керуйте способами входу у ваш акаунт
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {accounts.map((account) => (
            <ConnectedAccountCard
              key={account.provider}
              provider={account.provider}
              isConnected={account.isConnected}
              isLoading={account.isLoading}
              onConnect={() => linkProvider(account.provider)}
              onDisconnect={() => unlinkProvider(account.provider)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
