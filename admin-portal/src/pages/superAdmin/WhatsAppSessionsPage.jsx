import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle, faTimesCircle, faQrcode, faSpinner,
  faSync, faSearch, faTimes, faPlug, faInfoCircle,
  faDownload, faMobileAlt, faEllipsisH,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { runtimeApi } from '../../api/runtime';

const timeAgo = (iso) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const Badge = ({ type, label }) => {
  const map = {
    connected:    { color: '#25d366', bg: 'rgba(37,211,102,0.1)',  border: 'rgba(37,211,102,0.2)' },
    disconnected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'  },
    pending:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)' },
    qr_required:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)' },
  };
  const s = map[type] || { color: '#888', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 9px', borderRadius: '999px',
      fontSize: '11px', fontWeight: 600,
      backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: s.color }} />
      {label}
    </span>
  );
};

const StatCard = ({ label, value, accent, icon }) => (
  <div style={{
    backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e',
    borderRadius: '12px', padding: '18px 20px',
    display: 'flex', flexDirection: 'column', gap: '8px',
    transition: 'border-color 0.2s',
  }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e1e1e'}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</p>
      <FontAwesomeIcon icon={icon} style={{ color: '#333', fontSize: '13px' }} />
    </div>
    <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: accent, letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</p>
  </div>
);

const DetailModal = ({ session, onClose }) => (
  <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '24px', width: '420px', maxWidth: '90vw', boxShadow: '0 24px 60px rgba(0,0,0,0.8)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }}>
          <FontAwesomeIcon icon={faWhatsapp} style={{ color: '#25d366', marginRight: '8px' }} />
          {session.restaurant}
        </p>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          { label: 'Phone',       value: session.phone      },
          { label: 'Status',      value: <Badge type={session.status} label={session.status} /> },
          { label: 'Last Active', value: timeAgo(session.lastActive) },
          { label: 'Messages Sent',      value: session.messagesSent ?? '—'      },
          { label: 'Messages Delivered', value: session.messagesDelivered ?? '—' },
          { label: 'Messages Failed',    value: session.messagesFailed ?? '—'    },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #111' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>{label}</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#fff', fontWeight: 500 }}>{value}</p>
          </div>
        ))}
      </div>
      <button onClick={onClose} style={{ marginTop: '20px', width: '100%', padding: '10px', background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#aaa', fontSize: '13px', cursor: 'pointer' }}>
        Close
      </button>
    </div>
  </div>
);

const WhatsAppSessionsPage = () => {
  const [sessions, setSessions]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [autoRefresh, setAutoRefresh]   = useState(false);
  const [selected, setSelected]         = useState(null);
  const [toasts, setToasts]             = useState([]);

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await runtimeApi.getWhatsAppSessions();
      setSessions(data);
    } catch { addToast('Failed to load sessions', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!autoRefresh) return;
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, [autoRefresh]);

  const filtered = sessions.filter((s) => {
    const matchSearch = s.restaurant.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    total:        sessions.length,
    connected:    sessions.filter((s) => s.status === 'connected').length,
    disconnected: sessions.filter((s) => s.status === 'disconnected').length,
    pending:      sessions.filter((s) => s.status === 'pending').length,
  };

  const handleReconnect = (id) => {
    setSessions((p) => p.map((s) => s.id === id ? { ...s, status: 'connected' } : s));
    addToast('Session reconnected', 'success');
  };

  const handleDisconnect = (id) => {
    setSessions((p) => p.map((s) => s.id === id ? { ...s, status: 'disconnected' } : s));
    addToast('Session disconnected', 'success');
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'wa-sessions.json';
    a.click();
    addToast('Exported!', 'success');
  };

  if (loading && sessions.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '12px', color: '#555', fontSize: '13px' }}>
      <FontAwesomeIcon icon={faSpinner} spin /> Loading sessions…
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 14px', borderRadius: '9px', backgroundColor: '#111', border: '1px solid #222', fontSize: '12px', color: t.type === 'success' ? '#22c55e' : t.type === 'error' ? '#ef4444' : '#aaa', minWidth: '200px' }}>
            {t.msg}
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ))}
      </div>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>SYSTEM</p>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>WhatsApp Sessions</h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#555' }}>{counts.total} sessions · {counts.connected} connected</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => setAutoRefresh((a) => !a)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: autoRefresh ? '#22c55e' : '#666', fontSize: '12px', cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faSync} spin={autoRefresh} /> Auto-refresh
          </button>
          <button onClick={exportJSON} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#666', fontSize: '12px', cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faDownload} />
          </button>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', backgroundColor: '#22c55e', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faSync} /> Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
        <StatCard label="TOTAL SESSIONS"  value={counts.total}        accent="#ffffff" icon={faWhatsapp}    />
        <StatCard label="CONNECTED"       value={counts.connected}    accent="#25d366" icon={faCheckCircle} />
        <StatCard label="DISCONNECTED"    value={counts.disconnected} accent="#ef4444" icon={faTimesCircle} />
        <StatCard label="PENDING"         value={counts.pending}      accent="#f59e0b" icon={faQrcode}      />
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '9px', padding: '9px 14px' }}>
          <FontAwesomeIcon icon={faSearch} style={{ color: '#444', fontSize: '12px' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search restaurant or phone…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '13px' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>}
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', color: '#aaa', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', outline: 'none' }}>
          <option value="all">All Status</option>
          <option value="connected">Connected</option>
          <option value="disconnected">Disconnected</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Tab filters */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {[
          { key: 'all',          label: 'All',          count: counts.total        },
          { key: 'connected',    label: 'Connected',    count: counts.connected    },
          { key: 'disconnected', label: 'Disconnected', count: counts.disconnected },
          { key: 'pending',      label: 'Pending',      count: counts.pending      },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setFilterStatus(tab.key)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: filterStatus === tab.key ? '#1a1a1a' : 'transparent', border: `1px solid ${filterStatus === tab.key ? '#2a2a2a' : 'transparent'}`, borderRadius: '8px', color: filterStatus === tab.key ? '#fff' : '#555', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
            {tab.label}
            <span style={{ padding: '1px 6px', background: '#222', borderRadius: '999px', fontSize: '10px', color: filterStatus === tab.key ? '#fff' : '#666' }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Session rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', color: '#555', fontSize: '13px' }}>
            No sessions found
          </div>
        ) : filtered.map((s) => (
          <div key={s.id} style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', transition: 'border-color 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e1e1e'}
          >
            {/* Left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '9px', backgroundColor: '#1a1a1a', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FontAwesomeIcon icon={faWhatsapp} style={{ color: '#25d366', fontSize: '16px' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{s.restaurant}</span>
                  <Badge type={s.status} label={s.status === 'connected' ? 'Connected' : s.status === 'disconnected' ? 'Disconnected' : 'Pending'} />
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: '#555', flexWrap: 'wrap' }}>
                  <span><FontAwesomeIcon icon={faMobileAlt} style={{ marginRight: '4px' }} />{s.phone}</span>
                  <span>Last active: {timeAgo(s.lastActive)}</span>
                </div>
              </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {s.status !== 'connected' && (
                <button onClick={() => handleReconnect(s.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '7px', color: '#22c55e', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                  <FontAwesomeIcon icon={faSync} /> Reconnect
                </button>
              )}
              {s.status === 'connected' && (
                <button onClick={() => handleDisconnect(s.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '7px', color: '#ef4444', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                  <FontAwesomeIcon icon={faPlug} /> Disconnect
                </button>
              )}
              <button onClick={() => setSelected(s)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '7px', color: '#555', fontSize: '12px', cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faInfoCircle} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && <DetailModal session={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default WhatsAppSessionsPage;