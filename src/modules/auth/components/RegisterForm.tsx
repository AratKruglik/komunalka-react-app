import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Circle, CheckCircle2 } from 'lucide-react'
import { Logo, Button, GoogleIcon, FacebookIcon, AppleIcon } from '../../../shared/components/ui'

interface RegisterFormProps {
  className?: string
}

type PasswordStrength = 'none' | 'weak' | 'medium' | 'strong'

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'Мінімум 8 символів', test: (p) => p.length >= 8 },
  { label: 'Мінімум 1 велика літера', test: (p) => /[A-Z]/.test(p) },
  { label: 'Мінімум 1 цифра', test: (p) => /\d/.test(p) },
]

const passwordStrengthStyles: Record<
  PasswordStrength,
  { width: string; barClass: string; textClass: string }
> = {
  none: { width: '0%', barClass: 'bg-neutral-200', textClass: 'text-neutral-500' },
  weak: { width: '33%', barClass: 'bg-red-400', textClass: 'text-red-600' },
  medium: { width: '66%', barClass: 'bg-amber-400', textClass: 'text-amber-700' },
  strong: { width: '100%', barClass: 'bg-emerald-500', textClass: 'text-emerald-600' },
}

export function RegisterForm({ className = '' }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    language: 'uk',
    agreeToNews: false,
    agreeToTerms: false,
    agreeToPrivacy: false,
    isNotRobot: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const getPasswordStrength = (password: string): PasswordStrength => {
    if (!password) return 'none'
    const satisfiedRequirements = passwordRequirements.filter((req) => req.test(password)).length

    if (satisfiedRequirements === 0) return 'weak'
    if (satisfiedRequirements === 1) return 'weak'
    if (satisfiedRequirements === 2) return 'medium'
    return 'strong'
  }

  const getPasswordStrengthText = (strength: PasswordStrength): string => {
    switch (strength) {
      case 'none':
        return 'Не введено'
      case 'weak':
        return 'Слабкий'
      case 'medium':
        return 'Середній'
      case 'strong':
        return 'Надійний'
    }
  }

  const getPasswordStrengthWidth = (strength: PasswordStrength): string => {
    return passwordStrengthStyles[strength].width
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const strengthStyle = passwordStrengthStyles[passwordStrength]

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setIsLoading(true)

    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Ім'я обов'язкове"
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Прізвище обов'язкове"
    }
    if (!formData.email) {
      newErrors.email = "Електронна пошта обов'язкова"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Невірний формат електронної пошти'
    }
    if (!formData.phone) {
      newErrors.phone = "Номер телефону обов'язковий"
    } else if (!/^\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Введіть коректний номер телефону (9 цифр)'
    }
    if (!formData.password) {
      newErrors.password = "Пароль обов'язковий"
    } else if (passwordStrength === 'weak' || passwordStrength === 'none') {
      newErrors.password = 'Пароль занадто слабкий'
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Підтвердження паролю обов'язкове"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Паролі не співпадають'
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Необхідно погодитися з умовами використання'
    }
    if (!formData.agreeToPrivacy) {
      newErrors.agreeToPrivacy = 'Необхідно погодитися з політикою конфіденційності'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      console.log('Registration attempt:', formData)
      await new Promise((resolve) => setTimeout(resolve, 1500))
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialRegister = (provider: 'google' | 'facebook' | 'apple') => {
    console.log(`Register with ${provider}`)
  }

  return (
    <div
      className={[
        'mx-auto w-full max-w-4xl px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="pb-4 text-center sm:pb-6">
        <div className="mb-2 flex items-center justify-center gap-2 sm:mb-3">
          <Logo size="sm" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-slate-100 sm:text-3xl">
          Створити акаунт
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-slate-300 sm:text-base">
          Керуйте всіма комунальними послугами в одному кабінеті
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => handleSocialRegister('google')}
          className="flex w-full flex-1 items-center justify-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          disabled={isLoading}
        >
          <GoogleIcon className="h-4 w-4" />
          Через Google
        </button>

        <button
          type="button"
          onClick={() => handleSocialRegister('facebook')}
          className="flex w-full flex-1 items-center justify-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          disabled={isLoading}
        >
          <FacebookIcon className="h-4 w-4" />
          Через Facebook
        </button>

        <button
          type="button"
          onClick={() => handleSocialRegister('apple')}
          className="flex w-full flex-1 items-center justify-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          disabled={isLoading}
        >
          <AppleIcon className="h-5 w-5" />
          Через Apple
        </button>
      </div>

      <div className="relative my-6 sm:my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200 dark:border-slate-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500 dark:bg-slate-900 dark:text-slate-400 sm:text-sm">
            Або
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-slate-100">
            Особиста інформація
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-neutral-700 dark:text-slate-200"
              >
                Ім'я <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-amber-300 dark:focus:ring-amber-300"
                disabled={isLoading}
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-neutral-700 dark:text-slate-200"
              >
                Прізвище <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-amber-300 dark:focus:ring-amber-300"
                disabled={isLoading}
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700 dark:text-slate-200"
            >
              Електронна пошта <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-amber-300 dark:focus:ring-amber-300"
              placeholder="example@mail.com"
              disabled={isLoading}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-neutral-700 dark:text-slate-200"
            >
              Номер телефону <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-neutral-500 dark:text-slate-400">
                +380
              </span>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                className="w-full rounded-md border border-neutral-300 bg-white pl-14 pr-3 py-2.5 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-amber-300 dark:focus:ring-amber-300"
                placeholder="XX XXX XX XX"
                maxLength={9}
                disabled={isLoading}
              />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700 dark:text-slate-200"
            >
              Пароль <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 pr-12 py-2.5 text-base text-neutral-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-amber-300 dark:focus:ring-amber-300"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}

            <div className="mt-2 space-y-2">
              <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-slate-700">
                <div
                  className={['h-full transition-all duration-300', strengthStyle.barClass].join(' ')}
                  style={{ width: getPasswordStrengthWidth(passwordStrength) }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-slate-400">Надійність паролю:</span>
                <span className={['font-medium', strengthStyle.textClass, 'dark:text-slate-100'].join(' ')}>
                  {getPasswordStrengthText(passwordStrength)}
                </span>
              </div>

              <ul className="space-y-1">
                {passwordRequirements.map((requirement, index) => {
                  const isSatisfied = requirement.test(formData.password)
                  return (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-xs text-neutral-600 dark:text-slate-400"
                    >
                      {isSatisfied ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Circle className="h-3 w-3" />
                      )}
                      {requirement.label}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-neutral-700 dark:text-slate-200"
            >
              Підтвердити пароль <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 pr-12 py-2.5 text-base text-neutral-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-amber-300 dark:focus:ring-amber-300"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-slate-100">
            Налаштування облікового запису
          </h3>

          <div className="space-y-1.5">
            <label
              htmlFor="language"
              className="block text-sm font-medium text-neutral-700 dark:text-slate-200"
            >
              Мова інтерфейсу
            </label>
            <select
              id="language"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-amber-300 dark:focus:ring-amber-300"
              disabled={isLoading}
            >
              <option value="uk">Українська</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={formData.agreeToNews}
                onChange={(e) => setFormData({ ...formData, agreeToNews: e.target.checked })}
                className="mt-0.5 h-5 w-5 cursor-pointer rounded border border-neutral-400 accent-primary dark:border-slate-600"
                disabled={isLoading}
              />
              <span className="text-sm leading-5 text-neutral-800 dark:text-slate-300">
                Отримувати новини та оновлення про комунальні послуги
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                className="mt-0.5 h-5 w-5 cursor-pointer rounded border border-neutral-400 accent-primary dark:border-slate-600"
                disabled={isLoading}
              />
              <span className="text-sm leading-5 text-neutral-800 dark:text-slate-300">
                Я погоджуюся з{' '}
                <a
                  href="/terms"
                  className="text-primary hover:text-amber-700 hover:underline dark:text-amber-300 dark:hover:text-amber-200"
                >
                  умовами використання
                </a>{' '}
                <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="text-sm text-red-500 -mt-2">{errors.agreeToTerms}</p>
            )}

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={formData.agreeToPrivacy}
                onChange={(e) => setFormData({ ...formData, agreeToPrivacy: e.target.checked })}
                className="mt-0.5 h-5 w-5 cursor-pointer rounded border border-neutral-400 accent-primary dark:border-slate-600"
                disabled={isLoading}
              />
              <span className="text-sm leading-5 text-neutral-800 dark:text-slate-300">
                Я погоджуюся з{' '}
                <a
                  href="/privacy"
                  className="text-primary hover:text-amber-700 hover:underline dark:text-amber-300 dark:hover:text-amber-200"
                >
                  політикою конфіденційності
                </a>{' '}
                <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.agreeToPrivacy && (
              <p className="text-sm text-red-500 -mt-2">{errors.agreeToPrivacy}</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-neutral-800 dark:text-slate-200">Захист від роботів</span>
            <button type="button" className="text-neutral-400 hover:text-neutral-600 dark:text-slate-400 dark:hover:text-slate-200">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3.5 dark:border-slate-700 dark:bg-slate-900">
            <div className="h-5 w-5 rounded border-2 border-neutral-300 dark:border-slate-600" />
            <span className="text-sm text-neutral-700 dark:text-slate-300">Я не робот</span>
          </div>
        </div>

        <Button
          type="submit"
          loading={isLoading}
          loadingText="Створення акаунту..."
          fullWidth
          size="lg"
          className="font-bold"
        >
          Створити акаунт
        </Button>

        <div className="text-center">
          <p className="text-sm text-neutral-600 dark:text-slate-300">
            Вже маєте акаунт?{' '}
            <a
              href="/login"
              className="font-medium text-primary hover:text-amber-700 hover:underline dark:text-amber-300 dark:hover:text-amber-200"
            >
              Увійти
            </a>
          </p>
        </div>
      </form>
    </div>
  )
}
