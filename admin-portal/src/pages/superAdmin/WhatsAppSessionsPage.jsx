import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faDownload,
  faInfoCircle,
  faMobileAlt,
  faPlay,
  faPlug,
  faQrcode,
  faSearch,
  faSpinner,
  faSync,
  faTimes,
  faTimesCircle,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import adminApi from '../../api/admin';
import {
  getWhatsappBindingMeta,
  getWhatsappBindingPillStyle,
  getWhatsappStatusLabel,
} from '../../utils/whatsappPresentation';

const STATUS_STYLES = {
  connected: { color: '#25d366', bg: 'rgba(37,211,102,0.1)', border: 'rgba(37,211,102,0.2)' },
  disconnected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  qr_required: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  authenticating: { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)' },
  starting: { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)' },
  not_configured: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.24)' },
};

const EVENT_SEVERITY_STYLES = {
  info: { color: '#93c5fd', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
  warning: { color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  error: { color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
};

const EMPTY_DASH = '—';

function timeAgo(iso) {
  if (!iso) {
    return EMPTY_DASH;
  }

  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) {
    return EMPTY_DASH;
  }

  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return 'just now';
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.floor(hours / 24)}d ago`;
}

function isStale(session) {
  if (!session?.lastActive) {
    return false;
  }

  const timestamp = new Date(session.lastActive).getTime();
  if (Number.isNaN(timestamp)) {
    return false;
  }

  return Date.now() - timestamp > 1000 * 60 * 60 * 6;
}

function needsAttention(session) {
  return Boolean(
    session?.lastError ||
      session?.status === 'qr_required' ||
      session?.status === 'disconnected' ||
      isStale(session)
  );
}

function Badge({ type, label }) {
  const style = STATUS_STYLES[type] || {
    color: '#888',
    bg: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.1)',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 9px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: style.color,
        }}
      />
      {label}
    </span>
  );
}

function StatCard({ label, value, accent, icon, subtext = '' }) {
  return (
    <div
      style={{
        backgroundColor: '#0f0f0f',
        border: '1px solid #1e1e1e',
        borderRadius: '12px',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {label}
        </p>
        <FontAwesomeIcon icon={icon} style={{ color: '#333', fontSize: '13px' }} />
      </div>
      <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: accent, letterSpacing: '-0.5px', lineHeight: 1 }}>
        {value}
      </p>
      {subtext ? <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>{subtext}</p> : null}
    </div>
  );
}

function formatEventLabel(event) {
  return String(event || 'unknown')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatSeverityLabel(severity) {
  return String(severity || 'info')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getEventSeverityStyle(severity) {
  return EVENT_SEVERITY_STYLES[String(severity || 'info').trim().toLowerCase()] || EVENT_SEVERITY_STYLES.info;
}

function EventSection({ title, events, emptyMessage }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p style={{ margin: 0, fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </p>
      {events.length ? (
        events.map((event) => {
          const severityStyle = getEventSeverityStyle(event.severity);
          return (
            <div key={event.id} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #181818', backgroundColor: '#111' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ color: '#f2f2f2', fontSize: '12px', fontWeight: 600 }}>
                    {formatEventLabel(event.event)}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: severityStyle.bg,
                      color: severityStyle.color,
                      border: `1px solid ${severityStyle.border}`,
                    }}
                  >
                    {formatSeverityLabel(event.severity)}
                  </span>
                </div>
                <span style={{ color: '#666', fontSize: '11px' }}>
                  {timeAgo(event.createdAt)}
                </span>
              </div>
              {event.details && Object.keys(event.details).length ? (
                <div style={{ color: '#8b8b8b', fontSize: '11px', lineHeight: 1.6 }}>
                  {Object.entries(event.details).map(([key, value]) => (
                    <div key={key}>
                      <span style={{ color: '#666' }}>{formatEventLabel(key)}:</span> {String(value || EMPTY_DASH)}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })
      ) : (
        <div style={{ color: '#777', fontSize: '12px' }}>{emptyMessage}</div>
      )}
    </div>
  );
}

function DetailModal({ session, events, eventsLoading, onClose }) {
  const attentionEvents = events.filter((event) =>
    ['warning', 'error'].includes(String(event?.severity || '').trim().toLowerCase())
  );
  const activityEvents = events.filter(
    (event) => !['warning', 'error'].includes(String(event?.severity || '').trim().toLowerCase())
  );
  const detailItems = [
    { label: 'Phone', value: session.phone || EMPTY_DASH },
    { label: 'Status', value: <Badge type={session.status} label={getWhatsappStatusLabel(session.status)} /> },
    { label: 'Binding', value: getWhatsappBindingMeta(session.bindingMode).label },
    { label: 'Provider', value: session.provider || 'whatsapp-web' },
    { label: 'Provisioning', value: session.provisioningState || 'unknown' },
    { label: 'Routing', value: session.routingMode || 'unknown' },
    { label: 'Activation ready', value: session.activationReady ? 'Yes' : 'No' },
    { label: 'Last active', value: timeAgo(session.lastActive) },
    { label: 'Last connected', value: timeAgo(session.lastConnectedAt) },
    { label: 'Last disconnected', value: timeAgo(session.lastDisconnectedAt) },
    { label: 'QR available', value: session.qrAvailable ? 'Yes' : 'No' },
    { label: 'Last error', value: session.lastError || 'None' },
    { label: 'Messages sent', value: session.messagesSent ?? EMPTY_DASH },
    { label: 'Messages delivered', value: session.messagesDelivered ?? EMPTY_DASH },
    { label: 'Messages failed', value: session.messagesFailed ?? EMPTY_DASH },
    { label: 'Setup', value: session.setupMessage || 'Configured' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '24px', width: '460px', maxWidth: '90vw', boxShadow: '0 24px 60px rgba(0,0,0,0.8)' }}>
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
          {detailItems.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '10px 0', borderBottom: '1px solid #111' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>{label}</p>
              <div style={{ margin: 0, fontSize: '12px', color: '#fff', fontWeight: 500, textAlign: 'right' }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '18px' }}>
          <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Recent Session Events
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
            {eventsLoading ? (
              <div style={{ color: '#777', fontSize: '12px' }}>
                <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
                Loading events...
              </div>
            ) : (
              <>
                <EventSection
                  title="Needs Attention"
                  events={attentionEvents}
                  emptyMessage="No warning or error events."
                />
                <EventSection
                  title="Recent Activity"
                  events={activityEvents}
                  emptyMessage="No session events yet."
                />
              </>
            )}
          </div>
        </div>

        {session.routingHint ? (
          <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '10px', border: '1px solid #1e1e1e', backgroundColor: '#111', color: '#9a9a9a', fontSize: '12px', lineHeight: 1.6 }}>
            {session.routingHint}
          </div>
        ) : null}

        <button onClick={onClose} style={{ marginTop: '20px', width: '100%', padding: '10px', background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#aaa', fontSize: '13px', cursor: 'pointer' }}>
          Close
        </button>
      </div>
    </div>
  );
}

function QrModal({
  session,
  qr,
  loading,
  onClose,
  onRefresh,
  onStart,
}) {
  const qrImageUrl =
    qr && qr.qr
      ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qr.qr)}`
      : '';

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '24px', width: '460px', maxWidth: '92vw', boxShadow: '0 24px 60px rgba(0,0,0,0.8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }}>
              <FontAwesomeIcon icon={faQrcode} style={{ color: '#f59e0b', marginRight: '8px' }} />
              {session.restaurant} QR
            </p>
            <p style={{ margin: '6px 0 0', color: '#777', fontSize: '12px' }}>
              Help the restaurant reconnect from the super-admin monitor.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div style={{ display: 'grid', placeItems: 'center', minHeight: '280px', borderRadius: '16px', border: '1px solid #1c1c1c', background: '#111', marginBottom: '16px', padding: '20px' }}>
          {loading ? (
            <div style={{ color: '#777', fontSize: '13px' }}>
              <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
              Loading QR...
            </div>
          ) : qrImageUrl ? (
            <div style={{ display: 'grid', gap: '12px', justifyItems: 'center' }}>
              <div style={{ width: '280px', height: '280px', borderRadius: '20px', padding: '14px', background: '#fff', display: 'grid', placeItems: 'center' }}>
                <img src={qrImageUrl} alt={`${session.restaurant} WhatsApp QR`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ color: '#8b8b8b', fontSize: '12px', lineHeight: 1.6, textAlign: 'center' }}>
                QR generated {qr?.generatedAt ? new Date(qr.generatedAt).toLocaleTimeString('en-NG') : 'just now'}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#777', fontSize: '13px', lineHeight: 1.6 }}>
              <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: '22px', marginBottom: '10px', color: '#f59e0b' }} />
              <div>No active QR available right now.</div>
              <div style={{ marginTop: '6px' }}>Start or restart the session to generate a fresh QR.</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ color: '#666', fontSize: '12px', lineHeight: 1.6 }}>
            Ask the restaurant to open WhatsApp, go to Linked Devices, and scan this code.
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={onStart} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: '40px', padding: '0 14px', backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', color: '#60a5fa', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faPlay} /> Start
            </button>
            <button onClick={onRefresh} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: '40px', padding: '0 14px', backgroundColor: 'transparent', border: '1px solid #252525', borderRadius: '8px', color: '#d0d0d0', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faSync} /> Refresh QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhatsAppSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectedEventsLoading, setSelectedEventsLoading] = useState(false);
  const [qrSession, setQrSession] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts((previous) => [...previous, { id, msg, type }]);
    setTimeout(() => setToasts((previous) => previous.filter((toast) => toast.id !== id)), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      addToast('Failed to load sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!autoRefresh) {
      return undefined;
    }

    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const counts = useMemo(() => ({
    total: sessions.length,
    connected: sessions.filter((session) => session.status === 'connected').length,
    disconnected: sessions.filter((session) => session.status === 'disconnected').length,
    pending: sessions.filter((session) => ['pending', 'qr_required', 'authenticating', 'starting'].includes(session.status)).length,
    notConfigured: sessions.filter((session) => session.status === 'not_configured').length,
    qrRequired: sessions.filter((session) => session.status === 'qr_required').length,
    errors: sessions.filter((session) => Boolean(session.lastError)).length,
    stale: sessions.filter((session) => isStale(session)).length,
  }), [sessions]);

  const filtered = useMemo(() => sessions.filter((session) => {
    const searchValue = search.toLowerCase();
    const matchSearch =
      session.restaurant.toLowerCase().includes(searchValue) ||
      String(session.phone || '').toLowerCase().includes(searchValue);

    const matchStatus = (() => {
      if (filterStatus === 'all') {
        return true;
      }
      if (filterStatus === 'error') {
        return Boolean(session.lastError);
      }
      if (filterStatus === 'stale') {
        return isStale(session);
      }
      if (filterStatus === 'pending') {
        return ['pending', 'qr_required', 'authenticating', 'starting'].includes(session.status);
      }
      return session.status === filterStatus;
    })();

    return matchSearch && matchStatus;
  }), [filterStatus, search, sessions]);

  const handleReconnect = async (restaurantId) => {
    try {
      await adminApi.restartSession(restaurantId);
      await load();
      addToast('Session restart requested', 'success');
    } catch (error) {
      addToast(error.message || 'Failed to restart session', 'error');
    }
  };

  const handleDisconnect = async (restaurantId) => {
    try {
      await adminApi.disconnectSession(restaurantId);
      await load();
      addToast('Session disconnected', 'success');
    } catch (error) {
      addToast(error.message || 'Failed to disconnect session', 'error');
    }
  };

  const handleStart = async (restaurantId) => {
    try {
      await adminApi.startSession(restaurantId);
      await load();
      addToast('Session start requested', 'success');
    } catch (error) {
      addToast(error.message || 'Failed to start session', 'error');
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'wa-sessions.json';
    link.click();
    addToast('Exported', 'success');
  };

  const loadSessionEvents = async (restaurantId) => {
    if (!restaurantId) {
      return;
    }

    setSelectedEventsLoading(true);
    try {
      const items = await adminApi.getSessionEvents(restaurantId, 20);
      setSelectedEvents(items);
    } catch (error) {
      setSelectedEvents([]);
      addToast(error.message || 'Failed to load session events', 'error');
    } finally {
      setSelectedEventsLoading(false);
    }
  };

  const loadSessionQr = async (session) => {
    if (!session?.restaurantId) {
      return;
    }

    setQrLoading(true);
    try {
      const qr = await adminApi.getSessionQr(session.restaurantId);
      setQrData(qr);
    } catch (error) {
      setQrData(null);
      addToast(error.message || 'Failed to load QR', 'error');
    } finally {
      setQrLoading(false);
    }
  };

  const openQrModal = async (session) => {
    setQrSession(session);
    setQrData(null);
    await loadSessionQr(session);
  };

  const handleStartFromQr = async () => {
    if (!qrSession?.restaurantId) {
      return;
    }

    try {
      await adminApi.startSession(qrSession.restaurantId);
      addToast('Session start requested', 'success');
      await load();
      await loadSessionQr(qrSession);
    } catch (error) {
      addToast(error.message || 'Failed to start session', 'error');
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '12px', color: '#555', fontSize: '13px' }}>
        <FontAwesomeIcon icon={faSpinner} spin /> Loading sessions...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 14px', borderRadius: '9px', backgroundColor: '#111', border: '1px solid #222', fontSize: '12px', color: toast.type === 'success' ? '#22c55e' : toast.type === 'error' ? '#ef4444' : '#aaa', minWidth: '200px' }}>
            {toast.msg}
            <button onClick={() => setToasts((previous) => previous.filter((entry) => entry.id !== toast.id))} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>System</p>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>WhatsApp Sessions</h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#555' }}>
            {counts.total} sessions · {counts.connected} connected · {counts.qrRequired} waiting for QR · {counts.errors} with errors
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => setAutoRefresh((current) => !current)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: autoRefresh ? '#22c55e' : '#666', fontSize: '12px', cursor: 'pointer' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
        <StatCard label="TOTAL SESSIONS" value={counts.total} accent="#ffffff" icon={faWhatsapp} subtext="All restaurants" />
        <StatCard label="CONNECTED" value={counts.connected} accent="#25d366" icon={faCheckCircle} subtext="Healthy live sessions" />
        <StatCard label="DISCONNECTED" value={counts.disconnected} accent="#ef4444" icon={faTimesCircle} subtext="Needs recovery" />
        <StatCard label="PENDING" value={counts.pending} accent="#f59e0b" icon={faQrcode} subtext="Starting or waiting for QR" />
        <StatCard label="QR REQUIRED" value={counts.qrRequired} accent="#f59e0b" icon={faQrcode} subtext="Waiting on phone scan" />
        <StatCard label="SESSION ERRORS" value={counts.errors} accent="#fb7185" icon={faTriangleExclamation} subtext="Last error recorded" />
        <StatCard label="STALE" value={counts.stale} accent="#facc15" icon={faSync} subtext="No activity in 6h+" />
        <StatCard label="NOT CONFIGURED" value={counts.notConfigured} accent="#94a3b8" icon={faMobileAlt} subtext="Needs WhatsApp setup" />
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '9px', padding: '9px 14px' }}>
          <FontAwesomeIcon icon={faSearch} style={{ color: '#444', fontSize: '12px' }} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search restaurant or phone..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '13px' }} />
          {search ? (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          ) : null}
        </div>

        <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', color: '#aaa', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', outline: 'none' }}>
          <option value="all">All Status</option>
          <option value="connected">Connected</option>
          <option value="disconnected">Disconnected</option>
          <option value="qr_required">QR Required</option>
          <option value="pending">Pending</option>
          <option value="not_configured">Not Configured</option>
          <option value="error">With Errors</option>
          <option value="stale">Stale</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All', count: counts.total },
          { key: 'connected', label: 'Connected', count: counts.connected },
          { key: 'disconnected', label: 'Disconnected', count: counts.disconnected },
          { key: 'qr_required', label: 'QR Required', count: counts.qrRequired },
          { key: 'pending', label: 'Pending', count: counts.pending },
          { key: 'error', label: 'Errors', count: counts.errors },
          { key: 'stale', label: 'Stale', count: counts.stale },
          { key: 'not_configured', label: 'Not Configured', count: counts.notConfigured },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setFilterStatus(tab.key)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: filterStatus === tab.key ? '#1a1a1a' : 'transparent', border: `1px solid ${filterStatus === tab.key ? '#2a2a2a' : 'transparent'}`, borderRadius: '8px', color: filterStatus === tab.key ? '#fff' : '#555', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
            {tab.label}
            <span style={{ padding: '1px 6px', background: '#222', borderRadius: '999px', fontSize: '10px', color: filterStatus === tab.key ? '#fff' : '#666' }}>{tab.count}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', color: '#555', fontSize: '13px' }}>
            No sessions found
          </div>
        ) : filtered.map((session) => (
          <div key={session.id} style={{ backgroundColor: '#0f0f0f', border: `1px solid ${needsAttention(session) ? '#3a2020' : '#1e1e1e'}`, borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '9px', backgroundColor: '#1a1a1a', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FontAwesomeIcon icon={faWhatsapp} style={{ color: '#25d366', fontSize: '16px' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{session.restaurant}</span>
                  <Badge type={session.status} label={getWhatsappStatusLabel(session.status)} />
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '3px 9px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      ...getWhatsappBindingPillStyle(getWhatsappBindingMeta(session.bindingMode).tone),
                    }}
                  >
                    {getWhatsappBindingMeta(session.bindingMode).label}
                  </span>
                  {session.qrAvailable ? <Badge type="qr_required" label="QR ready" /> : null}
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: '#555', flexWrap: 'wrap' }}>
                  <span><FontAwesomeIcon icon={faMobileAlt} style={{ marginRight: '4px' }} />{session.phone || EMPTY_DASH}</span>
                  <span>Last active: {timeAgo(session.lastActive)}</span>
                  <span>Messages failed: {session.messagesFailed ?? 0}</span>
                  {session.lastError ? <span style={{ color: '#f87171' }}>Error: {session.lastError}</span> : null}
                  {session.setupMessage ? <span>{session.setupMessage}</span> : null}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {(session.status === 'disconnected' || session.status === 'qr_required') ? (
                <button onClick={() => handleStart(session.restaurantId)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '7px', color: '#60a5fa', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                  <FontAwesomeIcon icon={faPlay} /> Start
                </button>
              ) : null}
              {session.status !== 'connected' && session.status !== 'not_configured' ? (
                <button onClick={() => handleReconnect(session.restaurantId)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '7px', color: '#22c55e', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                  <FontAwesomeIcon icon={faSync} /> Reconnect
                </button>
              ) : null}
              {session.status === 'connected' ? (
                <button onClick={() => handleDisconnect(session.restaurantId)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '7px', color: '#ef4444', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                  <FontAwesomeIcon icon={faPlug} /> Disconnect
                </button>
              ) : null}
              {session.status === 'not_configured' ? (
                <span style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid rgba(148,163,184,0.22)', color: '#94a3b8', fontSize: '12px' }}>
                  Setup needed
                </span>
              ) : null}
              <button onClick={() => openQrModal(session)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '7px', color: '#555', fontSize: '12px', cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faQrcode} />
              </button>
              <button onClick={() => {
                setSelected(session);
                setSelectedEvents([]);
                void loadSessionEvents(session.restaurantId);
              }} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '7px', color: '#555', fontSize: '12px', cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faInfoCircle} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected ? (
        <DetailModal
          session={selected}
          events={selectedEvents}
          eventsLoading={selectedEventsLoading}
          onClose={() => {
            setSelected(null);
            setSelectedEvents([]);
          }}
        />
      ) : null}
      {qrSession ? (
        <QrModal
          session={qrSession}
          qr={qrData}
          loading={qrLoading}
          onClose={() => {
            setQrSession(null);
            setQrData(null);
          }}
          onRefresh={() => loadSessionQr(qrSession)}
          onStart={handleStartFromQr}
        />
      ) : null}
    </div>
  );
}
