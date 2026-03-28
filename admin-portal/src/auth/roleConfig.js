export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  RESTAURANT_ADMIN: 'restaurant_admin',
  RESTAURANT_STAFF: 'restaurant_staff',
};

export const DEFAULT_ROUTE_BY_ROLE = {
  super_admin: '/dashboard',
  restaurant_admin: '/dashboard',
  restaurant_staff: '/dashboard',
};

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  restaurant_admin: 'Restaurant Admin',
  restaurant_staff: 'Restaurant Staff',
};