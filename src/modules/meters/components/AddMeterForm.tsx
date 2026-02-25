import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { PageSectionHeader } from '@shared/components/pages'
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  FormMessage,
  Input,
  Label,
  RadioCard,
  Select,
  Textarea,
} from '@shared/components/ui'
import { CalendarDays } from 'lucide-react'
import {
  type MeterType,
  METER_TYPE_OPTIONS,
  METER_TYPE_UNITS,
} from '@shared/constants/meterTypes'
import { useAddresses } from '@modules/addresses/hooks'
import { useCreateMeter } from '@modules/meters/hooks'
import { useServiceProvidersByAddress } from '@modules/providers/hooks'
import { toUtilityTypeId, type CreateMeterRequest } from '@modules/meters/types'
import { formatApiTariffLabel, getApiPrimaryTariff } from '@shared/utils/providerTariffs'
import { METER_TYPE_TO_UTILITY_TYPE_ID } from '@shared/types/entities'

type SubmissionIntent = 'draft' | 'submit'

interface MeterFormValues {
  addressId: string
  meterType: MeterType | ''
  serialNumber: string
  installationLocation: string
  manufacturer: string
  installationDate: string
  initialReading: string
  providerId: string
  notes: string
}

const defaultValues: MeterFormValues = {
  addressId: '',
  meterType: '',
  serialNumber: '',
  installationLocation: '',
  manufacturer: '',
  installationDate: '',
  initialReading: '',
  providerId: '',
  notes: '',
}

const requiredFieldKeys: Array<keyof Pick<MeterFormValues, 'addressId' | 'meterType' | 'serialNumber' | 'installationDate' | 'initialReading' | 'providerId'>> = [
  'addressId',
  'meterType',
  'serialNumber',
  'installationDate',
  'initialReading',
  'providerId',
]

export interface AddMeterFormProps {
  onCancel?: () => void
  onSuccess?: () => void
}

