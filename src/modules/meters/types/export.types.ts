export type ExportFormat = 'pdf' | 'csv'

export interface ExportMeterReadingsRequest {
  addressIds?: number[]
  fromDate?: string
  toDate?: string
  format: ExportFormat
}
