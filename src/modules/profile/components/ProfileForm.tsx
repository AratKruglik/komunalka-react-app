import { useState, type FormEvent } from 'react'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormMessage,
  Input,
  Label,
} from '../../../shared/components/ui'

interface ProfileFormProps {
  onCancel?: () => void
}

// Mock user data - TODO: Replace with actual API call to GET /api/v1/users/{id}
const mockUserData = {
  username: 'olena_petrenko',
  email: 'olena@example.com',
}

export function ProfileForm({ onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    username: mockUserData.username,
    email: mockUserData.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setSuccessMessage('')
    setIsLoading(true)

    const newErrors: Record<string, string> = {}

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = "Ім'я користувача обов'язкове"
    } else if (formData.username.length < 3) {
      newErrors.username = "Ім'я користувача повинно містити мінімум 3 символи"
    }

    // Validate email
    if (!formData.email) {
      newErrors.email = "Електронна пошта обов'язкова"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Невірний формат електронної пошти'
    }

    // Validate password change if any password field is filled
    const isChangingPassword = formData.currentPassword || formData.newPassword || formData.confirmPassword

    if (isChangingPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Введіть поточний пароль"
      }

      if (!formData.newPassword) {
        newErrors.newPassword = "Введіть новий пароль"
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Пароль повинен містити мінімум 6 символів'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Підтвердіть новий пароль"
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Паролі не співпадають'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      // TODO: Replace with actual API call to PUT /api/v1/users/{id}
      // Example payload:
      // {
      //   username: formData.username,
      //   email: formData.email,
      //   password: formData.newPassword (only if changing password)
      // }
      console.log('Profile update attempt:', {
        username: formData.username,
        email: formData.email,
        passwordChanged: isChangingPassword,
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Clear password fields after successful update
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      setSuccessMessage('Профіль успішно оновлено!')
    } catch (error) {
      console.error('Profile update error:', error)
      setErrors({ submit: 'Не вдалося оновити профіль. Спробуйте пізніше.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {successMessage ? (
        <Alert variant="success" className="shadow-md">
          <AlertTitle>Готово</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      {errors.submit ? (
        <Alert variant="danger" className="shadow-md">
          <AlertTitle>Помилка</AlertTitle>
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Basic Information Card */}
        <Card className="border border-gray-200 shadow-lg dark:border-slate-800">
          <CardHeader>
            <CardTitle>Основна інформація</CardTitle>
            <CardDescription>Оновіть свої особисті дані</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username">Ім&apos;я користувача</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                leadingIcon={<User className="h-4 w-4 text-neutral-500" />}
                placeholder="Ваше ім'я користувача"
                disabled={isLoading}
                isInvalid={Boolean(errors.username)}
              />
              {errors.username ? (
                <FormMessage variant="error">{errors.username}</FormMessage>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Електронна пошта</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                leadingIcon={<Mail className="h-4 w-4 text-neutral-500" />}
                placeholder="your@email.com"
                disabled={isLoading}
                isInvalid={Boolean(errors.email)}
              />
              {errors.email ? (
                <FormMessage variant="error">{errors.email}</FormMessage>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Password Change Card */}
        <Card className="border border-gray-200 shadow-lg dark:border-slate-800">
          <CardHeader>
            <CardTitle>Зміна паролю</CardTitle>
            <CardDescription>
              Залиште поля порожніми, якщо не хочете змінювати пароль
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Поточний пароль</Label>
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                leadingIcon={<Lock className="h-4 w-4 text-neutral-500" />}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="rounded-md p-2 text-neutral-500 transition hover:text-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed dark:text-slate-400 dark:hover:text-slate-200"
                    aria-label={showCurrentPassword ? 'Приховати пароль' : 'Показати пароль'}
                    disabled={isLoading}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                isInvalid={Boolean(errors.currentPassword)}
              />
              {errors.currentPassword ? (
                <FormMessage variant="error">{errors.currentPassword}</FormMessage>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">Новий пароль</Label>
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                leadingIcon={<Lock className="h-4 w-4 text-neutral-500" />}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="rounded-md p-2 text-neutral-500 transition hover:text-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed dark:text-slate-400 dark:hover:text-slate-200"
                    aria-label={showNewPassword ? 'Приховати пароль' : 'Показати пароль'}
                    disabled={isLoading}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                isInvalid={Boolean(errors.newPassword)}
              />
              {errors.newPassword ? (
                <FormMessage variant="error">{errors.newPassword}</FormMessage>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Підтвердити новий пароль</Label>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                leadingIcon={<Lock className="h-4 w-4 text-neutral-500" />}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="rounded-md p-2 text-neutral-500 transition hover:text-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed dark:text-slate-400 dark:hover:text-slate-200"
                    aria-label={showConfirmPassword ? 'Приховати пароль' : 'Показати пароль'}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                isInvalid={Boolean(errors.confirmPassword)}
              />
              {errors.confirmPassword ? (
                <FormMessage variant="error">{errors.confirmPassword}</FormMessage>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            tone="neutral"
            onClick={onCancel}
            disabled={isLoading}
          >
            Скасувати
          </Button>
        ) : null}
        <Button
          type="submit"
          loading={isLoading}
          loadingText="Збереження..."
          tone="primary"
        >
          Зберегти зміни
        </Button>
      </div>
    </form>
  )
}
