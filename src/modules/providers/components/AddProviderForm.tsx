import { useMemo, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, ShieldCheck, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router'
import { PageSectionHeader } from '@shared/components/pages'
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  Checkbox,
  FormMessage,
  Input,
  Label,
  RadioCard,
  Select,
  Textarea,
} from '@shared/components/ui'
import { SERVICE_CONFIG } from '@shared/constants/services'
import { useAddresses } from '@/modules/addresses/hooks'
import { useUtilityTypes } from '@shared/hooks'
import { useCreateServiceProvider } from '../hooks'
import type { CreateServiceProviderRequest, CreateTariffRequest } from '@shared/types/api'

type TariffFormValue = {
  id: string
  name: string
  pricingModel: string
  baseRate: string
  serviceFee: string
}

type ProviderFormValues = {
  addressId: string
  providerName: string
  utilityTypeId: string
  supportPhone: string
  supportEmail: string
  website: string
  description: string
  autoReminder: boolean
  reminderDay: string
  tariffs: TariffFormValue[]
}

export interface AddProviderFormProps {
  onCancel?: () => void
  onSuccess?: () => void
}

type UtilityOption = {
  id: number
  slug: string
  title: string
  description: string
  unitLabel: string
  helper: string
  icon: LucideIcon
}

const SLUG_TO_METER_TYPE: Record<string, keyof typeof SERVICE_CONFIG> = {
  electricity: 'electricity',
  gas: 'gas',
  cold_water: 'coldWater',
  coldwater: 'coldWater',
  hot_water: 'hotWater',
  hotwater: 'hotWater',
  heat: 'heat',
  heating: 'heat',
}

const UTILITY_DESCRIPTIONS: Record<string, { description: string; helper: string }> = {
  electricity: {
    description: 'Електроенергія для квартири чи будинку',
    helper: 'Вкажіть тариф за кіловат-годину',
  },
  gas: {
    description: 'Природний газ для опалення та приготування їжі',
    helper: 'Зазвичай нараховується в кубічних метрах',
  },
  cold_water: {
    description: 'Холодне водопостачання',
    helper: 'Вкажіть тариф за кубічний метр',
  },
  coldwater: {
    description: 'Холодне водопостачання',
    helper: 'Вкажіть тариф за кубічний метр',
  },
  hot_water: {
    description: 'Гаряче водопостачання',
    helper: 'Вкажіть тариф за кубічний метр',
  },
  hotwater: {
    description: 'Гаряче водопостачання',
    helper: 'Вкажіть тариф за кубічний метр',
  },
  heat: {
    description: 'Централізоване опалення',
    helper: 'Найчастіше тариф вказується за гігакалорію',
  },
  heating: {
    description: 'Централізоване опалення',
    helper: 'Найчастіше тариф вказується за гігакалорію',
  },
}

const defaultValues: ProviderFormValues = {
  addressId: '',
  providerName: '',
  utilityTypeId: '',
  supportPhone: '',
  supportEmail: '',
  website: '',
  description: '',
  autoReminder: true,
  reminderDay: '5',
  tariffs: [{ id: 'tariff-1', name: 'Базовий тариф', pricingModel: 'fixed', baseRate: '', serviceFee: '0' }],
}

