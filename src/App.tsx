import { BrowserRouter, Routes, Route, Outlet } from 'react-router';
import { ProtectedRoute } from './shared/components/ProtectedRoute';
import { PublicRoute } from './shared/components/PublicRoute';
import AddressesPage from './modules/addresses/pages/AddressesPage';
import AddAddressPage from './modules/addresses/pages/AddAddressPage';
import LoginPage from './modules/auth/pages/LoginPage';
import RegisterPage from './modules/auth/pages/RegisterPage';
import LogoutPage from './modules/auth/pages/LogoutPage';
import DashboardPage from './modules/dashboard/pages/DashboardPage';
import AddMeterPage from './modules/meters/pages/AddMeterPage';
import AddressMetersPage from './modules/meters/pages/AddressMetersPage';
import ProvidersPage from './modules/providers/pages/ProvidersPage';
import AddProviderPage from './modules/providers/pages/AddProviderPage';
import AddReadingsPage from './modules/readings/pages/AddReadingsPage';
import ProfilePage from './modules/profile/pages/ProfilePage';

function RootLayout() {
  return <Outlet />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          {/* Public routes - redirect to dashboard if authenticated */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected routes - require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route index element={<DashboardPage />} />
            <Route path="/addresses" element={<AddressesPage />} />
            <Route path="/addresses/new" element={<AddAddressPage />} />
            <Route path="/meters" element={<AddressMetersPage />} />
            <Route path="/meters/new" element={<AddMeterPage />} />
            <Route path="/readings/new" element={<AddReadingsPage />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/providers/new" element={<AddProviderPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/logout" element={<LogoutPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
