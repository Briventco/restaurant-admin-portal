import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ordersApi } from '../../api/orders';
import StatusBadge from '../../components/ui/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import { ORDER_STATUS_OPTIONS } from '../../data/mockData';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [nextStatus, setNextStatus] = useState('confirmed');
  const [error, setError] = useState(null);   // ← added
  const [loading, setLoading] = useState(true); // ← added

  const load = useCallback(async () => {
    // Guard: don't fetch if we don't have the required IDs
    if (!orderId || !user?.restaurantId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await ordersApi.getById(user.restaurantId, orderId);
      setOrder(response);
      if (response?.status) {
        setNextStatus(response.status);
      }
    } catch (err) {
      setError(err.message || 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  }, [orderId, user?.restaurantId]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!orderId || !user?.restaurantId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await ordersApi.getById(user.restaurantId, orderId);
        if (active) {
          setOrder(response);
          if (response?.status) setNextStatus(response.status);
        }
      } catch (err) {
        if (active) setError(err.message || 'Failed to load order.');
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => { active = false; };
  }, [orderId, user?.restaurantId]);

  const actions = useMemo(() => {
    if (!order) return [];
    const actionList = [];

    if (order.status === 'pending_staff_review') {
      actionList.push({ label: 'Approve Order', handler: () => ordersApi.updateStatus(user.restaurantId, order.id, 'confirmed') });
      actionList.push({ label: 'Mark Unavailable Item(s)', handler: () => ordersApi.updateStatus(user.restaurantId, order.id, 'awaiting_customer_update') });
    }
    if (['awaiting_payment', 'payment_under_review'].includes(order.status)) {
      actionList.push({ label: 'Confirm Payment', handler: () => ordersApi.updatePaymentStatus(user.restaurantId, order.id, 'confirmed') });
      actionList.push({ label: 'Reject Payment', handler: () => ordersApi.updatePaymentStatus(user.restaurantId, order.id, 'rejected') });
    }
    if (!['delivered', 'cancelled'].includes(order.status)) {
      actionList.push({ label: 'Cancel Order', handler: () => ordersApi.updateStatus(user.restaurantId, order.id, 'cancelled') });
    }

    return actionList;
  }, [order, user.restaurantId]);

  const runAction = async (handler) => {
    await handler();
    load();
  };

  // ↓ Render guards in priority order
  if (loading) return <div className="card">Loading order...</div>;
  if (error)   return <div className="card" style={{ color: 'red' }}>Error: {error}</div>;
  if (!order)  return <div className="card">Order not found.</div>;

  return (
    <div className="stack-lg">
      <PageHeader
        title={`Order ${order.id}`}
        subtitle="Inspect message parsing, pricing totals, and action transitions."
      />

      <div className="card">
        <h3>Order {order.id}</h3>
        <div className="inline-metadata">
          <StatusBadge value={order.status} />
          <StatusBadge value={order.paymentStatus} />
          <span>Created: {formatDateTime(order.createdAt)}</span>
        </div>
      </div>

      <div className="cards-grid two-column">
        <div className="card">
          <h4>Customer Info</h4>
          <p>{order.customer}</p>
        </div>
        <div className="card">
          <h4>Raw Message</h4>
          <p>{order.rawMessage}</p>
        </div>
        <div className="card">
          <h4>Parsed / Matched Items</h4>
          <ul className="list-reset">
            {order.parsedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h4>Amount Summary</h4>
          <p>Subtotal: {formatCurrency(order.subtotal)}</p>
          <p>Delivery Fee: {formatCurrency(order.deliveryFee)}</p>
          <p>Total: {formatCurrency(order.total)}</p>
        </div>
      </div>

      <div className="card">
        <h4>Order Actions</h4>
        <div className="actions-row wrap">
          {actions.map((action) => (
            <button key={action.label} type="button" className="button button-ghost" onClick={() => runAction(action.handler)}>
              {action.label}
            </button>
          ))}
        </div>
        <div className="inline-form-row">
          <select className="input" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button type="button" className="button" onClick={async () => { await ordersApi.updateStatus(user.restaurantId, order.id, nextStatus); load(); }}>
            Update Status
          </button>
        </div>
      </div>

      <SectionCard title="Timeline / Messages (Placeholder)">
        <p className="muted-text">Message events and timeline blocks will be connected after backend conversation history APIs are finalized.</p>
      </SectionCard>
    </div>
  );
};

export default OrderDetailPage;