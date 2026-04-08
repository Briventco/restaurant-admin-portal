// App.jsx (updated with new login routes)
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/Layout/AppShell';
import { ProtectedRoute, PublicOnlyRoute, RoleRoute } from './auth/RouteGuards';
import { ROLES } from './auth/roleConfig';

import LoginPage from './pages/auth/LoginPage';
import BriventAdminLogin from './pages/auth/BriventAdminLogin';
import RestaurantAdminLogin from './pages/auth/RestaurantAdminLogin';
import StaffLogin from './pages/auth/StaffLogin';
import DashboardEntryPage from './pages/shared/DashboardEntryPage';
import AccessDeniedPage from './pages/shared/AccessDeniedPage';
import NotFoundPage from './pages/shared/NotFoundPage';
import RoleHomeRedirect from './pages/shared/RoleHomeRedirect';

import RestaurantsListPage from './pages/superAdmin/RestaurantsListPage';
import RestaurantDetailPage from './pages/superAdmin/RestaurantDetailPage';
import CreateRestaurantPage from './pages/superAdmin/CreateRestaurantPage';
import WhatsAppSessionsPage from './pages/superAdmin/WhatsAppSessionsPage';
import OutboxMonitorPage from './pages/superAdmin/OutboxMonitorPage';

import RestaurantOverviewPage from './pages/restaurant/RestaurantOverviewPage';
import OrdersPage from './pages/restaurant/OrdersPage';
import OrderDetailPage from './pages/restaurant/OrderDetailPage';
import MenuManagementPage from './pages/restaurant/MenuManagementPage';
import DeliveryZonesPage from './pages/restaurant/DeliveryZonesPage';
import PaymentsPage from './pages/restaurant/PaymentsPage';
import WhatsAppStatusPage from './pages/restaurant/WhatsAppStatusPage';
import SettingsPage from './pages/restaurant/SettingsPage';
import SubscriptionPage from './pages/restaurant/SubscriptionPage';
import EarningsPage from './pages/restaurant/EarningsPage';
import ProfilePage from './pages/restaurant/ProfilePage';

const roleAll = [ROLES.SUPER_ADMIN, ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF];
const roleSuperAdmin = [ROLES.SUPER_ADMIN];
const roleRestaurantAdmin = [ROLES.RESTAURANT_ADMIN];
const roleRestaurantTeam = [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF];

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={(
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        )}
      />

      <Route
        path="/login/brivent-admin"
        element={(
          <PublicOnlyRoute>
            <BriventAdminLogin />
          </PublicOnlyRoute>
        )}
      />

      <Route
        path="/login/restaurant-admin"
        element={(
          <PublicOnlyRoute>
            <RestaurantAdminLogin />
          </PublicOnlyRoute>
        )}
      />

      <Route
        path="/login/restaurant-staff"
        element={(
          <PublicOnlyRoute>
            <StaffLogin />
          </PublicOnlyRoute>
        )}
      />

      <Route
        element={(
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        )}
      >
        <Route path="/" element={<RoleHomeRedirect />} />

        <Route
          path="/dashboard"
          element={(
            <RoleRoute allowedRoles={roleAll}>
              <DashboardEntryPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/restaurants"
          element={(
            <RoleRoute allowedRoles={roleSuperAdmin}>
              <RestaurantsListPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/restaurants/new"
          element={(
            <RoleRoute allowedRoles={roleSuperAdmin}>
              <CreateRestaurantPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/restaurants/:restaurantId"
          element={(
            <RoleRoute allowedRoles={roleSuperAdmin}>
              <RestaurantDetailPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/sessions"
          element={(
            <RoleRoute allowedRoles={roleSuperAdmin}>
              <WhatsAppSessionsPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/outbox"
          element={(
            <RoleRoute allowedRoles={roleSuperAdmin}>
              <OutboxMonitorPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/overview"
          element={(
            <RoleRoute allowedRoles={roleRestaurantTeam}>
              <RestaurantOverviewPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/orders"
          element={(
            <RoleRoute allowedRoles={roleRestaurantTeam}>
              <OrdersPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/orders/:orderId"
          element={(
            <RoleRoute allowedRoles={roleRestaurantTeam}>
              <OrderDetailPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/menu"
          element={(
            <RoleRoute allowedRoles={roleRestaurantAdmin}>
              <MenuManagementPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/delivery"
          element={(
            <RoleRoute allowedRoles={roleRestaurantAdmin}>
              <DeliveryZonesPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/payments"
          element={(
            <RoleRoute allowedRoles={roleRestaurantTeam}>
              <PaymentsPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/whatsapp"
          element={(
            <RoleRoute allowedRoles={roleRestaurantTeam}>
              <WhatsAppStatusPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/subscription"
          element={(
            <RoleRoute allowedRoles={roleRestaurantAdmin}>
              <SubscriptionPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/earnings"
          element={(
            <RoleRoute allowedRoles={roleRestaurantAdmin}>
              <EarningsPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/profile"
          element={(
            <RoleRoute allowedRoles={roleRestaurantTeam}>
              <ProfilePage />
            </RoleRoute>
          )}
        />

        <Route
          path="/settings"
          element={(
            <RoleRoute allowedRoles={roleRestaurantAdmin}>
              <SettingsPage />
            </RoleRoute>
          )}
        />

        <Route path="/forbidden" element={<AccessDeniedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
