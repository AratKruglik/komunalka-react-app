import { useMemo, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { useForm } from 'react-hook-form'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  FormMessage,
  Input,
  Label,
  Select,
  Textarea,
} from '../../../shared/components/ui'
import {
  CalendarDays,
  Camera,
  Droplet,
  Flame,
  UploadCloud,
  Zap,
  Thermometer,
} from 'lucide-react'

const addressOptions = [
  {
    label: 'вул. Хрещатик, 22, кв. 15, м. Київ',
    value: 'kyiv-khreschatyk-22',
  },
  {
    label: 'вул. Галицька, 12, м. Львів',
    value: 'lviv-halytska-12',
  },
  {
    label: 'просп. Науки, 45, м. Харків',
    value: 'kharkiv-nauky-45',
  },
]

type MeterType = 'electricity' | 'gas' | 'coldWater' | 'hotWater'

type SubmissionIntent = 'draft' | 'submit'

interface MeterTypeOption {
  value: MeterType
  title: string
  description: string
  icon: typeof Zap
}

const meterTypeOptions: MeterTypeOption[] = [
  {
    value: 'electricity',
    title: 'Електролічильник',
    description: 'Для обліку споживання електроенергії',
    icon: Zap,
  },
  {
    value: 'gas',
    title: 'Газовий лічильник',
    description: 'Контроль споживання газу',
    icon: Flame,
  },
  {
    value: 'coldWater',
    title: 'Лічильник холодної води',
    description: 'Для холодного водопостачання',
    icon: Droplet,
  },
  {
    value: 'hotWater',
    title: 'Лічильник гарячої води',
    description: 'Для гарячого водопостачання',
    icon: Thermometer,
  },
]

interface MeterFormValues {
  addressId: string
  meterType: MeterType | ''
  serialNumber: string
  installationLocation: string
  manufacturer: string
  installationDate: string
  initialReading: string
  tariffValue: string
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

const readingUnits: Record<MeterType, string> = {
  electricity: 'кВт·год',
  gas: 'м³',
  coldWater: 'м³',
  hotWater: 'м³',
}

export interface AddMeterFormProps {
  onCancel?: () => void
}

export function AddMeterForm({ onCancel }: AddMeterFormProps) {
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)

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
      return 5
    }

    return Math.min(100, Math.round((completed / requiredFieldKeys.length) * 100))
  }, [addressId, meterType, serialNumber, installationDate, initialReading, tariffValue])

  const handleMeterTypeSelect = (value: MeterType) => {
    setValue('meterType', value, { shouldValidate: true })
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setUploadedFileName(file ? file.name : null)
    setIsDragActive(false)
  }

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragActive(false)
    }
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)
    if (!event.dataTransfer?.files?.length) {
      return
    }

    const files = event.dataTransfer.files
    setUploadedFileName(files[0]?.name ?? null)
    setValue('photo', files, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
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
      setUploadedFileName(null)
    }
  }

  const submitWithIntent = (intent: SubmissionIntent) =>
    handleSubmit(async (values) => {
      await simulateSubmit(values, intent)
    })

  const handleResetForm = () => {
    reset(defaultValues)
    setUploadedFileName(null)
  }

  const readingUnit = meterType && meterType in readingUnits ? readingUnits[meterType] : 'од.'

  const { ref: photoRef, onChange: photoOnChange, ...photoField } = register('photo')

  return (
    <form className="space-y-6" onSubmit={submitWithIntent('submit')}>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="gap-2">
          <CardTitle className="text-2xl font-semibold text-gray-900">Додати новий лічильник</CardTitle>
          <CardDescription className="text-base text-gray-600">
            Заповніть форму, щоб додати новий лічильник для обліку комунальних послуг
          </CardDescription>
        </CardHeader>

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
              {meterTypeOptions.map((option) => {
                const Icon = option.icon
                const isSelected = meterType === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={[
                      'rounded-lg border p-4 text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-[var(--shadow-sm)]'
                        : 'border-gray-200 hover:border-primary/60 hover:bg-gray-50',
                    ].join(' ')}
                    onClick={() => handleMeterTypeSelect(option.value)}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={[
                          'flex h-12 w-12 items-center justify-center rounded-full border-2',
                          isSelected
                            ? 'border-primary bg-white text-primary'
                            : 'border-gray-200 bg-gray-50 text-gray-500',
                        ].join(' ')}
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <div>
                        <p
                          className={[
                            'text-base font-semibold',
                            isSelected ? 'text-dark' : 'text-gray-700',
                          ].join(' ')}
                        >
                          {option.title}
                        </p>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
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
              <label
                htmlFor="photoUpload"
                className={[
                  'flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 text-center text-gray-600 transition',
                  isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-primary/5',
                ].join(' ')}
                onDragEnter={handleDragOver}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <UploadCloud className="h-8 w-8 text-primary" />
                <p className="text-base font-medium text-gray-800">
                  Перетягніть фото сюди або натисніть для вибору
                </p>
                <p className="text-sm text-gray-500">
                  Підтримувані формати: JPG, PNG, HEIC. Макс. розмір: 5MB
                </p>
                <Button type="button" variant="outline" tone="neutral" size="sm" className="pointer-events-none">
                  <Camera className="h-4 w-4" /> Завантажити фото
                </Button>
                <input
                  id="photoUpload"
                  type="file"
                  className="sr-only"
                  accept="image/png,image/jpeg,image/heic"
                  {...photoField}
                  ref={photoRef}
                  onChange={(event) => {
                    photoOnChange(event)
                    handleFileChange(event)
                  }}
                />
              </label>
              {uploadedFileName ? (
                <FormMessage className="text-sm text-gray-600">
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
                  endAdornment={<span className="text-sm text-gray-500">грн</span>}
                />
                <FormMessage variant="error">{errors.tariffValue?.message}</FormMessage>
              </div>
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
            <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-800">Поради щодо заповнення</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Перевірте серійний номер і дату встановлення у техпаспорті.</li>
                <li>Завантажте фото з чітко видимими показниками лічильника.</li>
                <li>Уточніть тариф у договорі з постачальником послуги.</li>
              </ul>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-800">Заповнення форми</p>
                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{progress}% завершено</p>
              </div>
            </div>
          </section>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t border-gray-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
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
