import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { PageSectionHeader } from '../../../shared/components/pages'
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  FormMessage,
  Input,
  Label,
  PhotoDropzone,
  RadioCard,
  Select,
  Textarea,
} from '../../../shared/components/ui'
import { CalendarDays, UploadCloud } from 'lucide-react'
import {
  type MeterType,
  METER_TYPE_OPTIONS,
  METER_TYPE_UNITS,
} from '../../../shared/constants/meterTypes'
import { MOCK_ADDRESSES, MOCK_PROVIDERS } from '../../../shared/data/mockDatabase'
import { formatTariffLabel, getPrimaryTariff } from '../../../shared/utils/providerTariffs'

type SubmissionIntent = 'draft' | 'submit'

interface MeterFormValues {
  addressId: string
  meterType: MeterType | ''
  serialNumber: string
  installationLocation: string
  manufacturer: string
  installationDate: string
  initialReading: string
  tariffValue: string
  providerId: string
  notes: string
  photo: FileList | null
}

const defaultValues: MeterFormValues = {
  addressId: '',
  meterType: '',
  serialNumber: '',
  installationLocation: '',
  manufacturer: '',
  installationDate: '',
  initialReading: '',
  tariffValue: '',
  providerId: '',
  notes: '',
  photo: null,
}

const requiredFieldKeys: Array<keyof Pick<MeterFormValues, 'addressId' | 'meterType' | 'serialNumber' | 'installationDate' | 'initialReading' | 'tariffValue'>> = [
  'addressId',
  'meterType',
  'serialNumber',
  'installationDate',
  'initialReading',
  'tariffValue',
]

export interface AddMeterFormProps {
  onCancel?: () => void
}

