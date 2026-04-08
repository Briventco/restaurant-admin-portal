import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope, faCheckCircle, faTimesCircle, faClock, faSync,
  faSearch, faTimes, faDownload, faStore, faUser, faSpinner,
  faExclamationTriangle, faInfoCircle, faEllipsisH, faCopy,
  faChartLine, faSkull,
} from '@fortawesome/free-solid-svg-icons';
import adminApi from '../../api/admin';

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};
const timeAgo = (iso) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
};

const Badge = ({ type, label }) => {
  const map = {
    delivered: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)'  },
    pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    failed:    { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)'  },
    retrying:  { color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)' },
    dead:      { color: '#666',    bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
  };
  const s = map[type?.toLowerCase()] || { color: '#888', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: s.color }} />
      {label || type}
    </span>
  );
};

const StatCard = ({ label, value, accent, icon }) => (
  <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'border-color 0.2s' }}
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

const DetailModal = ({ msg, onClose, onRetry }) => (
  <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '24px', width: '420px', maxWidth: '90vw', boxShadow: '0 24px 60px rgba(0,0,0,0.8)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }}>Message Details</p>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>
      </div>
      <div style={{ backgroundColor: '#111', borderRadius: '8px', padding: '14px', marginBottom: '16px', fontSize: '13px', color: '#aaa', lineHeight: 1.6 }}>
        "{msg.message}"
      </div>
      {[
        { label: 'ID',          value: msg.id         },
        { label: 'Restaurant',  value: msg.restaurant },
        { label: 'Recipient',   value: msg.recipient  },
        { label: 'Status',      value: <Badge type={msg.status} label={msg.status} /> },
        { label: 'Provider',    value: msg.provider || 'Not set' },
        { label: 'Binding',     value: msg.bindingMode || 'unconfigured' },
        { label: 'Routing',     value: msg.routingMode || 'unknown' },
        { label: 'Retries',     value: msg.retries    },
        { label: 'Sent',        value: fmtDate(msg.time) },
      ].map(({ label, value }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #111' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>{label}</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#fff', fontWeight: 500 }}>{value}</p>
        </div>
      ))}
      {msg.routingHint ? (
        <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '10px', border: '1px solid #1e1e1e', backgroundColor: '#111', color: '#9a9a9a', fontSize: '12px', lineHeight: 1.6 }}>
          {msg.routingHint}
        </div>
      ) : null}
      <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
        {msg.status === 'failed' && (
          <button onClick={() => { onRetry(msg.id); onClose(); }} style={{ flex: 1, padding: '10px', backgroundColor: '#22c55e', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faSync} style={{ marginRight: '6px' }} /> Retry
          </button>
        )}
        <button onClick={onClose} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#aaa', fontSize: '13px', cursor: 'pointer' }}>Close</button>
      </div>
    </div>
  </div>
);

