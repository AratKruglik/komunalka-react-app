import { AuthenticatedLayout } from '@shared/components/layout/AuthenticatedLayout'
import { SettingsSidebar } from '../components/SettingsSidebar'
import { ProfileTab } from '../components/ProfileTab'
import { SecurityTab } from '../components/SecurityTab'
import { AppearanceTab } from '../components/AppearanceTab'
import { AccountTab } from '../components/AccountTab'
import { useSettingsTab } from '../hooks/useSettingsTab'
import { settingsLayout } from '../styles'

const { container, sidebar, content } = settingsLayout()

export default function SettingsPage() {
  const { activeTab, setActiveTab } = useSettingsTab()

  return (
    <AuthenticatedLayout
      pageTitle="Налаштування"
      pageSubtitle="Керуйте параметрами вашого акаунта"
    >
      <div className={container()}>
        <aside className={sidebar()}>
          <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>

        <div className={content()} role="tabpanel">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'appearance' && <AppearanceTab />}
          {activeTab === 'account' && <AccountTab />}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
