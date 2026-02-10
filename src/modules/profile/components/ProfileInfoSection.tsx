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
  PhotoDropzone,
} from '@shared/components/ui'
import { userService } from '@shared/api'
import type { UseProfileReturn } from './profile-section.types'

interface ProfileInfoSectionProps {
  profile: UseProfileReturn
}

const AVATAR_SIZE_LIMIT = 2 * 1024 * 1024

export function ProfileInfoSection({ profile }: ProfileInfoSectionProps) {
  const { user, isLoading, error: profileError, isSuccess, updateProfile, clearError } = profile

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  })

  const initialAvatarPreview = user?.avatarUrl
    ? userService.getAvatarUrl(user.id, 'full')
    : null
  const initialAvatarLabel = initialAvatarPreview ? 'Поточний аватар' : null

  const [avatarFileName, setAvatarFileName] = useState<string | null>(initialAvatarLabel)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialAvatarPreview)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const avatarObjectUrlRef = useRef<string | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (user) {
      const phoneWithoutPrefix = user.phoneNumber?.replace(/^\+?380/, '') || ''
      setFormData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: phoneWithoutPrefix,
      })
      setAvatarFile(null)
      if (user.avatarUrl) {
        setAvatarPreview(userService.getAvatarUrl(user.id, 'full'))
        setAvatarFileName('Поточний аватар')
      }
    }
  }, [user])

  useEffect(() => {
    if (isSuccess) {
      setSuccessMessage('Профіль успішно оновлено!')
    }
  }, [isSuccess])

  useEffect(() => {
    if (profileError) {
      setErrors({ submit: profileError })
    }
  }, [profileError])

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
        avatar: 'Розмір файлу не повинен перевищувати 2 МБ',
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
    clearError()

    const newErrors: Record<string, string> = {}

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

    if (!formData.email) {
      newErrors.email = "Електронна пошта обов'язкова"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Невірний формат електронної пошти'
    }

    if (avatarFile && avatarFile.size > AVATAR_SIZE_LIMIT) {
      newErrors.avatar = 'Розмір файлу не повинен перевищувати 2 МБ'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const phoneWithPrefix = formData.phone ? `+380${formData.phone}` : undefined
    await updateProfile({
      username: formData.username,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: phoneWithPrefix,
      avatar: avatarFile ?? undefined,
    })

    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current)
      avatarObjectUrlRef.current = null
    }
    setAvatarFile(null)
    if (avatarInputRef.current) {
      avatarInputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card className="border border-gray-200 shadow-lg dark:border-slate-800">
        <CardHeader>
          <CardTitle>Основна інформація</CardTitle>
          <CardDescription>Оновіть свої особисті дані</CardDescription>
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

          <div className="space-y-2">
            <Label htmlFor="avatar">Аватар</Label>
            <PhotoDropzone
              id="avatar"
              fileName={avatarFileName}
              previewUrl={avatarPreview}
              emptyIcon={<Camera className="h-10 w-10 text-primary" />}
              emptyTitle="Перетягніть фото сюди або натисніть, щоб обрати"
              emptyDescription="JPG, PNG, HEIC до 2 МБ. Фото зʼявиться у меню та шапці."
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

          <div className="flex w-full justify-end pt-2">
            <Button
              type="submit"
              loading={isLoading}
              loadingText="Збереження..."
              tone="primary"
            >
              Зберегти зміни
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
