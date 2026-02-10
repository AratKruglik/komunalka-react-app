import type { LucideIcon } from 'lucide-react'
import type { OAuthProvider } from '@shared/types/auth/oauth.types'

export const SETTINGS_TABS = ['profile', 'security', 'appearance', 'account'] as const
export type SettingsTab = (typeof SETTINGS_TABS)[number]

export interface SettingsTabConfig {
  id: SettingsTab
  label: string
  icon: LucideIcon
  description: string
}

export type ConnectedAccountStatus = 'connected' | 'disconnected'

export interface ConnectedAccount {
  provider: OAuthProvider
  status: ConnectedAccountStatus
  isLoading: boolean
}
