import type { Address, Region, AddressType } from '@shared/types/entities'
import type { PaginationParams } from '@shared/api/types'

export interface CreateAddressRequest {
  regionId: number
  city: string
  street: string
  buildingNumber: string
  apartmentNumber: string
  zipCode: string
  notes: string
  isPrimary: boolean
  addressTypeId: number
}

export type UpdateAddressRequest = Partial<CreateAddressRequest>

export interface AddressListParams extends PaginationParams {
  city?: string
  regionId?: number
  isPrimary?: boolean
}

export type { Address, Region, AddressType }
