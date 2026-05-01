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
import './WhatsAppStatusPage.css';

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
  return (
    <span className={`badge badge--${(type || '').toLowerCase()}`}>
      <span className="badge__dot" />
      {label || type}
    </span>
  );
}

function StatCard({ label, value, accent, icon, subtext }) {
  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <p className="stat-card__label">{label}</p>
        <FontAwesomeIcon icon={icon} className="stat-card__icon" />
      </div>
      <div className="stat-card__value" style={{ color: accent }}>
        {value}
      </div>
      {subtext ? <p className="stat-card__subtext">{subtext}</p> : null}
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
  const [sessionUiActivated, setSessionUiActivated] = useState(false);
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
      setForm({
        provider: data.provider || 'whatsapp-web',
        configured: Boolean(data.configured),
        provisioningState: data.provisioningState || 'unassigned',
        phone: data.phone || '',
        phoneNumberId: data.phoneNumberId || '',
        wabaId: data.wabaId || '',
        notes: data.notes || '',
      });

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

  function updateField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
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
            Connect the restaurant's own WhatsApp and keep its session healthy. We're using the WhatsApp Web runtime for now so the setup stays simple and affordable during the pilot stage.
          </p>
          <div className="whatsapp-hero-tags">
            <span className="whatsapp-tag">
              <FontAwesomeIcon icon={faWhatsapp} />
              {restaurantId || 'restaurant'}
            </span>
            <span className="whatsapp-tag">
              <FontAwesomeIcon icon={faPlugCircleCheck} />
              {isWebjsMode ? 'whatsapp-web runtime' : status?.provider || 'provider not set'}
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
            <span className="whatsapp-pill" style={bindingStyle}>{bindingMeta.label}</span>
            <span className="whatsapp-pill" style={provisioningStyle}>{provisioningMeta.label}</span>
          </div>

          <div className="whatsapp-detail-rows">
            {detailRows.map(([label, value]) => (
              <div key={label} className="whatsapp-detail-row">
                <span className="whatsapp-detail-row__label">{label}</span>
                <span className="whatsapp-detail-row__value">{value}</span>
              </div>
            ))}
          </div>

          {provisioningTransitions.length > 0 && (
            <div className="whatsapp-provisioning-buttons">
              {provisioningTransitions.map((transition) => (
                <button
                  key={transition.targetState}
                  type="button"
                  onClick={() => handleAdvanceProvisioning(transition.targetState)}
                  disabled={saving}
                  className="whatsapp-provisioning-btn"
                >
                  Move to {transition.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="whatsapp-session-section">
        <div className="whatsapp-session-card">
          <div>
            <h2 className="whatsapp-section-title">WhatsApp Web session</h2>
            <p className="whatsapp-section-description">
              Connect this restaurant's own WhatsApp by starting a session and scanning the QR code. This is the low-cost startup path even if old Meta config still exists on the tenant.
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

      <section className="whatsapp-stats-section">
        <StatCard label="Status" value={<Badge type={status?.status} label={getWhatsappStatusLabel(status?.status)} />} accent="#fff" icon={faWhatsapp} subtext="Resolved live from backend" />
        <StatCard label="Runtime" value={isWebjsMode ? 'WhatsApp Web' : status?.provider || 'Not set'} accent="#3b82f6" icon={faMobileAlt} subtext="Current connection path" />
        <StatCard label="Binding" value={bindingMeta.label} accent="#22c55e" icon={faCheckCircle} subtext={bindingMeta.description} />
        <StatCard label="Provisioning" value={provisioningMeta.label} accent="#f59e0b" icon={faPlugCircleCheck} subtext={provisioningMeta.description} />
      </section>

      {error && (
        <div className="whatsapp-alert whatsapp-alert--error">
          <FontAwesomeIcon icon={faTriangleExclamation} className="whatsapp-alert__icon" />
          {error}
        </div>
      )}

      {saved && (
        <div className="whatsapp-alert whatsapp-alert--success">
          WhatsApp configuration saved successfully.
        </div>
      )}

      <section className="whatsapp-config-section">
        <form onSubmit={handleSave} className="whatsapp-config-form">
          <div className="whatsapp-config-form__header">
            <div>
              <h2 className="whatsapp-section-title">WhatsApp config</h2>
              <p className="whatsapp-section-description">
                Save the restaurant's WhatsApp identity and a few internal notes. We're intentionally hiding the old Meta-specific setup here so the page stays focused on the live Web JS flow.
              </p>
            </div>
            <span className="whatsapp-config-form__scope-tag">tenant scoped</span>
          </div>

          <label className="whatsapp-checkbox-label">
            <input
              type="checkbox"
              checked={form.configured}
              onChange={(event) => updateField('configured', event.target.checked)}
              className="whatsapp-checkbox"
            />
            <div>
              <strong className="whatsapp-checkbox-label__title">This restaurant has a dedicated WhatsApp setup</strong>
              <span className="whatsapp-checkbox-label__description">
                Leave this on once the restaurant should be treated as its own connected WhatsApp tenant instead of a shared fallback.
              </span>
            </div>
          </label>

          <div className="whatsapp-form-grid">
            <label className="whatsapp-form-field">
              <span className="whatsapp-form-field__label">Provider</span>
              <div className="whatsapp-form-field__readonly">WhatsApp Web Runtime</div>
            </label>

            <label className="whatsapp-form-field">
              <span className="whatsapp-form-field__label">Display phone</span>
              <input
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder="+234..."
                className="whatsapp-form-input"
              />
            </label>

            <label className="whatsapp-form-field">
              <span className="whatsapp-form-field__label">Provisioning state</span>
              <select
                value={form.provisioningState}
                onChange={(event) => updateField('provisioningState', event.target.value)}
                className="whatsapp-form-input"
              >
                <option value="unassigned">Unassigned</option>
                <option value="reserved">Number Reserved</option>
                <option value="connecting">Connecting</option>
                <option value="verified">Verified</option>
                <option value="active">Active</option>
                <option value="failed">Failed</option>
              </select>
            </label>

            {!isWebjsMode && (
              <>
                <label className="whatsapp-form-field">
                  <span className="whatsapp-form-field__label">Phone Number ID</span>
                  <input
                    value={form.phoneNumberId}
                    onChange={(event) => updateField('phoneNumberId', event.target.value)}
                    placeholder="Meta phone number id"
                    className="whatsapp-form-input"
                  />
                </label>

                <label className="whatsapp-form-field">
                  <span className="whatsapp-form-field__label">WABA ID</span>
                  <input
                    value={form.wabaId}
                    onChange={(event) => updateField('wabaId', event.target.value)}
                    placeholder="Meta WABA id"
                    className="whatsapp-form-input"
                  />
                </label>
              </>
            )}
          </div>

          <label className="whatsapp-form-field">
            <span className="whatsapp-form-field__label">Setup notes</span>
            <textarea
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="Optional notes about this restaurant's WhatsApp setup"
              className="whatsapp-form-textarea"
            />
          </label>

          <div className="whatsapp-config-form__actions">
            <div className="whatsapp-config-form__actions-hint">
              Save the display phone and notes here, then manage the real connection from the Web session panel above.
            </div>
            <div className="whatsapp-config-form__actions-buttons">
              <button
                type="button"
                onClick={handleClearConfig}
                disabled={saving}
                className="whatsapp-btn whatsapp-btn--secondary"
              >
                <FontAwesomeIcon icon={faTrashCan} />
                Clear config
              </button>
              <button
                type="submit"
                disabled={saving}
                className="whatsapp-btn whatsapp-btn--primary"
              >
                <FontAwesomeIcon icon={saving ? faSpinner : faSave} spin={saving} />
                {saving ? 'Saving...' : 'Save connection settings'}
              </button>
            </div>
          </div>
        </form>

        <aside className="whatsapp-info-card">
          <div>
            <h2 className="whatsapp-section-title">How this works</h2>
            <p className="whatsapp-section-description">
              This page is now centered on the Web JS rollout path, so the restaurant team can connect one WhatsApp number, keep it healthy, and recover quickly if the session drops.
            </p>
          </div>

          <div className="whatsapp-info-steps">
            {[
              ['Connect once', 'Start the session, scan the QR, and wait for the status to turn connected before testing customer messages.'],
              ['Reconnect fast', 'If the phone logs out or the browser session breaks, use Restart to generate a fresh QR and link again.'],
              ['Keep it restaurant-owned', 'Each restaurant should connect its own WhatsApp so customer chats and order updates stay isolated to that business.'],
            ].map(([title, copy]) => (
              <div key={title} className="whatsapp-info-step">
                <strong className="whatsapp-info-step__title">{title}</strong>
                <span className="whatsapp-info-step__copy">{copy}</span>
              </div>
            ))}
          </div>

          <div className="whatsapp-info-notice">
            We're keeping the old Meta path in the codebase for future use, but this screen is intentionally focused on the Web JS pilot flow so the restaurant team doesn't have to think about both systems at once.
          </div>

          <button
            type="button"
            onClick={load}
            className="whatsapp-btn whatsapp-btn--secondary whatsapp-btn--full"
          >
            <FontAwesomeIcon icon={faRotate} />
            Refresh status
          </button>
        </aside>
      </section>
    </div>
  );
}

export default WhatsAppStatusPage;
