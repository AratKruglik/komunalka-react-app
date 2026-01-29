import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import { AuthenticatedLayout } from '@shared/components/layout/AuthenticatedLayout'
import { PageSectionHeader } from '@shared/components/pages'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormMessage,
  Input,
  Label,
  Select,
} from '@shared/components/ui'
import { useAddresses } from '@modules/addresses/hooks'
import { useMetersByAddress } from '@modules/meters/hooks'
import { useReadingsByAddress } from '@modules/readings/hooks'
import { METER_TYPE_OPTIONS, type MeterType } from '@shared/constants/meterTypes'
import { MOCK_PROVIDERS } from '@shared/data/mockDatabase'
import {
  toAddressMetersSnapshotViewModel,
  type MeterTypeGroupViewModel,
} from '@shared/viewModels'
import { MeterTypeTabs } from '../components/MeterTypeTabs'

type QuickFormState = Record<
  MeterType,
  {
    meterId: number
    value: string
    periodLabel: string
  }
>

const meterTypeOrder: MeterType[] = ['electricity', 'gas', 'coldWater', 'hotWater', 'heat']

const meterStatusStyles: Record<
  string,
  {
    badge: string
    text: string
  }
> = {
  active: {
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    text: 'Активний',
  },
  maintenance: {
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
    text: 'Потрібне обслуговування',
  },
  pending: {
    badge: 'bg-blue-50 text-blue-700 border border-blue-200',
    text: 'Очікує показань',
  },
}

type HistoryStatus = 'accepted' | 'processing' | 'error'

const historyStatusMap: Record<
  HistoryStatus,
  {
    label: string
    badgeTone: 'success' | 'warning' | 'danger'
  }
> = {
  accepted: { label: 'Прийнято', badgeTone: 'success' },
  processing: { label: 'Обробляємо', badgeTone: 'warning' },
  error: { label: 'Відхилено', badgeTone: 'danger' },
}

