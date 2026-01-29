import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, ShieldCheck, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
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
import type { MeterType } from '@shared/constants/meterTypes'
import { MOCK_PROVIDERS } from '@shared/data/mockDatabase'
import type { BillingCycle, UtilityServiceType } from '@shared/types/providers'

type TariffFormValue = {
  id: string
  name: string
  price: string
}

type ProviderFormValues = {
  providerName: string
  serviceType: UtilityServiceType | ''
  billingCycle: BillingCycle
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
}

type UtilityOption = {
  value: UtilityServiceType
  title: string
  description: string
  unitLabel: string
  helper: string
  icon: LucideIcon
}

type BillingCycleOption = {
  value: BillingCycle
  label: string
}

// Mapper from MeterType to UtilityServiceType
const meterTypeToUtilityServiceType = (meterType: MeterType): UtilityServiceType | '' => {
  const mapping: Record<MeterType, UtilityServiceType> = {
    electricity: 'electricity',
    gas: 'gas',
    coldWater: 'water',
    hotWater: 'water',
    heat: 'heating',
  }
  return mapping[meterType] || ''
}

const utilityOptionConfigs: Record<
  UtilityServiceType,
  Omit<UtilityOption, 'icon' | 'iconColor'> & { serviceKey: MeterType }
> = {
  water: {
    value: 'water',
    title: 'Водопостачання',
    description: 'Холодна та гаряча вода для вашої адреси',
    unitLabel: 'грн/м³',
    helper: 'Вкажіть тариф за кубічний метр спожитої води',
    serviceKey: 'coldWater',
  },
  gas: {
    value: 'gas',
    title: 'Газопостачання',
    description: 'Природний газ для опалення та приготування їжі',
    unitLabel: 'грн/м³',
    helper: 'Зазвичай нараховується в кубічних метрах',
    serviceKey: 'gas',
  },
  electricity: {
    value: 'electricity',
    title: 'Електропостачання',
    description: 'Електроенергія для квартири чи будинку',
    unitLabel: 'грн/кВт·год',
    helper: 'Вкажіть тариф за кіловат-годину',
    serviceKey: 'electricity',
  },
  heating: {
    value: 'heating',
    title: 'Теплопостачання',
    description: 'Централізоване опалення або автономні системи',
    unitLabel: 'грн/Гкал',
    helper: 'Найчастіше тариф вказується за гігакалорію',
    serviceKey: 'heat',
  },
}

const utilityOptions: UtilityOption[] = Object.values(utilityOptionConfigs).map((option) => {
  const serviceConfig = SERVICE_CONFIG[option.serviceKey]

  return {
    ...option,
    icon: serviceConfig.icon,
  }
})

const billingCycleOptions: BillingCycleOption[] = [
  { value: 'monthly', label: 'Щомісячно' },
  { value: 'quarterly', label: 'Щоквартально' },
  { value: 'annual', label: 'Раз на рік' },
]

const defaultValues: ProviderFormValues = {
  providerName: '',
  serviceType: '',
  billingCycle: 'monthly',
  supportPhone: '',
  supportEmail: '',
  website: '',
  description: '',
  autoReminder: true,
  reminderDay: '5',
  tariffs: [{ id: 'tariff-1', name: 'Базовий тариф', price: '' }],
}

