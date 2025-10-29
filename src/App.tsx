import { BrowserRouter, Routes, Route, Outlet } from 'react-router'
import HomePage from './modules/home/pages/HomePage'
import AddressesPage from './modules/addresses/pages/AddressesPage'
import LoginPage from './modules/auth/pages/LoginPage'
import RegisterPage from './modules/auth/pages/RegisterPage'

function RootLayout() {
  return <Outlet />
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/addresses" element={<AddressesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
