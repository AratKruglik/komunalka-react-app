import { useEffect, useState, type FormEvent } from 'react'
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
  PasswordInput,
} from '@shared/components/ui'
import {
  defaultPasswordRequirements,
  getPasswordStrength,
} from '@shared/components/ui/form/PasswordInput'
import type { UseProfileReturn } from './profile-section.types'

interface PasswordChangeSectionProps {
  profile: UseProfileReturn
}

export function PasswordChangeSection({ profile }: PasswordChangeSectionProps) {
  const { isLoading, error: profileError, isSuccess, updateProfile, clearError } = profile

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (isSuccess) {
      setSuccessMessage('Пароль успішно змінено!')
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    }
  }, [isSuccess])

  useEffect(() => {
    if (profileError) {
      setErrors({ submit: profileError })
    }
  }, [profileError])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setSuccessMessage('')
    clearError()

    const newErrors: Record<string, string> = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Введіть поточний пароль'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Введіть новий пароль'
    } else {
      const strength = getPasswordStrength(formData.newPassword, defaultPasswordRequirements)
      if (strength === 'weak' || strength === 'none') {
        newErrors.newPassword = 'Пароль занадто слабкий'
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Підтвердіть новий пароль'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Паролі не співпадають'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    await updateProfile({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmNewPassword: formData.confirmPassword,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card className="border border-gray-200 shadow-lg dark:border-slate-800">
        <CardHeader>
          <CardTitle>Зміна паролю</CardTitle>
          <CardDescription>
            Залиште поля порожніми, якщо не хочете змінювати пароль
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
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

          <div className="flex w-full justify-end pt-2">
            <Button
              type="submit"
              loading={isLoading}
              loadingText="Збереження..."
              tone="primary"
            >
              Змінити пароль
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
