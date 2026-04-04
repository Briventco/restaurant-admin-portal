import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle, faTimesCircle, faSync, faQrcode,
  faMobileAlt, faSpinner, faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { runtimeApi } from '../../api/runtime';

/* ── Badge ───────────────────────────────────────────────────── */
const Badge = ({ type, label }) => {
  const map = {
    connected:    { color: '#25d366', bg: 'rgba(37,211,102,0.1)', border: 'rgba(37,211,102,0.2)' },
    disconnected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)'  },
    active:       { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)'  },
    inactive:     { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)'  },
  };
  const s = map[type?.toLowerCase()] || { color: '#888', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: s.color }} />
      {label || type}
    </span>
  );
};

/* ── Stat card ───────────────────────────────────────────────── */
const StatCard = ({ label, value, accent, icon }) => (
  <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'border-color 0.2s' }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e1e1e'}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</p>
      <FontAwesomeIcon icon={icon} style={{ color: '#333', fontSize: '13px' }} />
    </div>
    <p style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: accent, letterSpacing: '-0.3px', lineHeight: 1 }}>{value ?? '—'}</p>
  </div>
);

/* ════════════════════════════════════════════════════════════════ */
const WhatsAppStatusPage = () => {
  const { user } = useAuth();
  const [status, setStatus]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [toasts, setToasts]       = useState([]);

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await runtimeApi.getWhatsAppStatus(user?.restaurantId || 'r1');
      setStatus(data);
    } catch { addToast('Failed to load status', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAction = (action) => {
    setActionMsg(`${action} action queued (mock).`);
    addToast(`${action} initiated`, 'success');
    setTimeout(() => setActionMsg(''), 4000);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '12px', color: '#555', fontSize: '13px' }}>
      <FontAwesomeIcon icon={faSpinner} spin /> Loading…
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 14px', borderRadius: '9px', backgroundColor: '#111', border: '1px solid #222', fontSize: '12px', color: t.type === 'success' ? '#22c55e' : '#ef4444', minWidth: '200px' }}>
            {t.msg}
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>RESTAURANT</p>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>WhatsApp Status</h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#555' }}>Monitor connection health and trigger recovery</p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#666', fontSize: '12px', cursor: 'pointer' }}>
          <FontAwesomeIcon icon={faSync} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px' }}>
        <StatCard label="SESSION"    value={<Badge type={status?.status} label={status?.status} />}     accent="#fff"    icon={faWhatsapp}    />
        <StatCard label="SENT"       value={status?.messagesSent}       accent="#3b82f6" icon={faMobileAlt}   />
        <StatCard label="DELIVERED"  value={status?.messagesDelivered}  accent="#22c55e" icon={faCheckCircle} />
        <StatCard label="FAILED"     value={status?.messagesFailed}     accent="#ef4444" icon={faTimesCircle} />
      </div>

      {/* Connection + actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

        {/* Connection card */}
        <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '20px' }}>
          <p style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 600, color: '#fff' }}>
            <FontAwesomeIcon icon={faWhatsapp} style={{ color: '#25d366', marginRight: '8px' }} />
            Connection
          </p>
          {[
            { label: 'Status',     value: <Badge type={status?.status} label={status?.status} /> },
            { label: 'Phone',      value: status?.phone      },
            { label: 'Last Active',value: status?.lastActive || 'just now' },
            { label: 'QR Required',value: status?.qrCode ? 'Yes' : 'No'  },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #111' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>{label}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#fff', fontWeight: 500 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Actions card */}
        <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '20px' }}>
          <p style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 600, color: '#fff' }}>Session Actions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Reconnect',       icon: faSync,    action: 'Reconnect'       },
              { label: 'Restart Session', icon: faSync,    action: 'Restart session' },
              { label: 'Show QR Code',    icon: faQrcode,  action: 'Show QR'         },
              { label: 'Disconnect',      icon: faTimes,   action: 'Disconnect', danger: true },
            ].map((btn) => (
              <button key={btn.label} onClick={() => handleAction(btn.action)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: btn.danger ? 'rgba(239,68,68,0.05)' : '#111', border: `1px solid ${btn.danger ? 'rgba(239,68,68,0.2)' : '#1e1e1e'}`, borderRadius: '8px', color: btn.danger ? '#ef4444' : '#aaa', fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', width: '100%' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = btn.danger ? '#ef4444' : '#fff'; e.currentTarget.style.borderColor = btn.danger ? 'rgba(239,68,68,0.4)' : '#2a2a2a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = btn.danger ? '#ef4444' : '#aaa'; e.currentTarget.style.borderColor = btn.danger ? 'rgba(239,68,68,0.2)' : '#1e1e1e'; }}
              >
                <FontAwesomeIcon icon={btn.icon} style={{ fontSize: '12px' }} />
                {btn.label}
              </button>
            ))}
          </div>
          {actionMsg && (
            <p style={{ margin: '14px 0 0', fontSize: '12px', color: '#22c55e' }}>{actionMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppStatusPage;