import { useCallback, useState } from 'react'
import { useAuth } from '@shared/hooks/useAuth'

function generateCSV(headers: string[], rows: string[][]): string {
  const escapeCsvValue = (value: string) => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const headerLine = headers.map(escapeCsvValue).join(',')
  const dataLines = rows.map((row) => row.map(escapeCsvValue).join(','))
  return [headerLine, ...dataLines].join('\n')
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function useExportData() {
  const { state } = useAuth()
  const [isExporting, setIsExporting] = useState(false)

  const exportCSV = useCallback(async () => {
    if (!state.user) return

    setIsExporting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const user = state.user
      const headers = ['Тип', "Ім'я", 'Значення', 'Дата']
      const rows: string[][] = [
        ["Ім'я користувача", 'username', user.username, ''],
        ['Email', 'email', user.email, ''],
        ["Ім'я", 'firstName', user.firstName ?? '', ''],
        ['Прізвище', 'lastName', user.lastName ?? '', ''],
        ['Телефон', 'phoneNumber', user.phoneNumber ?? '', ''],
        ['Дата реєстрації', 'createdAt', user.createdAt ?? '', ''],
      ]

      if (user.addresses?.length) {
        user.addresses.forEach((address) => {
          const addressDisplay = [address.city, address.street, address.buildingNumber, address.apartmentNumber]
            .filter(Boolean)
            .join(', ')
          rows.push(['Адреса', 'address', addressDisplay, address.createdAt ?? ''])
        })
      }

      const timestamp = new Date().toISOString().slice(0, 10)
      const csv = generateCSV(headers, rows)
      triggerDownload(csv, `komunalka-export-${timestamp}.csv`)
    } finally {
      setIsExporting(false)
    }
  }, [state.user])

  return { isExporting, exportCSV }
}
