import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleInfo,
  faPlugCircleCheck,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import whatsappApi from '../../api/whatsapp';
import {
  getWhatsappStatusLabel,
} from '../../utils/whatsappPresentation';
import './WhatsAppStatusPage.css';

const META_APP_ID = import.meta.env.VITE_META_APP_ID || '';
const META_CONFIG_ID = import.meta.env.VITE_META_CONFIG_ID || '';
const META_COEXISTENCE_ENABLED = import.meta.env.VITE_META_COEXISTENCE_ENABLED !== 'false';
const META_SIGNUP_ORIGINS = ['https://www.facebook.com', 'https://web.facebook.com'];

let facebookSdkPromise = null;

function loadFacebookSdk() {
  if (facebookSdkPromise) return facebookSdkPromise;

  facebookSdkPromise = new Promise((resolve, reject) => {
    if (window.FB) {
      resolve(window.FB);
      return;
    }

    window.fbAsyncInit = function fbAsyncInit() {
      window.FB.init({ appId: META_APP_ID, version: 'v22.0', xfbml: false });
      resolve(window.FB);
    };

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load the Facebook SDK.'));
    document.body.appendChild(script);
  });

  return facebookSdkPromise;
}

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
  const [metaConnecting, setMetaConnecting] = useState(false);
  const metaSignupDataRef = useRef(null);
  const metaSignupErrorRef = useRef(null);

  const restaurantId = user?.restaurantId || '';

  const providerLabel = useMemo(() => {
    return status?.configured ? 'Meta Cloud API' : 'Not connected';
  }, [status?.configured]);

  const detailRows = useMemo(() => {
    return [
      ['Provider', providerLabel],
      ['Phone', status?.phone || 'Not assigned'],
    ];
  }, [providerLabel, status?.phone]);

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
    function handleMetaSignupMessage(event) {
      if (!META_SIGNUP_ORIGINS.includes(event.origin)) return;

      let data = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      if (!data || data.type !== 'WA_EMBEDDED_SIGNUP') return;

      if (data.event === 'CANCEL') {
        metaSignupErrorRef.current = new Error('WhatsApp connection was cancelled.');
        return;
      }

      if (data.event === 'ERROR' || data.event === 'ERROR_WHATSAPP_BUSINESS_APP_ONBOARDING') {
        const raw = data.data || data.error || {};
        metaSignupErrorRef.current = Object.assign(
          new Error(raw.message || data.message || 'Meta could not connect this WhatsApp Business number.'),
          { metaPayload: data }
        );
        return;
      }

      if ((data.event === 'FINISH' || data.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING') && data.data) {
        metaSignupDataRef.current = {
          wabaId: data.data.waba_id || '',
          phoneNumberId: data.data.phone_number_id || '',
          isCoexistence:
            data.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING' || data.data.is_on_biz_app === true,
          event: data.event,
        };
      }
    }

    window.addEventListener('message', handleMetaSignupMessage);
    return () => window.removeEventListener('message', handleMetaSignupMessage);
  }, []);

  async function handleConnectViaMeta() {
    if (!restaurantId || !META_APP_ID || !META_CONFIG_ID) return;

    setMetaConnecting(true);
    setError('');
    metaSignupDataRef.current = null;
    metaSignupErrorRef.current = null;

    try {
      const FB = await loadFacebookSdk();

      const authResponse = await new Promise((resolve, reject) => {
        FB.login(
          (response) => {
            if (response?.authResponse?.code) {
              resolve(response.authResponse);
            } else {
              reject(new Error('WhatsApp connection was cancelled or did not complete.'));
            }
          },
          {
            config_id: META_CONFIG_ID,
            response_type: 'code',
            override_default_response_type: true,
            ...(META_COEXISTENCE_ENABLED
              ? {
                  extras: {
                    setup: {},
                    featureType: 'whatsapp_business_app_onboarding',
                    sessionInfoVersion: '3',
                  },
                }
              : {}),
          }
        );
      });

      await new Promise((resolve) => window.setTimeout(resolve, 750));
      if (metaSignupErrorRef.current) throw metaSignupErrorRef.current;
      const signupData = metaSignupDataRef.current;
      if (!signupData?.wabaId || !signupData?.phoneNumberId) {
        throw new Error('Meta did not return a WhatsApp Business Account. Please try again.');
      }

      const nextStatus = await whatsappApi.completeMetaEmbeddedSignup(restaurantId, {
        code: authResponse.code,
        wabaId: signupData.wabaId,
        phoneNumberId: signupData.phoneNumberId,
        isCoexistence: META_COEXISTENCE_ENABLED && signupData.isCoexistence !== false,
      });

      setStatus(nextStatus);
    } catch (requestError) {
      const metaPayload = requestError?.metaPayload || requestError?.payload?.details;
      const rawMessage = String(requestError?.message || '').toLowerCase();
      if (metaPayload) console.error('Meta Embedded Signup raw error payload', metaPayload);
      if (requestError?.payload?.step) {
        setError(
          `Connecting WhatsApp via Meta failed at the "${requestError.payload.step}" step. Please restart the connection.`
        );
      } else {
        setError(
          rawMessage.includes('country') || rawMessage.includes('not available') || rawMessage.includes('unsupported')
            ? 'WhatsApp Business App coexistence is not available for this country/number. Update WhatsApp Business and try again, or use the standard Cloud API flow with a different number.'
            : rawMessage.includes('version') || rawMessage.includes('outdated')
              ? 'This number needs a newer WhatsApp Business app before it can use coexistence.'
              : requestError.message || 'Failed to connect WhatsApp via Meta.'
        );
      }
    } finally {
      setMetaConnecting(false);
      metaSignupDataRef.current = null;
    }
  }

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
      {/* Error Alert */}
      {error && (
        <div className="whatsapp-alert whatsapp-alert--error">
          <FontAwesomeIcon icon={faCircleInfo} className="whatsapp-alert__icon" />
          {error}
        </div>
      )}

      <section className="whatsapp-hero-section">
        <div className="whatsapp-hero-card">
          <p className="whatsapp-hero-eyebrow">Restaurant WhatsApp</p>
          <h1 className="whatsapp-hero-title">Give this restaurant its own line.</h1>
          <div className="whatsapp-hero-tags">
            <span className="whatsapp-tag">
              <FontAwesomeIcon icon={faWhatsapp} />
              {restaurantId || 'restaurant'}
            </span>
            <span className="whatsapp-tag">
              <FontAwesomeIcon icon={faPlugCircleCheck} />
              {providerLabel}
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

          {!status?.configured && META_APP_ID && META_CONFIG_ID && (
            <button
              type="button"
              onClick={handleConnectViaMeta}
              disabled={metaConnecting}
              className="whatsapp-btn whatsapp-btn--primary whatsapp-btn--full"
            >
              <FontAwesomeIcon icon={metaConnecting ? faSpinner : faWhatsapp} spin={metaConnecting} />
              {metaConnecting ? 'Connecting...' : 'Connect via Meta'}
            </button>
          )}
        </div>
      </section>

      <section className="whatsapp-session-section">
          <div className="whatsapp-session-card">
            <div>
              <h2 className="whatsapp-section-title">Meta Cloud API connection</h2>
              <p className="whatsapp-section-description">
                This restaurant sends and receives WhatsApp messages through Meta's Cloud API — there's no QR code
                or local session to manage. Messages are delivered directly by Meta's servers.
              </p>
            </div>

            <div className="whatsapp-session-badges">
              <Badge type={status?.status} label={getWhatsappStatusLabel(status?.status)} />
            </div>

            <div className="whatsapp-detail-rows whatsapp-detail-rows--compact">
              {[
                ['Phone number', status?.phone || 'Not assigned'],
                ['Runtime owner', status?.runtimeOwner || 'meta-whatsapp-cloud-api'],
              ].map(([label, value]) => (
                <div key={label} className="whatsapp-detail-row">
                  <span className="whatsapp-detail-row__label">{label}</span>
                  <span className="whatsapp-detail-row__value">{value}</span>
                </div>
              ))}
            </div>
          </div>
      </section>
    </div>
  );
}

export default WhatsAppStatusPage;
