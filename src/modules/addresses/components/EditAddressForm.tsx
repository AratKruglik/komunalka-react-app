import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
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
  Select,
  Textarea,
} from '@shared/components/ui'
import { useRegions, useAddressTypes } from '@shared/hooks'
import { useUpdateAddress } from '../hooks'
import type { Address, UpdateAddressRequest } from '../types'

interface EditAddressFormValues {
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

function getDefaultValues(address: Address): EditAddressFormValues {
  return {
    addressTypeId: String(address.addressType.id),
    regionId: String(address.region.id),
    city: address.city,
    street: address.street,
    buildingNumber: address.buildingNumber,
    apartmentNumber: address.apartmentNumber ?? '',
    zipCode: address.zipCode ?? '',
    notes: address.notes ?? '',
    isPrimary: address.isPrimary,
  }
}

function toUpdateRequest(values: EditAddressFormValues): UpdateAddressRequest {
  return {
    addressTypeId: Number(values.addressTypeId),
    regionId: Number(values.regionId),
    city: values.city,
    street: values.street,
    buildingNumber: values.buildingNumber,
    apartmentNumber: values.apartmentNumber,
    zipCode: values.zipCode,
    notes: values.notes,
    isPrimary: values.isPrimary,
  }
}

export interface EditAddressFormProps {
  address: Address
  onCancel?: () => void
  onSuccess?: () => void
}

export function EditAddressForm({ address, onCancel, onSuccess }: EditAddressFormProps) {
  const { updateAddress, isLoading: isUpdating, error: updateError } = useUpdateAddress()
  const { regions, isLoading: isLoadingRegions } = useRegions()
  const { addressTypes, isLoading: isLoadingAddressTypes } = useAddressTypes()

  const isLoadingReferences = isLoadingRegions || isLoadingAddressTypes

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditAddressFormValues>({
    defaultValues: getDefaultValues(address),
  })

  const onSubmit = handleSubmit(async (values) => {
    const request = toUpdateRequest(values)
    await updateAddress(address.id, request)
    onSuccess?.()
  })

  if (isLoadingReferences) {
    return (
      <Card className="border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <PageSectionHeader
          title="Редагування адреси"
          description="Змініть дані адреси та натисніть «Зберегти»"
        />
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Завантаження довідкових даних...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <Card className="border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <PageSectionHeader
          title="Редагування адреси"
          description="Змініть дані адреси та натисніть «Зберегти»"
        />

        <CardContent className="space-y-8">
          <section className="grid gap-6 sm:grid-cols-2">
            <FormField
              id="addressTypeId"
              label="Тип нерухомості"
              required
              error={errors.addressTypeId?.message}
            >
              <Select
                id="addressTypeId"
                {...register('addressTypeId', {
                  required: 'Оберіть тип нерухомості',
                })}
                isInvalid={Boolean(errors.addressTypeId)}
              >
                <option value="" disabled>
                  Оберіть тип нерухомості
                </option>
                {addressTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField
              id="regionId"
              label="Область"
              required
              error={errors.regionId?.message}
            >
              <Select
                id="regionId"
                {...register('regionId', {
                  required: 'Оберіть область',
                })}
                isInvalid={Boolean(errors.regionId)}
              >
                <option value="" disabled>
                  Оберіть область
                </option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <FormField
              id="city"
              label="Місто/Населений пункт"
              required
              error={errors.city?.message}
            >
              <Input
                id="city"
                placeholder="Введіть назву міста або населеного пункту"
                {...register('city', {
                  required: 'Вкажіть назву міста або населеного пункту',
                })}
                isInvalid={Boolean(errors.city)}
              />
            </FormField>

            <FormField
              id="street"
              label="Вулиця"
              required
              error={errors.street?.message}
            >
              <Input
                id="street"
                placeholder="Введіть назву вулиці"
                {...register('street', {
                  required: 'Вкажіть назву вулиці',
                })}
                isInvalid={Boolean(errors.street)}
              />
            </FormField>
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <FormField
              id="buildingNumber"
              label="Номер будинку"
              required
              error={errors.buildingNumber?.message}
            >
              <Input
                id="buildingNumber"
                placeholder="Введіть номер будинку"
                {...register('buildingNumber', {
                  required: 'Вкажіть номер будинку',
                })}
                isInvalid={Boolean(errors.buildingNumber)}
              />
            </FormField>

            <FormField
              id="apartmentNumber"
              label="Номер квартири/офісу"
              required
              error={errors.apartmentNumber?.message}
            >
              <Input
                id="apartmentNumber"
                placeholder="Введіть номер квартири або офісу"
                {...register('apartmentNumber', {
                  required: 'Вкажіть номер квартири або офісу',
                })}
                isInvalid={Boolean(errors.apartmentNumber)}
              />
            </FormField>
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <FormField
              id="zipCode"
              label="Поштовий індекс"
              required
              error={errors.zipCode?.message}
            >
              <Input
                id="zipCode"
                type="text"
                inputMode="numeric"
                placeholder="Введіть поштовий індекс (5 цифр)"
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
          </section>

          <FormField
            id="notes"
            label="Додаткові примітки"
            error={errors.notes?.message}
          >
            <Textarea
              id="notes"
              rows={4}
              placeholder="Додаткова інформація про адресу (необов'язково)"
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

        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t border-gray-200 px-6 py-5 dark:border-slate-800 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            tone="neutral"
            onClick={onCancel}
          >
            Скасувати
          </Button>
          <Button
            type="submit"
            loading={isSubmitting || isUpdating}
            loadingText="Збереження..."
          >
            Зберегти зміни
          </Button>
        </CardFooter>

        {updateError && (
          <div className="px-6 pb-4">
            <FormMessage variant="error">{updateError}</FormMessage>
          </div>
        )}
      </Card>
    </form>
  )
}

interface FormFieldProps {
  id: string
  label: string
  children: ReactNode
  required?: boolean
  error?: string
}

function FormField({ id, label, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1 text-dark dark:text-slate-100">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </Label>
      {children}
      {error ? <FormMessage variant="error">{error}</FormMessage> : null}
    </div>
  )
}
