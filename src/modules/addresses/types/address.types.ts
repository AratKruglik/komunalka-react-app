import type { Address } from '@shared/types/entities'
import type { PaginationParams } from '@shared/api/types'

/**
 * Request payload for creating a new address
 */
export interface CreateAddressRequest {
  street: string
  building: string
  apartment: string
  city: string
  district: string
  isPrimary: boolean
}

/**
 * Request payload for updating an existing address
 * All fields are optional
 */
export type UpdateAddressRequest = Partial<CreateAddressRequest>

/**
 * Parameters for filtering and paginating address list
 * Extends base pagination params with address-specific filters
 */
export interface AddressListParams extends PaginationParams {
  city?: string
  district?: string
  isPrimary?: boolean
}

/**
 * Re-export Address type for convenience
 */
export type { Address }
