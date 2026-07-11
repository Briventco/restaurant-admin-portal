import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { billingApi } from '../../api/billing';
import './SubscriptionPage.css';

const STATUS_LABELS = {
  trial: 'Free trial',
  trial_expired: 'Trial ended',
  payment_pending: 'Payment pending approval',
  active: 'Active subscription',
  expired: 'Subscription expired',
  legacy_active: 'Active',
};

const CONFIRM_POLL_ATTEMPTS = 8;
const CONFIRM_POLL_INTERVAL_MS = 2000;

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatAmount = (instructions) => {
  if (!instructions || !instructions.amount) return null;
  const currency = instructions.currency || 'NGN';
  const prefix = currency === 'NGN' ? '₦' : `${currency} `;
  return `${prefix}${Number(instructions.amount).toLocaleString()}`;
};

const SubscriptionPage = () => {
  const { user } = useAuth();
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const hasHandledReturnRef = useRef(false);

  const loadBilling = async () => {
    if (!user?.restaurantId) {
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      setError('');
      const data = await billingApi.getStatus(user.restaurantId);
      setBilling(data);
      return data;
    } catch (requestError) {
      setError(requestError.message || 'Unable to load billing details.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBilling();
  }, [user?.restaurantId]);

  useEffect(() => {
    if (hasHandledReturnRef.current || !user?.restaurantId) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (!status) {
      return;
    }

    hasHandledReturnRef.current = true;
    window.history.replaceState({}, '', window.location.pathname);

    if (status !== 'successful' && status !== 'completed') {
      setToast('Payment was not completed. You can try again below.');
      setTimeout(() => setToast(''), 5000);
      return;
    }

    setConfirming(true);

    (async () => {
      for (let attempt = 0; attempt < CONFIRM_POLL_ATTEMPTS; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, CONFIRM_POLL_INTERVAL_MS));
        const data = await loadBilling();
        const effectiveStatus = data?.effectiveStatus || data?.status;
        if (effectiveStatus === 'active') {
          setToast('Payment confirmed — your subscription is active.');
          setTimeout(() => setToast(''), 5000);
          break;
        }
      }
      setConfirming(false);
    })();
  }, [user?.restaurantId]);

  const handlePayNow = async () => {
    if (!user?.restaurantId) return;

    try {
      setPayLoading(true);
      setError('');
      const { paymentLink } = await billingApi.pay(user.restaurantId);
      if (!paymentLink) {
        throw new Error('Payment link was not returned. Please try again.');
      }
      window.location.href = paymentLink;
    } catch (requestError) {
      setError(requestError.message || 'Unable to start payment. Please try again.');
      setPayLoading(false);
    }
  };

  if (loading) {
    return <div className="sub-loading" />;
  }

  const instructions = billing?.paymentInstructions;
  const monthlyAmount = formatAmount(instructions);
  const effectiveStatus = billing?.effectiveStatus || billing?.status || 'trial';
  const statusLabel = STATUS_LABELS[effectiveStatus] || effectiveStatus;

  return (
    <div className="sub-container">
      {toast && (
        <div className="sub-toast-wrapper">
          <div className="sub-toast sub-toast--success">
            <span className="sub-toast-icon">✓</span>
            <span className="sub-toast-message">{toast}</span>
          </div>
        </div>
      )}

      <div className="sub-hero">
        <div>
          <p className="sub-eyebrow">Platform billing</p>
          <h1 className="sub-title">Subscription</h1>
          <p className="sub-description">
            Every restaurant gets a 15-day free trial. After that, pay securely online each month to keep your WhatsApp bot active.
          </p>
        </div>
        <div className="sub-hero-side">
          <div>
            <span>Status</span>
            <strong>{statusLabel}</strong>
          </div>
          {billing?.daysRemaining != null && (
            <p>{billing.daysRemaining} day{billing.daysRemaining === 1 ? '' : 's'} remaining</p>
          )}
        </div>
      </div>

      {error && (
        <div className="sub-expired-banner" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {(effectiveStatus === 'trial_expired' || effectiveStatus === 'expired') && (
        <div className="sub-expired-banner">
          Your trial or subscription has ended. WhatsApp ordering is paused until payment completes, but your WhatsApp session stays connected.
        </div>
      )}

      <div className="sub-grid">
        <div className="sub-panel">
          <h2 className="sub-panel-title">Current plan</h2>
          <div className="sub-list">
            <div className="sub-list-item">
              <span>Trial started</span>
              <strong>{formatDate(billing?.trialStartedAt)}</strong>
            </div>
            <div className="sub-list-item">
              <span>Trial ends</span>
              <strong>{formatDate(billing?.trialEndsAt)}</strong>
            </div>
            <div className="sub-list-item">
              <span>Subscription valid until</span>
              <strong>{formatDate(billing?.subscriptionEndsAt)}</strong>
            </div>
            <div className="sub-list-item">
              <span>WhatsApp bot</span>
              <strong className={billing?.botAllowed ? 'sub-status--active' : 'sub-status--expired'}>
                {billing?.botAllowed ? 'Taking orders' : 'Paused'}
              </strong>
            </div>
          </div>
        </div>

        <div className="sub-panel">
          <h2 className="sub-panel-title">Pay for 1 month</h2>

          {confirming ? (
            <div className="sub-payment-processing">
              <div className="sub-spinner" />
              <p>Confirming your payment…</p>
            </div>
          ) : (
            <>
              {monthlyAmount && (
                <div className="sub-payment-details">
                  <div className="sub-payment-row sub-payment-row--total">
                    <span>Amount due</span>
                    <strong>{monthlyAmount}</strong>
                  </div>
                </div>
              )}

              <button
                type="button"
                className="sub-plan-btn sub-plan-btn--primary"
                disabled={payLoading}
                onClick={handlePayNow}
              >
                {payLoading ? 'Redirecting…' : 'Pay now'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
