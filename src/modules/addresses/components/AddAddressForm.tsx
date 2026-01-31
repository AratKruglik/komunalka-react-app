import { Fragment, useMemo } from 'react'
import type { ReactNode } from 'react'
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Home,
  MapPinned,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
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
import { useRegions, useAddressTypes } from '@shared/hooks'
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

interface AddressFormValues {
  addressTypeId: string
  regionId: string
  city: string
  street: string
  buildingNumber: string
  apartmentNumber: string
  zipCode: string
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

const ADDRESS_TYPE_ICONS: Record<string, LucideIcon> = {
  apartment: Building2,
  house: Home,
  office: BriefcaseBusiness,
}

const ADDRESS_TYPE_DESCRIPTIONS: Record<string, string> = {
  apartment: 'Багатоквартирний будинок у місті',
  house: 'Окрема садиба або дача',
  office: 'Комерційне або офісне приміщення',
}

const defaultValues: AddressFormValues = {
  addressTypeId: '',
  regionId: '',
  city: '',
  street: '',
  buildingNumber: '',
  apartmentNumber: '',
  zipCode: '',
  notes: '',
  isPrimary: false,
}

export function AddAddressForm({ onCancel }: AddAddressFormProps) {
  const navigate = useNavigate()
  const { createAddress, isLoading: isPending, error } = useCreateAddress()
  const { regions, isLoading: isLoadingRegions } = useRegions()
  const { addressTypes, isLoading: isLoadingAddressTypes } = useAddressTypes()

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

  const addressTypeId = watch('addressTypeId')
  const isAddressTypeSelected = Boolean(addressTypeId)
  const isLoadingReferences = isLoadingRegions || isLoadingAddressTypes

  const handleAddressTypeSelect = (typeId: string) => {
    setValue('addressTypeId', typeId, { shouldValidate: true })
  }

  const onSubmit = async (data: AddressFormValues) => {
    const requestData: CreateAddressRequest = {
      regionId: Number(data.regionId),
      city: data.city,
      street: data.street,
      buildingNumber: data.buildingNumber,
      apartmentNumber: data.apartmentNumber,
      zipCode: data.zipCode,
      notes: data.notes,
      isPrimary: data.isPrimary,
      addressTypeId: Number(data.addressTypeId),
    }

    try {
      await createAddress(requestData)
      navigate('/addresses')
    } catch {
      // Error is handled by the hook
    }
  }

  const selectedAddressType = useMemo(() => {
    if (!addressTypeId) {
      return undefined
    }

    return addressTypes.find((type) => type.id === Number(addressTypeId))
  }, [addressTypeId, addressTypes])

  const steps = useMemo<Step[]>(() => {
    return stepDefinitions.map((definition) => {
      if (definition.id === 'type') {
        return {
          ...definition,
          status: isAddressTypeSelected ? 'completed' : 'current',
        }
      }

      if (definition.id === 'address') {
        return {
          ...definition,
          status: isAddressTypeSelected ? 'current' : 'upcoming',
        }
      }

      return {
        ...definition,
        status: 'upcoming',
      }
    })
  }, [isAddressTypeSelected])

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
              <Label htmlFor="addressTypeId">
                Тип нерухомості<span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Оберіть тип нерухомості, для якої додаєте адресу
              </p>
            </div>

            {isLoadingAddressTypes ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-sm text-gray-500 dark:text-slate-400">
                  Завантаження типів нерухомості...
                </span>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {addressTypes.map((type) => {
                  const Icon = ADDRESS_TYPE_ICONS[type.icon] || Home
                  const description = ADDRESS_TYPE_DESCRIPTIONS[type.icon] || type.description
                  return (
                    <RadioCard
                      key={type.id}
                      title={type.name}
                      description={description}
                      icon={Icon}
                      selected={addressTypeId === String(type.id)}
                      onClick={() => handleAddressTypeSelect(String(type.id))}
                    />
                  )
                })}
              </div>
            )}
            <input
              type="hidden"
              {...register('addressTypeId', {
                required: 'Оберіть тип нерухомості',
              })}
            />
            {errors.addressTypeId ? (
              <FormMessage variant="error">{errors.addressTypeId.message}</FormMessage>
            ) : null}
          </section>

          <fieldset
            disabled={!isAddressTypeSelected || isLoadingReferences}
            className="space-y-6 [&:disabled]:opacity-60"
            aria-disabled={!isAddressTypeSelected || isLoadingReferences}
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                id="regionId"
                label="Область"
                required
                helper="Оберіть область"
                error={errors.regionId?.message}
              >
                <Select
                  id="regionId"
                  required
                  {...register('regionId', {
                    required: 'Оберіть область',
                  })}
                  isInvalid={Boolean(errors.regionId)}
                >
                  <option value="" disabled>
                    {isLoadingRegions ? 'Завантаження...' : 'Оберіть область'}
                  </option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
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
                id="apartmentNumber"
                label="Номер квартири/офісу"
                required
                helper={
                  selectedAddressType
                    ? `Введіть номер для ${selectedAddressType.name.toLowerCase()}`
                    : 'Введіть номер квартири або офісу'
                }
                error={errors.apartmentNumber?.message}
              >
                <Input
                  id="apartmentNumber"
                  placeholder="Введіть номер квартири або офісу"
                  required
                  {...register('apartmentNumber', {
                    required: 'Вкажіть номер квартири або офісу',
                  })}
                  isInvalid={Boolean(errors.apartmentNumber)}
                />
              </FormField>

              <FormField
                id="zipCode"
                label="Поштовий індекс"
                required
                helper="Введіть поштовий індекс (5 цифр)"
                error={errors.zipCode?.message}
              >
                <Input
                  id="zipCode"
                  type="text"
                  placeholder="Введіть поштовий індекс (5 цифр)"
                  required
                  inputMode="numeric"
                  {...register('zipCode', {
                    required: 'Вкажіть поштовий індекс',
                    pattern: {
                      value: /^\d{5}$/,
                      message: 'Поштовий індекс має містити 5 цифр',
                    },
                  })}
                  isInvalid={Boolean(errors.zipCode)}
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

          {!isAddressTypeSelected ? (
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
            disabled={!isAddressTypeSelected}
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
