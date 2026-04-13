import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUpRightFromSquare,
  faBoxesStacked,
  faCalendarDays,
  faCheckCircle,
  faClock,
  faColumns,
  faMagnifyingGlass,
  faMoneyBillWave,
  faRotate,
  faSpinner,
  faTriangleExclamation,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../auth/AuthContext';
import { ordersApi } from '../../api/orders';
import './OrdersPage.css';

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

const withinWindow = (value, filter) => {
  if (filter === 'all') return true;
  if (!value) return false;

  const hours = filter === '24h' ? 24 : filter === '48h' ? 48 : 72;
  return Date.now() - new Date(value).getTime() <= hours * 3600000;
};

const STATUS_TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_THEME = {
  pending: { dot: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
  processing: { dot: '#3b82f6', glow: 'rgba(59,130,246,0.2)' },
  completed: { dot: '#22c55e', glow: 'rgba(34,197,94,0.2)' },
  cancelled: { dot: '#ef4444', glow: 'rgba(239,68,68,0.18)' },
};

const LIVE_REFRESHABLE_STATUSES = new Set([
  'pending_confirmation',
  'awaiting_payment',
  'payment_review',
  'confirmed',
  'preparing',
]);

const StatCard = ({ label, value, hint, icon, accent, onClick }) => (
  <button type="button" className="orders-stat-card" onClick={onClick}>
    <div className="orders-stat-head">
      <span>{label}</span>
      <div className="orders-stat-icon" style={{ color: accent }}>
        <FontAwesomeIcon icon={icon} />
      </div>
    </div>
    <div className="orders-stat-value" style={{ color: accent }}>{value}</div>
    <div className="orders-stat-hint">{hint}</div>
  </button>
);

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [recentFilter, setRecentFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((previous) => [...previous, { id, message, type }]);
    setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id));
    }, 3500);
  };

  const load = async () => {
    if (!user?.restaurantId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await ordersApi.listByRestaurant(user.restaurantId, { active: true });
      setOrders(data);
    } catch (error) {
      console.error(error);
      addToast('Failed to load live orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.restaurantId]);

  useEffect(() => {
    if (!user?.restaurantId) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      load();
    }, 10000);

    return () => {
      window.clearInterval(interval);
    };
  }, [user?.restaurantId]);

  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase();

    return orders
      .filter((order) => withinWindow(order.createdAt, recentFilter))
      .filter((order) => (statusFilter === 'all' ? true : order.uiStatus === statusFilter))
      .filter((order) => {
        if (!lowerSearch) return true;
        return (
          String(order.id || '').toLowerCase().includes(lowerSearch) ||
          String(order.customer || '').toLowerCase().includes(lowerSearch) ||
          String(order.items || '').toLowerCase().includes(lowerSearch)
        );
      });
  }, [orders, recentFilter, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.uiStatus === 'pending').length,
      processing: orders.filter((order) => order.uiStatus === 'processing').length,
      completed: orders.filter((order) => order.uiStatus === 'completed').length,
      cancelled: orders.filter((order) => order.uiStatus === 'cancelled').length,
      awaitingReview: orders.filter((order) => order.status === 'payment_review').length,
      revenue: orders.reduce((sum, order) => sum + Number(order.amount || 0), 0),
    }),
    [orders]
  );

  if (loading) {
    return (
      <div className="orders-loading">
        <FontAwesomeIcon icon={faSpinner} spin />
        <span>Loading live restaurant orders...</span>
      </div>
    );
  }

  return (
    <div className="orders-page-shell">
      <div className="orders-toast-stack">
        {toasts.map((toast) => (
          <div key={toast.id} className={`orders-toast ${toast.type}`}>
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToasts((previous) => previous.filter((item) => item.id !== toast.id))}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        ))}
      </div>

      <section className="orders-hero">
        <div className="orders-hero-copy">
          <p className="orders-eyebrow">Restaurant Operations</p>
          <h1>Live Orders</h1>
          <p className="orders-subtitle">
            Track everything coming in from WhatsApp, spot what needs attention, and open any order to take action.
          </p>

          <div className="orders-hero-pills">
            <span className="orders-pill">
              <FontAwesomeIcon icon={faBoxesStacked} />
              {stats.total} active orders
            </span>
            <span className="orders-pill">
              <FontAwesomeIcon icon={faCalendarDays} />
              Filter: {recentFilter === 'all' ? 'All time' : `Last ${recentFilter}`}
            </span>
            <span className="orders-pill">
              Payment review: {stats.awaitingReview}
            </span>
          </div>
        </div>

        <div className="orders-hero-actions">
          <button type="button" className="orders-ghost-btn" onClick={load}>
            <FontAwesomeIcon icon={faRotate} />
            Refresh
          </button>
          <button
            type="button"
            className="orders-ghost-btn"
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
          >
            <FontAwesomeIcon icon={faColumns} />
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </button>
        </div>
      </section>

      <section className="orders-stats-grid">
        <StatCard label="Total Orders" value={stats.total} hint="currently active" icon={faBoxesStacked} accent="#ffffff" onClick={() => setStatusFilter('all')} />
        <StatCard label="Pending" value={stats.pending} hint="needs review" icon={faClock} accent="#f59e0b" onClick={() => setStatusFilter('pending')} />
        <StatCard label="Processing" value={stats.processing} hint="kitchen in motion" icon={faSpinner} accent="#3b82f6" onClick={() => setStatusFilter('processing')} />
        <StatCard label="Completed" value={stats.completed} hint="already fulfilled" icon={faCheckCircle} accent="#22c55e" onClick={() => setStatusFilter('completed')} />
        <StatCard label="Revenue" value={formatNaira(stats.revenue)} hint="active order total" icon={faMoneyBillWave} accent="#4ade80" />
      </section>

      <section className="orders-toolbar">
        <div className="orders-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by order ID, customer, or item"
          />
          {search ? (
            <button type="button" onClick={() => setSearch('')}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          ) : null}
        </div>

        <div className="orders-filter-group">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select value={recentFilter} onChange={(event) => setRecentFilter(event.target.value)}>
            <option value="all">All Time</option>
            <option value="24h">Last 24h</option>
            <option value="48h">Last 48h</option>
            <option value="72h">Last 72h</option>
          </select>
        </div>
      </section>

      <div className="orders-tab-row">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`orders-tab ${statusFilter === tab.key ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab.key)}
          >
            {tab.label}
            <span>
              {tab.key === 'all' ? stats.total : stats[tab.key] || 0}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <section className="orders-empty">
          <FontAwesomeIcon icon={faTriangleExclamation} />
          <h3>No orders match this view</h3>
          <p>Try another filter or refresh after a new WhatsApp order comes in.</p>
        </section>
      ) : viewMode === 'table' ? (
        <section className="orders-table-shell">
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const theme = STATUS_THEME[order.uiStatus] || STATUS_THEME.pending;
                  return (
                    <tr key={order.id} onClick={() => navigate(`/orders/${order.id}`)}>
                      <td>
                        <div className="orders-primary-cell">
                          <strong>{order.id}</strong>
                          <span>{order.fulfillmentType || 'pickup'}</span>
                        </div>
                      </td>
                      <td>{order.customer}</td>
                      <td className="orders-items-cell">{order.items}</td>
                      <td className="orders-money-cell">{formatNaira(order.amount)}</td>
                      <td>
                        {order.status === 'payment_review' ? (
                          <div className="orders-payment-flag">
                            <strong>Payment review</strong>
                            <span>{order.paymentReportNote || 'Customer said payment was made'}</span>
                          </div>
                        ) : null}
                        <span
                          className="orders-status-badge"
                          style={{
                            color: theme.dot,
                            background: theme.glow,
                            borderColor: theme.glow,
                          }}
                        >
                          <span className="orders-status-dot" style={{ background: theme.dot }} />
                          {order.statusLabel}
                        </span>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="orders-open-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/orders/${order.id}`);
                          }}
                        >
                          <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="orders-card-grid">
          {filtered.map((order) => {
            const theme = STATUS_THEME[order.uiStatus] || STATUS_THEME.pending;
            return (
              <article
                key={order.id}
                className="orders-card"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className="orders-card-head">
                  <div>
                    <p className="orders-card-id">{order.id}</p>
                    <h3>{order.customer}</h3>
                  </div>
                  <span
                    className="orders-status-badge"
                    style={{
                      color: theme.dot,
                      background: theme.glow,
                      borderColor: theme.glow,
                    }}
                  >
                    <span className="orders-status-dot" style={{ background: theme.dot }} />
                    {order.statusLabel}
                  </span>
                </div>

                <p className="orders-card-items">{order.items}</p>

                {order.status === 'payment_review' ? (
                  <div className="orders-payment-flag compact">
                    <strong>Payment review</strong>
                    <span>{order.paymentReportNote || 'Customer said payment was made'}</span>
                  </div>
                ) : null}

                <div className="orders-card-meta">
                  <span>{order.fulfillmentType || 'pickup'}</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>

                <div className="orders-card-foot">
                  <strong>{formatNaira(order.amount)}</strong>
                  <span>Open Order</span>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};

export default OrdersPage;
