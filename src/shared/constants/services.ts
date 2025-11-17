import { Zap, Flame, Droplets, Thermometer, Waves } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { MeterType } from './meterTypes'

// Legacy type - kept for backward compatibility during migration
export type ServiceType =
  | 'Електроенергія'
  | 'Газ'
  | 'Холодна вода'
  | 'Гаряча вода'
  | 'Водопостачання'
  | 'Опалення'

export interface ServiceConfig {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  tagBg: string
  tagText: string
  chartColor: string
}

/**
 * Централізована конфігурація кольорів та іконок для комунальних послуг.
 * НОВИЙ ПІДХІД: Використовує MeterType як ключі для консистентності з логікою.
 * Використовується по всьому додатку для консистентності UI.
 */
export const SERVICE_CONFIG: Record<MeterType, ServiceConfig> = {
  electricity: {
    icon: Zap,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    tagBg: 'bg-sky-100',
    tagText: 'text-sky-800',
    chartColor: '#7DD3FC',
  },
  gas: {
    icon: Flame,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    tagBg: 'bg-amber-100',
    tagText: 'text-amber-800',
    chartColor: '#FBBF24',
  },
  coldWater: {
    icon: Droplets,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    tagBg: 'bg-blue-100',
    tagText: 'text-blue-800',
    chartColor: '#93C5FD',
  },
  hotWater: {
    icon: Thermometer,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    tagBg: 'bg-rose-100',
    tagText: 'text-rose-800',
    chartColor: '#F9A8D4',
  },
  heat: {
    icon: Waves,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    tagBg: 'bg-orange-100',
    tagText: 'text-orange-800',
    chartColor: '#FDBA74',
  },
}

/**
 * Отримує конфігурацію іконки для послуги за MeterType
 */
export function getServiceIcon(meterType: MeterType): LucideIcon | null {
  const config = SERVICE_CONFIG[meterType]
  return config?.icon ?? null
}

/**
 * Отримує класи фону та кольору іконки для послуги (для великих іконок у картках)
 */
export function getServiceIconClasses(meterType: MeterType): {
  iconBg: string
  iconColor: string
} {
  const config = SERVICE_CONFIG[meterType]
  return config
    ? { iconBg: config.iconBg, iconColor: config.iconColor }
    : { iconBg: 'bg-gray-100', iconColor: 'text-gray-600' }
}

/**
 * Отримує класи для тегів/badges послуг (для маленьких міток)
 */
export function getServiceTagClasses(meterType: MeterType): string {
  const config = SERVICE_CONFIG[meterType]
  return config ? `${config.tagBg} ${config.tagText}` : 'bg-gray-100 text-gray-800'
}
