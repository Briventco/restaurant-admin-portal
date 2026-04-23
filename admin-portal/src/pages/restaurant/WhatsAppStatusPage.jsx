import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faCircleInfo,
  faMobileAlt,
  faPlugCircleCheck,
  faQrcode,
  faRotate,
  faSave,
  faSpinner,
  faTrashCan,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import whatsappApi from '../../api/whatsapp';
import {
  getWhatsappBindingMeta,
  getWhatsappBindingPillStyle,
  getWhatsappProvisioningMeta,
  getWhatsappStatusLabel,
} from '../../utils/whatsappPresentation';

const badgeStyles = {
  connected: { color: '#25d366', bg: 'rgba(37,211,102,0.1)', border: 'rgba(37,211,102,0.2)' },
  disconnected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  not_configured: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.24)' },
};

const defaultForm = {
  provider: 'whatsapp-web',
  configured: false,
  provisioningState: 'unassigned',
  phone: '',
  phoneNumberId: '',
  wabaId: '',
  notes: '',
};

function Badge({ type, label }) {
  const style = badgeStyles[type?.toLowerCase()] || {
    color: '#888',
    bg: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.1)',
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: 600,
      backgroundColor: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: style.color }} />
      {label || type}
    </span>
  );
}

function StatCard({ label, value, accent, icon, subtext }) {
  return (
    <div
      style={{
        backgroundColor: '#0f0f0f',
        border: '1px solid #1e1e1e',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: '#5f5f5f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </p>
        <FontAwesomeIcon icon={icon} style={{ color: '#333', fontSize: '13px' }} />
      </div>
      <div style={{ color: accent, fontSize: '22px', fontWeight: 700, lineHeight: 1.05 }}>
        {value}
      </div>
      {subtext ? <p style={{ margin: 0, color: '#6f6f6f', fontSize: '12px' }}>{subtext}</p> : null}
    </div>
  );
}

function WhatsAppStatusPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [sessionStatus, setSessionStatus] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionBusy, setSessionBusy] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [sessionRateLimitedUntil, setSessionRateLimitedUntil] = useState(0);

  const restaurantId = user?.restaurantId || '';
  const bindingMeta = getWhatsappBindingMeta(status?.bindingMode);
  const bindingStyle = getWhatsappBindingPillStyle(bindingMeta.tone);
  const provisioningMeta = getWhatsappProvisioningMeta(status?.provisioningState);
  const provisioningStyle = getWhatsappBindingPillStyle(provisioningMeta.tone);
  const provisioningTransitions = Array.isArray(status?.provisioningTransitions) ? status.provisioningTransitions : [];
  const isWebjsMode = useMemo(() => {
    const provider = String(form.provider || status?.provider || '').toLowerCase();
    return provider === 'whatsapp-web' || provider === 'webjs';
  }, [form.provider, status?.provider]);
  const detailRows = useMemo(() => {
    const rows = [
      ['Provider', isWebjsMode ? 'WhatsApp Web Runtime' : status?.provider || 'Not set'],
      ['Provisioning', provisioningMeta.label],
      ['Phone', status?.phone || 'Not assigned'],
    ];

    if (!isWebjsMode) {
      rows.push(
        ['Phone Number ID', status?.phoneNumberId || 'Not set'],
        ['WABA ID', status?.wabaId || 'Not set']
      );
    }

    return rows;
  }, [
    isWebjsMode,
    provisioningMeta.label,
    status?.phone,
    status?.phoneNumberId,
    status?.provider,
    status?.wabaId,
  ]);

  const canTriggerSessionActions = useMemo(
    () => Boolean(status?.configured && status?.status !== 'not_configured'),
    [status]
  );
  const sessionPollingPaused = sessionRateLimitedUntil > Date.now();

  function markSessionRateLimited() {
    setSessionRateLimitedUntil(Date.now() + 60000);
  }

  async function loadSessionState({ silent = false } = {}) {
    if (!restaurantId) {
      return;
    }

    if (sessionRateLimitedUntil > Date.now()) {
      return;
    }

    if (!silent) {
      setSessionLoading(true);
    }

    try {
      const session = await whatsappApi.getSessionStatus(restaurantId);
      setSessionStatus(session);

      if (session.qrAvailable) {
        try {
          const qr = await whatsappApi.getQr(restaurantId);
          setQrData(qr);
        } catch {
          setQrData(null);
        }
      } else {
        setQrData(null);
      }
    } catch (requestError) {
      if (requestError?.status === 429) {
        markSessionRateLimited();
        if (!silent) {
          setError('WhatsApp session is being rate-limited right now. Auto-refresh is paused for 1 minute.');
        }
        return;
      }

      if (!silent) {
        setError(requestError.message || 'Failed to load WhatsApp session.');
      }
    } finally {
      if (!silent) {
        setSessionLoading(false);
      }
    }
  }

  async function load() {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await whatsappApi.getStatus(restaurantId);
      setStatus(data);
      setForm({
        provider: data.provider || 'whatsapp-web',
        configured: Boolean(data.configured),
        provisioningState: data.provisioningState || 'unassigned',
        phone: data.phone || '',
        phoneNumberId: data.phoneNumberId || '',
        wabaId: data.wabaId || '',
        notes: data.notes || '',
      });

      if (data.configured) {
        try {
          const session = await whatsappApi.getSessionStatus(restaurantId);
          setSessionStatus(session);

          if (session.qrAvailable) {
            try {
              const qr = await whatsappApi.getQr(restaurantId);
              setQrData(qr);
            } catch {
              setQrData(null);
            }
          } else {
            setQrData(null);
          }
        } catch (requestError) {
          if (requestError?.status === 429) {
            markSessionRateLimited();
            setError('WhatsApp session is being rate-limited right now. Auto-refresh is paused for 1 minute.');
          } else {
            throw requestError;
          }
        }
      } else {
        setSessionStatus(null);
        setQrData(null);
      }
    } catch (requestError) {
      setError(requestError.message || 'Failed to load WhatsApp status.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) {
      return undefined;
    }

    if (!canTriggerSessionActions || sessionPollingPaused) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      if (!sessionBusy && !sessionLoading) {
        loadSessionState({ silent: true });
      }
    }, 15000);

    return () => window.clearInterval(interval);
  }, [restaurantId, canTriggerSessionActions, sessionPollingPaused, sessionBusy, sessionLoading]);

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setSaved(false);
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const updated = await whatsappApi.updateConfig(restaurantId, form);
      setStatus(updated);
      setForm({
        provider: updated.provider || form.provider,
        configured: Boolean(updated.configured),
        provisioningState: updated.provisioningState || form.provisioningState,
        phone: updated.phone || '',
        phoneNumberId: updated.phoneNumberId || '',
        wabaId: updated.wabaId || '',
        notes: updated.notes || '',
      });
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message || 'Failed to save WhatsApp config.');
    } finally {
      setSaving(false);
    }
  }

  async function handleClearConfig() {
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const updated = await whatsappApi.updateConfig(restaurantId, {
        provider: '',
        configured: false,
        provisioningState: 'unassigned',
        phone: '',
        phoneNumberId: '',
        wabaId: '',
        notes: '',
      });
      setStatus(updated);
      setForm(defaultForm);
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message || 'Failed to clear WhatsApp config.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAdvanceProvisioning(targetState) {
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const updated = await whatsappApi.updateConfig(restaurantId, {
        ...form,
        configured: true,
        provisioningState: targetState,
      });
      setStatus(updated);
      setForm((previous) => ({
        ...previous,
        configured: Boolean(updated.configured),
        provisioningState: updated.provisioningState || targetState,
        provider: updated.provider || previous.provider,
        phone: updated.phone || previous.phone,
        phoneNumberId: updated.phoneNumberId || previous.phoneNumberId,
        wabaId: updated.wabaId || previous.wabaId,
        notes: updated.notes || previous.notes,
      }));
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message || 'Failed to advance WhatsApp provisioning.');
    } finally {
      setSaving(false);
    }
  }

  async function runSessionAction(action) {
    if (!restaurantId) {
      return;
    }

    setSessionBusy(true);
    setError('');

    try {
      let nextSession = null;
      if (action === 'start') {
        nextSession = await whatsappApi.startSession(restaurantId);
      } else if (action === 'restart') {
        nextSession = await whatsappApi.restartSession(restaurantId);
      } else if (action === 'disconnect') {
        nextSession = await whatsappApi.disconnectSession(
          restaurantId,
          'manual_disconnect_from_portal'
        );
      } else if (action === 'refresh') {
        await loadSessionState();
        return;
      }

      if (nextSession) {
        setSessionStatus(nextSession);
        if (nextSession.qrAvailable) {
          try {
            const qr = await whatsappApi.getQr(restaurantId);
            setQrData(qr);
          } catch {
            setQrData(null);
          }
        } else {
          setQrData(null);
        }
      }
    } catch (requestError) {
      setError(requestError.message || 'Failed to update WhatsApp session.');
    } finally {
      setSessionBusy(false);
    }
  }

  const sessionBadgeType = String(sessionStatus?.status || 'disconnected').toLowerCase();
  const qrPreviewUrl =
    qrData && qrData.qr
      ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrData.qr)}`
      : '';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '12px', color: '#666', fontSize: '13px' }}>
        <FontAwesomeIcon icon={faSpinner} spin />
        Loading WhatsApp configuration...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.2fr) minmax(300px, 0.8fr)',
        gap: '18px',
      }}>
        <div style={{
          background: 'radial-gradient(circle at top left, rgba(37,211,102,0.08), transparent 32%), #0f0f0f',
          border: '1px solid #1e1e1e',
          borderRadius: '20px',
          padding: '28px',
        }}>
          <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Restaurant WhatsApp
          </p>
          <h1 style={{ margin: 0, fontSize: '42px', lineHeight: 0.98, letterSpacing: '-0.06em', color: '#fff' }}>
            Give this restaurant its own line.
          </h1>
          <p style={{ maxWidth: '640px', margin: '14px 0 0', fontSize: '15px', lineHeight: 1.7, color: '#989898' }}>
            Connect the restaurant&apos;s own WhatsApp and keep its session healthy. We&apos;re using the WhatsApp Web runtime for now so the setup stays simple and affordable during the pilot stage.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '22px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '999px', border: '1px solid #242424', color: '#d4d4d4', fontSize: '12px', fontWeight: 600 }}>
              <FontAwesomeIcon icon={faWhatsapp} />
              {restaurantId || 'restaurant'}
            </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '999px', border: '1px solid #242424', color: '#d4d4d4', fontSize: '12px', fontWeight: 600 }}>
                <FontAwesomeIcon icon={faPlugCircleCheck} />
              {isWebjsMode ? 'whatsapp-web runtime' : status?.provider || 'provider not set'}
              </span>
            </div>
        </div>

        <div style={{
          backgroundColor: '#0f0f0f',
          border: '1px solid #1e1e1e',
          borderRadius: '20px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              display: 'grid',
              placeItems: 'center',
              backgroundColor: 'rgba(37,211,102,0.08)',
              border: '1px solid rgba(37,211,102,0.16)',
              color: '#25d366',
            }}>
              <FontAwesomeIcon icon={faCircleInfo} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>Current state</h2>
              <p style={{ margin: '4px 0 0', color: '#8d8d8d', fontSize: '13px', lineHeight: 1.6 }}>
                {status?.setupMessage || 'This restaurant already has a usable WhatsApp setup.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <Badge type={status?.status} label={getWhatsappStatusLabel(status?.status)} />
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              ...bindingStyle,
            }}>
              {bindingMeta.label}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              ...provisioningStyle,
            }}>
              {provisioningMeta.label}
            </span>
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {detailRows.map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid #181818', fontSize: '12px' }}>
                <span style={{ color: '#666' }}>{label}</span>
                <span style={{ color: '#f1f1f1', textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
              </div>
            ))}
          </div>
          {provisioningTransitions.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {provisioningTransitions.map((transition) => (
                <button
                  key={transition.targetState}
                  type="button"
                  onClick={() => handleAdvanceProvisioning(transition.targetState)}
                  disabled={saving}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '999px',
                    border: '1px solid #252525',
                    background: '#141414',
                    color: '#e8e8e8',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  Move to {transition.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 0.8fr)',
          gap: '18px',
        }}>
          <div style={{
            backgroundColor: '#0f0f0f',
            border: '1px solid #1e1e1e',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', letterSpacing: '-0.04em', color: '#fff' }}>
                WhatsApp Web session
              </h2>
              <p style={{ margin: '6px 0 0', color: '#8b8b8b', fontSize: '13px', lineHeight: 1.6 }}>
                Connect this restaurant’s own WhatsApp by starting a session and scanning the QR code. This is the low-cost startup path even if old Meta config still exists on the tenant.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <Badge type={sessionBadgeType} label={getWhatsappStatusLabel(sessionStatus?.status)} />
              {sessionStatus?.phoneNumber ? (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  border: '1px solid #252525',
                  color: '#d5d5d5',
                }}>
                  {sessionStatus.phoneNumber}
                </span>
              ) : null}
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
              {[
                ['Session status', getWhatsappStatusLabel(sessionStatus?.status)],
                ['QR available', sessionStatus?.qrAvailable ? 'Yes' : 'No'],
                ['Last connected', sessionStatus?.lastConnectedAt ? new Date(sessionStatus.lastConnectedAt).toLocaleString('en-NG') : '-'],
                ['Last error', sessionStatus?.lastError || 'None'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid #181818', fontSize: '12px' }}>
                  <span style={{ color: '#666' }}>{label}</span>
                  <span style={{ color: '#f1f1f1', textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                onClick={() => runSessionAction('start')}
                disabled={sessionBusy || sessionLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  minHeight: '44px',
                  padding: '0 16px',
                  borderRadius: '14px',
                  border: '1px solid transparent',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#04130a',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: sessionBusy ? 'not-allowed' : 'pointer',
                }}
              >
                <FontAwesomeIcon icon={sessionBusy ? faSpinner : faPlugCircleCheck} spin={sessionBusy} />
                Start session
              </button>
              <button
                type="button"
                onClick={() => runSessionAction('restart')}
                disabled={sessionBusy || sessionLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  minHeight: '44px',
                  padding: '0 16px',
                  borderRadius: '14px',
                  border: '1px solid #252525',
                  background: 'transparent',
                  color: '#d0d0d0',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: sessionBusy ? 'not-allowed' : 'pointer',
                }}
              >
                <FontAwesomeIcon icon={faRotate} />
                Restart
              </button>
              <button
                type="button"
                onClick={() => runSessionAction('disconnect')}
                disabled={sessionBusy || sessionLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  minHeight: '44px',
                  padding: '0 16px',
                  borderRadius: '14px',
                  border: '1px solid #252525',
                  background: 'transparent',
                  color: '#d0d0d0',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: sessionBusy ? 'not-allowed' : 'pointer',
                }}
              >
                <FontAwesomeIcon icon={faTrashCan} />
                Disconnect
              </button>
            </div>
          </div>

          <aside
            style={{
              backgroundColor: '#0f0f0f',
              border: '1px solid #1e1e1e',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <div style={{ alignSelf: 'stretch' }}>
              <h2 style={{ margin: 0, fontSize: '22px', letterSpacing: '-0.04em', color: '#fff' }}>
                Scan QR to connect
              </h2>
              <p style={{ margin: '6px 0 0', color: '#8b8b8b', fontSize: '13px', lineHeight: 1.6 }}>
                Open WhatsApp on the restaurant phone, use Linked Devices, and scan the QR below.
              </p>
            </div>

            {sessionLoading ? (
              <div style={{ color: '#777', fontSize: '13px', padding: '30px 0' }}>
                <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
                Checking session...
              </div>
            ) : qrPreviewUrl ? (
              <>
                <div style={{
                  width: '280px',
                  height: '280px',
                  borderRadius: '20px',
                  padding: '14px',
                  background: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                }}>
                  <img
                    src={qrPreviewUrl}
                    alt="WhatsApp QR"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ color: '#8b8b8b', fontSize: '12px', lineHeight: 1.6, textAlign: 'center' }}>
                  QR generated {qrData?.generatedAt ? new Date(qrData.generatedAt).toLocaleTimeString('en-NG') : 'just now'}
                </div>
              </>
            ) : (
              <div style={{
                width: '100%',
                minHeight: '220px',
                borderRadius: '18px',
                border: '1px dashed #2b2b2b',
                background: 'rgba(255,255,255,0.02)',
                display: 'grid',
                placeItems: 'center',
                color: '#7f7f7f',
                fontSize: '13px',
                textAlign: 'center',
                padding: '20px',
              }}>
                <div>
                  <FontAwesomeIcon icon={faQrcode} style={{ fontSize: '28px', marginBottom: '10px', color: '#444' }} />
                  <div>No QR available yet.</div>
                  <div style={{ marginTop: '6px' }}>Start or restart the session to generate one.</div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => runSessionAction('refresh')}
              disabled={sessionBusy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minHeight: '44px',
                padding: '0 16px',
                borderRadius: '14px',
                border: '1px solid #252525',
                background: 'transparent',
                color: '#d0d0d0',
                fontSize: '14px',
                fontWeight: 700,
                cursor: sessionBusy ? 'not-allowed' : 'pointer',
              }}
            >
              <FontAwesomeIcon icon={faRotate} />
              Refresh QR / status
            </button>
          </aside>
        </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px' }}>
        <StatCard label="Status" value={<Badge type={status?.status} label={getWhatsappStatusLabel(status?.status)} />} accent="#fff" icon={faWhatsapp} subtext="Resolved live from backend" />
        <StatCard label="Runtime" value={isWebjsMode ? 'WhatsApp Web' : status?.provider || 'Not set'} accent="#3b82f6" icon={faMobileAlt} subtext="Current connection path" />
        <StatCard label="Binding" value={bindingMeta.label} accent="#22c55e" icon={faCheckCircle} subtext={bindingMeta.description} />
        <StatCard label="Provisioning" value={provisioningMeta.label} accent="#f59e0b" icon={faPlugCircleCheck} subtext={provisioningMeta.description} />
      </section>

      {error ? (
        <div style={{
          padding: '14px 16px',
          borderRadius: '14px',
          border: '1px solid rgba(239,68,68,0.24)',
          backgroundColor: 'rgba(239,68,68,0.08)',
          color: '#f87171',
          fontSize: '13px',
          lineHeight: 1.6,
        }}>
          <FontAwesomeIcon icon={faTriangleExclamation} style={{ marginRight: '8px' }} />
          {error}
        </div>
      ) : null}

      {saved ? (
        <div style={{
          padding: '14px 16px',
          borderRadius: '14px',
          border: '1px solid rgba(34,197,94,0.24)',
          backgroundColor: 'rgba(34,197,94,0.08)',
          color: '#4ade80',
          fontSize: '13px',
          lineHeight: 1.6,
        }}>
          WhatsApp configuration saved successfully.
        </div>
      ) : null}

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 0.8fr)',
        gap: '18px',
      }}>
        <form
          onSubmit={handleSave}
          style={{
            backgroundColor: '#0f0f0f',
            border: '1px solid #1e1e1e',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', letterSpacing: '-0.04em', color: '#fff' }}>WhatsApp config</h2>
              <p style={{ margin: '6px 0 0', color: '#8b8b8b', fontSize: '13px', lineHeight: 1.6 }}>
                Save the restaurant&apos;s WhatsApp identity and a few internal notes. We&apos;re intentionally hiding the old Meta-specific setup here so the page stays focused on the live Web JS flow.
              </p>
            </div>
            <span style={{ padding: '9px 12px', borderRadius: '14px', border: '1px solid #242424', color: '#d6d6d6', fontSize: '12px', fontWeight: 600 }}>
              tenant scoped
            </span>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px 18px', borderRadius: '16px', border: '1px solid #222', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <input
              type="checkbox"
              checked={form.configured}
              onChange={(event) => updateField('configured', event.target.checked)}
              style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: '#22c55e' }}
            />
              <div>
                <strong style={{ display: 'block', color: '#f3f3f3', fontSize: '13px' }}>This restaurant has a dedicated WhatsApp setup</strong>
                <span style={{ display: 'block', marginTop: '4px', color: '#888', fontSize: '12px', lineHeight: 1.5 }}>
                  Leave this on once the restaurant should be treated as its own connected WhatsApp tenant instead of a shared fallback.
                </span>
              </div>
            </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#7a7a7a' }}>Provider</span>
              <div
                style={{
                  width: '100%',
                  border: '1px solid #232323',
                  borderRadius: '14px',
                  background: '#131313',
                  color: '#f8f8f8',
                  padding: '14px 16px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              >
                WhatsApp Web Runtime
              </div>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#7a7a7a' }}>Display phone</span>
              <input
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder="+234..."
                style={{
                  width: '100%',
                  border: '1px solid #232323',
                  borderRadius: '14px',
                  background: '#131313',
                  color: '#f8f8f8',
                  padding: '14px 16px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#7a7a7a' }}>Provisioning state</span>
              <select
                value={form.provisioningState}
                onChange={(event) => updateField('provisioningState', event.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #232323',
                  borderRadius: '14px',
                  background: '#131313',
                  color: '#f8f8f8',
                  padding: '14px 16px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              >
                <option value="unassigned">Unassigned</option>
                <option value="reserved">Number Reserved</option>
                <option value="connecting">Connecting</option>
                <option value="verified">Verified</option>
                <option value="active">Active</option>
                <option value="failed">Failed</option>
              </select>
            </label>

            {!isWebjsMode ? (
              <>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#7a7a7a' }}>Phone Number ID</span>
                  <input
                    value={form.phoneNumberId}
                    onChange={(event) => updateField('phoneNumberId', event.target.value)}
                    placeholder="Meta phone number id"
                    style={{
                      width: '100%',
                      border: '1px solid #232323',
                      borderRadius: '14px',
                      background: '#131313',
                      color: '#f8f8f8',
                      padding: '14px 16px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#7a7a7a' }}>WABA ID</span>
                  <input
                    value={form.wabaId}
                    onChange={(event) => updateField('wabaId', event.target.value)}
                    placeholder="Meta WABA id"
                    style={{
                      width: '100%',
                      border: '1px solid #232323',
                      borderRadius: '14px',
                      background: '#131313',
                      color: '#f8f8f8',
                      padding: '14px 16px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </label>
              </>
            ) : null}
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#7a7a7a' }}>Setup notes</span>
            <textarea
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="Optional notes about this restaurant's WhatsApp setup"
              style={{
                minHeight: '110px',
                resize: 'vertical',
                border: '1px solid #232323',
                borderRadius: '14px',
                background: '#131313',
                color: '#f8f8f8',
                padding: '14px 16px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </label>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ color: '#777', fontSize: '12px' }}>
              Save the display phone and notes here, then manage the real connection from the Web session panel above.
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleClearConfig}
                disabled={saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  minHeight: '46px',
                  padding: '0 16px',
                  borderRadius: '14px',
                  border: '1px solid #252525',
                  background: 'transparent',
                  color: '#d0d0d0',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                <FontAwesomeIcon icon={faTrashCan} />
                Clear config
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  minHeight: '46px',
                  padding: '0 18px',
                  borderRadius: '14px',
                  border: '1px solid transparent',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#04130a',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                <FontAwesomeIcon icon={saving ? faSpinner : faSave} spin={saving} />
                {saving ? 'Saving...' : 'Save connection settings'}
              </button>
            </div>
          </div>
        </form>

        <aside
          style={{
            backgroundColor: '#0f0f0f',
            border: '1px solid #1e1e1e',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', letterSpacing: '-0.04em', color: '#fff' }}>How this works</h2>
            <p style={{ margin: '6px 0 0', color: '#8b8b8b', fontSize: '13px', lineHeight: 1.6 }}>
              This page is now centered on the Web JS rollout path, so the restaurant team can connect one WhatsApp number, keep it healthy, and recover quickly if the session drops.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {[ 
              ['Connect once', 'Start the session, scan the QR, and wait for the status to turn connected before testing customer messages.'],
              ['Reconnect fast', 'If the phone logs out or the browser session breaks, use Restart to generate a fresh QR and link again.'],
              ['Keep it restaurant-owned', 'Each restaurant should connect its own WhatsApp so customer chats and order updates stay isolated to that business.'],
            ].map(([title, copy]) => (
              <div key={title} style={{ padding: '16px 18px', borderRadius: '16px', border: '1px solid #1f1f1f', background: 'rgba(255,255,255,0.02)' }}>
                <strong style={{ display: 'block', color: '#f2f2f2', fontSize: '13px', marginBottom: '6px' }}>{title}</strong>
                <span style={{ color: '#8b8b8b', fontSize: '12px', lineHeight: 1.6 }}>{copy}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: '16px 18px', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.22)', background: 'rgba(245,158,11,0.06)', color: '#fbbf24', fontSize: '12px', lineHeight: 1.6 }}>
            We&apos;re keeping the old Meta path in the codebase for future use, but this screen is intentionally focused on the Web JS pilot flow so the restaurant team doesn&apos;t have to think about both systems at once.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={load}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minHeight: '44px',
                padding: '0 16px',
                borderRadius: '14px',
                border: '1px solid #252525',
                background: 'transparent',
                color: '#d0d0d0',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <FontAwesomeIcon icon={faRotate} />
              Refresh status
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default WhatsAppStatusPage;
