import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/Layout/AppShell';
import { ProtectedRoute, PublicOnlyRoute, RoleRoute } from './auth/RouteGuards';
import { ROLES } from './auth/roleConfig';

import LandingPage from './pages/landing/LandingPage';
import Waitlist from './pages/landing/Waitlist';
import Pricing from './pages/landing/Pricing';
import LoginPage from './pages/auth/LoginPage';
import ServraAdminLogin from './pages/auth/ServraAdminLogin';
import RestaurantAdminLogin from './pages/auth/RestaurantAdminLogin';
import StaffLogin from './pages/auth/StaffLogin';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import RestaurantSignupPage from './pages/auth/RestaurantSignupPage';
import DashboardEntryPage from './pages/shared/DashboardEntryPage';
import AccessDeniedPage from './pages/shared/AccessDeniedPage';
import NotFoundPage from './pages/shared/NotFoundPage';
import RoleHomeRedirect from './pages/shared/RoleHomeRedirect';

import RestaurantsListPage from './pages/superAdmin/RestaurantsListPage';
import RestaurantDetailPage from './pages/superAdmin/RestaurantDetailPage';
import RestaurantActivationPage from './pages/superAdmin/RestaurantActivationPage';
import CreateRestaurantPage from './pages/superAdmin/CreateRestaurantPage';
import RestaurantOnboardingWizard from './pages/superAdmin/RestaurantOnboardingWizard';
import WhatsAppSessionsPage from './pages/superAdmin/WhatsAppSessionsPage';
import CentralAlertSenderPage from './pages/superAdmin/CentralAlertSenderPage';
import OutboxMonitorPage from './pages/superAdmin/OutboxMonitorPage';
import OutboxCustomersPage from './pages/superAdmin/OutboxCustomersPage';
import RestaurantChatPage from './pages/superAdmin/RestaurantChatPage';
import HealthMonitorPage from './pages/superAdmin/HealthMonitorPage';
import SubscriptionPlansPage from './pages/superAdmin/SubscriptionPlansPage';
import SubscriptionsPage from './pages/superAdmin/SubscriptionsPage';
import BillingApprovalsPage from './pages/superAdmin/BillingApprovalsPage';

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
import OnboardingPage from './pages/restaurant/OnboardingPage';
import StaffPage from './pages/restaurant/StaffPage';
import VerificationPendingPage from './pages/restaurant/VerificationPendingPage';
import VerificationRejectedPage from './pages/restaurant/VerificationRejectedPage';

const roleAll = [ROLES.SUPER_ADMIN, ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF];
const roleSuperAdmin = [ROLES.SUPER_ADMIN];
const roleRestaurantAdmin = [ROLES.RESTAURANT_ADMIN];
const roleRestaurantTeam = [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF];

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={(
          <PublicOnlyRoute>
            <LandingPage />
          </PublicOnlyRoute>
        )}
      />

      <Route
        path="/waitlist"
        element={<Waitlist />}
      />

      <Route
        path="/pricing"
        element={<Pricing />}
      />

      <Route
        path="/login"
        element={(
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        )}
      />

      <Route
        path="/login/servra-admin"
        element={(
          <PublicOnlyRoute>
            <ServraAdminLogin />
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

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/restaurant-signup"
        element={(
          <PublicOnlyRoute>
            <RestaurantSignupPage />
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
        <Route path="/home" element={<RoleHomeRedirect />} />

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
          path="/restaurants/onboard"
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
          path="/restaurants/:restaurantId/activation"
          element={(
            <RoleRoute allowedRoles={roleSuperAdmin}>
              <RestaurantActivationPage />
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
          path="/central-sender"
          element={(
            <RoleRoute allowedRoles={roleSuperAdmin}>
              <CentralAlertSenderPage />
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
          path="/outbox/:restaurantId/customers"
          element={(
            <RoleRoute allowedRoles={roleSuperAdmin}>
              <OutboxCustomersPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/outbox/:restaurantId/customers/:customerId/chat"
          element={(
            <RoleRoute allowedRoles={roleSuperAdmin}>
              <RestaurantChatPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/health-monitor"
          element={(
            <RoleRoute allowedRoles={roleSuperAdmin}>
              <HealthMonitorPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/subscription-plans"
          element={(
            <RoleRoute allowedRoles={roleSuperAdmin}>
              <SubscriptionPlansPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/subscriptions"
          element={(
            <RoleRoute allowedRoles={roleSuperAdmin}>
              <SubscriptionsPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/billing-approvals"
          element={(
            <RoleRoute allowedRoles={roleSuperAdmin}>
              <BillingApprovalsPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/verification-pending"
          element={(
            <RoleRoute allowedRoles={roleRestaurantAdmin} skipVerification>
              <VerificationPendingPage />
            </RoleRoute>
          )}
        />
        <Route
          path="/verification-rejected"
          element={(
            <RoleRoute allowedRoles={roleRestaurantAdmin} skipVerification>
              <VerificationRejectedPage />
            </RoleRoute>
          )}
        />

        <Route
          path="/onboarding"
          element={(
            <RoleRoute allowedRoles={roleRestaurantAdmin}>
              <OnboardingPage />
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

        {/* <Route
          path="/subscription"
          element={(
            <RoleRoute allowedRoles={roleRestaurantAdmin}>
              <SubscriptionPage />
            </RoleRoute>
          )}
        /> */}

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
            <RoleRoute allowedRoles={roleAll}>
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

        <Route
          path="/staff"
          element={(
            <RoleRoute allowedRoles={roleRestaurantAdmin}>
              <StaffPage />
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
