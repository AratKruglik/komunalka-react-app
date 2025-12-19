import { useEffect, useRef, useState, type FormEvent } from 'react'
import { User, Mail, Camera } from 'lucide-react'
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
  PhotoDropzone,
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
  firstName: 'Олена',
  lastName: 'Петренко',
  phone: '501234567',
  avatarUrl: null,
}

const AVATAR_SIZE_LIMIT = 5 * 1024 * 1024

export function ProfileForm({ onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    username: mockUserData.username,
    email: mockUserData.email,
    firstName: mockUserData.firstName,
    lastName: mockUserData.lastName,
    phone: mockUserData.phone,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const initialAvatarPreview = mockUserData.avatarUrl ?? null
  const initialAvatarLabel = initialAvatarPreview ? 'Поточний аватар' : null

  const [avatarFileName, setAvatarFileName] = useState<string | null>(initialAvatarLabel)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialAvatarPreview)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const avatarObjectUrlRef = useRef<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current)
      }
    }
  }, [])

  const clearAvatarError = () => {
    setErrors((previous) => {
      if (!previous.avatar) {
        return previous
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { avatar, ...rest } = previous
      return rest
    })
  }

  const resetAvatarPreview = () => {
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current)
      avatarObjectUrlRef.current = null
    }
    setAvatarFile(null)
    setAvatarPreview(initialAvatarPreview)
    setAvatarFileName(initialAvatarLabel)
    if (avatarInputRef.current) {
      avatarInputRef.current.value = ''
    }
    clearAvatarError()
  }

  const handleAvatarSelected = (files: FileList | null) => {
    if (!files?.length) {
      resetAvatarPreview()
      return
    }

    const file = files[0]

    if (file.size > AVATAR_SIZE_LIMIT) {
      setErrors((previous) => ({
        ...previous,
        avatar: 'Розмір файлу не повинен перевищувати 5 МБ',
      }))
      return
    }

    clearAvatarError()
    setAvatarFile(file)
    setAvatarFileName(file.name)

    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current)
    }
    const previewUrl = URL.createObjectURL(file)
    avatarObjectUrlRef.current = previewUrl
    setAvatarPreview(previewUrl)
  }

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

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Ім'я обов'язкове"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Прізвище обовʼязкове'
    }

    if (!formData.phone) {
      newErrors.phone = "Номер телефону обов'язковий"
    } else if (!/^\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Введіть коректний номер телефону (9 цифр)'
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

    if (avatarFile && avatarFile.size > AVATAR_SIZE_LIMIT) {
      newErrors.avatar = 'Розмір файлу не повинен перевищувати 5 МБ'
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
      //   firstName: formData.firstName,
      //   lastName: formData.lastName,
      //   phone: formData.phone,
      //   password: formData.newPassword (only if changing password)
      // }
      console.log('Profile update attempt:', {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        avatarUpdated: Boolean(avatarFile),
        avatarFileName,
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
            <div className="grid gap-5 lg:grid-cols-[320px,1fr] lg:items-start">
              <div className="space-y-2">
                <Label htmlFor="avatar">Аватар</Label>
                <PhotoDropzone
                  id="avatar"
                  fileName={avatarFileName}
                  previewUrl={avatarPreview}
                  emptyIcon={<Camera className="h-10 w-10 text-primary" />}
                  emptyTitle="Перетягніть фото сюди або натисніть, щоб обрати"
                  emptyDescription="JPG, PNG, HEIC до 5 МБ. Фото зʼявиться у меню та шапці."
                  helperText="Щоб замінити аватар, перетягніть новий файл або натисніть для вибору"
                  buttonLabel="Оновити фото"
                  clearLabel={initialAvatarPreview ? 'Повернути попереднє фото' : 'Видалити фото'}
                  onFilesSelected={handleAvatarSelected}
                  onClear={resetAvatarPreview}
                  previewHeight={220}
                  inputProps={{
                    accept: 'image/png,image/jpeg,image/heic,image/heif,image/webp',
                    ref: (element) => {
                      avatarInputRef.current = element
                    },
                  }}
                />
                <div className="flex justify-start">
                  <Button
                    type="button"
                    variant="ghost"
                    tone="neutral"
                    size="sm"
                    onClick={resetAvatarPreview}
                    disabled={isLoading || (!avatarPreview && !avatarFile)}
                    className="mt-1"
                  >
                    Очистити аватар
                  </Button>
                </div>
                {errors.avatar ? (
                  <FormMessage variant="error">{errors.avatar}</FormMessage>
                ) : null}
              </div>

              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">Імʼя</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Ваше імʼя"
                      disabled={isLoading}
                      isInvalid={Boolean(errors.firstName)}
                    />
                    {errors.firstName ? (
                      <FormMessage variant="error">{errors.firstName}</FormMessage>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Прізвище</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Ваше прізвище"
                      disabled={isLoading}
                      isInvalid={Boolean(errors.lastName)}
                    />
                    {errors.lastName ? (
                      <FormMessage variant="error">{errors.lastName}</FormMessage>
                    ) : null}
                  </div>
                </div>

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

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Номер телефону</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-neutral-500 dark:text-slate-400">
                      +380
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value.replace(/\D/g, ''),
                        })
                      }
                      className="w-full rounded-md border border-neutral-300 bg-white pl-14 pr-3 py-2.5 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-amber-300 dark:focus:ring-amber-300"
                      placeholder="XX XXX XX XX"
                      maxLength={9}
                      inputMode="numeric"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.phone ? <FormMessage variant="error">{errors.phone}</FormMessage> : null}
                </div>
              </div>
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
