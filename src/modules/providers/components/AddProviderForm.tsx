import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PageSectionHeader } from '../../../shared/components/pages'
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
} from '../../../shared/components/ui'
import { SERVICE_CONFIG, type ServiceType } from '../../../shared/constants/services'
import { MOCK_PROVIDER_TEMPLATES } from '../../../shared/data/mockProviders'
import type { BillingCycle, UtilityServiceType } from '../../../shared/types/providers'

type ProviderFormValues = {
  providerName: string
  serviceType: UtilityServiceType | ''
  unitPrice: string
  billingCycle: BillingCycle
  supportPhone: string
  supportEmail: string
  website: string
  description: string
  autoReminder: boolean
  reminderDay: string
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

const utilityOptionConfigs: Record<
  UtilityServiceType,
  Omit<UtilityOption, 'icon' | 'iconColor'> & { serviceKey: ServiceType }
> = {
  water: {
    value: 'water',
    title: 'Водопостачання',
    description: 'Холодна та гаряча вода для вашої адреси',
    unitLabel: 'грн/м³',
    helper: 'Вкажіть тариф за кубічний метр спожитої води',
    serviceKey: 'Водопостачання',
  },
  gas: {
    value: 'gas',
    title: 'Газопостачання',
    description: 'Природний газ для опалення та приготування їжі',
    unitLabel: 'грн/м³',
    helper: 'Зазвичай нараховується в кубічних метрах',
    serviceKey: 'Газ',
  },
  electricity: {
    value: 'electricity',
    title: 'Електропостачання',
    description: 'Електроенергія для квартири чи будинку',
    unitLabel: 'грн/кВт·год',
    helper: 'Вкажіть тариф за кіловат-годину',
    serviceKey: 'Електроенергія',
  },
  heating: {
    value: 'heating',
    title: 'Теплопостачання',
    description: 'Централізоване опалення або автономні системи',
    unitLabel: 'грн/Гкал',
    helper: 'Найчастіше тариф вказується за гігакалорію',
    serviceKey: 'Опалення',
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
  unitPrice: '',
  billingCycle: 'monthly',
  supportPhone: '',
  supportEmail: '',
  website: '',
  description: '',
  autoReminder: true,
  reminderDay: '5',
}

const requiredFieldKeys: Array<
  keyof Pick<ProviderFormValues, 'providerName' | 'serviceType' | 'unitPrice'>
> = ['providerName', 'serviceType', 'unitPrice']

export function AddProviderForm({ onCancel }: AddProviderFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProviderFormValues>({
    defaultValues,
    mode: 'onSubmit',
  })
  const [selectedTemplateId, setSelectedTemplateId] = useState('')

  const providerName = watch('providerName')
  const unitPrice = watch('unitPrice')
  const serviceType = watch('serviceType')
  const autoReminder = watch('autoReminder')

  const selectedUtility = useMemo(() => {
    return utilityOptions.find((option) => option.value === serviceType)
  }, [serviceType])

  const completionProgress = useMemo(() => {
    const completed = requiredFieldKeys.reduce((count, key) => {
      const value = (() => {
        switch (key) {
          case 'providerName':
            return providerName
          case 'serviceType':
            return serviceType
          case 'unitPrice':
            return unitPrice
          default:
            return ''
        }
      })()
      return value ? count + 1 : count
    }, 0)

    if (!completed) {
      return 0
    }

    return Math.min(100, Math.round((completed / requiredFieldKeys.length) * 100))
  }, [providerName, serviceType, unitPrice])

  const applyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = MOCK_PROVIDER_TEMPLATES.find((entry) => entry.id === templateId)
    if (!template) {
      return
    }

    const hasReminder = typeof template.reminderDay === 'number'
    const reminderValue = hasReminder ? String(template.reminderDay) : defaultValues.reminderDay

    setValue('providerName', template.name, { shouldDirty: true, shouldValidate: true })
    setValue('serviceType', template.serviceType, { shouldDirty: true, shouldValidate: true })
    setValue('unitPrice', template.unitPrice.toString(), { shouldDirty: true, shouldValidate: true })
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

    console.log('Submitting provider', {
      ...data,
      unitPrice: data.unitPrice ? Number(data.unitPrice) : null,
      reminderDay: data.autoReminder ? Number(data.reminderDay) : null,
    })

    reset(defaultValues)
    setSelectedTemplateId('')
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
                value={selectedTemplateId}
                onChange={(event) => applyTemplate(event.target.value)}
              >
                <option value="">Не використовувати шаблон</option>
                {MOCK_PROVIDER_TEMPLATES.map((template) => (
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

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  id="unitPrice"
                  label="Ціна за одиницю"
                  required
                  helper={selectedUtility?.helper ?? 'Вкажіть тариф у гривнях'}
                  error={errors.unitPrice?.message}
                >
                  <Input
                    id="unitPrice"
                    type="number"
                    placeholder="12.45"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    endAdornment={
                      <span className="text-sm font-medium text-gray-600">
                        {selectedUtility?.unitLabel ?? 'грн/од.'}
                      </span>
                    }
                    {...register('unitPrice', {
                      required: 'Вкажіть тариф',
                      validate: (value) =>
                        Number(value) > 0 || 'Вартість має бути більшою за 0',
                    })}
                    isInvalid={Boolean(errors.unitPrice)}
                  />
                </FormField>

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

                <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                  <p className="font-semibold text-gray-800">Поради щодо заповнення</p>
                  <ul className="list-disc space-y-1.5 pl-5">
                    <li>Звіряйте назву та код провайдера з останньою квитанцією.</li>
                    <li>Перевірте актуальний тариф на сайті постачальника.</li>
                    <li>Налаштуйте нагадування, щоб не пропустити передачу показників.</li>
                  </ul>
                  <div className="space-y-1 border-t border-gray-200 pt-3">
                    <p className="text-sm font-medium text-gray-800">Заповнення форми</p>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${completionProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{completionProgress}% завершено</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex flex-1 items-start gap-3">
                    <div className="grid size-10 place-items-center rounded-full bg-white text-primary shadow-sm">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-dark">
                        Нагадування про показники
                      </p>
                      <p className="text-sm text-gray-500">
                        Увімкніть автоматичне нагадування про внесення показників і оплату рахунку
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="autoReminder" {...register('autoReminder')} />
                    <Label htmlFor="autoReminder" className="!mb-0 text-sm">
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
      <Label htmlFor={id} className="flex items-center gap-1 text-dark">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </Label>
      {children}
      {helper ? <p className="text-sm text-gray-500">{helper}</p> : null}
      {error ? <FormMessage variant="error">{error}</FormMessage> : null}
    </div>
  )
}
