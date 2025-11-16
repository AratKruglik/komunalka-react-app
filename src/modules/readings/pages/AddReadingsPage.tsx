import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import { AuthenticatedLayout } from '../../../shared/components/layout/AuthenticatedLayout'
import { PageSectionHeader } from '../../../shared/components/pages'
import { Button, Card, CardContent, Label, Select } from '../../../shared/components/ui'
import { MOCK_ADDRESS_OPTIONS } from '../../../shared/data/mockAddresses'
import { MOCK_ADDRESS_READING_SNAPSHOTS } from '../data/mockReadings'
import { ReadingCard } from '../components/ReadingCard'
import { ReadingSummaryTable } from '../components/ReadingSummaryTable'
import type { AddressReadingsSnapshot, MeterReadingDraft } from '../types'

type MeterFormState = Record<
  string,
  {
    currentValue: string
    readingDate: string
    photo: {
      fileName: string | null
      previewUrl: string | null
    }
  }
>

const buildFormState = (drafts: MeterReadingDraft[]): MeterFormState => {
  return drafts.reduce<MeterFormState>((acc, draft) => {
    acc[draft.id] = {
      currentValue: String(draft.currentValue),
      readingDate: draft.readingDate,
      photo: {
        fileName: draft.photo?.fileName ?? null,
        previewUrl: draft.photo?.previewUrl ?? null,
      },
    }
    return acc
  }, {})
}

const findSnapshot = (addressId: string): AddressReadingsSnapshot | undefined => {
  return MOCK_ADDRESS_READING_SNAPSHOTS.find((snapshot) => snapshot.addressId === addressId)
}

export default function AddReadingsPage() {
  const navigate = useNavigate()
  const [selectedAddressId, setSelectedAddressId] = useState(MOCK_ADDRESS_OPTIONS[0]?.value ?? '')
  const snapshot = useMemo(() => findSnapshot(selectedAddressId), [selectedAddressId])
  const [forms, setForms] = useState<MeterFormState>(() => buildFormState(snapshot?.meterDrafts ?? []))
  const generatedPreviews = useRef<Record<string, string>>({})

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
    setSelectedAddressId(event.target.value)
  }

  const handleCurrentValueChange = (meterId: string, value: string) => {
    setForms((previous) => ({
      ...previous,
      [meterId]: {
        ...previous[meterId],
        currentValue: value,
      },
    }))
  }

  const handleReadingDateChange = (meterId: string, date: string) => {
    setForms((previous) => ({
      ...previous,
      [meterId]: {
        ...previous[meterId],
        readingDate: date,
      },
    }))
  }

  const handlePhotoSelected = (meterId: string, file: File | null) => {
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
          photo: { fileName: null, previewUrl: null },
        }
        return nextState
      }

      const previewUrl = URL.createObjectURL(file)
      generatedPreviews.current[meterId] = previewUrl

      nextState[meterId] = {
        ...nextState[meterId],
        photo: {
          fileName: file.name,
          previewUrl,
        },
      }
      return nextState
    })
  }

  const handlePhotoClear = (meterId: string) => {
    setForms((previous) => {
      if (!previous[meterId]) {
        return previous
      }
      const next = {
        ...previous,
        [meterId]: {
          ...previous[meterId],
          photo: { fileName: null, previewUrl: null },
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // TODO: Hook up API call once backend is ready.
  }

  const meterDrafts = snapshot?.meterDrafts ?? []

  const summaryRows = meterDrafts.map((draft) => {
    const formState = forms[draft.id]
    const currentValue = Number(formState?.currentValue ?? draft.currentValue)
    return {
      id: `${draft.id}-summary`,
      type: draft.type,
      serviceName: draft.serviceName,
      previousValue: draft.previousValue,
      currentValue: Number.isNaN(currentValue) ? null : currentValue,
      unit: draft.unit,
      tariff: draft.tariff,
      tariffLabel: draft.tariffLabel,
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
                value={selectedAddressId}
                onChange={handleAddressChange}
                wrapperClassName="w-full"
              >
                {MOCK_ADDRESS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
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
                photo={forms[draft.id]?.photo}
                onCurrentValueChange={(value) => handleCurrentValueChange(draft.id, value)}
                onReadingDateChange={(value) => handleReadingDateChange(draft.id, value)}
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

          <div className="flex justify-end border-t border-gray-100 pt-4">
            <Button type="submit" tone="primary" size="md" className="min-w-[220px]">
              Зберегти
            </Button>
          </div>
        </form>

      </div>
    </AuthenticatedLayout>
  )
}
