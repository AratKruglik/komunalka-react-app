import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { GuestLayout } from '@shared/components/layout/GuestLayout'
import { Logo, Spinner } from '@shared/components/ui'
import { ROUTES } from '@shared/constants'
import { useAuth } from '@shared/hooks'
import type { OAuthProvider } from '@shared/types/auth'

const OAUTH_STATE_KEY = 'oauth_state'
const OAUTH_PROVIDER_KEY = 'oauth_provider'

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { handleOAuthCallback, state } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code')
      const returnedState = searchParams.get('state')
      const errorParam = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (errorParam) {
        setError(errorDescription || 'Авторизацію скасовано')
        return
      }

      if (!code || !returnedState) {
        setError('Відсутні обовʼязкові параметри авторизації')
        return
      }

      const savedState = sessionStorage.getItem(OAUTH_STATE_KEY)
      const savedProvider = sessionStorage.getItem(OAUTH_PROVIDER_KEY) as OAuthProvider | null

      sessionStorage.removeItem(OAUTH_STATE_KEY)
      sessionStorage.removeItem(OAUTH_PROVIDER_KEY)

      if (!savedState || savedState !== returnedState) {
        setError('Невалідний state параметр. Можлива CSRF атака.')
        return
      }

      if (!savedProvider) {
        setError('Невизначений OAuth провайдер')
        return
      }

      try {
        await handleOAuthCallback(savedProvider, code, returnedState)
        navigate(ROUTES.HOME, { replace: true })
      } catch (err) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? (err as { message: string }).message
            : 'Помилка авторизації. Спробуйте ще раз.'
        setError(message)
      }
    }

    void processCallback()
  }, [searchParams, handleOAuthCallback, navigate])

  if (error) {
    return (
      <GuestLayout>
        <div className="w-full max-w-[448px]">
          <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-slate-900">
            <div className="px-6 py-8">
              <div className="flex justify-center mb-6">
                <Logo size="md" />
              </div>
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                <h2 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-300">
                  Помилка авторизації
                </h2>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
              <button
                onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
                className="mt-6 w-full rounded-md bg-primary px-4 py-2.5 text-base font-medium text-text-dark transition-colors hover:bg-primary-dark"
              >
                Повернутися до входу
              </button>
            </div>
          </div>
        </div>
      </GuestLayout>
    )
  }

  return (
    <GuestLayout>
      <div className="w-full max-w-[448px]">
        <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-slate-900">
          <div className="px-6 py-12">
            <div className="flex justify-center mb-6">
              <Logo size="md" />
            </div>
            <div className="flex flex-col items-center gap-4">
              <Spinner size="lg" />
              <p className="text-center text-gray-600 dark:text-slate-300">
                {state.isLoading ? 'Авторизація...' : 'Обробка даних...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  )
}
