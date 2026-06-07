import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope, faCheckCircle, faTimesCircle, faClock, faSync,
  faSearch, faTimes, faDownload, faStore, faSpinner,
  faExclamationTriangle, faInfoCircle, faCopy, faSkull,
} from '@fortawesome/free-solid-svg-icons';
import adminApi from '../../api/admin';
import './OutboxMonitorPage.css';

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const Badge = ({ type, label }) => {
  const key = type?.toLowerCase();
  const validKeys = ['delivered', 'pending', 'failed', 'retrying', 'dead'];
  const cls = validKeys.includes(key) ? key : 'default';
  return (
    <span className={`omp-badge omp-badge--${cls}`}>
      <span className={`omp-badge-dot omp-dot--${cls}`} />
      {label || type}
    </span>
  );
};

const StatCard = ({ label, value, accent, icon }) => (
  <div className="omp-stat-card">
    <div className="omp-stat-card-top">
      <p className="omp-stat-label">{label}</p>
      <FontAwesomeIcon icon={icon} className="omp-stat-icon" />
    </div>
    <p className={`omp-stat-value omp-stat-value--${accent}`}>{value}</p>
  </div>
);

const DetailModal = ({ msg, onClose, onRetry }) => (
  <div className="omp-detail-overlay">
    <div className="omp-detail-modal">
      <div className="omp-detail-modal-header">
        <p className="omp-detail-modal-title">Message Details</p>
        <button onClick={onClose} className="omp-detail-modal-close">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="omp-detail-message-box">"{msg.message}"</div>
      {[
        { label: 'ID',         value: msg.id         },
        { label: 'Restaurant', value: msg.restaurant },
        { label: 'Recipient',  value: msg.recipient  },
        { label: 'Status',     value: <Badge type={msg.status} label={msg.status} /> },
        { label: 'Provider',   value: msg.provider || 'Not set' },
        { label: 'Binding',    value: msg.bindingMode || 'unconfigured' },
        { label: 'Routing',    value: msg.routingMode || 'unknown' },
        { label: 'Retries',    value: msg.retries    },
        { label: 'Sent',       value: fmtDate(msg.time) },
      ].map(({ label, value }) => (
        <div key={label} className="omp-detail-row">
          <p className="omp-detail-row-label">{label}</p>
          <p className="omp-detail-row-value">{value}</p>
        </div>
      ))}
      {msg.routingHint && (
        <div className="omp-detail-hint">{msg.routingHint}</div>
      )}
      <div className="omp-detail-footer">
        {msg.status === 'failed' && (
          <button onClick={() => { onRetry(msg.id); onClose(); }} className="omp-detail-btn-retry">
            <FontAwesomeIcon icon={faSync} /> Retry
          </button>
        )}
        <button onClick={onClose} className="omp-detail-btn-close">Close</button>
      </div>
    </div>
  </div>
);

