import React, { useEffect, useState } from 'react';
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const loadBilling = async () => {
    if (!user?.restaurantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await billingApi.getStatus(user.restaurantId);
      setBilling(data);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load billing details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBilling();
  }, [user?.restaurantId]);

  const handleReportPayment = async () => {
    if (!user?.restaurantId) return;

    try {
      setSubmitting(true);
      setError('');
      const updated = await billingApi.reportPayment(user.restaurantId);
      setBilling(updated);
      setToast('Payment reported. Servra will review and activate your account.');
      setTimeout(() => setToast(''), 4000);
    } catch (requestError) {
      setError(requestError.message || 'Unable to report payment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="sub-loading" />;
  }

  const instructions = billing?.paymentInstructions;
  const monthlyAmount = formatAmount(instructions);
  const effectiveStatus = billing?.effectiveStatus || billing?.status || 'trial';
  const statusLabel = STATUS_LABELS[effectiveStatus] || effectiveStatus;
  const canReport = Boolean(billing?.canReportPayment);
  const isPending = effectiveStatus === 'payment_pending';

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
            Every restaurant gets a 15-day free trial. After that, pay manually each month and Servra will activate your account.
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
          Your trial or subscription has ended. WhatsApp ordering is paused until payment is approved, but your WhatsApp session stays connected.
        </div>
      )}

      {isPending && (
        <div className="sub-expired-banner" style={{ color: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)' }}>
          Thanks — we received your payment report. Servra will review it shortly.
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
                {billing?.botAllowed ? 'Taking orders' : 'Paused (session still connected)'}
              </strong>
            </div>
          </div>
        </div>

        <div className="sub-panel">
          <h2 className="sub-panel-title">Pay for 1 month</h2>
          {instructions?.bankName ? (
            <div className="sub-payment-details">
              <div className="sub-payment-row">
                <span>Bank</span>
                <strong>{instructions.bankName}</strong>
              </div>
              <div className="sub-payment-row">
                <span>Account name</span>
                <strong>{instructions.accountName}</strong>
              </div>
              <div className="sub-payment-row">
                <span>Account number</span>
                <strong>{instructions.accountNumber}</strong>
              </div>
              {monthlyAmount && (
                <div className="sub-payment-row sub-payment-row--total">
                  <span>Amount</span>
                  <strong>{monthlyAmount}</strong>
                </div>
              )}
            </div>
          ) : (
            <div className="sub-empty-state">
              <p>{instructions?.note || `Contact ${instructions?.contactEmail || 'hello@servra.io'} for payment details.`}</p>
            </div>
          )}

          <button
            type="button"
            className={`sub-plan-btn ${canReport ? 'sub-plan-btn--primary' : 'sub-plan-btn--disabled'}`}
            disabled={!canReport || submitting || isPending}
            onClick={handleReportPayment}
          >
            {submitting ? 'Submitting…' : isPending ? 'Awaiting approval' : 'I have paid'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