const OutboxMonitorPage = () => {
  const [messages, setMessages]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [autoRefresh, setAutoRefresh]   = useState(false);
  const [selected, setSelected]         = useState(null);
  const [toasts, setToasts]             = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listOutboxMessages(filterStatus === 'all' ? '' : filterStatus);
      setMessages(data);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!autoRefresh) return;
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, [autoRefresh]);
  useEffect(() => {
    load();
  }, [filterStatus]);

  const filtered = messages.filter((m) => {
    const matchSearch = m.restaurant.toLowerCase().includes(search.toLowerCase()) ||
      m.recipient.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    total:     messages.length,
    delivered: messages.filter((m) => m.status === 'delivered').length,
    pending:   messages.filter((m) => m.status === 'pending').length,
    failed:    messages.filter((m) => m.status === 'failed').length,
  };

  const handleRetry = async (id) => {
    try {
      const updated = await adminApi.retryOutboxMessage(id);
      setMessages((previous) => previous.map((message) => (
        message.id === id
          ? { ...message, ...updated }
          : message
      )));
      addToast('Message queued for retry', 'success');
    } catch (error) {
      addToast(error.message || 'Failed to retry message', 'error');
    }
  };

  const handleRetryAll = async () => {
    const failedIds = messages.filter((m) => m.status === 'failed').map((m) => m.id);
    await Promise.all(failedIds.map((id) => adminApi.retryOutboxMessage(id).catch(() => null)));
    await load();
    addToast(`${failedIds.length} messages queued for retry`, 'success');
  };

  const handleClearDelivered = () => {
    setMessages((p) => p.filter((m) => m.status !== 'delivered'));
    addToast('Delivered messages cleared', 'success');
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'outbox.json';
    a.click();
    addToast('Exported!', 'success');
  };

  const toggleRow = (id) => setSelectedRows((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const selectAll = () => setSelectedRows(selectedRows.length === filtered.length ? [] : filtered.map((m) => m.id));
  const copyId = (id) => { navigator.clipboard.writeText(id); addToast('Copied!', 'success'); };

  const statusIcon = { delivered: faCheckCircle, pending: faClock, failed: faTimesCircle, retrying: faSync, dead: faSkull };

  if (loading && messages.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '12px', color: '#555', fontSize: '13px' }}>
      <FontAwesomeIcon icon={faSpinner} spin /> Loading outbox…
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 14px', borderRadius: '9px', backgroundColor: '#111', border: '1px solid #222', fontSize: '12px', color: t.type === 'success' ? '#22c55e' : t.type === 'error' ? '#ef4444' : '#aaa', minWidth: '200px' }}>
            {t.msg}
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>SYSTEM</p>
          {/* <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>Outbox Monitor</h1> */}
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#555' }}>{counts.total} messages · {counts.failed} failed</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setAutoRefresh((a) => !a)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: autoRefresh ? '#22c55e' : '#666', fontSize: '12px', cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faSync} spin={autoRefresh} /> Auto
          </button>
          <button onClick={exportJSON} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#666', fontSize: '12px', cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faDownload} />
          </button>
          <button onClick={handleClearDelivered} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#666', fontSize: '12px', cursor: 'pointer' }}>
            Clear Delivered
          </button>
          <button onClick={handleRetryAll} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#22c55e', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faSync} /> Retry All Failed
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px' }}>
        <StatCard label="TOTAL"     value={counts.total}     accent="#ffffff" icon={faEnvelope}     />
        <StatCard label="DELIVERED" value={counts.delivered} accent="#22c55e" icon={faCheckCircle}  />
        <StatCard label="PENDING"   value={counts.pending}   accent="#f59e0b" icon={faClock}        />
        <StatCard label="FAILED"    value={counts.failed}    accent="#ef4444" icon={faTimesCircle}  />
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '9px', padding: '9px 14px' }}>
          <FontAwesomeIcon icon={faSearch} style={{ color: '#444', fontSize: '12px' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search restaurant, recipient, ID…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '13px' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>}
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', color: '#aaa', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', outline: 'none' }}>
          <option value="all">All Status</option>
          <option value="delivered">Delivered</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="retrying">Retrying</option>
        </select>
      </div>

      {/* Tab filters */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {[
          { key: 'all',       label: 'All',       count: counts.total     },
          { key: 'delivered', label: 'Delivered', count: counts.delivered },
          { key: 'pending',   label: 'Pending',   count: counts.pending   },
          { key: 'failed',    label: 'Failed',    count: counts.failed    },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setFilterStatus(tab.key)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: filterStatus === tab.key ? '#1a1a1a' : 'transparent', border: `1px solid ${filterStatus === tab.key ? '#2a2a2a' : 'transparent'}`, borderRadius: '8px', color: filterStatus === tab.key ? '#fff' : '#555', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
            {tab.key === 'failed' && <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#ef4444', fontSize: '10px' }} />}
            {tab.label}
            <span style={{ padding: '1px 6px', background: '#222', borderRadius: '999px', fontSize: '10px', color: filterStatus === tab.key ? '#fff' : '#666' }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Bulk bar */}
      {selectedRows.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#111', border: '1px solid #1e1e1e', borderRadius: '10px', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#22c55e' }} />
            {selectedRows.length} selected
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { selectedRows.forEach(handleRetry); setSelectedRows([]); }} style={{ padding: '6px 12px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '7px', color: '#22c55e', fontSize: '12px', cursor: 'pointer' }}>Retry Selected</button>
            <button onClick={() => setSelectedRows([])} style={{ padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '7px', color: '#666', fontSize: '12px', cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      )}

      {/* Message rows */}
      <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 160px 80px 100px 80px', gap: '0', padding: '10px 16px', borderBottom: '1px solid #1a1a1a' }}>
          <input type="checkbox" checked={selectedRows.length === filtered.length && filtered.length > 0} onChange={selectAll} style={{ accentColor: '#22c55e', cursor: 'pointer' }} />
          {['Restaurant', 'Recipient', 'Message', 'Status', 'Retries', 'Actions'].map((h) => (
            <p key={h} style={{ margin: 0, fontSize: '10px', fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</p>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#555', fontSize: '13px' }}>No messages found</div>
        ) : filtered.map((m, idx) => (
          <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 160px 80px 100px 80px', gap: '0', padding: '13px 16px', borderBottom: idx < filtered.length - 1 ? '1px solid #111' : 'none', alignItems: 'center', transition: 'background 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <input type="checkbox" checked={selectedRows.includes(m.id)} onChange={() => toggleRow(m.id)} style={{ accentColor: '#22c55e', cursor: 'pointer' }} />

            {/* Restaurant */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FontAwesomeIcon icon={faStore} style={{ color: '#555', fontSize: '11px' }} />
              </div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.restaurant}</p>
            </div>

            {/* Recipient */}
            <p style={{ margin: 0, fontSize: '12px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.recipient}</p>

            {/* Message */}
            <p style={{ margin: 0, fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.message}</p>

            {/* Status */}
            <div><Badge type={m.status} label={m.status} /></div>

            {/* Retries */}
            <p style={{ margin: 0, fontSize: '12px', color: m.retries > 2 ? '#ef4444' : '#666', fontWeight: m.retries > 0 ? 600 : 400 }}>{m.retries}</p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '5px' }}>
              {m.status === 'failed' && (
                <button onClick={() => handleRetry(m.id)} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '6px', color: '#22c55e', cursor: 'pointer', fontSize: '11px' }} title="Retry">
                  <FontAwesomeIcon icon={faSync} />
                </button>
              )}
              <button onClick={() => setSelected(m)} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '6px', color: '#555', cursor: 'pointer', fontSize: '11px' }} title="Details">
                <FontAwesomeIcon icon={faInfoCircle} />
              </button>
              <button onClick={() => copyId(m.id)} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '6px', color: '#555', cursor: 'pointer', fontSize: '11px' }} title="Copy ID">
                <FontAwesomeIcon icon={faCopy} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && <DetailModal msg={selected} onClose={() => setSelected(null)} onRetry={handleRetry} />}
    </div>
  );
};

export default OutboxMonitorPage;
