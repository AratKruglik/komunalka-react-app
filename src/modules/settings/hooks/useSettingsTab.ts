import { useSearchParams } from 'react-router'
import { SETTINGS_TABS, type SettingsTab } from '../types'

export function useSettingsTab() {
  const [searchParams, setSearchParams] = useSearchParams()

  const rawTab = searchParams.get('tab')
  const activeTab: SettingsTab = SETTINGS_TABS.includes(rawTab as SettingsTab)
    ? (rawTab as SettingsTab)
    : 'profile'

  const setActiveTab = (tab: SettingsTab) => {
    setSearchParams({ tab }, { replace: true })
  }

  return { activeTab, setActiveTab }
}
