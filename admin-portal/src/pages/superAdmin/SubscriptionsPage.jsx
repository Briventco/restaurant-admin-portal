import React, { useState, useEffect } from 'react';
import { billingApi } from '../../api/billing';

const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

const STATUS_LABELS = {
  trial: 'Free trial',
  trial_expired: 'Trial ended',
  payment_pending: 'Payment pending',
  active: 'Active',
  expired: 'Expired',
  legacy_active: 'Active (legacy)',
};

const STATUS_COLORS = {
  trial: '#3b82f6',
  trial_expired: '#f59e0b',
  payment_pending: '#f59e0b',
  active: '#22c55e',
  expired: '#ef4444',
  legacy_active: '#22c55e',
};

const PROVIDER_LABELS = {
  flutterwave: 'Flutterwave',
  manual: 'Manual transfer',
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const SubscriptionsPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      const data = await billingApi.listAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast(err.message || 'Failed to load billing data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const totalRestaurants = rows.length;
  const activeRows = rows.filter((r) => r.billing?.effectiveStatus === 'active' || r.billing?.effectiveStatus === 'legacy_active');
  const monthlyRevenue = activeRows.reduce((sum, r) => sum + Number(r.billing?.lastPaymentAmount || 0), 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '16px', color: '#555' }}>
        <div style={{ width: '24px', height: '24px', border: '3px solid #333', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ margin: 0, fontSize: '13px' }}>Loading billing data...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px', borderRadius: '9px',
            backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            fontSize: '12px', color: '#fff', minWidth: '240px',
          }}>
            <span style={{ color: t.type === 'success' ? '#22c55e' : t.type === 'error' ? '#ef4444' : '#3b82f6' }}>
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
            </span>
            <span style={{ flex: 1 }}>{t.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '11px' }}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#fff' }}>
            Restaurant Billing
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#555' }}>
            Every restaurant's subscription status and last payment, manual or automatic
          </p>
        </div>
        <button
          onClick={loadRows}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Total Restaurants</p>
          <h3 style={{ margin: '8px 0 0', fontSize: '24px', fontWeight: 700, color: '#fff' }}>{totalRestaurants}</h3>
        </div>
        <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Active Subscriptions</p>
          <h3 style={{ margin: '8px 0 0', fontSize: '24px', fontWeight: 700, color: '#a855f7' }}>{activeRows.length}</h3>
        </div>
        <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Monthly Revenue (recorded)</p>
          <h3 style={{ margin: '8px 0 0', fontSize: '24px', fontWeight: 700, color: '#22c55e' }}>{formatNaira(monthlyRevenue)}</h3>
        </div>
      </div>

      <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #1e1e1e' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>All Restaurants</h3>
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>No restaurants found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e1e1e' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 600 }}>Restaurant</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 600 }}>Valid until</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 600 }}>Last payment</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 600 }}>Bot</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const billing = row.billing || {};
                  const status = billing.effectiveStatus || billing.status || 'trial';
                  const provider = billing.lastPaymentProvider ? PROVIDER_LABELS[billing.lastPaymentProvider] || billing.lastPaymentProvider : '';
                  return (
                    <tr key={row.restaurantId} style={{ borderBottom: '1px solid #1e1e1e' }}>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#fff' }}>
                        <div style={{ fontWeight: 600 }}>{row.restaurantName || 'Unknown'}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>{row.email || ''}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: `${STATUS_COLORS[status] || '#888'}1a`,
                          color: STATUS_COLORS[status] || '#888',
                        }}>
                          {STATUS_LABELS[status] || status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#888' }}>
                        {status === 'trial' ? formatDate(billing.trialEndsAt) : formatDate(billing.subscriptionEndsAt)}
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#fff' }}>
                        {provider ? (
                          <div>
                            <div>{provider}{billing.lastPaymentAmount ? ` · ${formatNaira(billing.lastPaymentAmount)}` : ''}</div>
                            <div style={{ fontSize: '12px', color: '#888' }}>{formatDate(billing.paymentApprovedAt)}</div>
                          </div>
                        ) : (
                          <span style={{ color: '#666' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px' }}>
                        <span style={{ color: billing.botAllowed ? '#22c55e' : '#f59e0b' }}>
                          {billing.botAllowed ? 'Taking orders' : 'Paused'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
