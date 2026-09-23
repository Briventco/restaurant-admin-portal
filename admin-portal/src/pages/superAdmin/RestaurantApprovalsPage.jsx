import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verificationApi } from '../../api/verification';

const formatDate = (value) => {
  if (!value) return 'Recently submitted';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently submitted';
  return date.toLocaleString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
};

const RestaurantApprovalsPage = () => {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [toast, setToast] = useState('');

  const loadPending = async () => {
    try {
      setLoading(true);
      const restaurants = await verificationApi.getPending();
      setPending(Array.isArray(restaurants) ? restaurants : []);
    } catch (error) {
      setToast(error.message || 'Failed to load approval queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPending(); }, []);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 4000);
  };

  const handleVerify = async (restaurantId, action) => {
    const reason = action === 'reject'
      ? window.prompt('Why is this restaurant being rejected?')
      : '';
    if (action === 'reject' && !String(reason || '').trim()) return;

    try {
      setActionId(restaurantId);
      await verificationApi.verify(restaurantId, { action, reason: reason || '' });
      showToast(action === 'approve' ? 'Restaurant approved.' : 'Restaurant rejected.');
      await loadPending();
    } catch (error) {
      showToast(error.message || 'Unable to update restaurant verification.');
    } finally {
      setActionId('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, padding: '12px 16px', borderRadius: '10px', background: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: '13px' }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Review queue</div>
          <h1 style={{ margin: '6px 0 0', color: '#fff', fontSize: '26px', fontWeight: 700 }}>Restaurant Approvals</h1>
          <p style={{ margin: '6px 0 0', color: '#777', fontSize: '13px' }}>Review new restaurant registrations before they get dashboard access.</p>
        </div>
        <button type="button" onClick={loadPending} disabled={loading} style={{ padding: '10px 16px', border: '1px solid #2b2b2b', borderRadius: '8px', background: 'transparent', color: '#ddd', fontSize: '12px', fontWeight: 600, cursor: loading ? 'wait' : 'pointer' }}>
          Refresh queue
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ minWidth: '150px', padding: '16px 18px', background: '#111', border: '1px solid #242424', borderRadius: '10px' }}>
          <div style={{ color: '#777', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Awaiting review</div>
          <div style={{ marginTop: '8px', color: '#f59e0b', fontSize: '24px', fontWeight: 700 }}>{pending.length}</div>
        </div>
        <div style={{ flex: 1, minWidth: '220px', padding: '16px 18px', background: '#111', border: '1px solid #242424', borderRadius: '10px' }}>
          <div style={{ color: '#777', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>What happens next</div>
          <div style={{ marginTop: '8px', color: '#bbb', fontSize: '13px', lineHeight: 1.5 }}>Approving unlocks the restaurant account. Rejected restaurants can resubmit after addressing your reason.</div>
        </div>
      </div>

      <section style={{ background: '#0f0f0f', border: '1px solid #242424', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #242424' }}><h2 style={{ margin: 0, color: '#fff', fontSize: '15px' }}>Pending registrations</h2></div>
        {loading ? (
          <div style={{ padding: '48px 20px', color: '#777', textAlign: 'center', fontSize: '13px' }}>Loading approval queue...</div>
        ) : pending.length === 0 ? (
          <div style={{ padding: '56px 20px', textAlign: 'center' }}><div style={{ color: '#22c55e', fontSize: '15px', fontWeight: 700 }}>CLEAR</div><div style={{ marginTop: '10px', color: '#fff', fontSize: '15px', fontWeight: 600 }}>All caught up</div><div style={{ marginTop: '6px', color: '#777', fontSize: '13px' }}>There are no restaurant registrations waiting for review.</div></div>
        ) : (
          pending.map((restaurant) => (
            <div key={restaurant.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', padding: '18px 20px', borderTop: '1px solid #1d1d1d' }}>
              <div style={{ flex: '1 1 220px' }}>
                <button type="button" onClick={() => navigate(`/restaurants/${restaurant.id}`)} style={{ padding: 0, border: 0, background: 'none', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>{restaurant.name || 'Unnamed restaurant'}</button>
                <div style={{ marginTop: '5px', color: '#777', fontSize: '12px' }}>{restaurant.email || 'No email provided'}</div>
                <div style={{ marginTop: '3px', color: '#555', fontSize: '12px' }}>{restaurant.phone || 'No phone provided'}</div>
              </div>
              <div style={{ flex: '1 1 180px', color: '#aaa', fontSize: '12px' }}><div style={{ color: '#666', marginBottom: '5px' }}>Submitted</div>{formatDate(restaurant.verificationSubmittedAt || restaurant.createdAt)}</div>
              <div style={{ display: 'flex', flex: '0 0 auto', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button type="button" disabled={actionId === restaurant.id} onClick={() => handleVerify(restaurant.id, 'approve')} style={{ padding: '9px 14px', border: 0, borderRadius: '7px', background: '#22c55e', color: '#07130a', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Approve</button>
                <button type="button" disabled={actionId === restaurant.id} onClick={() => handleVerify(restaurant.id, 'reject')} style={{ padding: '9px 14px', border: '1px solid #54242a', borderRadius: '7px', background: 'transparent', color: '#f87171', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Reject</button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default RestaurantApprovalsPage;
