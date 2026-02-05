/**
 * Core entity types for the komunalka application.
 * These types define the data model with numeric IDs and proper foreign key relationships.
 */

import type { MeterType } from '../constants/meterTypes'
import type { ProviderTariff } from './providers'

// =============================================================================
// Service Labels (Ukrainian UI strings)
// =============================================================================

export type ServiceLabel =
  | 'Електроенергія'
  | 'Газ'
  | 'Холодна вода'
  | 'Гаряча вода'
  | 'Опалення'

// =============================================================================
// Mappings between MeterType and ServiceLabel
// =============================================================================

export const METER_TYPE_TO_SERVICE_LABEL: Record<MeterType, ServiceLabel> = {
  electricity: 'Електроенергія',
  gas: 'Газ',
  coldWater: 'Холодна вода',
  hotWater: 'Гаряча вода',
  heat: 'Опалення',
}

export const SERVICE_LABEL_TO_METER_TYPE: Record<ServiceLabel, MeterType> = {
  Електроенергія: 'electricity',
  Газ: 'gas',
  'Холодна вода': 'coldWater',
  'Гаряча вода': 'hotWater',
  Опалення: 'heat',
}

// =============================================================================
// Utility Type ID Mappings (for API communication)
// =============================================================================

export const UTILITY_TYPE_ID_TO_METER_TYPE: Record<number, MeterType> = {
  1: 'electricity',
  2: 'gas',
  3: 'coldWater',
  4: 'hotWater',
  5: 'heat',
}

export const METER_TYPE_TO_UTILITY_TYPE_ID: Record<MeterType, number> = {
  electricity: 1,
  gas: 2,
  coldWater: 3,
  hotWater: 4,
  heat: 5,
}

// =============================================================================
// Reference Entities
// =============================================================================

export interface Region {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface AddressType {
  id: number
  name: string
  description: string
  icon: string
  createdAt: string
  updatedAt: string
}

// =============================================================================
// Core Entities
// =============================================================================

export interface Address {
  id: number
  userId: number
  regionId: number
  city: string
  street: string
  buildingNumber: string
  apartmentNumber: string
  zipCode: string
  notes: string
  isPrimary: boolean
  addressTypeId: number
  region: Region
  addressType: AddressType
  createdAt: string
  updatedAt: string
}

/**
 * Provider entity - represents a utility service provider
 */
export interface Provider {
  id: number
  name: string
  serviceType: MeterType
  serviceLabel: ServiceLabel
  unitLabel: string
  tariffs: ProviderTariff[]
  billingCycle: 'monthly' | 'quarterly' | 'annual'
  supportPhone?: string
  supportEmail?: string
  website?: string
  description?: string
  reminderDay?: number
}

/**
 * Meter entity - represents a physical meter device
 * Matches API response from GET /api/v1/meter endpoints
 */
export interface Meter {
  id: number
  addressId: number
  utilityTypeId: number
  serialNumber: string
  name: string
  description?: string | null
  modelName?: string | null
  location?: string | null
  photoPath?: string | null
  installationDate: string
  initialReading?: number | null
  serviceProviderId?: number | null
  notes?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  utilityTypeName: string
  serviceProviderName?: string | null
}

/**
 * Photo attached to a reading
 * Matches API response from meter-readings endpoints
 */
export interface ReadingPhoto {
  id: number
  optimizedUrl: string
  thumbnailUrl: string
  width: number
  height: number
  isProcessed: boolean
}

/**
 * Reading entity - represents a meter reading record
 * Matches API response from GET /api/v1/meter-readings endpoints
 */
export interface Reading {
  id: number
  meterId: number
  readingValue: number
  readingDate: string
  previousReadingValue?: number | null
  consumption?: number | null
  notes?: string | null
  isEstimated: boolean
  createdAt: string
  updatedAt: string
  meterName: string
  utilityTypeName: string
  unit: string
  photos: ReadingPhoto[]
}

/**
 * Consumption calculation for a reading
 * Returned as part of BatchReadingsResponse
 */
export interface ConsumptionCalculation {
  meterId: number
  meterName: string
  utilityType: string
  consumption: number
  unit: string
  baseRate: number
  serviceFee: number
  currencyCode: string
  currencySymbol: string
  totalCost: number
  tariffIdentifier: string
  tariffEffectiveFrom: string
  tariffEffectiveTo?: string | null
  consumptionCost: number
  serviceFeeCost: number
}

/**
 * Response from batch readings submission
 * Matches API response from POST /api/v1/meter-readings/batch
 */
export interface BatchReadingsResponse {
  addressId: number
  addressDisplay: string
  readings: Reading[]
  calculations: ConsumptionCalculation[]
  totalCost: number
  currencyCode: string
  currencySymbol: string
  submittedAt: string
}