const OutboxMonitorPage = () => {
  const navigate = useNavigate();

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
  useEffect(() => { load(); }, [filterStatus]);

  const filtered = messages.filter((m) => {
    const matchSearch =
      m.restaurant.toLowerCase().includes(search.toLowerCase()) ||
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
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
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

  const toggleRow = (id) =>
    setSelectedRows((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const selectAll = () =>
    setSelectedRows(selectedRows.length === filtered.length ? [] : filtered.map((m) => m.id));

  const copyId = (id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    addToast('Copied!', 'success');
  };

  // const handleRowClick = (m) => {
  //   const restaurantSlug = encodeURIComponent(m.restaurant);
  //   navigate(`outbox/${restaurantSlug}/chat`, {
  //     state: { 
  //       restaurantName: m.restaurant, 
  //       restaurantId: m.restaurantId,
  //       recipient: m.recipient,
  //       messageId: m.id 
  //     },
  //   });
  // };
  const handleRowClick = (m) => {
  const restaurantSlug = encodeURIComponent(m.restaurant);
  navigate(`/outbox/${restaurantSlug}/chat`, {
    state: { 
      restaurantName: m.restaurant, 
      restaurantId: m.restaurantId,
      recipient: m.recipient,
      customerName: m.recipientName || m.recipient.split('@')[0] || 'Customer',
      messageId: m.id 
    },
  });
};

  const handleActionClick = (e, cb) => {
    e.stopPropagation();
    cb();
  };

  if (loading && messages.length === 0) return (
    <div className="omp-loader">
      <FontAwesomeIcon icon={faSpinner} spin /> Loading outbox…
    </div>
  );

  return (
    <div className="omp-page">

      <div className="omp-toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`omp-toast omp-toast--${t.type}`}>
            {t.msg}
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} className="omp-toast-close">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ))}
      </div>

      <div className="omp-header">
        <div>
          <p className="omp-header-meta">SYSTEM</p>
          <p className="omp-header-sub">{counts.total} messages · {counts.failed} failed</p>
        </div>
        <div className="omp-header-actions">
          <button onClick={() => setAutoRefresh((a) => !a)} className={`omp-btn-ghost${autoRefresh ? ' omp-btn-ghost--active' : ''}`}>
            <FontAwesomeIcon icon={faSync} spin={autoRefresh} /> Auto
          </button>
          <button onClick={exportJSON} className="omp-btn-ghost">
            <FontAwesomeIcon icon={faDownload} />
          </button>
          <button onClick={handleClearDelivered} className="omp-btn-ghost">
            Clear Delivered
          </button>
          <button onClick={handleRetryAll} className="omp-btn-primary">
            <FontAwesomeIcon icon={faSync} /> Retry All Failed
          </button>
        </div>
      </div>

      <div className="omp-stats-grid">
        <StatCard label="TOTAL"     value={counts.total}     accent="total"     icon={faEnvelope}    />
        <StatCard label="DELIVERED" value={counts.delivered} accent="delivered" icon={faCheckCircle} />
        <StatCard label="PENDING"   value={counts.pending}   accent="pending"   icon={faClock}       />
        <StatCard label="FAILED"    value={counts.failed}    accent="failed"    icon={faTimesCircle} />
      </div>

      <div className="omp-search-row">
        <div className="omp-search-box">
          <FontAwesomeIcon icon={faSearch} className="omp-search-icon" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurant, recipient, ID…"
            className="omp-search-input"
          />
          {search && (
            <button onClick={() => setSearch('')} className="omp-search-clear">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="omp-status-select">
          <option value="all">All Status</option>
          <option value="delivered">Delivered</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="retrying">Retrying</option>
        </select>
      </div>

      <div className="omp-tab-row">
        {[
          { key: 'all',       label: 'All',       count: counts.total     },
          { key: 'delivered', label: 'Delivered', count: counts.delivered },
          { key: 'pending',   label: 'Pending',   count: counts.pending   },
          { key: 'failed',    label: 'Failed',    count: counts.failed    },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`omp-tab${filterStatus === tab.key ? ' omp-tab--active' : ''}`}
          >
            {tab.key === 'failed' && <FontAwesomeIcon icon={faExclamationTriangle} className="omp-tab-alert-icon" />}
            {tab.label}
            <span className={`omp-tab-count${filterStatus === tab.key ? ' omp-tab-count--active' : ''}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {selectedRows.length > 0 && (
        <div className="omp-bulk-bar">
          <span className="omp-bulk-label">
            <FontAwesomeIcon icon={faCheckCircle} className="omp-bulk-check-icon" />
            {selectedRows.length} selected
          </span>
          <div className="omp-bulk-actions">
            <button onClick={() => { selectedRows.forEach(handleRetry); setSelectedRows([]); }} className="omp-btn-retry-selected">
              Retry Selected
            </button>
            <button onClick={() => setSelectedRows([])} className="omp-btn-bulk-clear">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      )}

      <div className="omp-table">
        <div className="omp-table-header">
          <input
            type="checkbox"
            checked={selectedRows.length === filtered.length && filtered.length > 0}
            onChange={selectAll}
            className="omp-checkbox"
          />
          {['Restaurant', 'Recipient', 'Message', 'Status', 'Retries', 'Actions'].map((h) => (
            <p key={h} className="omp-table-header-cell">{h}</p>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="omp-table-empty">No messages found</div>
        ) : filtered.map((m, idx) => (
          <div
            key={m.id}
            className="omp-table-row"
            onClick={() => handleRowClick(m)}
          >
            <input
              type="checkbox"
              checked={selectedRows.includes(m.id)}
              onChange={(e) => { e.stopPropagation(); toggleRow(m.id); }}
              className="omp-checkbox"
            />

            <div className="omp-restaurant-cell">
              <div className="omp-restaurant-avatar">
                <FontAwesomeIcon icon={faStore} className="omp-restaurant-avatar-icon" />
              </div>
              <p className="omp-restaurant-name">{m.restaurant}</p>
            </div>

            <p className="omp-recipient-text">{m.recipient}</p>
            <p className="omp-message-text">{m.message}</p>

            <div><Badge type={m.status} label={m.status} /></div>

            <p className={m.retries > 2 ? 'omp-retries-high' : 'omp-retries-normal'}>{m.retries}</p>

            <div className="omp-row-actions">
              {m.status === 'failed' && (
                <button
                  onClick={(e) => handleActionClick(e, () => handleRetry(m.id))}
                  className="omp-action-btn omp-action-btn--retry"
                  title="Retry"
                >
                  <FontAwesomeIcon icon={faSync} />
                </button>
              )}
              <button
                onClick={(e) => handleActionClick(e, () => setSelected(m))}
                className="omp-action-btn"
                title="Details"
              >
                <FontAwesomeIcon icon={faInfoCircle} />
              </button>
              <button
                onClick={(e) => copyId(m.id, e)}
                className="omp-action-btn"
                title="Copy ID"
              >
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