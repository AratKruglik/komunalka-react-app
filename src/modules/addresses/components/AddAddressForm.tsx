import { Fragment, useMemo } from 'react'
import type { ReactNode } from 'react'
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Home,
  MapPinned,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
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
import { useCreateAddress } from '../hooks'
import type { CreateAddressRequest } from '../types'

type StepStatus = 'completed' | 'current' | 'upcoming'

interface StepDefinition {
  id: string
  title: string
  icon: typeof Home
}

interface Step extends StepDefinition {
  status: StepStatus
}

type PropertyType = 'apartment' | 'house' | 'office'

interface PropertyTypeOption {
  value: PropertyType
  title: string
  description: string
  icon: typeof Home
}

interface AddressFormValues {
  propertyType: PropertyType | ''
  region: string
  city: string
  street: string
  buildingNumber: string
  unitNumber: string
  postalCode: string
  notes: string
  isPrimary: boolean
}

interface AddAddressFormProps {
  onCancel?: () => void
}

const stepDefinitions: StepDefinition[] = [
  {
    id: 'type',
    title: 'Тип нерухомості',
    icon: Home,
  },
  {
    id: 'address',
    title: 'Адреса',
    icon: MapPinned,
  },
  {
    id: 'confirmation',
    title: 'Підтвердження',
    icon: CheckCircle2,
  },
]

const propertyTypeOptions: PropertyTypeOption[] = [
  {
    value: 'apartment',
    title: 'Квартира',
    description: 'Багатоквартирний будинок у місті',
    icon: Building2,
  },
  {
    value: 'house',
    title: 'Приватний будинок',
    description: 'Окрема садиба або дача',
    icon: Home,
  },
  {
    value: 'office',
    title: 'Офіс',
    description: 'Комерційне або офісне приміщення',
    icon: BriefcaseBusiness,
  },
]

const regionOptions = [
  'Київська область',
  'Львівська область',
  'Харківська область',
  'Одеська область',
  'Дніпропетровська область',
]

const defaultValues: AddressFormValues = {
  propertyType: '',
  region: '',
  city: '',
  street: '',
  buildingNumber: '',
  unitNumber: '',
  postalCode: '',
  notes: '',
  isPrimary: false,
}

