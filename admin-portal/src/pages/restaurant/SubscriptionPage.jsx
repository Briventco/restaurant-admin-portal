import './SubscriptionPage.css';

/*
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { restaurantApi } from '../../api/restaurant';
import { subscriptionApi } from '../../api/subscription';

const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

const plansData = [ ... ];

const SubscriptionPage = () => { ... full implementation ... };
*/

const SubscriptionPage = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '420px', gap: '20px', textAlign: 'center' }}>
    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>🚀</div>
    <div>
      <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Subscriptions — Coming Soon</h2>
      <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: 1.6 }}>Plan management, billing history, and upgrades are being built. You'll be able to manage everything from here very soon.</p>
    </div>
    <span style={{ padding: '5px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: 'rgba(34,197,94,0.08)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>In Development</span>
  </div>
);

export default SubscriptionPage;