export function AddMeterForm({ onCancel }: AddMeterFormProps) {
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MeterFormValues>({
    defaultValues,
  })

  const addressId = watch('addressId')
  const meterType = watch('meterType')
  const serialNumber = watch('serialNumber')
  const installationDate = watch('installationDate')
  const initialReading = watch('initialReading')
  const tariffValue = watch('tariffValue')
  const providerId = watch('providerId')

  const { ref: photoRef, onChange: photoOnChange, ...photoField } = register('photo')

  const progress = useMemo(() => {
    const completed = requiredFieldKeys.reduce((count, key) => {
      const value = (() => {
        switch (key) {
          case 'addressId':
            return addressId
          case 'meterType':
            return meterType
          case 'serialNumber':
            return serialNumber
          case 'installationDate':
            return installationDate
          case 'initialReading':
            return initialReading
          case 'tariffValue':
            return tariffValue
          default:
            return ''
        }
      })()

      return value ? count + 1 : count
    }, 0)

    if (completed === 0) {
      return 0
    }

    return Math.min(100, Math.round((completed / requiredFieldKeys.length) * 100))
  }, [addressId, meterType, serialNumber, installationDate, initialReading, tariffValue])

  const addressOptions = useMemo(() => {
    return MOCK_ADDRESSES.map((address) => ({
      value: String(address.id),
      label: `${address.street}, ${address.building}, кв. ${address.apartment}`,
    }))
  }, [])

  const handleMeterTypeSelect = (value: MeterType) => {
    setValue('meterType', value, { shouldValidate: true })
  }

  const availableProviders = useMemo(() => {
    if (!meterType) {
      return []
    }

    return MOCK_PROVIDERS.filter((provider) => {
      return provider.serviceType === meterType
    })
  }, [meterType])

  const selectedProvider = useMemo(() => {
    if (!providerId) {
      return null
    }
    const providerIdNum = Number(providerId)
    return availableProviders.find((provider) => provider.id === providerIdNum) ?? null
  }, [availableProviders, providerId])

  const selectedTariff = useMemo(() => {
    return selectedProvider ? getPrimaryTariff(selectedProvider) : null
  }, [selectedProvider])

  useEffect(() => {
    if (!meterType && providerId) {
      setValue('providerId', '', { shouldDirty: true })
      return
    }

    if (providerId) {
      const providerIdNum = Number(providerId)
      if (availableProviders.every((provider) => provider.id !== providerIdNum)) {
        setValue('providerId', '', { shouldDirty: true })
      }
    }
  }, [availableProviders, meterType, providerId, setValue])

  useEffect(() => {
    if (!selectedProvider || !selectedTariff) {
      return
    }

    setValue('tariffValue', selectedTariff.price.toString(), {
      shouldDirty: true,
      shouldValidate: true,
    })
  }, [selectedProvider, selectedTariff, setValue])

  const updatePhotoState = (files: FileList | null) => {
    setValue('photo', files, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })

    if (files?.[0]) {
      const file = files[0]
      setUploadedFileName(file.name)
      setPhotoPreview((previous) => {
        if (previous) {
          URL.revokeObjectURL(previous)
        }
        return URL.createObjectURL(file)
      })
    } else {
      setUploadedFileName(null)
      setPhotoPreview((previous) => {
        if (previous) {
          URL.revokeObjectURL(previous)
        }
        return null
      })
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    photoOnChange(event)
    const files = event.target.files
    updatePhotoState(files?.length ? files : null)
  }

  const handleFilesSelected = (files: FileList | null) => {
    updatePhotoState(files)
  }

  const handleClearPhoto = () => {
    if (photoInputRef.current) {
      photoInputRef.current.value = ''
    }
    updatePhotoState(null)
  }

  const simulateSubmit = async (values: MeterFormValues, intent: SubmissionIntent) => {
    await new Promise((resolve) => setTimeout(resolve, 600))

    console.log('Meter form submission', {
      intent,
      ...values,
      initialReading: values.initialReading ? Number(values.initialReading) : null,
      tariffValue: values.tariffValue ? Number(values.tariffValue) : null,
      photo: values.photo?.[0]?.name ?? null,
    })

    if (intent === 'submit') {
      reset(defaultValues)
      updatePhotoState(null)
      if (photoInputRef.current) {
        photoInputRef.current.value = ''
      }
    }
  }

  const submitWithIntent = (intent: SubmissionIntent) =>
    handleSubmit(async (values) => {
      await simulateSubmit(values, intent)
    })

  const handleResetForm = () => {
    reset(defaultValues)
    updatePhotoState(null)
    if (photoInputRef.current) {
      photoInputRef.current.value = ''
    }
  }

  const readingUnit = meterType && meterType in METER_TYPE_UNITS ? METER_TYPE_UNITS[meterType] : 'од.'
  const tariffUnitLabel =
    selectedProvider?.unitLabel ?? (meterType ? `грн/${readingUnit}` : 'грн')

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview])

  return (
    <form className="space-y-6" onSubmit={submitWithIntent('submit')}>
      <Card className="border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <PageSectionHeader
          title="Додати новий лічильник"
          description="Заповніть форму, щоб додати новий лічильник для обліку комунальних послуг"
        />

        <CardContent className="space-y-8">
          <section className="space-y-3">
            <Label htmlFor="addressId" className="text-base font-semibold text-gray-800">
              Оберіть адресу <span className="text-red-500">*</span>
            </Label>
            <Select
              id="addressId"
              {...register('addressId', { required: 'Оберіть адресу зі списку' })}
              isInvalid={Boolean(errors.addressId)}
              className="text-base"
            >
              <option value="">Оберіть адресу зі списку</option>
              {addressOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <FormMessage variant="error">{errors.addressId?.message}</FormMessage>
          </section>

          <section className="space-y-3">
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold text-gray-800">
                Тип лічильника <span className="text-red-500">*</span>
              </p>
              <p className="text-sm text-gray-500">
                Оберіть тип послуги, для якої встановлюється лічильник
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {METER_TYPE_OPTIONS.map((option) => (
                <RadioCard
                  key={option.value}
                  title={option.title}
                  description={option.description}
                  icon={option.icon}
                  selected={meterType === option.value}
                  onClick={() => handleMeterTypeSelect(option.value)}
                />
              ))}
            </div>
            <input
              type="hidden"
              {...register('meterType', { required: 'Оберіть тип лічильника' })}
            />
            <FormMessage variant="error">{errors.meterType?.message}</FormMessage>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">
                Серійний номер <span className="text-red-500">*</span>
              </Label>
              <Input
                id="serialNumber"
                placeholder="Введіть серійний номер лічильника"
                {...register('serialNumber', {
                  required: 'Серійний номер є обов\'язковим',
                  minLength: { value: 6, message: 'Мінімум 6 символів' },
                })}
                isInvalid={Boolean(errors.serialNumber)}
              />
              <FormMessage variant="default" className="text-xs text-gray-500">
                Приклад: AE123456789
              </FormMessage>
              <FormMessage variant="error">{errors.serialNumber?.message}</FormMessage>
            </div>

            <div className="space-y-2">
              <Label htmlFor="installationLocation">Розташування лічильника</Label>
              <Input
                id="installationLocation"
                placeholder="Наприклад: на кухні біля вхідних дверей"
                {...register('installationLocation')}
              />
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Модель/Виробник</Label>
              <Input
                id="manufacturer"
                placeholder="Введіть модель або виробника лічильника"
                {...register('manufacturer')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photoUpload">Фото лічильника</Label>
              <PhotoDropzone
                id="photoUpload"
                fileName={uploadedFileName}
                previewUrl={photoPreview}
                emptyIcon={<UploadCloud className="h-8 w-8 text-primary" />}
                emptyTitle="Перетягніть фото сюди або натисніть для вибору"
                emptyDescription="Підтримувані формати: JPG, PNG, HEIC. Макс. розмір: 5MB"
                helperText="Перетягніть інше фото або натисніть, щоб замінити"
                buttonLabel="Завантажити фото"
                clearLabel="Видалити фото"
                onFilesSelected={handleFilesSelected}
                onClear={handleClearPhoto}
                inputProps={{
                  ...photoField,
                  accept: 'image/png,image/jpeg,image/heic',
                  onChange: handleFileChange,
                  ref: (element) => {
                    photoRef(element)
                    photoInputRef.current = element
                  },
                }}
              />
              {!photoPreview && uploadedFileName ? (
                <FormMessage className="text-sm text-gray-600 dark:text-slate-300">
                  Вибрано: {uploadedFileName}
                </FormMessage>
              ) : null}
            </div>
         </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="installationDate">
                Дата встановлення <span className="text-red-500">*</span>
              </Label>
              <Input
                id="installationDate"
                type="date"
                placeholder="Обрати дату"
                {...register('installationDate', { required: 'Вкажіть дату встановлення' })}
                isInvalid={Boolean(errors.installationDate)}
                endAdornment={<CalendarDays className="h-5 w-5 text-gray-400" />}
              />
              <FormMessage variant="error">{errors.installationDate?.message}</FormMessage>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="initialReading">
                  Початкові показання <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="initialReading"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  {...register('initialReading', {
                    required: 'Вкажіть початкові показання',
                  })}
                  isInvalid={Boolean(errors.initialReading)}
                  endAdornment={<span className="text-sm text-gray-500">{readingUnit}</span>}
                />
                <FormMessage variant="error">{errors.initialReading?.message}</FormMessage>
              </div>

              <div className="space-y-2">
                <Label htmlFor="providerId">Провайдер послуги</Label>
                <Select
                  id="providerId"
                  {...register('providerId')}
                  disabled={!meterType || availableProviders.length === 0}
                >
                  <option value="">
                    {meterType
                      ? availableProviders.length
                        ? 'Оберіть провайдера'
                        : 'Немає шаблонів для цього типу'
                      : 'Спочатку оберіть тип лічильника'}
                  </option>
                  {availableProviders.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name} · {(() => {
                        const tariff = getPrimaryTariff(provider)
                        if (!tariff) return provider.unitLabel
                        return `${tariff.name} · ${formatTariffLabel(tariff.price, provider.unitLabel)}`
                      })()}
                    </option>
                  ))}
                </Select>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {selectedProvider
                    ? 'Тариф автоматично оновлено згідно з обраним провайдером.'
                    : 'Виберіть провайдера, щоб автоматично підставити тариф.'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tariffValue">
                Поточний тариф (грн за одиницю) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tariffValue"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                {...register('tariffValue', {
                  required: 'Вкажіть тариф',
                })}
                isInvalid={Boolean(errors.tariffValue)}
                endAdornment={<span className="text-sm text-gray-500">{tariffUnitLabel}</span>}
              />
              {selectedProvider ? (
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Джерело тарифу: {selectedProvider.name}
                </p>
              ) : null}
              <FormMessage variant="error">{errors.tariffValue?.message}</FormMessage>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="notes">Додаткові примітки</Label>
              <Textarea
                id="notes"
                rows={5}
                placeholder="Будь-які додаткові деталі про лічильник"
                {...register('notes')}
              />
            </div>
            <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <p className="font-semibold text-gray-800 dark:text-slate-100">Поради щодо заповнення</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Перевірте серійний номер і дату встановлення у техпаспорті.</li>
                <li>Завантажте фото з чітко видимими показниками лічильника.</li>
                <li>Уточніть тариф у договорі з постачальником послуги.</li>
              </ul>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-800 dark:text-slate-100">Заповнення форми</p>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-primary transition-all dark:bg-amber-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">{progress}% завершено</p>
              </div>
            </div>
          </section>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t border-gray-200 px-6 py-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              tone="neutral"
              onClick={onCancel}
            >
              Скасувати
            </Button>
            <Button
              type="button"
              variant="ghost"
              tone="neutral"
              onClick={handleResetForm}
            >
              Очистити форму
            </Button>
          </div>
          <div className="flex w-full flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              tone="primary"
              onClick={submitWithIntent('draft')}
              disabled={isSubmitting}
            >
              Зберегти чернетку
            </Button>
            <Button type="submit" loading={isSubmitting} loadingText="Збереження...">
              Зберегти лічильник
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  )
}
