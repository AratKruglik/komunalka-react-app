import { useState, useCallback } from 'react'
import { PasswordChangeSection } from '@modules/profile/components'
import { useProfile } from '@modules/profile/hooks'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  Input,
} from '@shared/components/ui'
import { Lock } from 'lucide-react'
import { ConnectedAccountCard } from './ConnectedAccountCard'
import { useConnectedAccounts } from '../hooks/useConnectedAccounts'
import type { OAuthProvider } from '@shared/types/auth'

export function SecurityTab() {
  const profile = useProfile()
  const { accounts, linkProvider, unlinkProvider } = useConnectedAccounts()

  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(null)
  const [password, setPassword] = useState('')
  const [isUnlinking, setIsUnlinking] = useState(false)

  const handleDisconnect = (provider: OAuthProvider) => {
    setPendingProvider(provider)
    setPassword('')
  }

  const handleConfirmUnlink = useCallback(async () => {
    if (!pendingProvider || !password) return

    setIsUnlinking(true)
    await unlinkProvider(pendingProvider, password)
    setIsUnlinking(false)
    setPendingProvider(null)
    setPassword('')
  }, [pendingProvider, password, unlinkProvider])

  const handleCancelUnlink = useCallback(() => {
    setPendingProvider(null)
    setPassword('')
  }, [])

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
              onDisconnect={() => handleDisconnect(account.provider)}
            />
          ))}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={pendingProvider !== null}
        onClose={handleCancelUnlink}
        onConfirm={handleConfirmUnlink}
        title={`Від'єднати ${pendingProvider ?? ''}?`}
        description={
          <div className="w-full space-y-3">
            <span>Введіть пароль для підтвердження</span>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ваш пароль"
              leadingIcon={<Lock className="h-4 w-4 text-neutral-500" />}
              autoFocus
            />
          </div>
        }
        confirmLabel="Від'єднати"
        variant="danger"
        isLoading={isUnlinking}
      />
    </div>
  )
}
