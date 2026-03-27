export const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  RESTAURANT_ADMIN: 'restaurant_admin',
  RESTAURANT_STAFF: 'restaurant_staff',
});

export const ROLE_LABELS = Object.freeze({
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.RESTAURANT_ADMIN]: 'Restaurant Admin',
  [ROLES.RESTAURANT_STAFF]: 'Restaurant Staff',
});

export const DEFAULT_ROUTE_BY_ROLE = Object.freeze({
  [ROLES.SUPER_ADMIN]: '/dashboard',
  [ROLES.RESTAURANT_ADMIN]: '/overview',
  [ROLES.RESTAURANT_STAFF]: '/overview',
});

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', roles: [ROLES.SUPER_ADMIN] },
  { label: 'Restaurants', path: '/restaurants', roles: [ROLES.SUPER_ADMIN] },
  { label: 'WhatsApp Sessions', path: '/sessions', roles: [ROLES.SUPER_ADMIN] },
  { label: 'Outbox Monitor', path: '/outbox', roles: [ROLES.SUPER_ADMIN] },
  { label: 'Overview', path: '/overview', roles: [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF] },
  { label: 'Orders', path: '/orders', roles: [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF] },
  { label: 'Menu', path: '/menu', roles: [ROLES.RESTAURANT_ADMIN] },
  { label: 'Delivery Zones', path: '/delivery', roles: [ROLES.RESTAURANT_ADMIN] },
  { label: 'Payments', path: '/payments', roles: [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF] },
  { label: 'WhatsApp Status', path: '/whatsapp', roles: [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF] },
  { label: 'Settings', path: '/settings', roles: [ROLES.RESTAURANT_ADMIN] },
];

export const ROUTE_ROLE_MAP = Object.freeze({
  '/dashboard': [ROLES.SUPER_ADMIN, ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF],
  '/restaurants': [ROLES.SUPER_ADMIN],
  '/restaurants/:restaurantId': [ROLES.SUPER_ADMIN],
  '/sessions': [ROLES.SUPER_ADMIN],
  '/outbox': [ROLES.SUPER_ADMIN],
  '/overview': [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF],
  '/orders': [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF],
  '/orders/:orderId': [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF],
  '/menu': [ROLES.RESTAURANT_ADMIN],
  '/delivery': [ROLES.RESTAURANT_ADMIN],
  '/payments': [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF],
  '/whatsapp': [ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF],
  '/settings': [ROLES.RESTAURANT_ADMIN],
});

export const hasRoleAccess = (role, allowedRoles = []) => {
  return allowedRoles.includes(role);
};
