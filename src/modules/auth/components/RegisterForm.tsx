import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Circle, CheckCircle2, Calculator, TrendingUp, Bell, BarChart3, Shield } from 'lucide-react'
import { Logo, Button } from '../../../shared/components/ui'

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

export function RegisterForm() {
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
    const satisfiedRequirements = passwordRequirements.filter((req) =>
      req.test(password)
    ).length

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

  const getPasswordStrengthColor = (strength: PasswordStrength): string => {
    switch (strength) {
      case 'none':
        return '#e0e0e0'
      case 'weak':
        return '#ff4d4d'
      case 'medium':
        return '#ffa500'
      case 'strong':
        return '#10b981'
    }
  }

  const getPasswordStrengthWidth = (strength: PasswordStrength): string => {
    switch (strength) {
      case 'none':
        return '0%'
      case 'weak':
        return '33%'
      case 'medium':
        return '66%'
      case 'strong':
        return '100%'
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setIsLoading(true)

    // Валідація
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
      newErrors.agreeToTerms = "Необхідно погодитися з умовами використання"
    }
    if (!formData.agreeToPrivacy) {
      newErrors.agreeToPrivacy = "Необхідно погодитися з політикою конфіденційності"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    // TODO: Реалізувати логіку реєстрації
    try {
      console.log('Registration attempt:', formData)
      // Симуляція запиту
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Тут буде реальна логіка реєстрації
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialRegister = (provider: 'google' | 'facebook' | 'apple') => {
    console.log(`Register with ${provider}`)
    // TODO: Реалізувати OAuth реєстрацію
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:rounded-2xl lg:flex-row">
      {/* Left side - Form - Responsive width and padding */}
      <div className="w-full border-b border-gray-100 lg:w-3/5 lg:border-b-0 lg:border-r">
        <div className="px-4 py-5 sm:px-8 sm:py-6 lg:px-10 lg:py-8 xl:px-12">
          {/* Header with Logo - responsive sizing */}
          <div className="pb-3 text-center sm:pb-4">
            <div className="mb-2 flex items-center justify-center gap-2 sm:mb-3">
              <Logo size="sm" />
            </div>
            <h1 className="text-xl font-bold text-black sm:text-2xl lg:text-3xl">
              Створити акаунт
            </h1>
            <p className="mt-1 text-xs text-gray-600 sm:text-sm">
              Керуйте всіма комунальними послугами в одному кабінеті
            </p>
          </div>

          {/* Social Buttons - responsive sizing and spacing */}
          <div className="space-y-2 sm:space-y-3">
            <button
          type="button"
          onClick={() => handleSocialRegister('google')}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          disabled={isLoading}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
            />
            <path
              fill="#34A853"
              d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"
            />
            <path
              fill="#4A90E2"
              d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"
            />
            <path
              fill="#FBBC05"
              d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"
            />
          </svg>
          Зареєструватися через Google
            </button>

            <button
          type="button"
          onClick={() => handleSocialRegister('facebook')}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          disabled={isLoading}
        >
          <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Зареєструватися через Facebook
            </button>

            <button
          type="button"
          onClick={() => handleSocialRegister('apple')}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          disabled={isLoading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
              fill="#000000"
            />
          </svg>
          Зареєструватися через Apple
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-4 sm:my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 sm:px-3 sm:text-xs sm:tracking-[0.3em]">
                Або
              </span>
            </div>
          </div>

          {/* Registration Form - responsive spacing */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-black">Особиста інформація</h3>

          {/* First Name & Last Name */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Ім'я <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-md border border-gray-300 text-base text-black bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Прізвище <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-md border border-gray-300 text-base text-black bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Електронна пошта <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2.5 rounded-md border border-gray-300 text-base text-black placeholder:text-[#adaebc] bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              placeholder="example@mail.com"
              disabled={isLoading}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Номер телефону <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-gray-500">
                +380
              </span>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })
                }
                className="w-full pl-14 pr-3 py-2.5 rounded-md border border-gray-300 text-base text-black placeholder:text-[#adaebc] bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                placeholder="XX XXX XX XX"
                maxLength={9}
                disabled={isLoading}
              />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
          </div>

          {/* Password - 16px gap */}
          <div className="mb-[16px]">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Пароль <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 pr-12 py-2.5 rounded-md border border-gray-300 text-base text-black bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}

            {/* Password Strength Indicator */}
            <div className="mt-2 space-y-2">
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: getPasswordStrengthWidth(passwordStrength),
                    backgroundColor: getPasswordStrengthColor(passwordStrength),
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Надійність паролю:</span>
                <span className="font-medium text-black">
                  {getPasswordStrengthText(passwordStrength)}
                </span>
              </div>

              {/* Password Requirements */}
              <ul className="space-y-1">
                {passwordRequirements.map((requirement, index) => {
                  const isSatisfied = requirement.test(formData.password)
                  return (
                    <li key={index} className="flex items-center gap-2 text-xs text-gray-500">
                      {isSatisfied ? (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      ) : (
                        <Circle className="w-3 h-3" />
                      )}
                      {requirement.label}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Підтвердити пароль <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 pr-12 py-2.5 rounded-md border border-gray-300 text-base text-black bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Account Settings Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-black">Налаштування облікового запису</h3>

          {/* Language Selection */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1.5">
              Мова інтерфейсу
            </label>
            <select
              id="language"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-3 py-2.5 rounded-md border border-gray-300 text-base text-black bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              disabled={isLoading}
            >
              <option value="uk">Українська</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreeToNews}
                onChange={(e) => setFormData({ ...formData, agreeToNews: e.target.checked })}
                className="mt-0.5 w-5 h-5 rounded border border-gray-400 cursor-pointer accent-primary"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700 leading-5">
                Отримувати новини та оновлення про комунальні послуги
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                className="mt-0.5 w-5 h-5 rounded border border-gray-400 cursor-pointer accent-primary"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700 leading-5">
                Я погоджуюся з{' '}
                <a href="/terms" className="text-[#DAA520] hover:underline">
                  умовами використання
                </a>{' '}
                <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="text-sm text-red-500 -mt-2">{errors.agreeToTerms}</p>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreeToPrivacy}
                onChange={(e) => setFormData({ ...formData, agreeToPrivacy: e.target.checked })}
                className="mt-0.5 w-5 h-5 rounded border border-gray-400 cursor-pointer accent-primary"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700 leading-5">
                Я погоджуюся з{' '}
                <a href="/privacy" className="text-[#DAA520] hover:underline">
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

        {/* ReCAPTCHA Placeholder */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-700">Захист від роботів</span>
            <button type="button" className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded px-4 py-4 flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
            <span className="text-sm text-gray-500">Я не робот</span>
          </div>
        </div>

        {/* Submit Button */}
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

        {/* Already have account */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Вже маєте акаунт?{' '}
            <a href="/login" className="font-medium text-[#DAA520] hover:underline">
              Увійти
            </a>
          </p>
        </div>
      </form>
      </div>
      </div>

      {/* Right side - Benefits - Responsive padding and spacing */}
      <div className="w-full bg-[#fff2b2] px-4 py-6 sm:px-8 sm:py-8 lg:w-2/5 lg:px-10 lg:py-12">
        <div className="mx-auto flex h-full max-w-md flex-col justify-center gap-6 sm:gap-8 lg:gap-10">
          <h2 className="text-xl font-bold leading-7 text-[#333333] sm:text-2xl sm:leading-8 lg:text-3xl">
            Чому варто приєднатися?
          </h2>

          <ul className="space-y-4 sm:space-y-5 lg:space-y-6">
            <li className="flex gap-4">
              <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[gold]">
                <Calculator className="w-4 h-4 text-[#333333]" />
              </div>
              <div>
                <h3 className="text-base font-medium text-[#333333] leading-6 mb-2">
                  Автоматичний розрахунок комунальних платежів
                </h3>
                <p className="text-sm text-gray-700 leading-5">
                  Система автоматично розраховує ваші платежі на основі показників лічильників
                </p>
              </div>
            </li>

            <li className="flex gap-4">
              <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[gold]">
                <TrendingUp className="w-4 h-4 text-[#333333]" />
              </div>
              <div>
                <h3 className="text-base font-medium text-[#333333] leading-6 mb-2">
                  Зручне відстеження споживання
                </h3>
                <p className="text-sm text-gray-700 leading-5">
                  Відстежуйте своє споживання води, газу та електроенергії в режимі реального часу
                </p>
              </div>
            </li>

            <li className="flex gap-4">
              <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[gold]">
                <Bell className="w-4 h-4 text-[#333333]" />
              </div>
              <div>
                <h3 className="text-base font-medium text-[#333333] leading-6 mb-1">
                  Нагадування про оплату
                </h3>
                <p className="text-sm text-gray-700 leading-5">
                  Отримуйте своєчасні нагадування про необхідність оплати комунальних послуг
                </p>
              </div>
            </li>

            <li className="flex gap-4">
              <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[gold]">
                <BarChart3 className="w-4 h-4 text-[#333333]" />
              </div>
              <div>
                <h3 className="text-base font-medium text-[#333333] leading-6 mb-1">
                  Детальна аналітика витрат
                </h3>
                <p className="text-sm text-gray-700 leading-5">
                  Аналізуйте свої витрати за допомогою зручних графіків та діаграм
                </p>
              </div>
            </li>

            <li className="flex gap-4">
              <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[gold]">
                <Shield className="w-4 h-4 text-[#333333]" />
              </div>
              <div>
                <h3 className="text-base font-medium text-[#333333] leading-6 mb-1">
                  Безпечне зберігання даних
                </h3>
                <p className="text-sm text-gray-700 leading-5">
                  Ваші особисті дані та історія платежів надійно захищені
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
