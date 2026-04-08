import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { ordersApi } from '../../api/orders';
import './AccountPages.css';

const formatNaira = (value) => `N${Number(value || 0).toLocaleString()}`;

const EarningsPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.restaurantId) {
        setLoading(false);
        return;
      }

      try {
        const data = await ordersApi.listByRestaurant(user.restaurantId, { active: false });
        if (!cancelled) {
          setOrders(data);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.restaurantId]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
    const completedRevenue = orders
      .filter((order) => order.status === 'delivered')
      .reduce((sum, order) => sum + Number(order.amount || 0), 0);
    const averageOrderValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;

    return {
      totalRevenue,
      completedRevenue,
      averageOrderValue,
      totalOrders: orders.length,
    };
  }, [orders]);

  if (loading) {
    return <div className="account-loading">Loading live earnings...</div>;
  }

  return (
    <div className="account-page-shell">
      <section className="account-hero">
        <div>
          <p className="account-eyebrow">Account</p>
          <h1>Earnings</h1>
          <p className="account-subtitle">
            A live operational revenue snapshot built from restaurant orders already flowing through
            the system.
          </p>
        </div>
        <div className="account-hero-side">
          <div>
            <span>Total processed volume</span>
            <strong>{formatNaira(stats.totalRevenue)}</strong>
          </div>
          <p>These numbers are currently derived from order totals, not a dedicated payouts ledger.</p>
        </div>
      </section>

      <div className="account-kpi-grid">
        <article className="account-kpi">
          <span>Total Orders</span>
          <strong>{stats.totalOrders}</strong>
          <p>All orders currently returned for this restaurant.</p>
        </article>
        <article className="account-kpi">
          <span>Average Order</span>
          <strong>{formatNaira(stats.averageOrderValue)}</strong>
          <p>Useful as a quick operating benchmark for pricing and upsell decisions.</p>
        </article>
        <article className="account-kpi">
          <span>Delivered Revenue</span>
          <strong>{formatNaira(stats.completedRevenue)}</strong>
          <p>Orders already marked delivered in the current restaurant dataset.</p>
        </article>
      </div>
    </div>
  );
};

export default EarningsPage;
