# Restaurant Admin Portal (V1 MVP)

Single role-based admin portal for the restaurant WhatsApp ordering system.

## Roles
- `super_admin` (Brivent internal)
- `restaurant_admin` (restaurant owner/admin)
- `restaurant_staff` (restaurant staff)

## Tech
- React + Vite
- JavaScript
- React Router
- Mock-friendly API service layer under `src/api/`

## Run Locally
1. `cd admin-portal`
2. `npm install`
3. `npm run dev`
4. Open the Vite URL shown in terminal

## Lint and Build
- `npm run lint`
- `npm run build`

## Mock Login (MVP)
Use any of these demo accounts on `/login`:
- Super Admin: `super@brivent.com` / `admin123`
- Restaurant Admin: `owner@demo.com` / `admin123`
- Restaurant Staff: `staff@demo.com` / `admin123`

There is also a role switcher in the top header after login.

## Route Access
- Super Admin: `/dashboard`, `/restaurants`, `/restaurants/:restaurantId`, `/sessions`, `/outbox`
- Restaurant Admin: `/dashboard`, `/overview`, `/orders`, `/orders/:orderId`, `/menu`, `/delivery`, `/payments`, `/whatsapp`, `/settings`
- Restaurant Staff: `/dashboard`, `/overview`, `/orders`, `/orders/:orderId`, `/payments`, `/whatsapp`

## API Layer Structure
- `src/api/client.js`
- `src/api/restaurants.js`
- `src/api/orders.js`
- `src/api/menu.js`
- `src/api/deliveryZones.js`
- `src/api/payments.js`
- `src/api/runtime.js`
- `src/api/outbox.js`

## Environment Variables
- `VITE_API_URL` (optional, default `/api/v1`)
- `VITE_USE_MOCK_API` (optional, default `true`; set to `false` to hit backend)
