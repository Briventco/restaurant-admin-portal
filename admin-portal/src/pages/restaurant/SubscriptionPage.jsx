import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { restaurantApi } from '../../api/restaurant';
import './AccountPages.css';

const SubscriptionPage = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.restaurantId) {
        setLoading(false);
        return;
      }

      try {
        const data = await restaurantApi.getCurrent(user.restaurantId);
        if (!cancelled) {
          setRestaurant(data);
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

  if (loading) {
    return <div className="account-loading">Loading subscription details...</div>;
  }

  const plan = restaurant?.plan || 'Starter';

  return (
    <div className="account-page-shell">
      <section className="account-hero">
        <div>
          <p className="account-eyebrow">Account</p>
          <h1>Subscription</h1>
          <p className="account-subtitle">
            Keep track of the restaurant’s current plan and the operational scope tied to it.
          </p>
        </div>
        <div className="account-hero-side">
          <div>
            <span>Current plan</span>
            <strong>{plan}</strong>
          </div>
          <p>{restaurant?.name || 'Restaurant'} is currently using the live portal setup.</p>
        </div>
      </section>

      <div className="account-grid">
        <section className="account-panel">
          <h2>Plan Snapshot</h2>
          <div className="account-list">
            <div className="account-list-row">
              <span>Plan name</span>
              <strong>{plan}</strong>
            </div>
            <div className="account-list-row">
              <span>Restaurant</span>
              <strong>{restaurant?.name || '-'}</strong>
            </div>
            <div className="account-list-row">
              <span>Restaurant ID</span>
              <strong>{restaurant?.restaurantId || user?.restaurantId || '-'}</strong>
            </div>
          </div>
        </section>

        <section className="account-panel full">
          <h2>What this means right now</h2>
          <div className="account-note">
            Subscription billing is not fully wired yet, but this page now exists as a real part of
            the restaurant portal instead of a dead route. It’s ready to become the place where plan
            limits, billing state, renewal timing, and upgrade actions will live once onboarding and
            multi-restaurant billing are added.
          </div>
        </section>
      </div>
    </div>
  );
};

export default SubscriptionPage;
