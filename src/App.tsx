import { BrowserRouter, Routes, Route, Outlet } from 'react-router';
import { ProtectedRoute } from './shared/components/ProtectedRoute';
import { PublicRoute } from './shared/components/PublicRoute';
import { ROUTES } from './shared/constants';
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
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          </Route>

          {/* Protected routes - require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route index element={<DashboardPage />} />
            <Route path={ROUTES.ADDRESSES} element={<AddressesPage />} />
            <Route path={ROUTES.ADDRESSES_NEW} element={<AddAddressPage />} />
            <Route path={ROUTES.METERS} element={<AddressMetersPage />} />
            <Route path={ROUTES.METERS_NEW} element={<AddMeterPage />} />
            <Route path={ROUTES.READINGS_NEW} element={<AddReadingsPage />} />
            <Route path={ROUTES.PROVIDERS} element={<ProvidersPage />} />
            <Route path={ROUTES.PROVIDERS_NEW} element={<AddProviderPage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path={ROUTES.LOGOUT} element={<LogoutPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
