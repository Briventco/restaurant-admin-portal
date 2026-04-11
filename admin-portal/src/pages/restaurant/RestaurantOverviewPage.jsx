import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBagShopping,
  faBolt,
  faBoxesStacked,
  faClock,
  faLayerGroup,
  faReceipt,
  faStore,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../auth/AuthContext';
import { ordersApi } from '../../api/orders';
import { menuApi } from '../../api/menu';
import StatusBadge from '../../components/ui/StatusBadge';
import './RestaurantOverviewPage.css';

const formatNaira = (value) => `N${Number(value || 0).toLocaleString()}`;

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleString('en-NG', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

const StatCard = ({ icon, label, value, hint, accent = '' }) => (
  <article className="overview-stat-card">
    <div className="overview-stat-head">
      <span>{label}</span>
      <div className="overview-stat-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
    </div>
    <strong className={`overview-stat-value ${accent}`}>{value}</strong>
    <p className="overview-stat-hint">{hint}</p>
  </article>
);

const RestaurantOverviewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      if (!user?.restaurantId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [ordersResult, menuResult] = await Promise.allSettled([
          ordersApi.listByRestaurant(user.restaurantId, { active: true }),
          menuApi.listByRestaurant(user.restaurantId),
        ]);

        if (cancelled) {
          return;
        }

        const nextOrders =
          ordersResult.status === 'fulfilled' ? ordersResult.value : [];
        const nextMenuItems =
          menuResult.status === 'fulfilled' ? menuResult.value : [];

        setOrders(nextOrders);
        setMenuItems(nextMenuItems);

        const failedAreas = [];
        if (ordersResult.status === 'rejected') {
          failedAreas.push('orders');
        }
        if (menuResult.status === 'rejected') {
          failedAreas.push('menu');
        }

        if (failedAreas.length) {
          const detail =
            (ordersResult.status === 'rejected' && ordersResult.reason?.message) ||
            (menuResult.status === 'rejected' && menuResult.reason?.message) ||
            'Please refresh and try again.';
          setError(`We could not load ${failedAreas.join(' and ')} right now. ${detail}`);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, [user?.restaurantId]);

  const stats = useMemo(() => {
    const pending = orders.filter((order) => order.status === 'pending_confirmation').length;
    const inKitchen = orders.filter((order) =>
      ['confirmed', 'preparing'].includes(order.status)
    ).length;
    const dispatched = orders.filter((order) => order.status === 'rider_dispatched').length;
    const availableMenuItems = menuItems.filter((item) => item.available).length;
    const activeRevenue = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);

    return {
      pending,
      inKitchen,
      dispatched,
      availableMenuItems,
      totalMenuItems: menuItems.length,
      activeRevenue,
    };
  }, [menuItems, orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (left, right) =>
          new Date(right.updatedAt || right.createdAt || 0).getTime() -
          new Date(left.updatedAt || left.createdAt || 0).getTime()
      )
      .slice(0, 5);
  }, [orders]);

  if (loading) {
    return <div className="overview-loading">Loading live restaurant overview...</div>;
  }

  return (
    <div className="overview-page-shell">
      <section className="overview-hero">
        <div>
          <p className="overview-eyebrow">Restaurant Overview</p>
          <h1>{user?.restaurantName || user?.displayName || 'Restaurant Portal'}</h1>
          <p className="overview-subtitle">
            This dashboard pulls from the live order queue and live menu so the team can see what
            needs attention right now.
          </p>

          <div className="overview-hero-pills">
            <span className="overview-pill">
              <FontAwesomeIcon icon={faStore} />
              {user?.restaurantId || '-'}
            </span>
            <span className="overview-pill">
              <FontAwesomeIcon icon={faBolt} />
              {orders.length} active order{orders.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <div className="overview-hero-actions">
          <button type="button" className="overview-primary-btn" onClick={() => navigate('/orders')}>
            Open Orders
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
          <button type="button" className="overview-secondary-btn" onClick={() => navigate('/menu')}>
            Manage Menu
          </button>
        </div>
      </section>

      {error ? <div className="overview-alert">{error}</div> : null}

      <section className="overview-stats-grid">
        <StatCard
          icon={faClock}
          label="Pending Review"
          value={stats.pending}
          hint="Customer orders awaiting restaurant action"
          accent="warning"
        />
        <StatCard
          icon={faBagShopping}
          label="In Kitchen"
          value={stats.inKitchen}
          hint="Confirmed or preparing orders in progress"
          accent="success"
        />
        <StatCard
          icon={faReceipt}
          label="Active Revenue"
          value={formatNaira(stats.activeRevenue)}
          hint="Total value in the current active queue"
          accent="accent"
        />
        <StatCard
          icon={faBoxesStacked}
          label="Available Menu"
          value={stats.availableMenuItems}
          hint={`${stats.totalMenuItems} total menu item${stats.totalMenuItems === 1 ? '' : 's'}`}
        />
        <StatCard
          icon={faLayerGroup}
          label="Dispatch Stage"
          value={stats.dispatched}
          hint="Orders already marked rider dispatched"
        />
      </section>

      <div className="overview-content-grid">
        <section className="overview-panel">
          <div className="overview-panel-head">
            <div>
              <h2>Live Order Queue</h2>
              <p>Most recent active orders from the restaurant workflow.</p>
            </div>
            <button type="button" className="overview-link-btn" onClick={() => navigate('/orders')}>
              View all
            </button>
          </div>

          {!recentOrders.length ? (
            <div className="overview-empty">
              <h3>No active orders right now</h3>
              <p>Once customers place new orders, they’ll appear here immediately.</p>
            </div>
          ) : (
            <div className="overview-order-list">
              {recentOrders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  className="overview-order-item"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="overview-order-main">
                    <div>
                      <p className="overview-order-id">{order.id}</p>
                      <h3>{order.customer}</h3>
                      <p className="overview-order-items">{order.items}</p>
                    </div>
                    <div className="overview-order-side">
                      <StatusBadge value={order.status} label={order.statusLabel} />
                      <strong>{formatNaira(order.amount)}</strong>
                    </div>
                  </div>
                  <div className="overview-order-foot">
                    <span>{order.fulfillmentType || 'pickup'}</span>
                    <span>{formatTime(order.updatedAt || order.createdAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="overview-panel">
          <div className="overview-panel-head">
            <div>
              <h2>Menu Health</h2>
              <p>Quick pulse on what customers can currently order.</p>
            </div>
            <button type="button" className="overview-link-btn" onClick={() => navigate('/menu')}>
              Open menu
            </button>
          </div>

          <div className="overview-menu-summary">
            <div className="overview-menu-tile">
              <span>Available items</span>
              <strong>{stats.availableMenuItems}</strong>
            </div>
            <div className="overview-menu-tile">
              <span>Hidden items</span>
              <strong>{Math.max(stats.totalMenuItems - stats.availableMenuItems, 0)}</strong>
            </div>
          </div>

          <div className="overview-menu-list">
            {menuItems.slice(0, 6).map((item) => (
              <div key={item.id} className="overview-menu-item">
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.category || 'Uncategorized'}</p>
                </div>
                <div className="overview-menu-side">
                  <StatusBadge
                    value={item.available ? 'active' : 'suspended'}
                    label={item.available ? 'Available' : 'Hidden'}
                  />
                  <strong>{formatNaira(item.price)}</strong>
                </div>
              </div>
            ))}

            {!menuItems.length ? (
              <div className="overview-empty compact">
                <h3>No menu items yet</h3>
                <p>Add your first menu item so customers can place real orders.</p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RestaurantOverviewPage;
