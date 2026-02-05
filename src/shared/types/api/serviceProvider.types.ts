/**
 * API types for Service Provider endpoints
 * Matches Komunalka.API.http documentation
 */

// =============================================================================
// Utility Type (Reference data, no auth)
// =============================================================================

export interface ApiUtilityType {
  id: number
  slug: string
  displayName: string
  unit: string
  isActive: boolean
}

// =============================================================================
// Tariff (nested in Service Provider response)
// =============================================================================

export interface ApiTariff {
  id: number
  serviceProviderId: number
  utilityTypeId: number
  currencyId: number
  pricingModel: 'fixed' | 'tiered'
  baseRate: number
  serviceFee: number
  effectiveFrom: string
  effectiveTo: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  utilityTypeName: string
  currencyCode: string
  currencySymbol: string
}

// =============================================================================
// Service Provider
// =============================================================================

export interface ApiServiceProvider {
  id: number
  addressId: number
  name: string
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  tariffs: ApiTariff[]
}

// =============================================================================
// Request DTOs
// =============================================================================

export interface CreateTariffRequest {
  utilityTypeId: number
  currencyId: number
  pricingModel: 'fixed' | 'tiered'
  baseRate: number
  serviceFee?: number
  effectiveFrom: string
  effectiveTo?: string | null
  notes?: string | null
}

export interface CreateServiceProviderRequest {
  addressId: number
  utilityTypeId: number
  name: string
  description?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  isActive?: boolean
  tariffs: CreateTariffRequest[]
}

export interface UpdateServiceProviderRequest {
  name?: string
  description?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  isActive?: boolean
  utilityTypeId?: number
}

// =============================================================================
// API Response Wrappers
// =============================================================================

export interface ApiDataResponse<T> {
  data: T
}

export interface ApiListResponse<T> {
  data: T[]
}
