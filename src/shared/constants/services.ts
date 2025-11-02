import { Zap, Flame, Droplets, Thermometer, Waves } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
}

/**
 * Централізована конфігурація кольорів та іконок для комунальних послуг.
 * Використовується по всьому додатку для консистентності UI.
 */
export const SERVICE_CONFIG: Record<ServiceType, ServiceConfig> = {
  Електроенергія: {
    icon: Zap,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    tagBg: 'bg-sky-100',
    tagText: 'text-sky-800',
  },
  Газ: {
    icon: Flame,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    tagBg: 'bg-amber-100',
    tagText: 'text-amber-800',
  },
  'Холодна вода': {
    icon: Droplets,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    tagBg: 'bg-blue-100',
    tagText: 'text-blue-800',
  },
  'Гаряча вода': {
    icon: Thermometer,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    tagBg: 'bg-rose-100',
    tagText: 'text-rose-800',
  },
  Водопостачання: {
    icon: Droplets,
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    tagBg: 'bg-cyan-100',
    tagText: 'text-cyan-800',
  },
  Опалення: {
    icon: Waves,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    tagBg: 'bg-orange-100',
    tagText: 'text-orange-800',
  },
}

/**
 * Отримує конфігурацію іконки для послуги
 */
export function getServiceIcon(serviceName: string): LucideIcon | null {
  const config = SERVICE_CONFIG[serviceName as ServiceType]
  return config?.icon ?? null
}

/**
 * Отримує класи фону та кольору іконки для послуги (для великих іконок у картках)
 */
export function getServiceIconClasses(serviceName: string): {
  iconBg: string
  iconColor: string
} {
  const config = SERVICE_CONFIG[serviceName as ServiceType]
  return config
    ? { iconBg: config.iconBg, iconColor: config.iconColor }
    : { iconBg: 'bg-gray-100', iconColor: 'text-gray-600' }
}

/**
 * Отримує класи для тегів/badges послуг (для маленьких міток)
 */
export function getServiceTagClasses(serviceName: string): string {
  const config = SERVICE_CONFIG[serviceName as ServiceType]
  return config ? `${config.tagBg} ${config.tagText}` : 'bg-gray-100 text-gray-800'
}
