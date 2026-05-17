import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleInfo,
  faPlugCircleCheck,
  faQrcode,
  faRotate,
  faSpinner,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import whatsappApi from '../../api/whatsapp';
import {
  getWhatsappStatusLabel,
} from '../../utils/whatsappPresentation';
import './WhatsAppStatusPage.css';

function Badge({ type, label }) {
  return (
    <span className={`badge badge--${(type || '').toLowerCase()}`}>
      <span className="badge__dot" />
      {label || type}
    </span>
  );
}

function WhatsAppStatusPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionStatus, setSessionStatus] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionBusy, setSessionBusy] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [sessionUiActivated, setSessionUiActivated] = useState(false);
  const [sessionRateLimitedUntil, setSessionRateLimitedUntil] = useState(0);

  const restaurantId = user?.restaurantId || '';
  const detailRows = useMemo(() => {
    return [
      ['Provider', 'WhatsApp Web Runtime'],
      ['Phone', status?.phone || 'Not assigned'],
    ];
  }, [status?.phone]);

  const canTriggerSessionActions = useMemo(
    () => Boolean(status?.configured && status?.status !== 'not_configured'),
    [status]
  );
  const sessionPollingPaused = sessionRateLimitedUntil > Date.now();

  function markSessionRateLimited() {
    setSessionRateLimitedUntil(Date.now() + 60000);
  }

  async function loadSessionState({ silent = false } = {}) {
    if (!restaurantId) return;
    if (!sessionUiActivated) return;
    if (sessionRateLimitedUntil > Date.now()) return;

    if (!silent) setSessionLoading(true);

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
      if (!silent) setSessionLoading(false);
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

      if (data.configured && sessionUiActivated) {
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
    setSessionUiActivated(false);
    setSessionStatus(null);
    setQrData(null);
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) return undefined;
    if (!sessionUiActivated) return undefined;
    if (!canTriggerSessionActions || sessionPollingPaused) return undefined;

    const interval = window.setInterval(() => {
      if (!sessionBusy && !sessionLoading) {
        loadSessionState({ silent: true });
      }
    }, 15000);

    return () => window.clearInterval(interval);
  }, [restaurantId, canTriggerSessionActions, sessionPollingPaused, sessionBusy, sessionLoading, sessionUiActivated]);

  async function runSessionAction(action) {
    if (!restaurantId) return;
    setSessionUiActivated(true);

    setSessionBusy(true);
    setError('');

    try {
      let nextSession = null;
      if (action === 'start') {
        nextSession = await whatsappApi.startSession(restaurantId);
      } else if (action === 'restart') {
        nextSession = await whatsappApi.restartSession(restaurantId);
      } else if (action === 'disconnect') {
        nextSession = await whatsappApi.disconnectSession(restaurantId, 'manual_disconnect_from_portal');
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
      <div className="whatsapp-loading">
        <FontAwesomeIcon icon={faSpinner} spin />
        Loading WhatsApp configuration...
      </div>
    );
  }

  return (
    <div className="whatsapp-page">
      <section className="whatsapp-hero-section">
        <div className="whatsapp-hero-card">
          <p className="whatsapp-hero-eyebrow">Restaurant WhatsApp</p>
          <h1 className="whatsapp-hero-title">Give this restaurant its own line.</h1>
          <p className="whatsapp-hero-description">
            Connect the restaurant's own WhatsApp and keep the session healthy.
          </p>
          <div className="whatsapp-hero-tags">
            <span className="whatsapp-tag">
              <FontAwesomeIcon icon={faWhatsapp} />
              {restaurantId || 'restaurant'}
            </span>
            <span className="whatsapp-tag">
              <FontAwesomeIcon icon={faPlugCircleCheck} />
              whatsapp-web runtime
            </span>
          </div>
        </div>

        <div className="whatsapp-state-card">
          <div className="whatsapp-state-card__header">
            <div className="whatsapp-state-card__icon">
              <FontAwesomeIcon icon={faCircleInfo} />
            </div>
            <div>
              <h2 className="whatsapp-state-card__title">Current state</h2>
              <p className="whatsapp-state-card__message">
                {status?.setupMessage || 'This restaurant already has a usable WhatsApp setup.'}
              </p>
            </div>
          </div>

          <div className="whatsapp-state-card__badges">
            <Badge type={status?.status} label={getWhatsappStatusLabel(status?.status)} />
          </div>

          <div className="whatsapp-detail-rows">
            {detailRows.map(([label, value]) => (
              <div key={label} className="whatsapp-detail-row">
                <span className="whatsapp-detail-row__label">{label}</span>
                <span className="whatsapp-detail-row__value">{value}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      <section className="whatsapp-session-section">
        <div className="whatsapp-session-card">
          <div>
            <h2 className="whatsapp-section-title">WhatsApp Web session</h2>
            <p className="whatsapp-section-description">
              Connect this restaurant's WhatsApp by starting a session and scanning the QR code.
            </p>
          </div>

          <div className="whatsapp-session-badges">
            <Badge type={sessionBadgeType} label={getWhatsappStatusLabel(sessionStatus?.status)} />
            {sessionStatus?.phoneNumber && (
              <span className="whatsapp-phone-tag">{sessionStatus.phoneNumber}</span>
            )}
          </div>

          <div className="whatsapp-detail-rows">
            {[
              ['Session status', getWhatsappStatusLabel(sessionStatus?.status)],
              ['QR available', sessionStatus?.qrAvailable ? 'Yes' : 'No'],
              ['Last connected', sessionStatus?.lastConnectedAt ? new Date(sessionStatus.lastConnectedAt).toLocaleString('en-NG') : '-'],
              ['Last error', sessionStatus?.lastError || 'None'],
            ].map(([label, value]) => (
              <div key={label} className="whatsapp-detail-row">
                <span className="whatsapp-detail-row__label">{label}</span>
                <span className="whatsapp-detail-row__value">{value}</span>
              </div>
            ))}
          </div>

          <div className="whatsapp-session-actions">
            <button
              type="button"
              onClick={() => runSessionAction('start')}
              disabled={sessionBusy || sessionLoading}
              className="whatsapp-btn whatsapp-btn--primary"
            >
              <FontAwesomeIcon icon={sessionBusy ? faSpinner : faPlugCircleCheck} spin={sessionBusy} />
              Start session
            </button>
            <button
              type="button"
              onClick={() => runSessionAction('restart')}
              disabled={sessionBusy || sessionLoading}
              className="whatsapp-btn whatsapp-btn--secondary"
            >
              <FontAwesomeIcon icon={faRotate} />
              Restart
            </button>
            <button
              type="button"
              onClick={() => runSessionAction('disconnect')}
              disabled={sessionBusy || sessionLoading}
              className="whatsapp-btn whatsapp-btn--secondary"
            >
              <FontAwesomeIcon icon={faTrashCan} />
              Disconnect
            </button>
          </div>
        </div>

        <aside className="whatsapp-qr-card">
          <div>
            <h2 className="whatsapp-section-title">Scan QR to connect</h2>
            <p className="whatsapp-section-description">
              Open WhatsApp on the restaurant phone, use Linked Devices, and scan the QR below.
            </p>
          </div>

          {sessionLoading ? (
            <div className="whatsapp-qr-loading">
              <FontAwesomeIcon icon={faSpinner} spin className="whatsapp-qr-loading-icon" />
              Checking session...
            </div>
          ) : qrPreviewUrl ? (
            <>
              <div className="whatsapp-qr-wrapper">
                <img src={qrPreviewUrl} alt="WhatsApp QR" className="whatsapp-qr-image" />
              </div>
              <div className="whatsapp-qr-timestamp">
                QR generated {qrData?.generatedAt ? new Date(qrData.generatedAt).toLocaleTimeString('en-NG') : 'just now'}
              </div>
            </>
          ) : (
            <div className="whatsapp-qr-placeholder">
              <div>
                <FontAwesomeIcon icon={faQrcode} className="whatsapp-qr-placeholder-icon" />
                <div>No QR available yet.</div>
                <div className="whatsapp-qr-placeholder-hint">Start or restart the session to generate one.</div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => runSessionAction('refresh')}
            disabled={sessionBusy}
            className="whatsapp-btn whatsapp-btn--secondary whatsapp-btn--full"
          >
            <FontAwesomeIcon icon={faRotate} />
            Refresh QR / status
          </button>
        </aside>
      </section>

      {/* Extra admin/config sections intentionally disabled for now.
          Keep only live session + QR connection UI on this page. */}
    </div>
  );
}

export default WhatsAppStatusPage;
