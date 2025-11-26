import { Camera, Calendar } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  PhotoDropzone,
  Select,
} from '../../../shared/components/ui'
import { SERVICE_CONFIG } from '../../../shared/constants/services'
import type { MeterReadingDraftViewModel } from '../../../shared/viewModels'

interface ReadingCardProps {
  draft: MeterReadingDraftViewModel
  currentValue: string
  readingDate: string
  selectedTariffId: string
  photo?: {
    fileName: string | null
    previewUrl: string | null
  }
  onCurrentValueChange: (value: string) => void
  onReadingDateChange: (value: string) => void
  onTariffChange: (tariffId: string) => void
  onPhotoSelected: (file: File | null) => void
  onPhotoClear: () => void
}

const numberFormatter = new Intl.NumberFormat('uk-UA', {
  maximumFractionDigits: 2,
})

const currencyFormatter = new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'UAH',
  maximumFractionDigits: 2,
})

export function ReadingCard({
  draft,
  currentValue,
  readingDate,
  selectedTariffId,
  photo,
  onCurrentValueChange,
  onReadingDateChange,
  onTariffChange,
  onPhotoClear,
  onPhotoSelected,
}: ReadingCardProps) {
  const serviceConfig = SERVICE_CONFIG[draft.type]
  const ServiceIcon = serviceConfig?.icon
  const serviceIconBg = serviceConfig?.iconBg ?? 'bg-gray-100'
  const serviceIconColor = serviceConfig?.iconColor ?? 'text-gray-600'
  const parsedCurrent = Number(currentValue)
  const isValidCurrent = !Number.isNaN(parsedCurrent)
  const consumption = isValidCurrent ? Math.max(0, parsedCurrent - draft.previousValue) : 0
  const activeTariff =
    draft.tariffs.find((tariff) => tariff.id === selectedTariffId) ?? draft.tariffs[0]
  const estimatedCost = consumption * (activeTariff?.price ?? draft.tariff)

  const handleDropzoneSelection = (files: FileList | null) => {
    if (!files?.length) {
      onPhotoSelected(null)
      return
    }
    onPhotoSelected(files[0])
  }

  return (
    <Card className="border-gray-100 shadow-lg">
      <CardHeader className="gap-4 border-b border-gray-100 pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {ServiceIcon ? (
                <span
                  className={[
                    'inline-flex h-10 w-10 items-center justify-center rounded-full text-lg',
                    serviceIconBg,
                    serviceIconColor,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <ServiceIcon className="h-5 w-5" aria-hidden />
                </span>
              ) : null}
              <CardTitle className="text-xl">{draft.serviceName}</CardTitle>
            </div>
            <div className="text-sm text-gray-500">
              <p className="font-medium text-gray-700">{draft.meterLabel}</p>
              <p>№ {draft.meterNumber}</p>
            </div>
          </div>
          <CardDescription className="text-sm text-gray-600">Внесіть актуальні показання та додайте фото лічильника</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor={`${draft.id}-current`} className="text-sm font-medium text-gray-700">
              Поточні показання
            </Label>
            <Input
              id={`${draft.id}-current`}
              type="number"
              inputMode="decimal"
              value={currentValue}
              onChange={(event) => onCurrentValueChange(event.target.value)}
              endAdornment={<span className="text-sm text-gray-500">{draft.unit}</span>}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <Label htmlFor={`${draft.id}-previous`} className="font-medium text-gray-700">
                Попередні показання
              </Label>
              <span className="text-xs text-gray-500">{draft.previousDate}</span>
            </div>
            <Input
              id={`${draft.id}-previous`}
              value={draft.previousValue}
              readOnly
              className="bg-gray-50 text-gray-700"
              endAdornment={<span className="text-sm text-gray-500">{draft.unit}</span>}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${draft.id}-date`} className="text-sm font-medium text-gray-700">
              Дата зняття показань
            </Label>
            <Input
              id={`${draft.id}-date`}
              type="date"
              value={readingDate}
              onChange={(event) => onReadingDateChange(event.target.value)}
              endAdornment={<Calendar className="h-4 w-4 text-gray-400" aria-hidden />}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${draft.id}-tariff`} className="text-sm font-medium text-gray-700">
              Тариф для розрахунку
            </Label>
            <Select
              id={`${draft.id}-tariff`}
              value={activeTariff?.id ?? draft.tariffId}
              onChange={(event) => onTariffChange(event.target.value)}
            >
              {draft.tariffs.map((tariff) => (
                <option key={tariff.id} value={tariff.id}>
                  {tariff.label}
                </option>
              ))}
            </Select>
            <p className="text-xs text-gray-500">
              Перемикайте між денним, нічним або іншими тарифами цього провайдера.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-slate-100">Фото лічильника</Label>
            <PhotoDropzone
              id={`${draft.id}-photo`}
              fileName={photo?.fileName ?? draft.photo?.fileName ?? null}
              previewUrl={photo?.previewUrl ?? draft.photo?.previewUrl ?? null}
              emptyIcon={<Camera className="h-8 w-8 text-gray-400" aria-hidden />}
              emptyTitle="Перетягніть файл або натисніть, щоб завантажити"
              emptyDescription="Додайте фото для підтвердження показань"
              helperText="Підтримуються формати JPG, PNG. Максимум 10 МБ"
              buttonLabel="Завантажити фото"
              variant="full"
              className="border-blue-200 bg-blue-50 dark:border-slate-600 dark:bg-slate-900/60"
              onFilesSelected={handleDropzoneSelection}
              onClear={onPhotoClear}
            />
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 dark:border-amber-300/30 dark:bg-amber-200/10">
            <p className="text-base font-semibold text-gray-900 dark:text-slate-100">Розрахунок</p>
            <dl className="mt-4 space-y-3 text-sm text-gray-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <dt>Споживання:</dt>
                <dd className="font-semibold text-gray-900 dark:text-slate-100">
                  {numberFormatter.format(consumption)} {draft.unit}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Тариф:</dt>
                <dd className="font-semibold text-gray-900 dark:text-slate-100">
                  {activeTariff?.label ?? draft.tariffLabel}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-primary/20 pt-3 text-base dark:border-amber-300/30">
                <dt className="font-semibold text-gray-900 dark:text-slate-100">Вартість:</dt>
                <dd className="font-semibold text-gray-900 dark:text-slate-100">
                  {currencyFormatter.format(estimatedCost || 0)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
