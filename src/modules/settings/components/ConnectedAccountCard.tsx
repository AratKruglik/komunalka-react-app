import { tv } from 'tailwind-variants'
import { Badge, Button, GoogleIcon, GithubIcon } from '@shared/components/ui'
import type { OAuthProvider } from '@shared/types/auth'

interface ConnectedAccountCardProps {
  provider: OAuthProvider
  isConnected: boolean
  isLoading: boolean
  onConnect: () => void
  onDisconnect: () => void
}

const providerRow = tv({
  base: [
    'flex items-center justify-between gap-4',
    'rounded-lg border border-gray-200 bg-white p-4',
    'dark:border-slate-700 dark:bg-slate-800/50',
  ],
})

const providerIcons: Record<OAuthProvider, typeof GoogleIcon> = {
  Google: GoogleIcon,
  GitHub: GithubIcon,
}

export function ConnectedAccountCard({
  provider,
  isConnected,
  isLoading,
  onConnect,
  onDisconnect,
}: ConnectedAccountCardProps) {
  const Icon = providerIcons[provider]

  return (
    <div className={providerRow()}>
      <div className="flex items-center gap-3">
        <Icon size={20} />
        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
          {provider}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={isConnected ? 'success' : 'neutral'}>
          {isConnected ? "Під'єднано" : "Від'єднано"}
        </Badge>

        {isConnected ? (
          <Button
            variant="outline"
            tone="danger"
            size="sm"
            loading={isLoading}
            loadingText="Від'єднання..."
            onClick={onDisconnect}
          >
            Від&apos;єднати
          </Button>
        ) : (
          <Button
            variant="outline"
            tone="primary"
            size="sm"
            loading={isLoading}
            loadingText="Під'єднання..."
            onClick={onConnect}
          >
            Під&apos;єднати
          </Button>
        )}
      </div>
    </div>
  )
}
