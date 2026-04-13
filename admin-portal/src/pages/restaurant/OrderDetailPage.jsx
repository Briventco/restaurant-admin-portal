import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faBagShopping,
  faBolt,
  faCalendarDays,
  faCheck,
  faLocationDot,
  faPhone,
  faReceipt,
  faStore,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../auth/AuthContext';
import { ordersApi } from '../../api/orders';
import { paymentsApi } from '../../api/payments';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmModal from '../../components/ui/ConfirmModal';
import './OrderDetailPage.css';

const formatNaira = (value) => `N${Number(value || 0).toLocaleString()}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString('en-NG', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

const DetailStat = ({ icon, label, value, accent = '' }) => (
  <div className="order-detail-stat">
    <div className="order-detail-stat-icon">
      <FontAwesomeIcon icon={icon} />
    </div>
    <div>
      <p className="order-detail-stat-label">{label}</p>
      <p className={`order-detail-stat-value ${accent}`}>{value}</p>
    </div>
  </div>
);

const InfoCard = ({ title, icon, children }) => (
  <section className="order-detail-info-card">
    <div className="order-detail-info-head">
      <span className="order-detail-info-icon">
        <FontAwesomeIcon icon={icon} />
      </span>
      <h3>{title}</h3>
    </div>
    <div className="order-detail-info-body">{children}</div>
  </section>
);

const ActionButton = ({ label, tone = 'neutral', onClick, disabled }) => (
  <button
    type="button"
    className={`order-detail-action-btn ${tone}`}
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </button>
);

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [rejectReason, setRejectReason] = useState('Item is out of stock right now');
  const [paymentReason, setPaymentReason] = useState('We could not confirm the transfer in the restaurant account yet.');

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!orderId || !user?.restaurantId) return;

    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const response = await ordersApi.getById(user.restaurantId, orderId);
      setOrder(response);
    } catch (err) {
      if (!silent) {
        setError(err.message || 'Failed to load order.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [orderId, user?.restaurantId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!orderId || !user?.restaurantId) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      load({ silent: true });
    }, 8000);

    return () => {
      window.clearInterval(interval);
    };
  }, [load, orderId, user?.restaurantId]);

  const actions = useMemo(() => {
    if (!order) return [];

    const list = [];

    if (order.status === 'pending_confirmation') {
      list.push({
        key: 'accept',
        label: 'Accept Order',
        tone: 'success',
        confirmLabel: 'Yes, Accept',
        confirmTitle: 'Accept this order?',
        confirmMessage:
          'This will accept the order and, if manual transfer is enabled in settings, send the restaurant bank details to the customer for payment.',
        run: () => ordersApi.accept(user.restaurantId, order.id),
      });
      list.push({
        key: 'reject',
        label: 'Reject Order',
        tone: 'danger',
        requiresReason: true,
        confirmLabel: 'Yes, Reject',
        confirmTitle: 'Reject this order?',
        confirmMessage:
          'This will reject the order and immediately notify the customer that the restaurant could not accept it. Add a short reason below so the customer gets a clearer update.',
        run: (reason) => ordersApi.reject(user.restaurantId, order.id, reason),
      });
    }

    if (['confirmed', 'preparing'].includes(order.status)) {
      list.push({
        key: 'ready',
        label: 'Mark Ready',
        tone: 'accent',
        confirmLabel: 'Mark as Ready',
        confirmTitle: 'Mark order as ready?',
        confirmMessage:
          'This will tell the customer that the order is ready for the next handoff or pickup step.',
        run: () => ordersApi.ready(user.restaurantId, order.id),
      });
    }

    if (['awaiting_payment', 'payment_review'].includes(order.status)) {
      list.push({
        key: 'confirm-payment',
        label: 'Payment Confirmed',
        tone: 'success',
        confirmLabel: 'Confirm Payment',
        confirmTitle: 'Confirm customer payment?',
        confirmMessage:
          'This will mark payment as received, notify the customer, and move the order into the next kitchen step.',
        run: () => paymentsApi.confirmPayment(user.restaurantId, order.id),
      });
      list.push({
        key: 'reject-payment',
        label: 'Payment Not Seen Yet',
        tone: 'danger',
        requiresPaymentReason: true,
        confirmLabel: 'Send Update',
        confirmTitle: 'Tell customer payment is not confirmed yet?',
        confirmMessage:
          'This will notify the customer that the transfer has not been confirmed yet and keep the order in the payment stage.',
        run: (reason) => paymentsApi.rejectPayment(user.restaurantId, order.id, reason),
      });
    }

    if (['confirmed', 'preparing', 'rider_dispatched'].includes(order.status)) {
      list.push({
        key: 'cancel',
        label: 'Cancel Order',
        tone: 'ghost-danger',
        confirmLabel: 'Cancel Order',
        confirmTitle: 'Cancel this order?',
        confirmMessage:
          'This action will cancel the order from the restaurant portal and notify the customer that the order will not continue.',
        run: () => ordersApi.cancel(user.restaurantId, order.id, 'Cancelled from restaurant portal'),
      });
    }

    return list;
  }, [order, user?.restaurantId]);

  const runAction = async (runner) => {
    setActionLoading(true);
    try {
      const payload = pendingAction?.requiresReason ? rejectReason.trim() : undefined;
      const paymentPayload = pendingAction?.requiresPaymentReason ? paymentReason.trim() : undefined;
      await runner(payload ?? paymentPayload);
      setPendingAction(null);
      setRejectReason('Item is out of stock right now');
      setPaymentReason('We could not confirm the transfer in the restaurant account yet.');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to update order.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="card">Loading order...</div>;
  }

  if (error) {
    return <div className="card" style={{ color: '#ef4444' }}>Error: {error}</div>;
  }

  if (!order) {
    return <div className="card">Order not found.</div>;
  }

  return (
    <div className="order-detail-page">
      <div className="order-detail-topbar">
        <button type="button" className="order-detail-back" onClick={() => navigate('/orders')}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Back To Orders
        </button>
      </div>

      <section className="order-detail-hero">
        <div className="order-detail-hero-copy">
          <p className="order-detail-eyebrow">Restaurant Operations</p>
          <h1>Order {order.id}</h1>
          <p className="order-detail-subtitle">
            Review the customer request, confirm the kitchen flow, and trigger the next customer update.
          </p>

          <div className="order-detail-badges">
            <StatusBadge value={order.status} />
            <StatusBadge value={order.paymentStatus} />
            <span className="order-detail-pill">
              <FontAwesomeIcon icon={faCalendarDays} />
              {formatDate(order.createdAt)}
            </span>
          </div>
        </div>

        <div className="order-detail-hero-panel">
          <DetailStat icon={faReceipt} label="Total" value={formatNaira(order.amount)} accent="accent" />
          <DetailStat icon={faBagShopping} label="Items" value={String((order.matched || []).length || 0)} />
          <DetailStat icon={faStore} label="Fulfillment" value={order.fulfillmentType || 'pickup'} />
        </div>
      </section>

      <div className="order-detail-grid">
        <InfoCard title="Customer" icon={faPhone}>
          <p className="order-detail-strong">{order.customer}</p>
          <p>{order.customerPhone || '-'}</p>
          <p className="order-detail-muted">Channel: {order.channel || '-'}</p>
        </InfoCard>

        <InfoCard title="Fulfillment" icon={faLocationDot}>
          <p className="order-detail-strong">{order.fulfillmentType || 'pickup'}</p>
          <p>{order.deliveryAddress || 'No delivery address provided'}</p>
        </InfoCard>

        <InfoCard title="Message Source" icon={faBolt}>
          <p>{order.rawMessage || 'No raw message captured'}</p>
        </InfoCard>

        <InfoCard title="Amount Summary" icon={faReceipt}>
          <div className="order-detail-summary-line">
            <span>Subtotal</span>
            <strong>{formatNaira(order.subtotal)}</strong>
          </div>
          <div className="order-detail-summary-line">
            <span>Delivery Fee</span>
            <strong>{formatNaira(order.deliveryFee)}</strong>
          </div>
          <div className="order-detail-summary-line total">
            <span>Total</span>
            <strong>{formatNaira(order.amount)}</strong>
          </div>
        </InfoCard>

        <InfoCard title="Payment Review Info" icon={faCheck}>
          <div className="order-detail-summary-line">
            <span>Payment state</span>
            <strong>{String(order.paymentStatus || 'not_started').replace(/_/g, ' ')}</strong>
          </div>
          <div className="order-detail-summary-line">
            <span>Reported at</span>
            <strong>{formatDate(order.paymentReportedAt)}</strong>
          </div>
          <div className="order-detail-summary-line">
            <span>Reviewed at</span>
            <strong>{formatDate(order.paymentReviewedAt)}</strong>
          </div>
          <div className="order-detail-summary-line">
            <span>Reference shared</span>
            <strong>{formatDate(order.paymentReferenceSharedAt)}</strong>
          </div>
          <div className="order-detail-summary-line">
            <span>Customer transfer details</span>
            <strong>{order.paymentReportNote || 'Nothing shared yet'}</strong>
          </div>
          {order.paymentReviewReason ? (
            <div className="order-detail-summary-line">
              <span>Last review note</span>
              <strong>{order.paymentReviewReason}</strong>
            </div>
          ) : null}
        </InfoCard>
      </div>

      <section className="order-detail-section">
        <div className="order-detail-section-head">
          <h2>Matched Items</h2>
          <p>Everything the backend resolved from the customer message.</p>
        </div>

        <div className="order-detail-items">
          {(order.matched || []).map((item) => (
            <div
              key={`${item.menuItemId || item.name}-${item.quantity || 1}`}
              className="order-detail-item"
            >
              <div>
                <p className="order-detail-item-name">{item.name}</p>
                <p className="order-detail-item-meta">
                  {item.quantity || 1} x {formatNaira(item.price)}
                </p>
              </div>
              <strong>{formatNaira(item.subtotal)}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="order-detail-section">
        <div className="order-detail-section-head">
          <h2>Actions</h2>
          <p>Push the order through the next real customer-facing step.</p>
        </div>

        <div className="order-detail-actions">
          {actions.length === 0 ? (
            <p className="order-detail-muted">
              No direct actions are available for this order status yet.
            </p>
          ) : (
            actions.map((action) => (
              <ActionButton
                key={action.key}
                label={actionLoading ? 'Working...' : action.label}
                tone={action.tone}
                onClick={() => {
                  if (action.requiresReason) {
                    setRejectReason('Item is out of stock right now');
                  }
                  if (action.requiresPaymentReason) {
                    setPaymentReason('We could not confirm the transfer in the restaurant account yet.');
                  }
                  setPendingAction(action);
                }}
                disabled={actionLoading}
              />
            ))
          )}

          <ActionButton
            label="Back To Orders"
            tone="ghost"
            onClick={() => navigate('/orders')}
            disabled={actionLoading}
          />
        </div>
      </section>

      <ConfirmModal
        isOpen={Boolean(pendingAction)}
        title={pendingAction?.confirmTitle || 'Confirm action'}
        message={pendingAction?.confirmMessage || 'Are you sure you want to continue?'}
        confirmLabel={pendingAction?.confirmLabel || 'Continue'}
        cancelLabel="Go Back"
        isLoading={actionLoading}
        onCancel={() => {
          if (!actionLoading) {
            setPendingAction(null);
            setRejectReason('Item is out of stock right now');
            setPaymentReason('We could not confirm the transfer in the restaurant account yet.');
          }
        }}
        onConfirm={() => {
          if (pendingAction?.requiresReason && !rejectReason.trim()) {
            return;
          }
          if (pendingAction?.requiresPaymentReason && !paymentReason.trim()) {
            return;
          }
          if (pendingAction?.run) {
            runAction(pendingAction.run);
          }
        }}
      >
        {pendingAction?.requiresReason ? (
          <label className="order-detail-modal-field">
            <span>Reason the customer will see</span>
            <textarea
              className="order-detail-modal-textarea"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Tell the customer why this order is being rejected"
              rows={4}
              disabled={actionLoading}
            />
          </label>
        ) : null}
        {pendingAction?.requiresPaymentReason ? (
          <label className="order-detail-modal-field">
            <span>Message the customer will see</span>
            <textarea
              className="order-detail-modal-textarea"
              value={paymentReason}
              onChange={(event) => setPaymentReason(event.target.value)}
              placeholder="Tell the customer why payment has not been confirmed yet"
              rows={4}
              disabled={actionLoading}
            />
          </label>
        ) : null}
      </ConfirmModal>
    </div>
  );
};

export default OrderDetailPage;