export function AddProviderForm({ onCancel }: AddProviderFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProviderFormValues>({
    defaultValues,
    mode: 'onSubmit',
  })
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)

  const providerName = watch('providerName')
  const serviceType = watch('serviceType')
  const autoReminder = watch('autoReminder')
  const tariffs = watch('tariffs') ?? []

  const { fields: tariffFields, append, remove, replace } = useFieldArray({
    control,
    name: 'tariffs',
  })

  const selectedUtility = useMemo(() => {
    return utilityOptions.find((option) => option.value === serviceType)
  }, [serviceType])

  const primaryTariff = tariffs[0]

  const completionProgress = useMemo(() => {
    const requiredFields = [providerName, serviceType, primaryTariff?.price]
    const completed = requiredFields.filter(Boolean).length

    if (!completed) {
      return 0
    }

    return Math.min(100, Math.round((completed / requiredFields.length) * 100))
  }, [primaryTariff?.price, providerName, serviceType])

  const applyTemplate = (templateId: number) => {
    setSelectedTemplateId(templateId)
    const template = MOCK_PROVIDERS.find((entry) => entry.id === templateId)
    if (!template) {
      return
    }

    const hasReminder = typeof template.reminderDay === 'number'
    const reminderValue = hasReminder ? String(template.reminderDay) : defaultValues.reminderDay

    setValue('providerName', template.name, { shouldDirty: true, shouldValidate: true })
    setValue('serviceType', meterTypeToUtilityServiceType(template.serviceType), { shouldDirty: true, shouldValidate: true })
    const mappedTariffs = template.tariffs.map((tariff) => ({
      id: tariff.id,
      name: tariff.name,
      price: tariff.price.toString(),
    }))

    replace(mappedTariffs)
    setValue('tariffs', mappedTariffs, { shouldDirty: true, shouldValidate: true })
    setValue('billingCycle', template.billingCycle, { shouldDirty: true })
    setValue('supportPhone', template.supportPhone ?? '', { shouldDirty: true })
    setValue('supportEmail', template.supportEmail ?? '', { shouldDirty: true })
    setValue('website', template.website ?? '', { shouldDirty: true })
    setValue('description', template.description ?? '', { shouldDirty: true })
    setValue('autoReminder', hasReminder, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
    setValue('reminderDay', reminderValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }

  const handleServiceSelect = (value: UtilityServiceType) => {
    setValue('serviceType', value, { shouldValidate: true })
  }

  const onSubmit = async (data: ProviderFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 600))

    const normalizedTariffs = data.tariffs
      .filter((tariff) => tariff.price)
      .map((tariff, index) => ({
        id: tariff.id || `tariff-${index + 1}`,
        name: tariff.name || `Тариф ${index + 1}`,
        price: Number(tariff.price),
      }))

    console.log('Submitting provider', {
      ...data,
      tariffs: normalizedTariffs,
      reminderDay: data.autoReminder ? Number(data.reminderDay) : null,
    })

    reset(defaultValues)
    replace(defaultValues.tariffs)
    setSelectedTemplateId(null)
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-5">
        <Card className="border border-gray-200 shadow-lg">
          <PageSectionHeader
            title="Новий провайдер"
            description="Додайте тариф комунального провайдера та налаштуйте нагадування про нарахування"
            titleClassName="text-2xl font-bold text-dark"
          />

          <CardContent className="space-y-8">
            <FormField
              id="providerTemplate"
              label="Шаблон провайдера"
              helper="Оберіть поширеного постачальника, щоб автоматично заповнити форму"
            >
              <Select
                id="providerTemplate"
                value={selectedTemplateId ?? ''}
                onChange={(event) => {
                  const value = event.target.value
                  if (value) {
                    applyTemplate(Number(value))
                  } else {
                    setSelectedTemplateId(null)
                  }
                }}
              >
                <option value="">Не використовувати шаблон</option>
                {MOCK_PROVIDERS.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} · {template.serviceLabel}
                  </option>
                ))}
              </Select>
            </FormField>

            <section className="space-y-4">
              <div>
                <Label htmlFor="serviceType" className="text-base text-dark">
                  Тип послуги<span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500">
                  Оберіть комунальну послугу, щоб ми підказали правильну одиницю виміру
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {utilityOptions.map((option) => (
                  <RadioCard
                    key={option.value}
                    title={option.title}
                    description={option.description}
                    icon={option.icon}
                    helperText={option.helper}
                    selected={serviceType === option.value}
                    onClick={() => handleServiceSelect(option.value)}
                  />
                ))}
              </div>
              <input
                type="hidden"
                {...register('serviceType', {
                  required: 'Оберіть тип послуги',
                })}
              />
              {errors.serviceType ? (
                <FormMessage variant="error">{errors.serviceType.message}</FormMessage>
              ) : null}
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
                  {...register('providerName', {
                    required: 'Вкажіть назву провайдера',
                  })}
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
                        price: '',
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
                    const tariffPriceError = errors.tariffs?.[index]?.price?.message

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
                            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Базовий</span>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 md:gap-6 md:pt-2">
                          <FormField
                            id={`tariff-name-${tariff.id}`}
                            label="Назва тарифу"
                            required
                            helper="Наприклад: Денний, Нічний або Стандарт"
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

                          <FormField
                            id={`tariff-price-${tariff.id}`}
                            label="Вартість"
                            required
                            helper={selectedUtility?.helper ?? 'Вкажіть тариф у гривнях'}
                            error={tariffPriceError}
                          >
                            <Input
                              id={`tariff-price-${tariff.id}`}
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
                              {...register(`tariffs.${index}.price` as const, {
                                required: 'Вкажіть тариф',
                                validate: (value) =>
                                  Number(value) > 0 || 'Вартість має бути більшою за 0',
                              })}
                              isInvalid={Boolean(tariffPriceError)}
                            />
                          </FormField>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <FormField
                id="billingCycle"
                label="Період нарахування"
                helper="Як часто провайдер виставляє рахунок"
                error={errors.billingCycle?.message}
              >
                <Select
                  id="billingCycle"
                  {...register('billingCycle')}
                >
                  {billingCycleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>

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
                  <p className="font-semibold text-gray-800 dark:text-slate-100">Поради щодо заповнення</p>
                  <ul className="list-disc space-y-1.5 pl-5">
                    <li>Звіряйте назву та код провайдера з останньою квитанцією.</li>
                    <li>Перевірте актуальний тариф на сайті постачальника.</li>
                    <li>Налаштуйте нагадування, щоб не пропустити передачу показників.</li>
                  </ul>
                  <div className="space-y-1 border-t border-gray-200 pt-3 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-100">Заповнення форми</p>
                    <div className="h-2 rounded-full bg-gray-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-primary transition-all dark:bg-amber-300"
                        style={{ width: `${completionProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{completionProgress}% завершено</p>
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
                        if (!autoReminder) {
                          return true
                        }

                        const number = Number(value)
                        if (!Number.isFinite(number)) {
                          return 'Вкажіть число від 1 до 28'
                        }
                        if (number < 1 || number > 28) {
                          return 'День має бути у діапазоні 1-28'
                        }
                        return true
                      },
                    })}
                    isInvalid={Boolean(errors.reminderDay)}
                  />
                </FormField>
              </div>
            </section>

            <p className="text-sm text-gray-500">
              <span className="text-red-500">*</span> Обов'язкові поля
            </p>
          </CardContent>

          <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" tone="neutral" onClick={onCancel}>
              Скасувати
            </Button>
            <Button type="submit" loading={isSubmitting} loadingText="Збереження...">
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
