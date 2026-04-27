import React, { useState, useEffect } from 'react';
import { subscriptionApi } from '../../api/subscription';

const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await subscriptionApi.listSubscriptions();
      setSubscriptions(data);
    } catch (err) {
      addToast('Failed to load subscriptions', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  // Calculate statistics
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const totalRestaurants = subscriptions.length;
  const totalRevenue = activeSubscriptions.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const monthlyRevenue = totalRevenue; // All are monthly for now

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '16px', color: '#555' }}>
        <div style={{ width: '24px', height: '24px', border: '3px solid #333', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ margin: 0, fontSize: '13px' }}>Loading subscriptions...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast stack */}
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

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#fff' }}>
            Restaurant Subscriptions
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#555' }}>
            View all restaurant subscriptions and revenue
          </p>
        </div>
        <button
          onClick={loadSubscriptions}
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

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{
          backgroundColor: '#0f0f0f',
          border: '1px solid #1e1e1e',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '10px',
              backgroundColor: 'rgba(59,130,246,0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v9"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Total Restaurants</p>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#fff' }}>
                {totalRestaurants}
              </h3>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
            Restaurants with subscriptions
          </p>
        </div>

        <div style={{
          backgroundColor: '#0f0f0f',
          border: '1px solid #1e1e1e',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '10px',
              backgroundColor: 'rgba(34,197,94,0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Monthly Revenue</p>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#22c55e' }}>
                {formatNaira(monthlyRevenue)}
              </h3>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
            Total monthly recurring revenue
          </p>
        </div>

        <div style={{
          backgroundColor: '#0f0f0f',
          border: '1px solid #1e1e1e',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '10px',
              backgroundColor: 'rgba(168,85,247,0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Active Subscriptions</p>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#a855f7' }}>
                {activeSubscriptions.length}
              </h3>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
            Currently active subscriptions
          </p>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div style={{
        backgroundColor: '#0f0f0f',
        border: '1px solid #1e1e1e',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #1e1e1e' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>
            All Subscriptions
          </h3>
        </div>
        
        {subscriptions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>No subscriptions found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e1e1e' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 600 }}>
                    Restaurant
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 600 }}>
                    Plan
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 600 }}>
                    Amount
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 600 }}>
                    Status
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 600 }}>
                    Started
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #1e1e1e' }}>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#fff' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{sub.restaurantName || 'Unknown'}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>{sub.restaurantEmail || ''}</div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#fff' }}>
                      {sub.planName || 'Unknown'}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#22c55e', fontWeight: 600 }}>
                      {formatNaira(sub.amount)}/{sub.billingCycle}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: sub.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: sub.status === 'active' ? '#22c55e' : '#ef4444',
                      }}>
                        {sub.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#888' }}>
                      {new Date(sub.startDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
