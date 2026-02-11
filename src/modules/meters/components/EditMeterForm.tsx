import { useEffect, useMemo } from 'react'
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
  Select,
  Textarea,
} from '@shared/components/ui'
import { CalendarDays } from 'lucide-react'
import { METER_TYPE_OPTIONS, METER_TYPE_UNITS } from '@shared/constants/meterTypes'
import { useUpdateMeter } from '@modules/meters/hooks'
import { useServiceProvidersByAddress } from '@modules/providers/hooks'
import { fromUtilityTypeId, type Meter, type UpdateMeterRequest } from '@modules/meters/types'
import { METER_TYPE_TO_UTILITY_TYPE_ID } from '@shared/types/entities'
import { formatApiTariffLabel, getApiPrimaryTariff } from '@shared/utils/providerTariffs'

interface EditMeterFormValues {
  serialNumber: string
  installationLocation: string
  manufacturer: string
  installationDate: string
  providerId: string
  initialReading: string
  notes: string
  isActive: boolean
}

function getDefaultValues(meter: Meter): EditMeterFormValues {
  return {
    serialNumber: meter.serialNumber,
    installationLocation: meter.location ?? '',
    manufacturer: meter.modelName ?? '',
    installationDate: meter.installationDate.split('T')[0],
    initialReading: meter.initialReading != null ? String(meter.initialReading) : '',
    providerId: meter.serviceProviderId ? String(meter.serviceProviderId) : '',
    notes: meter.notes ?? '',
    isActive: meter.isActive,
  }
}

function toUpdateRequest(values: EditMeterFormValues, meter: Meter): UpdateMeterRequest {
  return {
    serialNumber: values.serialNumber,
    location: values.installationLocation || undefined,
    modelName: values.manufacturer || undefined,
    installationDate: values.installationDate,
    initialReading: values.initialReading ? Number(values.initialReading) : undefined,
    serviceProviderId: values.providerId ? Number(values.providerId) : undefined,
    notes: values.notes || undefined,
    isActive: values.isActive,
    utilityTypeId: meter.utilityTypeId,
    name: meter.name,
  }
}

export interface EditMeterFormProps {
  meter: Meter
  onCancel?: () => void
  onSuccess?: () => void
}

export function EditMeterForm({ meter, onCancel, onSuccess }: EditMeterFormProps) {
  const { updateMeter, isLoading: isUpdating, error: updateError } = useUpdateMeter()
  const { providers: addressProviders, isLoading: providersLoading } = useServiceProvidersByAddress(meter.addressId)

  const meterType = fromUtilityTypeId(meter.utilityTypeId)
  const meterTypeLabel = METER_TYPE_OPTIONS.find((o) => o.value === meterType)?.title ?? meterType
  const readingUnit = meterType in METER_TYPE_UNITS ? METER_TYPE_UNITS[meterType] : 'од.'

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditMeterFormValues>({
    defaultValues: getDefaultValues(meter),
  })

  const providerId = watch('providerId')

  const availableProviders = useMemo(() => {
    if (!addressProviders.length) return []
    const targetUtilityTypeId = METER_TYPE_TO_UTILITY_TYPE_ID[meterType]
    return addressProviders.filter((provider) =>
      provider.tariffs.some((tariff) => tariff.utilityTypeId === targetUtilityTypeId),
    )
  }, [meterType, addressProviders])

  useEffect(() => {
    if (providersLoading || !meter.serviceProviderId) return
    const exists = availableProviders.some((p) => p.id === meter.serviceProviderId)
    if (exists) {
      setValue('providerId', String(meter.serviceProviderId))
    }
  }, [providersLoading, availableProviders, meter.serviceProviderId, setValue])

  const selectedProvider = useMemo(() => {
    if (!providerId) return null
    return availableProviders.find((p) => p.id === Number(providerId)) ?? null
  }, [availableProviders, providerId])

  const providerTariffs = useMemo(() => {
    if (!selectedProvider) return []
    const targetUtilityTypeId = METER_TYPE_TO_UTILITY_TYPE_ID[meterType]
    return selectedProvider.tariffs.filter((t) => t.utilityTypeId === targetUtilityTypeId)
  }, [selectedProvider, meterType])

  const onSubmit = handleSubmit(async (values) => {
    const request = toUpdateRequest(values, meter)
    await updateMeter(meter.id, request)
    onSuccess?.()
  })

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <Card className="border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <PageSectionHeader
          title={`Редагування: ${meter.name}`}
          description="Змініть дані лічильника та натисніть «Зберегти»"
        />

        <CardContent className="space-y-8">
          <section className="space-y-2">
            <Label className="text-base font-semibold text-gray-800 dark:text-slate-200">Тип лічильника</Label>
            <p className="text-sm text-gray-600 dark:text-slate-300">{meterTypeLabel}</p>
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
              <Label htmlFor="initialReading">Початкові показання</Label>
              <Input
                id="initialReading"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                {...register('initialReading')}
                endAdornment={<span className="text-sm text-gray-500">{readingUnit}</span>}
              />
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="providerId">Провайдер послуги</Label>
              <Select
                id="providerId"
                {...register('providerId')}
                disabled={providersLoading || availableProviders.length === 0}
              >
                <option value="">
                  {providersLoading
                    ? 'Завантаження...'
                    : availableProviders.length
                      ? 'Оберіть провайдера'
                      : 'Немає провайдерів для цієї адреси'}
                </option>
                {availableProviders.map((provider) => {
                  const tariff = getApiPrimaryTariff(provider)
                  return (
                    <option key={provider.id} value={String(provider.id)}>
                      {provider.name}
                      {tariff ? ` · ${formatApiTariffLabel(tariff)}` : ''}
                    </option>
                  )
                })}
              </Select>
              <FormMessage variant="error">{errors.providerId?.message}</FormMessage>
              {!providersLoading && meter.serviceProviderName && !availableProviders.some((p) => p.id === meter.serviceProviderId) && (
                <FormMessage variant="default">
                  Поточний провайдер «{meter.serviceProviderName}» більше не доступний для цієї адреси. Оберіть нового.
                </FormMessage>
              )}
            </div>

            {selectedProvider && providerTariffs.length > 0 ? (
              <div className="space-y-2 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Тарифна інформація</p>
                {providerTariffs.map((tariff) => (
                  <p key={tariff.id} className="text-sm text-blue-700 dark:text-blue-300">
                    {tariff.name}: {formatApiTariffLabel(tariff)}
                    {tariff.serviceFee > 0 && ` + абонплата ${tariff.serviceFee.toFixed(2)} ${tariff.currencySymbol}`}
                  </p>
                ))}
                <p className="text-xs text-blue-600 dark:text-blue-400">Джерело: {selectedProvider.name}</p>
              </div>
            ) : null}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="notes">Додаткові примітки</Label>
              <Textarea
                id="notes"
                rows={4}
                placeholder="Будь-які додаткові деталі про лічильник"
                {...register('notes')}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-800 dark:text-slate-200">Статус</Label>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary dark:border-slate-600"
                />
                <span className="text-sm text-gray-700 dark:text-slate-300">Лічильник активний</span>
              </label>
            </div>
          </section>
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
