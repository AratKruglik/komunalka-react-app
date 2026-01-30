import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import { AuthenticatedLayout } from '@shared/components/layout/AuthenticatedLayout'
import { PageSectionHeader } from '@shared/components/pages'
import { Button, Card, CardContent, FormMessage, Label, Select } from '@shared/components/ui'
import { useAddresses } from '@modules/addresses/hooks'
import { useMetersByAddress } from '@modules/meters/hooks'
import { useReadingsByAddress, useCreateBatchReadings } from '@modules/readings/hooks'
import type { BatchReadingItem } from '@modules/readings/types'
import { MOCK_PROVIDERS } from '@shared/data/mockDatabase'
import {
  toAddressSelectViewModel,
  toAddressReadingsSnapshotViewModel,
  type AddressReadingsSnapshotViewModel,
  type MeterReadingDraftViewModel,
} from '@shared/viewModels'
import { ReadingCard } from '../components/ReadingCard'
import { ReadingSummaryTable } from '../components/ReadingSummaryTable'

type MeterFormState = Record<
  number,
  {
    currentValue: string
    readingDate: string
    tariffId: string
    photo: {
      file: File | null
      fileName: string | null
      previewUrl: string | null
    }
  }
>

const buildFormState = (drafts: readonly MeterReadingDraftViewModel[]): MeterFormState => {
  return drafts.reduce<MeterFormState>((acc, draft) => {
    acc[draft.id] = {
      currentValue: String(draft.currentValue),
      readingDate: draft.readingDate,
      tariffId: draft.tariffId,
      photo: {
        file: null,
        fileName: draft.photo?.fileName ?? null,
        previewUrl: draft.photo?.previewUrl ?? null,
      },
    }
    return acc
  }, {})
}

