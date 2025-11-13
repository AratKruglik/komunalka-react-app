import { BrowserRouter, Routes, Route, Outlet } from 'react-router'
import AddressesPage from './modules/addresses/pages/AddressesPage'
import AddAddressPage from './modules/addresses/pages/AddAddressPage'
import LoginPage from './modules/auth/pages/LoginPage'
import RegisterPage from './modules/auth/pages/RegisterPage'
import DashboardPage from './modules/dashboard/pages/DashboardPage'
import AddMeterPage from './modules/meters/pages/AddMeterPage'
import ProvidersPage from './modules/providers/pages/ProvidersPage'
import AddProviderPage from './modules/providers/pages/AddProviderPage'

function RootLayout() {
  return <Outlet />
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/addresses" element={<AddressesPage />} />
          <Route path="/addresses/new" element={<AddAddressPage />} />
          <Route path="/meters/new" element={<AddMeterPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/providers/new" element={<AddProviderPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
