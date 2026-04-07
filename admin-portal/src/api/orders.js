import { request } from "../services/api";

function titleCaseStatus(value) {
  return String(value || "")
    .trim()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeStatusForUi(status) {
  const normalized = String(status || "").trim().toLowerCase();

  if (["pending_confirmation", "pending_staff_review"].includes(normalized)) {
    return "pending";
  }

  if (["confirmed", "preparing", "rider_dispatched"].includes(normalized)) {
    return "processing";
  }

  if (["delivered"].includes(normalized)) {
    return "completed";
  }

  if (["cancelled"].includes(normalized)) {
    return "cancelled";
  }

  return normalized || "pending";
}

function buildCustomerLabel(order) {
  return (
    String(order.customerName || "").trim() ||
    String(order.customerPhone || "").trim() ||
    String(order.channelCustomerId || "").trim() ||
    "Unknown Customer"
  );
}

function buildItemsLabel(matched) {
  const items = Array.isArray(matched) ? matched : [];
  if (!items.length) {
    return "No items";
  }

  return items.map((item) => `${item.quantity || 1} x ${item.name || "Item"}`).join(", ");
}

function normalizeOrder(order) {
  const matched = Array.isArray(order.matched) ? order.matched : [];
  const createdAt = order.createdAt || order.updatedAt || "";

  return {
    ...order,
    customer: buildCustomerLabel(order),
    items: buildItemsLabel(matched),
    amount: Number(order.total || 0),
    statusLabel: titleCaseStatus(order.status),
    uiStatus: normalizeStatusForUi(order.status),
    parsedItems: matched.map((item) => `${item.quantity || 1} x ${item.name || "Item"}`),
    subtotal: Number(order.total || 0),
    deliveryFee: Number(order.deliveryFee || 0),
    createdAt,
    updatedAt: order.updatedAt || createdAt,
    paymentStatus: order.paymentState || order.paymentStatus || "not_started",
  };
}

async function listByRestaurant(restaurantId, filters = {}) {
  const searchParams = new URLSearchParams();

  if (filters.active !== false) {
    searchParams.set("active", "true");
  }

  if (filters.limit) {
    searchParams.set("limit", String(filters.limit));
  }

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const response = await request(`/restaurants/${restaurantId}/orders${suffix}`, {
    method: "GET",
  });

  let orders = (response.orders || []).map(normalizeOrder);

  if (filters.status && filters.status !== "all") {
    orders = orders.filter((order) => order.uiStatus === filters.status);
  }

  if (filters.searchTerm) {
    const lower = String(filters.searchTerm || "").trim().toLowerCase();
    orders = orders.filter((order) => {
      return (
        String(order.id || "").toLowerCase().includes(lower) ||
        String(order.customer || "").toLowerCase().includes(lower) ||
        String(order.items || "").toLowerCase().includes(lower)
      );
    });
  }

  return orders;
}

async function getById(restaurantId, orderId) {
  const response = await request(`/restaurants/${restaurantId}/orders/${orderId}`, {
    method: "GET",
  });

  return normalizeOrder(response.order);
}

async function accept(restaurantId, orderId) {
  const response = await request(`/restaurants/${restaurantId}/orders/${orderId}/accept`, {
    method: "POST",
  });

  return normalizeOrder(response.order);
}

async function reject(restaurantId, orderId, note = "") {
  const response = await request(`/restaurants/${restaurantId}/orders/${orderId}/reject`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });

  return normalizeOrder(response.order);
}

async function ready(restaurantId, orderId) {
  const response = await request(`/restaurants/${restaurantId}/orders/${orderId}/ready`, {
    method: "POST",
  });

  return normalizeOrder(response.order);
}

async function cancel(restaurantId, orderId, reason = "") {
  const response = await request(`/restaurants/${restaurantId}/orders/${orderId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

  return normalizeOrder(response.order);
}

async function transition(restaurantId, orderId, toStatus, reason = "") {
  const response = await request(`/restaurants/${restaurantId}/orders/${orderId}/transition`, {
    method: "POST",
    body: JSON.stringify({ toStatus, reason }),
  });

  return normalizeOrder(response.order);
}

export const ordersApi = {
  listByRestaurant,
  getById,
  accept,
  reject,
  ready,
  cancel,
  transition,
  updateStatus: transition,
};

export default ordersApi;