export function AddProviderForm({ onCancel, onSuccess }: AddProviderFormProps) {
  const navigate = useNavigate()
  const { addresses, isLoading: addressesLoading } = useAddresses()
  const { utilityTypes, isLoading: utilityTypesLoading } = useUtilityTypes()
  const { create, isLoading: isCreating, error: createError } = useCreateServiceProvider()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProviderFormValues>({
    defaultValues,
    mode: 'onSubmit',
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const providerName = watch('providerName')
  const utilityTypeId = watch('utilityTypeId')
  const autoReminder = watch('autoReminder')
  const tariffs = watch('tariffs') ?? []
  const addressId = watch('addressId')

  const { fields: tariffFields, append, remove } = useFieldArray({
    control,
    name: 'tariffs',
  })

  useEffect(() => {
    if (addresses.length > 0 && !addressId) {
      const primaryAddress = addresses.find((a) => a.isPrimary) ?? addresses[0]
      setValue('addressId', String(primaryAddress.id))
    }
  }, [addresses, addressId, setValue])

  const utilityOptions: UtilityOption[] = useMemo(() => {
    return utilityTypes.map((ut) => {
      const meterType = SLUG_TO_METER_TYPE[ut.slug] ?? 'electricity'
      const serviceConfig = SERVICE_CONFIG[meterType]
      const descriptions = UTILITY_DESCRIPTIONS[ut.slug] ?? {
        description: ut.displayName,
        helper: `Вкажіть тариф у ${ut.unit}`,
      }

      return {
        id: ut.id,
        slug: ut.slug,
        title: ut.displayName,
        description: descriptions.description,
        unitLabel: `грн/${ut.unit}`,
        helper: descriptions.helper,
        icon: serviceConfig.icon,
      }
    })
  }, [utilityTypes])

  const selectedUtility = useMemo(() => {
    return utilityOptions.find((option) => String(option.id) === utilityTypeId)
  }, [utilityOptions, utilityTypeId])

  const primaryTariff = tariffs[0]

  const completionProgress = useMemo(() => {
    const requiredFields = [addressId, providerName, utilityTypeId, primaryTariff?.baseRate]
    const completed = requiredFields.filter(Boolean).length
    if (!completed) return 0
    return Math.min(100, Math.round((completed / requiredFields.length) * 100))
  }, [addressId, primaryTariff?.baseRate, providerName, utilityTypeId])

  const handleUtilitySelect = (id: number) => {
    setValue('utilityTypeId', String(id), { shouldValidate: true })
  }

  const onSubmit = async (data: ProviderFormValues) => {
    setSubmitError(null)

    const tariffRequests: CreateTariffRequest[] = data.tariffs
      .filter((t) => t.baseRate)
      .map((t) => ({
        pricingModel: t.pricingModel || 'fixed',
        baseRate: Number(t.baseRate),
        serviceFee: Number(t.serviceFee) || 0,
        notes: t.name || null,
      }))

    const request: CreateServiceProviderRequest = {
      addressId: Number(data.addressId),
      utilityTypeId: Number(data.utilityTypeId),
      name: data.providerName,
      description: data.description || null,
      phone: data.supportPhone || null,
      email: data.supportEmail || null,
      website: data.website || null,
      isActive: true,
      tariffs: tariffRequests,
    }

    const result = await create(request)

    if (result) {
      reset(defaultValues)
      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/providers')
      }
    } else {
      setSubmitError(createError ?? 'Не вдалося створити провайдера')
    }
  }

  const formatAddressDisplay = (address: typeof addresses[0]): string => {
    const parts = [address.city, address.street, address.buildingNumber]
    if (address.apartmentNumber) {
      parts.push(`кв. ${address.apartmentNumber}`)
    }
    return parts.join(', ')
  }

  const isLoading = addressesLoading || utilityTypesLoading

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-5">
        <Card className="border border-gray-200 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <PageSectionHeader
            title="Новий провайдер"
            description="Додайте постачальника комунальних послуг для однієї з ваших адрес"
            titleClassName="text-2xl font-bold text-dark dark:text-slate-50"
          />

          <CardContent className="space-y-8">
            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {submitError}
              </div>
            )}

            <FormField
              id="addressId"
              label="Адреса"
              required
              helper="Оберіть адресу, для якої додаєте провайдера"
              error={errors.addressId?.message}
            >
              <Select
                id="addressId"
                disabled={isLoading || addresses.length === 0}
                {...register('addressId', { required: 'Оберіть адресу' })}
              >
                {addresses.length === 0 ? (
                  <option value="">Немає доступних адрес</option>
                ) : (
                  addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {formatAddressDisplay(address)}
                      {address.isPrimary ? ' (основна)' : ''}
                    </option>
                  ))
                )}
              </Select>
            </FormField>

            <section className="space-y-4">
              <div>
                <Label htmlFor="utilityTypeId" className="text-base text-dark dark:text-slate-100">
                  Тип послуги<span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Оберіть комунальну послугу, щоб ми підказали правильну одиницю виміру
                </p>
              </div>

              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-24 animate-pulse rounded-lg border border-gray-200 bg-gray-100 dark:border-slate-700 dark:bg-slate-800"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {utilityOptions.map((option) => (
                    <RadioCard
                      key={option.id}
                      title={option.title}
                      description={option.description}
                      icon={option.icon}
                      helperText={option.helper}
                      selected={utilityTypeId === String(option.id)}
                      onClick={() => handleUtilitySelect(option.id)}
                    />
                  ))}
                </div>
              )}
              <input
                type="hidden"
                {...register('utilityTypeId', { required: 'Оберіть тип послуги' })}
              />
              {errors.utilityTypeId && (
                <FormMessage variant="error">{errors.utilityTypeId.message}</FormMessage>
              )}
            </section>

            <section className="space-y-6">
              <FormField
                id="providerName"
                label="Назва провайдера"
                required
                helper="Офіційна назва в договорах або квитанціях"
                error={errors.providerName?.message}
              >
                <Input
                  id="providerName"
                  placeholder="Наприклад, Київводоканал"
                  {...register('providerName', { required: 'Вкажіть назву провайдера' })}
                  isInvalid={Boolean(errors.providerName)}
                />
              </FormField>

              <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-dark dark:text-slate-100">
                      Тарифи провайдера<span className="text-red-500">*</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Додайте денний, нічний чи інші плани. Мінімум один тариф обовʼязковий.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    tone="primary"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      append({
                        id: `tariff-${tariffFields.length + 1}-${Date.now()}`,
                        name: '',
                        pricingModel: '',
                        baseRate: '',
                        serviceFee: '0',
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Додати тариф
                  </Button>
                </div>

                <div className="space-y-3">
                  {tariffFields.map((tariff, index) => {
                    const tariffNameError = errors.tariffs?.[index]?.name?.message
                    const tariffRateError = errors.tariffs?.[index]?.baseRate?.message

                    return (
                      <div
                        key={tariff.id}
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-slate-700 dark:bg-slate-800"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 text-sm font-semibold text-gray-800 dark:text-slate-100">
                            <span className="grid size-9 place-items-center rounded-full bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-100">
                              {index + 1}
                            </span>
                            <span>{watch(`tariffs.${index}.name`) || 'Новий тариф'}</span>
                          </div>
                          {tariffFields.length > 1 ? (
                            <Button
                              type="button"
                              variant="ghost"
                              tone="neutral"
                              size="sm"
                              className="text-sm"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Видалити
                            </Button>
                          ) : (
                            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                              Базовий
                            </span>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 md:gap-6 md:pt-2">
                          <FormField
                            id={`tariff-name-${tariff.id}`}
                            label="Назва тарифу"
                            required
                            helper="Наприклад: Денний, Нічний"
                            error={tariffNameError}
                          >
                            <Input
                              id={`tariff-name-${tariff.id}`}
                              placeholder="Вкажіть назву тарифу"
                              {...register(`tariffs.${index}.name` as const, {
                                required: 'Назва тарифу є обовʼязковою',
                              })}
                              isInvalid={Boolean(tariffNameError)}
                            />
                          </FormField>

                          {/* TODO(human): Визначити UX для вибору pricingModel */}
                          <FormField
                            id={`tariff-pricing-${tariff.id}`}
                            label="Тип тарифу"
                            required
                            helper="Наприклад: day, night, peak, fixed"
                            error={errors.tariffs?.[index]?.pricingModel?.message}
                          >
                            <Input
                              id={`tariff-pricing-${tariff.id}`}
                              placeholder="fixed"
                              {...register(`tariffs.${index}.pricingModel` as const, {
                                required: 'Вкажіть тип тарифу',
                              })}
                              isInvalid={Boolean(errors.tariffs?.[index]?.pricingModel)}
                            />
                          </FormField>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                          <FormField
                            id={`tariff-rate-${tariff.id}`}
                            label="Базова ставка"
                            required
                            helper={selectedUtility?.helper ?? 'Вкажіть тариф у гривнях'}
                            error={tariffRateError}
                          >
                            <Input
                              id={`tariff-rate-${tariff.id}`}
                              type="number"
                              placeholder="12.45"
                              step="0.01"
                              min="0"
                              inputMode="decimal"
                              endAdornment={
                                <span className="text-sm font-medium text-gray-600 dark:text-slate-200">
                                  {selectedUtility?.unitLabel ?? 'грн/од.'}
                                </span>
                              }
                              {...register(`tariffs.${index}.baseRate` as const, {
                                required: 'Вкажіть тариф',
                                validate: (value) =>
                                  Number(value) > 0 || 'Вартість має бути більшою за 0',
                              })}
                              isInvalid={Boolean(tariffRateError)}
                            />
                          </FormField>

                          <FormField
                            id={`tariff-fee-${tariff.id}`}
                            label="Абонплата"
                            helper="Фіксована плата за обслуговування"
                          >
                            <Input
                              id={`tariff-fee-${tariff.id}`}
                              type="number"
                              placeholder="0"
                              step="0.01"
                              min="0"
                              inputMode="decimal"
                              endAdornment={
                                <span className="text-sm font-medium text-gray-600 dark:text-slate-200">
                                  грн
                                </span>
                              }
                              {...register(`tariffs.${index}.serviceFee` as const)}
                            />
                          </FormField>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  id="supportPhone"
                  label="Телефон підтримки"
                  helper="Номер, за яким можна уточнити тариф або передати показники"
                  error={errors.supportPhone?.message}
                >
                  <Input
                    id="supportPhone"
                    type="tel"
                    inputMode="tel"
                    placeholder="+380 44 123 45 67"
                    {...register('supportPhone', {
                      pattern: {
                        value: /^\+?[0-9\s()-]{7,}$/,
                        message: 'Вкажіть коректний номер телефону',
                      },
                    })}
                    isInvalid={Boolean(errors.supportPhone)}
                  />
                </FormField>

                <FormField
                  id="supportEmail"
                  label="E-mail для звернень"
                  helper="Якщо доступна, вкажіть адресу для електронних звернень"
                  error={errors.supportEmail?.message}
                >
                  <Input
                    id="supportEmail"
                    type="email"
                    placeholder="support@example.com"
                    {...register('supportEmail', {
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Вкажіть коректний email',
                      },
                    })}
                    isInvalid={Boolean(errors.supportEmail)}
                  />
                </FormField>
              </div>

              <FormField
                id="website"
                label="Офіційний сайт"
                helper="Додайте посилання, щоб мати швидкий доступ до кабінету"
                error={errors.website?.message}
              >
                <Input
                  id="website"
                  type="url"
                  placeholder="https://..."
                  {...register('website', {
                    pattern: {
                      value: /^(https?:\/\/)?[\w.-]+(\.[\w.-]+)+(\/[\w\-.~:?#@!$&'()*+,;=%]*)?$/,
                      message: 'Вкажіть коректне посилання',
                    },
                  })}
                  isInvalid={Boolean(errors.website)}
                />
              </FormField>

              <div className="grid gap-6 lg:grid-cols-2">
                <FormField
                  id="description"
                  label="Нотатки"
                  helper="Додаткові умови договору, графік роботи або внутрішні помітки"
                  error={errors.description?.message}
                >
                  <Textarea
                    id="description"
                    rows={5}
                    placeholder="Напишіть важливі деталі про провайдера або тариф"
                    {...register('description')}
                  />
                </FormField>

                <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <p className="font-semibold text-gray-800 dark:text-slate-100">
                    Поради щодо заповнення
                  </p>
                  <ul className="list-disc space-y-1.5 pl-5">
                    <li>Звіряйте назву та код провайдера з останньою квитанцією.</li>
                    <li>Перевірте актуальний тариф на сайті постачальника.</li>
                    <li>Налаштуйте нагадування, щоб не пропустити передачу показників.</li>
                  </ul>
                  <div className="space-y-1 border-t border-gray-200 pt-3 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-100">
                      Заповнення форми
                    </p>
                    <div className="h-2 rounded-full bg-gray-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-primary transition-all dark:bg-amber-300"
                        style={{ width: `${completionProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {completionProgress}% завершено
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex flex-1 items-start gap-3">
                    <div className="grid size-10 place-items-center rounded-full bg-white text-primary shadow-sm dark:bg-slate-900 dark:text-amber-200">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-dark dark:text-slate-100">
                        Нагадування про показники
                      </p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        Увімкніть автоматичне нагадування про внесення показників і оплату рахунку
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="autoReminder" {...register('autoReminder')} />
                    <Label htmlFor="autoReminder" className="!mb-0 text-sm dark:text-slate-100">
                      Активувати
                    </Label>
                  </div>
                </div>

                <FormField
                  id="reminderDay"
                  label="День місяця для нагадування"
                  helper="Найкраще обрати 1-28 число"
                  error={errors.reminderDay?.message}
                >
                  <Input
                    id="reminderDay"
                    type="number"
                    min="1"
                    max="28"
                    step="1"
                    inputMode="numeric"
                    disabled={!autoReminder}
                    placeholder="5"
                    {...register('reminderDay', {
                      validate: (value) => {
                        if (!autoReminder) return true
                        const number = Number(value)
                        if (!Number.isFinite(number)) return 'Вкажіть число від 1 до 28'
                        if (number < 1 || number > 28) return 'День має бути у діапазоні 1-28'
                        return true
                      },
                    })}
                    isInvalid={Boolean(errors.reminderDay)}
                  />
                </FormField>
              </div>
            </section>

            <p className="text-sm text-gray-500 dark:text-slate-400">
              <span className="text-red-500">*</span> Обовязкові поля
            </p>
          </CardContent>

          <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" tone="neutral" onClick={onCancel}>
              Скасувати
            </Button>
            <Button
              type="submit"
              loading={isCreating}
              loadingText="Збереження..."
              disabled={addresses.length === 0}
            >
              Зберегти провайдера
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  )
}

interface FormFieldProps {
  id: string
  label: string
  children: ReactNode
  helper?: string
  required?: boolean
  error?: string
}

function FormField({ id, label, helper, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1 text-dark dark:text-slate-100">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </Label>
      {children}
      {helper ? <p className="text-sm text-gray-500 dark:text-slate-400">{helper}</p> : null}
      {error ? <FormMessage variant="error">{error}</FormMessage> : null}
    </div>
  )
}
