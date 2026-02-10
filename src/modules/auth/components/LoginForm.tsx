import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { tv } from 'tailwind-variants'
import { Alert, AlertDescription, GithubIcon, GoogleIcon } from '@shared/components/ui'
import { getLocalizedErrorMessage } from '@shared/api/utils'
import type { ApiError } from '@shared/api/utils'
import { ROUTES } from '@shared/constants'
import { useAuth } from '@shared/hooks'
import type { OAuthProvider } from '@shared/types/auth'
import * as React from "react"

const OAUTH_STATE_KEY = 'oauth_state'
const OAUTH_PROVIDER_KEY = 'oauth_provider'

function generateOAuthState(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

const socialButton = tv({
  base: [
    'flex items-center justify-center',
    'rounded-md border border-gray-300 bg-white',
    'py-2.5 transition-colors hover:bg-gray-50',
    'dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700',
  ],
})

export function LoginForm() {
  const navigate = useNavigate()
  const { login, state, getOAuthUrl } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null)

  const isLoading = state.isLoading

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setErrors({})

    const newErrors: { email?: string; password?: string; general?: string } = {}

    // Валідація полів
    if (!email) {
      newErrors.email = "Електронна пошта обов'язкова"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Невірний формат електронної пошти'
    }

    if (!password) {
      newErrors.password = "Пароль обов'язковий"
    } else if (password.length < 6) {
      newErrors.password = 'Пароль повинен містити мінімум 6 символів'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      // Використовуємо метод login з AuthContext
      await login(email, password, rememberMe)

      // Перенаправлення на головну сторінку
      navigate(ROUTES.HOME)
    } catch (error: unknown) {
      const apiError = error as ApiError
      if (apiError && typeof apiError === 'object' && 'status' in apiError) {
        setErrors({ general: getLocalizedErrorMessage(apiError) })
      } else {
        setErrors({ general: 'Помилка входу. Перевірте дані та спробуйте ще раз.' })
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    try {
      setOauthLoading(provider)
      setErrors({})

      const state = generateOAuthState()
      sessionStorage.setItem(OAUTH_STATE_KEY, state)
      sessionStorage.setItem(OAUTH_PROVIDER_KEY, provider)

      const authUrl = await getOAuthUrl(provider)

      const url = new URL(authUrl)
      url.searchParams.set('state', state)

      window.location.href = url.toString()
    } catch (error) {
      setOauthLoading(null)
      const apiError = error as ApiError
      if (apiError && typeof apiError === 'object' && 'status' in apiError) {
        setErrors({ general: getLocalizedErrorMessage(apiError) })
      } else {
        setErrors({ general: `Помилка авторизації через ${provider}` })
      }
    }
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* General Error Message */}
        {errors.general && (
          <Alert variant="danger">
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200"
          >
            Електронна пошта
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border-[0.5px] border-gray-300 bg-white py-2.5 pl-11 pr-4 text-base text-text-dark placeholder:text-text-placeholder transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-amber-300 dark:focus:ring-amber-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
              placeholder="ваша@пошта.com"
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          {errors.email ? (
            <p className="mt-1 text-sm text-red-500">
              {errors.email}
            </p>
          ) : null}
        </div>

        {/* Password Field */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-slate-200"
            >
              Пароль
            </label>
            <a
              href={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-link transition-colors hover:text-link-hover"
            >
              Забули пароль?
            </a>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border-[0.5px] border-gray-300 bg-white py-2.5 pl-11 pr-12 text-base text-text-dark placeholder:text-text-placeholder transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-amber-300 dark:focus:ring-amber-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
              aria-label={showPassword ? 'Приховати пароль' : 'Показати пароль'}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p className="mt-1 text-sm text-red-500">
              {errors.password}
            </p>
          ) : null}
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-[0.5px] border-gray-400 transition-colors accent-primary focus:ring-1 focus:ring-primary"
            disabled={isLoading}
          />
          <label
            htmlFor="remember"
            className="ml-2 select-none text-sm text-gray-700 dark:text-slate-200"
          >
            Запам'ятати мене
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-base font-medium text-text-dark transition-colors hover:bg-primary-dark active:bg-primary-active disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isLoading ? 'Вхід...' : 'Увійти'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-4 sm:my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs sm:text-sm">
          <span className="bg-white px-2 text-gray-500 dark:bg-slate-900 dark:text-slate-400">
            Увійти через соцмережі
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button
          type="button"
          className={socialButton()}
          disabled={isLoading || oauthLoading !== null}
          aria-label="Увійти через Google"
          onClick={() => handleOAuthLogin('Google')}
        >
          {oauthLoading === 'Google' ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          ) : (
            <GoogleIcon size={16} />
          )}
        </button>

        <button
          type="button"
          className={socialButton()}
          disabled={isLoading || oauthLoading !== null}
          aria-label="Увійти через GitHub"
          onClick={() => handleOAuthLogin('GitHub')}
        >
          {oauthLoading === 'GitHub' ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          ) : (
            <GithubIcon size={16} />
          )}
        </button>
      </div>
    </div>
  )
}
