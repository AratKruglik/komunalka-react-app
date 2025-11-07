import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { AppleIcon, FacebookIcon, GoogleIcon } from '../../../shared/components/ui'
import * as React from "react";

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setErrors({})
    setIsLoading(true)

    const newErrors: { email?: string; password?: string } = {}

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
      setIsLoading(false)
      return
    }

    try {
      console.log('Login attempt:', { email, password, rememberMe })
      await new Promise((resolve) => setTimeout(resolve, 1500))
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-gray-700"
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
              className="w-full rounded-md border-[0.5px] border-gray-300 bg-white py-2.5 pl-11 pr-4 text-base text-[#333333] placeholder:text-[#adaebc] transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
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
              className="block text-sm font-medium text-gray-700"
            >
              Пароль
            </label>
            <a
              href="/forgot-password"
              className="text-xs text-[#DAA520] transition-colors hover:text-[#B8860B]"
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
              className="w-full rounded-md border-[0.5px] border-gray-300 bg-white py-2.5 pl-11 pr-12 text-base text-[#333333] placeholder:text-[#adaebc] transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-gray-600"
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
            className="ml-2 select-none text-sm text-gray-700"
          >
            Запам'ятати мене
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-base font-medium text-[#333333] transition-colors hover:bg-primary-dark active:bg-[#FFB700] disabled:cursor-not-allowed disabled:bg-gray-300"
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
          <span className="bg-white px-2 text-gray-500">
            Увійти через соцмережі
          </span>
        </div>
      </div>

      {/* Social Login Buttons - responsive grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <button
          type="button"
          className="flex items-center justify-center rounded-md border border-gray-300 bg-white py-2.5 transition-colors hover:bg-gray-50"
          disabled={isLoading}
          aria-label="Увійти через Google"
        >
          <GoogleIcon size={16} />
        </button>

        <button
          type="button"
          className="flex items-center justify-center rounded-md border border-gray-300 bg-white py-2.5 transition-colors hover:bg-gray-50"
          disabled={isLoading}
          aria-label="Увійти через Facebook"
        >
          <FacebookIcon size={16} />
        </button>

        <button
          type="button"
          className="flex items-center justify-center rounded-md border border-gray-300 bg-white py-2.5 transition-colors hover:bg-gray-50"
          disabled={isLoading}
          aria-label="Увійти через Apple"
        >
          <AppleIcon size={20} />
        </button>
      </div>
    </div>
  )
}