export default function AddressMetersPage() {
  const navigate = useNavigate()
  const { addresses } = useAddresses()

  const addressOptions = useMemo(() => {
    return addresses.map((address) => ({
      value: address.id,
      label: `${address.street}, ${address.building}, кв. ${address.apartment}`,
    }))
  }, [addresses])

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)

  // Set initial address when addresses load
  useEffect(() => {
    if (addressOptions.length > 0 && selectedAddressId === null) {
      setSelectedAddressId(addressOptions[0].value)
    }
  }, [addressOptions, selectedAddressId])

  // Fetch meters and readings from API
  const { meters, isLoading: isLoadingMeters } = useMetersByAddress(selectedAddressId)
  const { readings, isLoading: isLoadingReadings } = useReadingsByAddress(selectedAddressId)

  const [activeMeterType, setActiveMeterType] = useState<MeterType>('electricity')
  const [quickForms, setQuickForms] = useState<QuickFormState>({} as QuickFormState)
  const [submissionState, setSubmissionState] = useState<{ type: MeterType; message: string } | null>(null)

  // Build snapshot from API data
  const addressSnapshot = useMemo(() => {
    if (selectedAddressId === null || meters.length === 0) {
      return null
    }

    return toAddressMetersSnapshotViewModel(
      selectedAddressId,
      meters,
      readings,
      MOCK_PROVIDERS,
    )
  }, [selectedAddressId, meters, readings])

  const isLoading = isLoadingMeters || isLoadingReadings

  const availableGroups = useMemo(() => {
    if (!addressSnapshot) {
      return []
    }
    return meterTypeOrder
      .map((type) => addressSnapshot.groups[type])
      .filter((group): group is MeterTypeGroupViewModel => Boolean(group))
  }, [addressSnapshot])

  useEffect(() => {
    if (availableGroups.length === 0) {
      return
    }

    const hasActive = availableGroups.some((group) => group.type === activeMeterType)
    if (!hasActive) {
      setActiveMeterType(availableGroups[0].type)
    }
  }, [availableGroups, activeMeterType])

  useEffect(() => {
    if (!submissionState) {
      return
    }

    const timeout = window.setTimeout(() => setSubmissionState(null), 3500)
    return () => window.clearTimeout(timeout)
  }, [submissionState])

  const currentGroup = availableGroups.find((group) => group.type === activeMeterType) ?? null

  const meterTypeMeta = Object.fromEntries(
    METER_TYPE_OPTIONS.map((option) => [option.value, option]),
  ) as Record<MeterType, (typeof METER_TYPE_OPTIONS)[number]>

  const meterTabs = availableGroups.map((group) => {
    const meta = meterTypeMeta[group.type]
    return {
      value: group.type,
      label: meta?.title ?? group.type,
      count: group.meters.length,
      description: meta?.description,
    }
  })

  const quickFormState = currentGroup
    ? quickForms[currentGroup.type] ?? {
        meterId: currentGroup.quickDraft.meterId,
        value: '',
        periodLabel: currentGroup.quickDraft.monthLabel,
      }
    : null

  const resolveBaseQuickForm = (type: MeterType) => {
    const existing = quickForms[type]
    if (existing) {
      return existing
    }
    const group = availableGroups.find((entry) => entry.type === type)
    if (!group) {
      return { meterId: 0, value: '', periodLabel: '' }
    }
    return {
      meterId: group.quickDraft.meterId,
      value: '',
      periodLabel: group.quickDraft.monthLabel,
    }
  }

  const handleQuickFormChange = (
    type: MeterType,
    partial: Partial<QuickFormState[MeterType]>,
  ) => {
    setQuickForms((previous) => ({
      ...previous,
      [type]: {
        ...resolveBaseQuickForm(type),
        ...(previous[type] ?? {}),
        ...partial,
      },
    }))
  }

  const handleQuickSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentGroup || !quickFormState?.value) {
      return
    }

    setSubmissionState({
      type: currentGroup.type,
      message: `Показання ${quickFormState.value} ${currentGroup.quickDraft.unit} збережено як чернетку`,
    })

    setQuickForms((previous) => ({
      ...previous,
      [currentGroup.type]: {
        meterId: quickFormState.meterId,
        value: '',
        periodLabel: quickFormState.periodLabel,
      },
    }))
  }

  const renderMetersList = () => {
    if (!currentGroup) {
      return null
    }

    return (
      <div className="space-y-4">
        {currentGroup.meters.map((meter) => {
          const statusStyle = meterStatusStyles[meter.status] ?? meterStatusStyles.active
          return (
            <div
              key={meter.id}
              className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-base font-semibold text-gray-900 dark:text-slate-100">{meter.name}</p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle.badge}`}>
                    {statusStyle.text}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  Серійний №: <span className="font-medium text-gray-800 dark:text-slate-100">{meter.meterNumber}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  Локація: <span className="font-medium text-gray-800 dark:text-slate-100">{meter.location}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  Провайдер: <span className="font-medium text-gray-800 dark:text-slate-100">{meter.providerName}</span>
                </p>
              </div>

              <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-slate-400 sm:text-right">
                <p>
                  Останні показання:{' '}
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{meter.lastSubmission}</span>
                </p>
                {meter.nextCheckDate ? (
                  <p>
                    Перевірка до:{' '}
                    <span className="font-semibold text-gray-900 dark:text-slate-100">{meter.nextCheckDate}</span>
                  </p>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  tone="neutral"
                  className="mt-2 sm:ml-auto"
                >
                  Оновити дані
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderQuickForm = () => {
    if (!currentGroup || !quickFormState) {
      return null
    }

    const meterOptions = currentGroup.meters
    const periodOptions = Array.from(
      new Set([
        currentGroup.quickDraft.monthLabel,
        ...currentGroup.latestReadings.map((reading) => reading.monthLabel),
      ]),
    )

    return (
      <form
        className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:flex md:flex-wrap md:items-end md:gap-4 md:space-y-0"
        onSubmit={handleQuickSubmit}
      >
        <div className="w-full md:flex-1">
          <Label htmlFor="quick-meter" className="text-sm text-gray-600 dark:text-slate-100">
            Лічильник
          </Label>
          <Select
            id="quick-meter"
            value={String(quickFormState.meterId)}
            onChange={(event) =>
              handleQuickFormChange(currentGroup.type, { meterId: Number(event.target.value) })
            }
            className="mt-1"
          >
            {meterOptions.map((meter) => (
              <option key={meter.id} value={meter.id}>
                {meter.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-full md:flex-1">
          <Label htmlFor="quick-period" className="text-sm text-gray-600 dark:text-slate-100">
            Місяць
          </Label>
          <Select
            id="quick-period"
            value={quickFormState.periodLabel}
            onChange={(event) =>
              handleQuickFormChange(currentGroup.type, { periodLabel: event.target.value })
            }
            className="mt-1"
          >
            {periodOptions.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-full md:flex-1">
          <Label htmlFor="quick-value" className="text-sm text-gray-600 dark:text-slate-100">
            Нові показання
          </Label>
          <Input
            id="quick-value"
            type="number"
            inputMode="decimal"
            placeholder={`Напр., ${currentGroup.quickDraft.previousValue + 12}`}
            value={quickFormState.value}
            onChange={(event) =>
              handleQuickFormChange(currentGroup.type, { value: event.target.value })
            }
            className="mt-1"
            endAdornment={<span className="text-sm text-gray-500">{currentGroup.quickDraft.unit}</span>}
            required
            min="0"
          />
        </div>

        <div className="w-full md:w-auto">
          <Button
            type="submit"
            tone="primary"
            className="w-full min-w-[180px] md:min-w-[200px]"
            disabled={!quickFormState.value}
          >
            Зберегти показання
          </Button>
        </div>

        {submissionState && submissionState.type === currentGroup.type ? (
          <FormMessage variant="success" className="w-full">
            {submissionState.message}
          </FormMessage>
        ) : (
          <FormMessage className="w-full text-gray-500">
            Останнє значення: {currentGroup.quickDraft.previousValue}{' '}
            {currentGroup.quickDraft.unit}
          </FormMessage>
        )}
      </form>
    )
  }

  const renderHistory = () => {
    if (!currentGroup) {
      return null
    }

    return (
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="grid grid-cols-4 gap-2 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase text-gray-500 dark:bg-slate-800 dark:text-slate-300 sm:text-sm">
          <span>Період</span>
          <span>Показання</span>
          <span>Статус</span>
          <span>Відправлено</span>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {currentGroup.history.map((record) => (
            <div
              key={record.id}
              className="grid grid-cols-4 gap-2 px-4 py-3 text-sm text-gray-700 dark:text-slate-300"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-slate-100">{record.periodLabel}</p>
                {record.note ? (
                  <p className="text-xs text-gray-500 dark:text-slate-400">{record.note}</p>
                ) : null}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-slate-100">
                  {record.value} {currentGroup.quickDraft.unit}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Δ {record.consumption} {currentGroup.quickDraft.unit}
                </p>
              </div>
              <div>
                <Badge variant={historyStatusMap[record.status].badgeTone}>
                  {historyStatusMap[record.status].label}
                </Badge>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{record.submittedAt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <AuthenticatedLayout
      pageTitle="Лічильники за адресою"
      pageSubtitle="Переглядайте актуальні показання та швидко надсилайте оновлення"
    >
      <div className="space-y-6">
        <Card className="border border-gray-200 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <PageSectionHeader
            title="Оберіть адресу для перегляду лічильників"
            description="Всі налаштування, прив'язані до адреси, синхронізуються з вашим обліковим записом"
            ctaButton={{
              label: 'Додати лічильник',
              icon: <Plus className="h-4 w-4 sm:h-5 sm:w-5" />,
              onClick: () => navigate('/meters/new'),
              className: 'w-full min-w-0 text-sm sm:w-auto sm:min-w-[188px] sm:text-base',
            }}
          />
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <p className="text-sm text-gray-500 dark:text-slate-400">Всього лічильників</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-slate-50">
                  {addressSnapshot?.summary.totalMeters ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <p className="text-sm text-gray-500 dark:text-slate-400">Активні</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-slate-50">
                  {addressSnapshot?.summary.activeMeters ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <p className="text-sm text-gray-500 dark:text-slate-400">Очікують показань</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-slate-50">
                  {addressSnapshot?.summary.pendingReadings ?? 0}
                </p>
              </div>
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="address-select" className="text-sm font-semibold text-gray-600 dark:text-slate-100">
                Адреса
              </Label>
              <Select
                id="address-select"
                value={selectedAddressId ?? ''}
                onChange={(event) => setSelectedAddressId(Number(event.target.value))}
              >
                {addressOptions.map((address) => (
                  <option key={address.value} value={address.value}>
                    {address.label}
                  </option>
                ))}
              </Select>
              {isLoading ? (
                <FormMessage>Завантаження...</FormMessage>
              ) : addressSnapshot === null && selectedAddressId !== null ? (
                <FormMessage variant="error">
                  Для цієї адреси поки що немає збережених лічильників.
                </FormMessage>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="space-y-4 border-b border-gray-100 dark:border-slate-800">
            <div>
              <CardTitle className="text-xl text-gray-900 dark:text-slate-50">Типи лічильників</CardTitle>
              <CardDescription>
                Виберіть потрібний тип, щоб переглянути робочі лічильники, останні показання та історію
              </CardDescription>
            </div>
            {meterTabs.length > 0 ? (
              <MeterTypeTabs tabs={meterTabs} activeValue={activeMeterType} onChange={setActiveMeterType} />
            ) : (
              <FormMessage variant="error">
                Немає доступних лічильників для цієї адреси. Додайте новий, щоб почати.
              </FormMessage>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {currentGroup ? (
              <>
                <section className="space-y-3">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50">
                      {meterTypeMeta[currentGroup.type]?.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      {currentGroup.meters.length} {currentGroup.meters.length === 1 ? 'лічильник' : 'лічильники'}
                    </p>
                  </div>
                  {renderMetersList()}
                </section>

                <section className="space-y-3">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-slate-50">Швидке внесення показань</h4>
                  {renderQuickForm()}
                </section>

                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-slate-50">Історія показань</h4>
                    <Button type="button" size="sm" variant="ghost" tone="primary">
                      Завантажити PDF
                    </Button>
                  </div>
                  {renderHistory()}
                </section>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Оберіть тип лічильника, щоб побачити його дані.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
