import { BrowserRouter, Routes, Route, Outlet } from 'react-router'
import AddressesPage from './modules/addresses/pages/AddressesPage'
import LoginPage from './modules/auth/pages/LoginPage'
import RegisterPage from './modules/auth/pages/RegisterPage'
import DashboardPage from './modules/dashboard/pages/DashboardPage'

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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