export default function AddReadingsPage() {
  const navigate = useNavigate()
  const { addresses } = useAddresses()
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Set initial address when addresses load
  useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === null) {
      setSelectedAddressId(addresses[0].id)
    }
  }, [addresses, selectedAddressId])

  // Fetch meters and readings from API
  const { meters, isLoading: isLoadingMeters } = useMetersByAddress(selectedAddressId)
  const { readings, isLoading: isLoadingReadings, refetch: refetchReadings } = useReadingsByAddress(selectedAddressId)
  const { createBatchReadings, isLoading: isSubmitting, error: submitError } = useCreateBatchReadings()

  // Generate address options for dropdown
  const addressOptions = useMemo(
    () => addresses.map(toAddressSelectViewModel),
    [addresses]
  )

  // Generate snapshot for selected address from API data
  const snapshot = useMemo<AddressReadingsSnapshotViewModel | null>(() => {
    if (selectedAddressId === null || meters.length === 0) {
      return null
    }

    return toAddressReadingsSnapshotViewModel(
      selectedAddressId,
      meters,
      readings,
      MOCK_PROVIDERS
    )
  }, [selectedAddressId, meters, readings])

  const isLoading = isLoadingMeters || isLoadingReadings
  const [forms, setForms] = useState<MeterFormState>(() => buildFormState(snapshot?.meterDrafts ?? []))
  const generatedPreviews = useRef<Record<string, string>>({})

  const getActiveTariff = (
    draft: MeterReadingDraftViewModel,
    formState?: MeterFormState[number],
  ) => {
    const selectedTariffId = formState?.tariffId ?? draft.tariffId
    return draft.tariffs.find((tariff) => tariff.id === selectedTariffId) ?? draft.tariffs[0]
  }

  useEffect(() => {
    setForms(buildFormState(snapshot?.meterDrafts ?? []))
    Object.values(generatedPreviews.current).forEach((url) => URL.revokeObjectURL(url))
    generatedPreviews.current = {}
  }, [snapshot])

  useEffect(() => {
    return () => {
      Object.values(generatedPreviews.current).forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const handleAddressChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAddressId(Number(event.target.value))
  }

  const handleCurrentValueChange = (meterId: number, value: string) => {
    setForms((previous) => ({
      ...previous,
      [meterId]: {
        ...previous[meterId],
        currentValue: value,
      },
    }))
  }

  const handleReadingDateChange = (meterId: number, date: string) => {
    setForms((previous) => ({
      ...previous,
      [meterId]: {
        ...previous[meterId],
        readingDate: date,
      },
    }))
  }

  const handleTariffChange = (meterId: number, tariffId: string) => {
    setForms((previous) => ({
      ...previous,
      [meterId]: {
        ...previous[meterId],
        tariffId,
      },
    }))
  }

  const handlePhotoSelected = (meterId: number, file: File | null) => {
    setForms((previous) => {
      const nextState = { ...previous }
      if (!nextState[meterId]) {
        return previous
      }

      const previousPreview = generatedPreviews.current[meterId]
      if (previousPreview) {
        URL.revokeObjectURL(previousPreview)
        delete generatedPreviews.current[meterId]
      }

      if (!file) {
        nextState[meterId] = {
          ...nextState[meterId],
          photo: { file: null, fileName: null, previewUrl: null },
        }
        return nextState
      }

      const previewUrl = URL.createObjectURL(file)
      generatedPreviews.current[meterId] = previewUrl

      nextState[meterId] = {
        ...nextState[meterId],
        photo: {
          file,
          fileName: file.name,
          previewUrl,
        },
      }
      return nextState
    })
  }

  const handlePhotoClear = (meterId: number) => {
    setForms((previous) => {
      if (!previous[meterId]) {
        return previous
      }
      const next = {
        ...previous,
        [meterId]: {
          ...previous[meterId],
          photo: { file: null, fileName: null, previewUrl: null },
        },
      }
      const previousPreview = generatedPreviews.current[meterId]
      if (previousPreview) {
        URL.revokeObjectURL(previousPreview)
        delete generatedPreviews.current[meterId]
      }
      return next
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (selectedAddressId === null) return

    // Build batch reading items
    const batchItems: BatchReadingItem[] = meterDrafts.map((draft) => {
      const formState = forms[draft.id]
      return {
        MeterId: draft.id,
        Value: Number(formState?.currentValue ?? draft.currentValue),
        ReadingDate: formState?.readingDate ?? draft.readingDate,
        Notes: undefined,
      }
    })

    const photos = new Map<number, File>()
    for (const draft of meterDrafts) {
      const formState = forms[draft.id]
      if (formState?.photo?.file) {
        photos.set(draft.id, formState.photo.file)
      }
    }

    try {
      await createBatchReadings(selectedAddressId, batchItems, photos.size > 0 ? photos : undefined)
      setSubmitSuccess(true)
      refetchReadings()

      // Clear success after delay
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch {
      // Error is handled by the hook
    }
  }

  const meterDrafts = snapshot?.meterDrafts ?? []

  const summaryRows = meterDrafts.map((draft) => {
    const formState = forms[draft.id]
    const currentValue = Number(formState?.currentValue ?? draft.currentValue)
    const activeTariff = getActiveTariff(draft, formState)
    return {
      id: `${draft.id}-summary`,
      type: draft.type,
      serviceName: draft.serviceName,
      previousValue: draft.previousValue,
      currentValue: Number.isNaN(currentValue) ? null : currentValue,
      unit: draft.unit,
      tariffId: activeTariff?.id ?? draft.tariffId,
      tariff: activeTariff?.price ?? draft.tariff,
      tariffLabel: activeTariff?.label ?? draft.tariffLabel,
    }
  })

  return (
    <AuthenticatedLayout
      pageTitle="Внести показання"
      pageSubtitle="Заповніть форму для кожного лічильника та додайте фото підтвердження"
    >
      <div className="space-y-6">
        <Card className="border border-gray-200 shadow-lg">
          <PageSectionHeader
            title="Оберіть адресу для внесення показань"
            description="Всі налаштування, привʼязані до адреси, синхронізуються з вашим обліковим записом"
            withBorder
            ctaButton={{
              label: 'Додати лічильник',
              icon: <Plus className="h-4 w-4" />,
              onClick: () => navigate('/meters/new'),
            }}
          />
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address-select" className="text-sm font-semibold text-gray-700">
                Адреса
              </Label>
              <Select
                id="address-select"
                value={selectedAddressId ?? ''}
                onChange={handleAddressChange}
              >
                {addressOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {meterDrafts.length ? (
            meterDrafts.map((draft) => (
              <ReadingCard
                key={draft.id}
                draft={draft}
                currentValue={forms[draft.id]?.currentValue ?? String(draft.currentValue)}
                readingDate={forms[draft.id]?.readingDate ?? draft.readingDate}
                selectedTariffId={forms[draft.id]?.tariffId ?? draft.tariffId}
                photo={forms[draft.id]?.photo}
                onCurrentValueChange={(value) => handleCurrentValueChange(draft.id, value)}
                onReadingDateChange={(value) => handleReadingDateChange(draft.id, value)}
                onTariffChange={(value) => handleTariffChange(draft.id, value)}
                onPhotoSelected={(file) => handlePhotoSelected(draft.id, file)}
                onPhotoClear={() => handlePhotoClear(draft.id)}
              />
            ))
          ) : (
            <Card className="border-dashed border-gray-200 bg-gray-50 text-center shadow-none">
              <CardContent className="py-10">
                <p className="text-lg font-semibold text-gray-800">Немає лічильників для вибраної адреси</p>
                <p className="mt-2 text-sm text-gray-500">
                  Додайте лічильник у розділі «Лічильники», щоб почати вводити показання
                </p>
              </CardContent>
            </Card>
          )}

          <ReadingSummaryTable rows={summaryRows} />

          {submitError && (
            <FormMessage variant="error">{submitError}</FormMessage>
          )}
          {submitSuccess && (
            <FormMessage variant="success">Показання успішно збережено!</FormMessage>
          )}

          <div className="flex justify-end border-t border-gray-100 pt-4">
            <Button
              type="submit"
              tone="primary"
              size="md"
              className="min-w-[220px]"
              loading={isSubmitting}
              loadingText="Збереження..."
              disabled={isLoading || meterDrafts.length === 0}
            >
              Зберегти
            </Button>
          </div>
        </form>

      </div>
    </AuthenticatedLayout>
  )
}
