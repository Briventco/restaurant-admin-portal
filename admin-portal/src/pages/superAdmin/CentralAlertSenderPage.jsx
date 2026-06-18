import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleInfo,
  faClock,
  faPlay,
  faPlug,
  faQrcode,
  faSpinner,
  faSync,
  faTriangleExclamation,
  faWifi,
} from '@fortawesome/free-solid-svg-icons';
import adminApi from '../../api/admin';
import { getWhatsappStatusLabel } from '../../utils/whatsappPresentation';

const CENTRAL_SENDER_ID = 'servra_ops_sender';

const chipStyles = {
  connected: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.22)' },
  disconnected: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.22)' },
  qr_required: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.22)' },
  starting: { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.22)' },
  authenticating: { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.22)' },
  not_configured: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.24)' },
};

function timeAgo(iso) {
  if (!iso) return 'Never';
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return 'Never';
  const diffMinutes = Math.floor((Date.now() - ts) / 60000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  return `${Math.floor(diffMinutes / 1440)}d ago`;
}

function Badge({ status, children }) {
  const palette = chipStyles[String(status || '').toLowerCase()] || chipStyles.not_configured;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 9px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        color: palette.color,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: palette.color }} />
      {children}
    </span>
  );
}

function Card({ label, value, hint, icon, accent = '#fff' }) {
  return (
    <div
      style={{
        background: '#0f0f0f',
        border: '1px solid #1e1e1e',
        borderRadius: 14,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
        <FontAwesomeIcon icon={icon} style={{ color: '#333' }} />
      </div>
      <div style={{ margin: 0, fontSize: 20, fontWeight: 700, color: accent, lineHeight: 1.1 }}>{value}</div>
      {hint ? <div style={{ margin: 0, fontSize: 12, color: '#777', lineHeight: 1.5 }}>{hint}</div> : null}
    </div>
  );
}

function QrModal({ open, session, qr, loading, onClose, onRefresh, onStart }) {
  if (!open) return null;

  const qrImageUrl = qr?.qr
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qr.qr)}`
    : '';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.7)', display: 'grid', placeItems: 'center', padding: 16 }}>
      <div style={{ width: 'min(520px, 100%)', background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 16, boxShadow: '0 24px 60px rgba(0,0,0,0.8)', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div>
            <p style={{ margin: 0, color: '#fff', fontSize: 16, fontWeight: 700 }}>
              <FontAwesomeIcon icon={faQrcode} style={{ color: '#f59e0b', marginRight: 8 }} />
              Central sender QR
            </p>
            <p style={{ margin: '6px 0 0', color: '#777', fontSize: 12 }}>
              Scan this once to connect the shared alert account.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#777', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>

        <div style={{ minHeight: 300, display: 'grid', placeItems: 'center', borderRadius: 14, border: '1px solid #1a1a1a', background: '#111', padding: 20, marginBottom: 16 }}>
          {loading ? (
            <div style={{ color: '#777', fontSize: 13 }}>
              <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 8 }} />
              Loading QR...
            </div>
          ) : qrImageUrl ? (
            <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
              <div style={{ width: 280, height: 280, borderRadius: 18, background: '#fff', padding: 14, display: 'grid', placeItems: 'center' }}>
                <img src={qrImageUrl} alt="Central sender WhatsApp QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <p style={{ margin: 0, color: '#8b8b8b', fontSize: 12 }}>
                QR generated {qr?.generatedAt ? new Date(qr.generatedAt).toLocaleTimeString('en-NG') : 'just now'}
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#777', fontSize: 13, lineHeight: 1.6 }}>
              <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 22, marginBottom: 10, color: '#f59e0b' }} />
              <div>No active QR available right now.</div>
              <div style={{ marginTop: 6 }}>Start or restart the session to generate one.</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ color: '#777', fontSize: 12, lineHeight: 1.6 }}>
            {session?.status ? `Status: ${getWhatsappStatusLabel(session.status)}` : 'Shared sender control'}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={onStart} style={{ minHeight: 40, padding: '0 14px', borderRadius: 8, border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faPlay} /> Start
            </button>
            <button onClick={onRefresh} style={{ minHeight: 40, padding: '0 14px', borderRadius: 8, border: '1px solid #252525', background: 'transparent', color: '#d0d0d0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faSync} /> Refresh QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CentralAlertSenderPage() {
  const [session, setSession] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(window.__centralSenderToastTimer);
    window.__centralSenderToastTimer = window.setTimeout(() => setToast(''), 3500);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCentralAlertSenderSession();
      setSession(data);
      setToast('');
    } catch (error) {
      showToast(error.message || 'Failed to load central sender');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const items = await adminApi.getCentralAlertSenderEvents(12);
      setEvents(items);
    } catch (error) {
      showToast(error.message || 'Failed to load events');
    } finally {
      setEventsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
    void loadEvents();
  }, [load, loadEvents]);

  const openQr = useCallback(async () => {
    setQrOpen(true);
    setQrLoading(true);
    try {
      const qr = await adminApi.getCentralAlertSenderQr();
      setQrData(qr);
    } catch (error) {
      setQrData(null);
      showToast(error.message || 'Failed to load QR');
    } finally {
      setQrLoading(false);
    }
  }, [showToast]);

  const handleStart = useCallback(async () => {
    try {
      await adminApi.startCentralAlertSender();
      showToast('Central sender start requested');
      await load();
      await loadEvents();
    } catch (error) {
      showToast(error.message || 'Failed to start central sender');
    }
  }, [load, loadEvents, showToast]);

  const handleRestart = useCallback(async () => {
    try {
      await adminApi.restartCentralAlertSender();
      showToast('Central sender restart requested');
      await load();
      await loadEvents();
    } catch (error) {
      showToast(error.message || 'Failed to restart central sender');
    }
  }, [load, loadEvents, showToast]);

  const handleDisconnect = useCallback(async () => {
    try {
      await adminApi.disconnectCentralAlertSender();
      showToast('Central sender disconnected');
      await load();
      await loadEvents();
    } catch (error) {
      showToast(error.message || 'Failed to disconnect central sender');
    }
  }, [load, loadEvents, showToast]);

  const handleRefreshQr = useCallback(async () => {
    setQrLoading(true);
    try {
      const qr = await adminApi.getCentralAlertSenderQr();
      setQrData(qr);
    } catch (error) {
      setQrData(null);
      showToast(error.message || 'Failed to refresh QR');
    } finally {
      setQrLoading(false);
    }
  }, [showToast]);

  const stats = useMemo(() => {
    const status = String(session?.status || 'disconnected');
    return {
      status,
      lastError: session?.lastError || '',
      qrReady: Boolean(session?.qrAvailable),
      lastConnectedAt: session?.lastConnectedAt || null,
      lastDisconnectedAt: session?.lastDisconnectedAt || null,
      lastActive: session?.lastActive || null,
      provider: session?.provider || 'whatsapp-web',
      senderId: session?.restaurantId || CENTRAL_SENDER_ID,
    };
  }, [session]);

  if (loading && !session) {
    return (
      <div style={{ minHeight: 280, display: 'grid', placeItems: 'center', color: '#777', fontSize: 13 }}>
        <div>
          <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 8 }} />
          Loading central sender...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {toast ? (
        <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 800, background: '#111', border: '1px solid #222', color: '#d0d0d0', padding: '10px 14px', borderRadius: 10, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: 16,
          alignItems: 'stretch',
        }}
      >
        <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Shared sender</p>
              <h2 style={{ margin: 0, color: '#fff', fontSize: 22, letterSpacing: '-0.3px' }}>Central alert account</h2>
              <p style={{ margin: '8px 0 0', color: '#777', fontSize: 12, lineHeight: 1.6, maxWidth: 560 }}>
                This page controls the single WhatsApp session that sends order alerts for every restaurant. It stays separate from the restaurant session monitor so the flow is easier to understand.
              </p>
            </div>
            <Badge status={stats.status}>{getWhatsappStatusLabel(stats.status)}</Badge>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
            <button onClick={handleStart} style={{ minHeight: 40, padding: '0 14px', borderRadius: 8, border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faPlay} /> Start
            </button>
            <button onClick={handleRestart} style={{ minHeight: 40, padding: '0 14px', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faSync} /> Restart
            </button>
            <button onClick={handleDisconnect} style={{ minHeight: 40, padding: '0 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faPlug} /> Disconnect
            </button>
            <button onClick={openQr} style={{ minHeight: 40, padding: '0 14px', borderRadius: 8, border: '1px solid #252525', background: 'transparent', color: '#d0d0d0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faQrcode} /> QR
            </button>
            <button onClick={load} style={{ minHeight: 40, padding: '0 14px', borderRadius: 8, border: '1px solid #252525', background: 'transparent', color: '#d0d0d0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faSync} /> Refresh
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Card label="Sender ID" value={stats.senderId} hint="Shared session owner" icon={faWifi} accent="#fff" />
          <Card label="QR ready" value={stats.qrReady ? 'Yes' : 'No'} hint="If no, open QR" icon={faQrcode} accent={stats.qrReady ? '#22c55e' : '#f59e0b'} />
          <Card label="Last active" value={timeAgo(stats.lastActive)} hint="Recent session activity" icon={faClock} accent="#fff" />
          <Card label="Last error" value={stats.lastError || 'None'} hint="Most recent issue" icon={faTriangleExclamation} accent={stats.lastError ? '#f87171' : '#fff'} />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
        }}
      >
        <Card label="Provider" value={stats.provider} hint="WhatsApp runtime owner" icon={faCircleInfo} accent="#fff" />
        <Card label="Last connected" value={timeAgo(stats.lastConnectedAt)} hint="When the session last came online" icon={faClock} accent="#fff" />
        <Card label="Last disconnected" value={timeAgo(stats.lastDisconnectedAt)} hint="When it last dropped off" icon={faTriangleExclamation} accent="#fff" />
        <Card label="Status" value={getWhatsappStatusLabel(stats.status)} hint="Current connection state" icon={faWifi} accent={stats.status === 'connected' ? '#22c55e' : '#fff'} />
      </div>

      <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent events</p>
            <h3 style={{ margin: '6px 0 0', fontSize: 16, color: '#fff' }}>Latest session activity</h3>
          </div>
          <button onClick={loadEvents} style={{ minHeight: 38, padding: '0 14px', borderRadius: 8, border: '1px solid #252525', background: 'transparent', color: '#d0d0d0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faSync} /> Refresh events
          </button>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {eventsLoading && events.length === 0 ? (
            <div style={{ color: '#777', fontSize: 13 }}>
              <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 8 }} />
              Loading events...
            </div>
          ) : events.length ? (
            events.map((event) => (
              <div key={event.id} style={{ padding: '12px 14px', borderRadius: 12, background: '#111', border: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{String(event.event || 'event').replace(/_/g, ' ')}</div>
                  <div style={{ color: '#777', fontSize: 12, marginTop: 4 }}>
                    {event.severity || 'info'}
                    {event.details && event.details.message ? ` · ${event.details.message}` : ''}
                  </div>
                </div>
                <div style={{ color: '#666', fontSize: 12 }}>{timeAgo(event.createdAt)}</div>
              </div>
            ))
          ) : (
            <div style={{ color: '#777', fontSize: 13 }}>No events yet.</div>
          )}
        </div>
      </div>

      <QrModal
        open={qrOpen}
        session={session}
        qr={qrData}
        loading={qrLoading}
        onClose={() => setQrOpen(false)}
        onRefresh={handleRefreshQr}
        onStart={handleStart}
      />
    </div>
  );
}
