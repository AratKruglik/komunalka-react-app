import { useState, type FormEvent } from 'react'
import { User, Mail } from 'lucide-react'
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
  PasswordInput,
} from '../../../shared/components/ui'
import {
  defaultPasswordRequirements,
  getPasswordStrength,
} from '../../../shared/components/ui/form/PasswordInput'

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
      } else {
        const strength = getPasswordStrength(formData.newPassword, defaultPasswordRequirements)
        if (strength === 'weak' || strength === 'none') {
          newErrors.newPassword = 'Пароль занадто слабкий'
        }
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
            <PasswordInput
              id="currentPassword"
              label="Поточний пароль"
              value={formData.currentPassword}
              onChange={(value) => setFormData({ ...formData, currentPassword: value })}
              disabled={isLoading}
              error={errors.currentPassword}
              showStrength={false}
              autoComplete="current-password"
              placeholder="••••••••"
            />

            <PasswordInput
              id="newPassword"
              label="Новий пароль"
              value={formData.newPassword}
              onChange={(value) => setFormData({ ...formData, newPassword: value })}
              disabled={isLoading}
              error={errors.newPassword}
              autoComplete="new-password"
              placeholder="••••••••"
              requirements={defaultPasswordRequirements}
            />

            <PasswordInput
              id="confirmPassword"
              label="Підтвердити новий пароль"
              value={formData.confirmPassword}
              onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
              disabled={isLoading}
              error={errors.confirmPassword}
              autoComplete="new-password"
              placeholder="••••••••"
              showStrength={false}
            />
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