export function AddAddressForm({ onCancel }: AddAddressFormProps) {
  const navigate = useNavigate()
  const { createAddress, isLoading: isPending, error } = useCreateAddress()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    defaultValues,
    mode: 'onSubmit',
  })

  const propertyType = watch('propertyType')
  const isPropertyTypeSelected = Boolean(propertyType)

  const handlePropertyTypeSelect = (type: PropertyType) => {
    setValue('propertyType', type, { shouldValidate: true })
  }

  const onSubmit = async (data: AddressFormValues) => {
    const requestData: CreateAddressRequest = {
      street: data.street,
      building: data.buildingNumber,
      apartment: data.unitNumber,
      city: data.city,
      district: data.region,
      isPrimary: data.isPrimary,
    }

    try {
      await createAddress(requestData)
      navigate('/addresses')
    } catch {
      // Error is handled by the hook
    }
  }

  const selectedTypeTitle = useMemo(() => {
    if (!propertyType) {
      return undefined
    }

    return propertyTypeOptions.find((option) => option.value === propertyType)?.title
  }, [propertyType])

  const steps = useMemo<Step[]>(() => {
    return stepDefinitions.map((definition) => {
      if (definition.id === 'type') {
        return {
          ...definition,
          status: isPropertyTypeSelected ? 'completed' : 'current',
        }
      }

      if (definition.id === 'address') {
        return {
          ...definition,
          status: isPropertyTypeSelected ? 'current' : 'upcoming',
        }
      }

      return {
        ...definition,
        status: 'upcoming',
      }
    })
  }, [isPropertyTypeSelected])

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Card className="border border-gray-200 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <PageSectionHeader
          title="Додати нову адресу"
          description="Заповніть форму нижче, щоб додати нову адресу для обліку комунальних послуг"
          titleClassName="text-2xl font-bold text-dark dark:text-slate-100"
        />

        <CardContent className="space-y-8">
          <FormStepper steps={steps} />

          <section className="space-y-4">
            <div>
              <Label htmlFor="propertyType">
                Тип нерухомості<span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Оберіть тип нерухомості, для якої додаєте адресу
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {propertyTypeOptions.map((option) => (
                <RadioCard
                  key={option.value}
                  title={option.title}
                  description={option.description}
                  icon={option.icon}
                  selected={propertyType === option.value}
                  onClick={() => handlePropertyTypeSelect(option.value)}
                />
              ))}
            </div>
            <input
              type="hidden"
              {...register('propertyType', {
                required: 'Оберіть тип нерухомості',
              })}
            />
            {errors.propertyType ? (
              <FormMessage variant="error">{errors.propertyType.message}</FormMessage>
            ) : null}
          </section>

          <fieldset
            disabled={!isPropertyTypeSelected}
            className="space-y-6 [&:disabled]:opacity-60"
            aria-disabled={!isPropertyTypeSelected}
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                id="region"
                label="Область"
                required
                helper="Оберіть область"
                error={errors.region?.message}
              >
                <Select
                  id="region"
                  required
                  {...register('region', {
                    required: 'Оберіть область',
                  })}
                  isInvalid={Boolean(errors.region)}
                >
                  <option value="" disabled>
                    Оберіть область
                  </option>
                  {regionOptions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                id="city"
                label="Місто/Населений пункт"
                required
                helper="Введіть назву міста або населеного пункту"
                error={errors.city?.message}
              >
                <Input
                  id="city"
                  placeholder="Введіть назву міста або населеного пункту"
                  required
                  {...register('city', {
                    required: 'Вкажіть назву міста або населеного пункту',
                  })}
                  isInvalid={Boolean(errors.city)}
                />
              </FormField>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                id="street"
                label="Вулиця"
                required
                helper="Введіть назву вулиці"
                error={errors.street?.message}
              >
                <Input
                  id="street"
                  placeholder="Введіть назву вулиці"
                  required
                  {...register('street', {
                    required: 'Вкажіть назву вулиці',
                  })}
                  isInvalid={Boolean(errors.street)}
                />
              </FormField>

              <FormField
                id="buildingNumber"
                label="Номер будинку"
                required
                helper="Введіть номер будинку"
                error={errors.buildingNumber?.message}
              >
                <Input
                  id="buildingNumber"
                  placeholder="Введіть номер будинку"
                  required
                  {...register('buildingNumber', {
                    required: 'Вкажіть номер будинку',
                  })}
                  isInvalid={Boolean(errors.buildingNumber)}
                />
              </FormField>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                id="unitNumber"
                label="Номер квартири/офісу"
                required
                helper={
                  selectedTypeTitle
                    ? `Введіть номер для ${selectedTypeTitle.toLowerCase()}`
                    : 'Введіть номер квартири або офісу'
                }
                error={errors.unitNumber?.message}
              >
                <Input
                  id="unitNumber"
                  placeholder="Введіть номер квартири або офісу"
                  required
                  {...register('unitNumber', {
                    required: 'Вкажіть номер квартири або офісу',
                  })}
                  isInvalid={Boolean(errors.unitNumber)}
                />
              </FormField>

              <FormField
                id="postalCode"
                label="Поштовий індекс"
                required
                helper="Введіть поштовий індекс (5 цифр)"
                error={errors.postalCode?.message}
              >
                <Input
                  id="postalCode"
                  type="text"
                  placeholder="Введіть поштовий індекс (5 цифр)"
                  required
                  inputMode="numeric"
                  {...register('postalCode', {
                    required: 'Вкажіть поштовий індекс',
                    pattern: {
                      value: /^\d{5}$/,
                      message: 'Поштовий індекс має містити 5 цифр',
                    },
                  })}
                  isInvalid={Boolean(errors.postalCode)}
                />
              </FormField>
            </div>

            <FormField
              id="notes"
              label="Додаткові примітки"
              helper="Додаткова інформація про адресу (необов'язково)"
              error={errors.notes?.message}
            >
              <Textarea
                id="notes"
                placeholder="Додаткова інформація про адресу (необов'язково)"
                rows={4}
                {...register('notes')}
                isInvalid={Boolean(errors.notes)}
              />
            </FormField>

            <div className="flex items-center gap-3">
              <Checkbox
                id="isPrimary"
                {...register('isPrimary')}
              />
              <Label htmlFor="isPrimary" className="!mb-0 cursor-pointer text-dark dark:text-slate-100">
                Встановити як основну адресу
              </Label>
            </div>

            <p className="text-sm text-gray-500 dark:text-slate-400">
              <span className="text-red-500">*</span> Обов&apos;язкові поля
            </p>
          </fieldset>

          {!isPropertyTypeSelected ? (
            <p className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Оберіть тип нерухомості, щоб заповнити адресу
            </p>
          ) : null}
        </CardContent>

        <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {error ? (
            <FormMessage variant="error" className="w-full">
              Помилка: {error}
            </FormMessage>
          ) : null}
          <Button
            type="button"
            variant="outline"
            tone="neutral"
            onClick={onCancel}
            disabled={isPending}
          >
            Скасувати
          </Button>
          <Button
            type="submit"
            loading={isPending || isSubmitting}
            loadingText="Збереження..."
            disabled={!isPropertyTypeSelected}
          >
            Зберегти адресу
          </Button>
        </CardFooter>
      </Card>
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

interface FormStepperProps {
  steps: Step[]
}

function FormStepper({ steps }: FormStepperProps) {
  const columnTemplate = `repeat(${steps.length * 2 - 1}, minmax(0, 1fr))`

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-900">
      <ol
        className="flex flex-col gap-4 md:grid md:items-center md:gap-4"
        style={{ gridTemplateColumns: columnTemplate }}
      >
        {steps.map((step, index) => {
          const Icon = step.icon
          const statusClasses = getStatusClasses(step.status)
          const nextStatus = steps[index + 1]?.status

          return (
            <Fragment key={step.id}>
              <li className="flex flex-col items-center gap-2 text-center md:justify-self-center">
                <span
                  className={[
                    'flex size-12 items-center justify-center rounded-full border-2',
                    statusClasses.circle,
                  ].join(' ')}
                >
                  <Icon className={statusClasses.icon} />
                </span>
                <p className={['text-sm font-medium', statusClasses.label].join(' ')}>
                  {step.title}
                </p>
              </li>
              {index < steps.length - 1 ? (
                <Fragment>
                  <div
                    aria-hidden
                    className={['hidden h-1 w-full rounded-full md:block', getConnectorClass(step.status, nextStatus)].join(' ')}
                  />
                  <div className="mx-auto block h-6 w-px rounded-full bg-gray-200 dark:bg-slate-700 md:hidden" aria-hidden />
                </Fragment>
              ) : null}
            </Fragment>
          )
        })}
      </ol>
    </div>
  )
}

function getStatusClasses(status: StepStatus) {
  switch (status) {
    case 'completed':
      return {
        circle: 'border-primary bg-primary/10 text-primary dark:border-amber-300 dark:bg-amber-200/10 dark:text-amber-200',
        icon: 'h-6 w-6',
        label: 'text-dark dark:text-slate-100',
      }
    case 'current':
      return {
        circle: 'border-primary bg-white text-primary dark:border-amber-300 dark:bg-slate-900 dark:text-amber-200',
        icon: 'h-6 w-6',
        label: 'text-dark dark:text-slate-100',
      }
    default:
      return {
        circle: 'border-gray-200 bg-white text-gray-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
        icon: 'h-6 w-6',
        label: 'text-gray-500 dark:text-slate-400',
      }
  }
}

function getConnectorClass(current: StepStatus, next?: StepStatus) {
  if (current === 'completed' && next === 'completed') {
    return 'bg-primary dark:bg-amber-300'
  }

  if (current === 'completed' && next === 'current') {
    return 'bg-primary/70 dark:bg-amber-300/70'
  }

  if (current === 'current') {
    return 'bg-primary/50 dark:bg-amber-300/50'
  }

  return 'bg-gray-200 dark:bg-slate-700'
}
