/**
 * View Models для модуля Addresses
 * Mapper функції для трансформації entity → view model
 */

import type { Address, Meter } from '../types/entities'
import type { MeterType } from '../constants/meterTypes'
import { METER_TYPE_TO_SERVICE_LABEL } from '../types/entities'
import type { LucideIcon } from 'lucide-react'
import { Star } from 'lucide-react'

// =============================================================================
// View Model Types
// =============================================================================

export interface AddressBadge {
  readonly label: string
  readonly variant: 'primary' | 'muted' | 'outline'
  readonly icon?: LucideIcon
}

export interface AddressServiceTag {
  readonly type: MeterType
  readonly label: string
}

export interface AddressCardViewModel {
  readonly id: number
  readonly title: string
  readonly subtitle: string
  readonly badges: readonly AddressBadge[]
  readonly services: readonly AddressServiceTag[]
  readonly isPrimary: boolean
  readonly addressType: {
    readonly name: string
    readonly icon: string
  }
}

export interface AddressSelectViewModel {
  readonly id: number
  readonly label: string
  readonly description: string
}

// =============================================================================
// Mapper Functions
// =============================================================================

/**
 * Перетворює Address entity на AddressCardViewModel для AddressCard компонента
 */
export function toAddressCardViewModel(
  address: Address,
  meters: readonly Meter[],
): AddressCardViewModel {
  const apartment = address.apartmentNumber ? `, кв. ${address.apartmentNumber}` : ''
  const title = `${address.street}, ${address.buildingNumber}${apartment}`

  const subtitle = `${address.addressType.name} | м. ${address.city}, ${address.region.name}`

  // Формуємо badges
  const badges: AddressBadge[] = []

  if (address.isPrimary) {
    badges.push({ label: 'Основна адреса', variant: 'primary' })
  } else {
    badges.push({ label: 'Зробити основною', variant: 'outline', icon: Star })
  }

  const meterCountLabel =
    meters.length === 1 ? '1 лічильник' : `${meters.length} лічильників`
  badges.push({ label: meterCountLabel, variant: 'muted' })

  // Формуємо services з унікальних типів лічильників
  const uniqueMeterTypes = new Set<MeterType>()
  meters.forEach((meter) => uniqueMeterTypes.add(meter.type))

  const services: AddressServiceTag[] = Array.from(uniqueMeterTypes).map((type) => ({
    type,
    label: METER_TYPE_TO_SERVICE_LABEL[type],
  }))

  return {
    id: address.id,
    title,
    subtitle,
    badges,
    services,
    isPrimary: address.isPrimary,
    addressType: {
      name: address.addressType.name,
      icon: address.addressType.icon,
    },
  }
}

/**
 * Перетворює Address entity на AddressSelectViewModel для dropdown/select компонента
 */
export function toAddressSelectViewModel(address: Address): AddressSelectViewModel {
  const apartment = address.apartmentNumber ? `, кв. ${address.apartmentNumber}` : ''
  const label = `${address.street}, ${address.buildingNumber}${apartment}`
  const description = `${address.addressType.name} | м. ${address.city}, ${address.region.name}`

  return {
    id: address.id,
    label,
    description,
  }
}

/**
 * Batch mapper для списку адрес
 */
export function toAddressCardViewModels(
  addresses: readonly Address[],
  metersMap: ReadonlyMap<number, readonly Meter[]>,
): readonly AddressCardViewModel[] {
  return addresses.map((address) => {
    const meters = metersMap.get(address.id) || []
    return toAddressCardViewModel(address, meters)
  })
}
