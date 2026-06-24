import React, { useEffect, useState } from 'react';
import { billingApi } from '../../api/billing';

const STATUS_LABELS = {
  trial_expired: 'Trial ended',
  payment_pending: 'Awaiting approval',
  expired: 'Subscription expired',
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const BillingApprovalsPage = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [toast, setToast] = useState('');

  const loadPending = async () => {
    try {
      setLoading(true);
      const rows = await billingApi.listPending();
      setPending(Array.isArray(rows) ? rows : []);
    } catch (error) {
      setToast(error.message || 'Failed to load billing queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 4000);
  };

  const handleApprove = async (restaurantId) => {
    try {
      setActionId(restaurantId);
      await billingApi.approve(restaurantId);
      showToast('Payment approved. Restaurant activated for 30 days.');
      await loadPending();
    } catch (error) {
      showToast(error.message || 'Unable to approve payment.');
    } finally {
      setActionId('');
    }
  };

  const handleReject = async (restaurantId) => {
    const reason = window.prompt('Optional rejection reason for the restaurant admin:') || '';
    try {
      setActionId(restaurantId);
      await billingApi.reject(restaurantId, reason);
      showToast('Payment rejected.');
      await loadPending();
    } catch (error) {
      showToast(error.message || 'Unable to reject payment.');
    } finally {
      setActionId('');
    }
  };

  const awaitingApproval = pending.filter(
    (row) => row.billing?.effectiveStatus === 'payment_pending'
  );
  const needsAttention = pending.filter(
    (row) => row.billing?.effectiveStatus !== 'payment_pending'
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px', color: '#888' }}>
        Loading billing queue…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 999,
          padding: '12px 16px', borderRadius: '10px', background: '#111', border: '1px solid #222',
          color: '#fff', fontSize: '13px', maxWidth: '360px',
        }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#fff' }}>Billing Approvals</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
            Restaurants waiting for payment confirmation or overdue on trial/subscription.
          </p>
        </div>
        <button
          type="button"
          onClick={loadPending}
          style={{
            padding: '10px 18px', borderRadius: '8px', border: 'none',
            background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Refresh
        </button>
      </div>

      <section style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e1e1e' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#fff' }}>
            Pending approval ({awaitingApproval.length})
          </h3>
        </div>
        {awaitingApproval.length === 0 ? (
          <div style={{ padding: '28px 20px', color: '#666', fontSize: '13px' }}>
            No restaurants have reported payment yet.
          </div>
        ) : (
          awaitingApproval.map((row) => (
            <div
              key={row.restaurantId}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 1fr auto',
                gap: '12px',
                alignItems: 'center',
                padding: '16px 20px',
                borderTop: '1px solid #1a1a1a',
              }}
            >
              <div>
                <strong style={{ color: '#fff', display: 'block' }}>{row.restaurantName}</strong>
                <span style={{ color: '#666', fontSize: '12px' }}>{row.email || row.restaurantId}</span>
              </div>
              <div style={{ color: '#aaa', fontSize: '12px' }}>
                Reported {formatDate(row.billing?.paymentReportedAt)}
              </div>
              <div style={{ color: '#3b82f6', fontSize: '12px', fontWeight: 600 }}>
                {STATUS_LABELS[row.billing?.effectiveStatus] || row.billing?.effectiveStatus}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  disabled={actionId === row.restaurantId}
                  onClick={() => handleApprove(row.restaurantId)}
                  style={{
                    padding: '8px 12px', borderRadius: '8px', border: 'none',
                    background: '#22c55e', color: '#fff', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={actionId === row.restaurantId}
                  onClick={() => handleReject(row.restaurantId)}
                  style={{
                    padding: '8px 12px', borderRadius: '8px', border: '1px solid #333',
                    background: 'transparent', color: '#ef4444', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <section style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e1e1e' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#fff' }}>
            Expired / unpaid ({needsAttention.length})
          </h3>
        </div>
        {needsAttention.length === 0 ? (
          <div style={{ padding: '28px 20px', color: '#666', fontSize: '13px' }}>
            No expired restaurants right now.
          </div>
        ) : (
          needsAttention.map((row) => (
            <div
              key={row.restaurantId}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 1fr',
                gap: '12px',
                alignItems: 'center',
                padding: '16px 20px',
                borderTop: '1px solid #1a1a1a',
              }}
            >
              <div>
                <strong style={{ color: '#fff', display: 'block' }}>{row.restaurantName}</strong>
                <span style={{ color: '#666', fontSize: '12px' }}>{row.email || row.restaurantId}</span>
              </div>
              <div style={{ color: '#aaa', fontSize: '12px' }}>
                Trial ended {formatDate(row.billing?.trialEndsAt)}
              </div>
              <div style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 600 }}>
                {STATUS_LABELS[row.billing?.effectiveStatus] || row.billing?.effectiveStatus}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default BillingApprovalsPage;
