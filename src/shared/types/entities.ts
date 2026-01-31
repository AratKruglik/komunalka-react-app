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
 */
export interface Meter {
  id: number
  addressId: number // Foreign key to Address
  providerId: number // Foreign key to Provider
  type: MeterType
  name: string
  meterNumber: string
  location: string
  installedAt: string
  status: 'active' | 'maintenance' | 'inactive'
  nextCheckDate?: string
}

/**
 * Reading entity - represents a meter reading record
 */
export interface Reading {
  id: number
  meterId: number // Foreign key to Meter
  date: string // ISO date string
  value: number
  consumption?: number // Calculated consumption
  submittedAt: string // ISO datetime string
  status: 'accepted' | 'processing' | 'rejected'
  note?: string
  photoUrl?: string
}
