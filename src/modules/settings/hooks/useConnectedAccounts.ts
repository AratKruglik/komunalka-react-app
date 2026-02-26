import { useState, useCallback } from 'react'
import { useAuth } from '@shared/hooks'
import { authService } from '@shared/api'
import type { OAuthProvider } from '@shared/types/auth'

const OAUTH_STATE_KEY = 'oauth_state'
const OAUTH_PROVIDER_KEY = 'oauth_provider'
const OAUTH_ACTION_KEY = 'oauth_action'

function generateOAuthState(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

interface ProviderState {
  isLoading: boolean
  error: string | null
}

type ProvidersLoadingState = Record<OAuthProvider, ProviderState>

const initialProviderState: ProviderState = { isLoading: false, error: null }

export function useConnectedAccounts() {
  const { state, getOAuthUrl } = useAuth()

  const [providerStates, setProviderStates] = useState<ProvidersLoadingState>({
    Google: { ...initialProviderState },
    GitHub: { ...initialProviderState },
  })

  const isProviderConnected = useCallback(
    (provider: OAuthProvider): boolean => {
      return state.linkedProviders.includes(provider)
    },
    [state.linkedProviders],
  )

  const setProviderLoading = (provider: OAuthProvider, isLoading: boolean) => {
    setProviderStates((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], isLoading, error: null },
    }))
  }

  const setProviderError = (provider: OAuthProvider, error: string) => {
    setProviderStates((prev) => ({
      ...prev,
      [provider]: { isLoading: false, error },
    }))
  }

  const linkProvider = useCallback(
    async (provider: OAuthProvider) => {
      setProviderLoading(provider, true)

      try {
        const oauthState = generateOAuthState()
        sessionStorage.setItem(OAUTH_STATE_KEY, oauthState)
        sessionStorage.setItem(OAUTH_PROVIDER_KEY, provider)
        sessionStorage.setItem(OAUTH_ACTION_KEY, 'link')

        const authUrl = await getOAuthUrl(provider)
        const url = new URL(authUrl)
        url.searchParams.set('state', oauthState)

        window.location.href = url.toString()
      } catch {
        setProviderError(provider, 'Не вдалося розпочати підʼєднання акаунта')
      }
    },
    [getOAuthUrl],
  )

  const unlinkProvider = useCallback(
    async (provider: OAuthProvider, password: string) => {
      setProviderLoading(provider, true)

      try {
        await authService.unlinkProvider(provider, { password })
      } catch {
        setProviderError(provider, 'Не вдалося відʼєднати акаунт')
      } finally {
        setProviderLoading(provider, false)
      }
    },
    [],
  )

  const accounts = (['Google', 'GitHub'] as const).map((provider) => ({
    provider,
    isConnected: isProviderConnected(provider),
    isLoading: providerStates[provider].isLoading,
    error: providerStates[provider].error,
  }))

  return { accounts, linkProvider, unlinkProvider }
}
