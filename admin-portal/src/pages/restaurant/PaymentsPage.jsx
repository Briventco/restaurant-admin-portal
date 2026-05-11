import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowTrendUp,
  faClock,
  faCreditCard,
  faLocationDot,
  faSave,
  faSpinner,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../auth/AuthContext';
import { settingsApi } from '../../api/settings';
import './AccountPages.css';

const SettingToggle = ({ label, hint, value, onChange }) => (
  <div
    className={`settings-toggle-row ${value ? 'on' : 'off'}`}
    onClick={onChange}
    role="switch"
    aria-checked={value}
    tabIndex={0}
    onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onChange()}
  >
    <div className="settings-toggle-text">
      <strong>{label}</strong>
      <p>{hint}</p>
    </div>
    <div className={`settings-toggle-pill ${value ? 'on' : 'off'}`}>
      <span className="settings-toggle-thumb" />
    </div>
  </div>
);

const PaymentsPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    manualTransferEnabled: false,
    bankName: '',
    accountName: '',
    accountNumber: '',
    paymentInstructions: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.restaurantId) {
      setLoading(false);
      return;
    }

    settingsApi.get(user.restaurantId)
      .then((data) => {
        setForm({
          manualTransferEnabled: data.manualTransferEnabled || false,
          bankName: data.bankName || '',
          accountName: data.accountName || '',
          accountNumber: data.accountNumber || '',
          paymentInstructions: data.paymentInstructions || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.restaurantId]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      await settingsApi.update(user.restaurantId, form);
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-loading">Loading payment settings...</div>;
  }

  return (
    <div className="account-page-shell">
      <section className="account-hero">
        <div>
          <h1>Payment Overview</h1>
          <p className="account-subtitle">
            Track payment statuses, methods, and revenue from all your orders in one place.
          </p>
        </div>
      </section>

      <div className="account-kpi-grid">
        <article className="account-kpi">
          <span>Total Revenue</span>
          <strong><FontAwesomeIcon icon={faArrowTrendUp} /> ₦0</strong>
          <p>Total earnings from paid orders this month.</p>
        </article>
        <article className="account-kpi">
          <span>Pending Payments</span>
          <strong><FontAwesomeIcon icon={faClock} /> 0</strong>
          <p>Orders awaiting payment confirmation.</p>
        </article>
        <article className="account-kpi">
          <span>Payment Methods Used</span>
          <strong><FontAwesomeIcon icon={faCreditCard} /> 0</strong>
          <p>Unique payment methods across all orders.</p>
        </article>
      </div>

      <div className="account-grid">
        <section className="account-panel">
          <h2>Recent Transactions</h2>
          <div className="account-list">
            <div className="account-list-row">
              <span>No transactions yet</span>
              <strong>—</strong>
            </div>
          </div>
        </section>

        <section className="account-panel">
          <h2>Payment Methods</h2>
          <div className="account-list">
            <div className="account-list-row">
              <span>WhatsApp Pay</span>
              <strong>Active</strong>
            </div>
            <div className="account-list-row">
              <span>Bank Transfer</span>
              <strong>{form.manualTransferEnabled ? 'Active' : 'Inactive'}</strong>
            </div>
            <div className="account-list-row">
              <span>Cash on Delivery</span>
              <strong>Active</strong>
            </div>
            <div className="account-list-row">
              <span>Card</span>
              <strong>Active</strong>
            </div>
          </div>
        </section>
      </div>

      {error && <div className="settings-alert">{error}</div>}

      <form onSubmit={handleSave}>
        <section className="settings-panel" style={{ marginTop: '24px' }}>
          <div className="settings-panel-head">
            <div>
              <h2>
                <FontAwesomeIcon icon={faLocationDot} />
                Manual Payment
              </h2>
              <p>Configure the bank transfer details customers should receive after order acceptance.</p>
            </div>
          </div>

          <div className="settings-toggle-list">
            <SettingToggle
              label="Manual Transfer Flow"
              hint="When enabled, accepted orders move into awaiting payment instead of straight into kitchen confirmation."
              value={form.manualTransferEnabled}
              onChange={() => update('manualTransferEnabled', !form.manualTransferEnabled)}
            />
          </div>

          <div className="settings-grid">
            <label className="settings-field">
              <span>Bank name</span>
              <input
                className="settings-input"
                value={form.bankName}
                onChange={(e) => update('bankName', e.target.value)}
                disabled={saving}
              />
            </label>
            <label className="settings-field">
              <span>Account name</span>
              <input
                className="settings-input"
                value={form.accountName}
                onChange={(e) => update('accountName', e.target.value)}
                disabled={saving}
              />
            </label>
            <label className="settings-field">
              <span>Account number</span>
              <input
                className="settings-input"
                value={form.accountNumber}
                onChange={(e) => update('accountNumber', e.target.value)}
                disabled={saving}
              />
            </label>
            <label className="settings-field settings-field-full">
              <span>Payment instructions</span>
              <textarea
                className="settings-input settings-textarea"
                value={form.paymentInstructions}
                onChange={(e) => update('paymentInstructions', e.target.value)}
                disabled={saving}
                rows={4}
                placeholder="Example: Send proof of transfer on WhatsApp after payment."
              />
            </label>
          </div>
        </section>

        <section className="settings-save-row">
          <div className="settings-save-note">
            <FontAwesomeIcon icon={saved ? faCheck : faClock} />
            <span>
              {saved ? 'Your latest changes are already saved.' : 'Changes here update the live restaurant configuration.'}
            </span>
          </div>
          <button type="submit" className="settings-save-btn" disabled={saving}>
            {saving ? (
              <><FontAwesomeIcon icon={faSpinner} spin /> Saving...</>
            ) : saved ? (
              <><FontAwesomeIcon icon={faCheck} /> Saved</>
            ) : (
              <><FontAwesomeIcon icon={faSave} /> Save Settings</>
            )}
          </button>
        </section>
      </form>
    </div>
  );
};

export default PaymentsPage;