export function AddMeterForm({ onCancel, onSuccess }: AddMeterFormProps) {
  const { addresses } = useAddresses()
  const { createMeter, isLoading: isCreating, error: createError } = useCreateMeter()
  const [currentAddressId, setCurrentAddressId] = useState<number | null>(null)
  const { providers: addressProviders, isLoading: providersLoading } = useServiceProvidersByAddress(currentAddressId)

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
  const providerId = watch('providerId')

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
          case 'providerId':
            return providerId
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
  }, [addressId, meterType, serialNumber, installationDate, initialReading, providerId])

  const addressOptions = useMemo(() => {
    return addresses.map((address) => {
      const apartment = address.apartmentNumber ? `, кв. ${address.apartmentNumber}` : ''
      return {
        value: String(address.id),
        label: `${address.street}, ${address.buildingNumber}${apartment}`,
      }
    })
  }, [addresses])

  const handleMeterTypeSelect = (value: MeterType) => {
    setValue('meterType', value, { shouldValidate: true })
  }

  useEffect(() => {
    if (addressId) {
      setCurrentAddressId(Number(addressId))
    } else {
      setCurrentAddressId(null)
    }
  }, [addressId])

  const availableProviders = useMemo(() => {
    if (!meterType || !addressProviders.length) {
      return []
    }

    const targetUtilityTypeId = METER_TYPE_TO_UTILITY_TYPE_ID[meterType]

    return addressProviders.filter((provider) => {
      return provider.tariffs.some((tariff) => tariff.utilityType.id === targetUtilityTypeId)
    })
  }, [meterType, addressProviders])

  const selectedProvider = useMemo(() => {
    if (!providerId) {
      return null
    }
    const providerIdNum = Number(providerId)
    return availableProviders.find((provider) => provider.id === providerIdNum) ?? null
  }, [availableProviders, providerId])

  const providerTariffs = useMemo(() => {
    if (!selectedProvider || !meterType) {
      return []
    }
    const targetUtilityTypeId = METER_TYPE_TO_UTILITY_TYPE_ID[meterType]
    return selectedProvider.tariffs.filter((tariff) => tariff.utilityType.id === targetUtilityTypeId)
  }, [selectedProvider, meterType])

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

  const submitToApi = async (values: MeterFormValues, intent: SubmissionIntent) => {
    if (intent === 'draft') {
      console.log('Saving draft:', values)
      return
    }

    const request: CreateMeterRequest = {
      addressId: Number(values.addressId),
      utilityTypeId: toUtilityTypeId(values.meterType as MeterType),
      name: values.meterType ? METER_TYPE_OPTIONS.find((o) => o.value === values.meterType)?.title ?? values.meterType : '',
      serialNumber: values.serialNumber,
      installationDate: values.installationDate,
      isActive: true,
      modelName: values.manufacturer || undefined,
      location: values.installationLocation || undefined,
      initialReading: values.initialReading ? Number(values.initialReading) : undefined,
      serviceProviderId: Number(values.providerId),
      notes: values.notes || undefined,
    }

    await createMeter(request)

    onSuccess?.()
  }

  const submitWithIntent = (intent: SubmissionIntent) =>
    handleSubmit(async (values) => {
      await submitToApi(values, intent)
    })

  const handleResetForm = () => {
    reset(defaultValues)
  }

  const readingUnit = meterType && meterType in METER_TYPE_UNITS ? METER_TYPE_UNITS[meterType] : 'од.'

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
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="providerId">
                Провайдер послуги <span className="text-red-500">*</span>
              </Label>
              <Select
                id="providerId"
                {...register('providerId', { required: 'Оберіть провайдера послуги' })}
                isInvalid={Boolean(errors.providerId)}
                disabled={!meterType || !addressId || providersLoading || availableProviders.length === 0}
              >
                <option value="">
                  {!addressId
                    ? 'Спочатку оберіть адресу'
                    : !meterType
                      ? 'Спочатку оберіть тип лічильника'
                      : providersLoading
                        ? 'Завантаження...'
                        : availableProviders.length
                          ? 'Оберіть провайдера'
                          : 'Немає провайдерів для цієї адреси'}
                </option>
                {availableProviders.map((provider) => {
                  const tariff = getApiPrimaryTariff(provider)
                  return (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                      {tariff ? ` · ${formatApiTariffLabel(tariff)}` : ''}
                    </option>
                  )
                })}
              </Select>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {selectedProvider
                  ? 'Тариф автоматично оновлено згідно з обраним провайдером.'
                  : 'Виберіть провайдера, щоб автоматично підставити тариф.'}
              </p>
              <FormMessage variant="error">{errors.providerId?.message}</FormMessage>
            </div>

            {selectedProvider && providerTariffs.length > 0 ? (
              <div className="space-y-2 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Тарифна інформація
                </p>
                {providerTariffs.map((tariff) => (
                  <p key={tariff.id} className="text-sm text-blue-700 dark:text-blue-300">
                    {tariff.name}: {formatApiTariffLabel(tariff)}
                    {tariff.serviceFee > 0 && ` + абонплата ${tariff.serviceFee.toFixed(2)} ${tariff.currency.symbol}`}
                  </p>
                ))}
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Джерело: {selectedProvider.name}
                </p>
              </div>
            ) : null}
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
                <li>Вкажіть точну модель лічильника для зручності обслуговування.</li>
                <li>Оберіть провайдера послуги для прив'язки тарифу до лічильника.</li>
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
              disabled={isSubmitting || isCreating}
            >
              Зберегти чернетку
            </Button>
            <Button
              type="submit"
              loading={isSubmitting || isCreating}
              loadingText="Збереження..."
            >
              Зберегти лічильник
            </Button>
          </div>
        </CardFooter>
        {createError && (
          <div className="px-6 pb-4">
            <FormMessage variant="error">{createError}</FormMessage>
          </div>
        )}
      </Card>
    </form>
  )
}
