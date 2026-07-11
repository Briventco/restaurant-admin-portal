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
import './PaymentsPage.css';

const SettingToggle = ({ label, hint, value, onChange, disabled }) => (
  <div
    className={`settings-toggle-row ${value ? 'on' : 'off'} ${disabled ? 'disabled' : ''}`}
    onClick={disabled ? undefined : onChange}
    role="switch"
    aria-checked={value}
    aria-disabled={disabled}
    tabIndex={disabled ? -1 : 0}
    onKeyDown={(e) => !disabled && (e.key === ' ' || e.key === 'Enter') && onChange()}
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

const emptyAutomaticPayment = {
  enabled: false,
  bankCode: '',
  bankName: '',
  accountNumber: '',
  accountName: '',
  businessName: '',
  configured: false,
};

const PaymentsPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    timezone: 'Africa/Lagos',
    openingHours: '08:00',
    closingHours: '22:00',
    acceptOrders: true,
    autoConfirm: false,
    notifyOnOrder: true,
    manualTransferEnabled: false,
    bankName: '',
    accountName: '',
    accountNumber: '',
    paymentInstructions: '',
    automaticPayment: emptyAutomaticPayment,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [banks, setBanks] = useState([]);
  const [editingAutomatic, setEditingAutomatic] = useState(false);
  const [setupForm, setSetupForm] = useState({
    bankCode: '',
    accountNumber: '',
    businessName: '',
  });
  const [resolvedAccountName, setResolvedAccountName] = useState('');
  const [resolving, setResolving] = useState(false);
  const [setupSaving, setSetupSaving] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [toggleSaving, setToggleSaving] = useState(false);

  useEffect(() => {
    if (!user?.restaurantId) {
      setLoading(false);
      return;
    }

    settingsApi.get(user.restaurantId)
      .then((data) => {
        setForm((prev) => ({ ...prev, ...data }));
        setSetupForm((prev) => ({ ...prev, businessName: prev.businessName || data.name || '' }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    settingsApi.listBanks(user.restaurantId)
      .then(setBanks)
      .catch(() => {});
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

  const handleVerifyAccount = async () => {
    if (!setupForm.bankCode || !setupForm.accountNumber) return;

    setResolving(true);
    setSetupError('');
    setResolvedAccountName('');

    try {
      const accountName = await settingsApi.resolveAccount(user.restaurantId, {
        bankCode: setupForm.bankCode,
        accountNumber: setupForm.accountNumber,
      });
      setResolvedAccountName(accountName);
    } catch (err) {
      setSetupError(err.message || 'Could not verify that account.');
    } finally {
      setResolving(false);
    }
  };

  const handleEnableAutomatic = async () => {
    if (!resolvedAccountName || !setupForm.businessName.trim()) return;

    setSetupSaving(true);
    setSetupError('');

    try {
      const bank = banks.find((b) => b.code === setupForm.bankCode);
      const updated = await settingsApi.setupAutomaticPayment(user.restaurantId, {
        bankCode: setupForm.bankCode,
        bankName: bank ? bank.name : '',
        accountNumber: setupForm.accountNumber,
        businessName: setupForm.businessName.trim(),
      });
      setForm((prev) => ({ ...prev, automaticPayment: updated.automaticPayment }));
      setEditingAutomatic(false);
      setResolvedAccountName('');
    } catch (err) {
      setSetupError(err.message || 'Failed to enable automatic payment.');
    } finally {
      setSetupSaving(false);
    }
  };

  const handleToggleAutomatic = async () => {
    setToggleSaving(true);
    setError('');

    try {
      const updated = await settingsApi.toggleAutomaticPayment(
        user.restaurantId,
        !form.automaticPayment.enabled
      );
      setForm((prev) => ({ ...prev, automaticPayment: updated.automaticPayment }));
    } catch (err) {
      setError(err.message || 'Failed to update automatic payment.');
    } finally {
      setToggleSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-loading">Loading payment settings...</div>;
  }

  const automatic = form.automaticPayment || emptyAutomaticPayment;

  return (
    <div className="account-page-shell">
      <section className="account-hero">
        <div>
          <h1>Payment Overview</h1>
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
              <span>Card / Transfer / USSD</span>
              <strong>{automatic.enabled ? 'Active' : 'Inactive'}</strong>
            </div>
          </div>
        </section>
      </div>

      {error && <div className="settings-alert">{error}</div>}

      <section className="settings-panel" style={{ marginTop: '24px' }}>
        <div className="settings-panel-head">
          <div>
            <h2>
              <FontAwesomeIcon icon={faCreditCard} />
              Automatic Payment
            </h2>
            <p>Let customers pay online by card, transfer, or USSD. Money settles straight to your own bank account, minus a small platform fee.</p>
          </div>
        </div>

        {automatic.configured && !editingAutomatic ? (
          <>
            <div className="settings-toggle-list">
              <SettingToggle
                label="Automatic Payment"
                hint="When enabled, order confirmations send customers a payment link instead of bank transfer instructions."
                value={automatic.enabled}
                onChange={handleToggleAutomatic}
                disabled={toggleSaving}
              />
            </div>

            <div className="settings-grid" style={{ marginTop: '16px' }}>
              <label className="settings-field">
                <span>Bank</span>
                <input className="settings-input" value={automatic.bankName} disabled />
              </label>
              <label className="settings-field">
                <span>Account name</span>
                <input className="settings-input" value={automatic.accountName} disabled />
              </label>
              <label className="settings-field">
                <span>Account number</span>
                <input className="settings-input" value={automatic.accountNumber} disabled />
              </label>
              <label className="settings-field">
                <span>Business name</span>
                <input className="settings-input" value={automatic.businessName} disabled />
              </label>
            </div>

            <button
              type="button"
              className="settings-save-btn settings-save-btn--secondary"
              style={{ marginTop: '16px' }}
              onClick={() => {
                setSetupForm({
                  bankCode: automatic.bankCode,
                  accountNumber: automatic.accountNumber,
                  businessName: automatic.businessName,
                });
                setResolvedAccountName('');
                setEditingAutomatic(true);
              }}
            >
              Update bank details
            </button>
          </>
        ) : (
          <>
            {setupError && <div className="settings-alert">{setupError}</div>}

            <div className="settings-grid">
              <label className="settings-field">
                <span>Bank</span>
                <select
                  className="settings-input"
                  value={setupForm.bankCode}
                  onChange={(e) => {
                    setSetupForm((prev) => ({ ...prev, bankCode: e.target.value }));
                    setResolvedAccountName('');
                  }}
                  disabled={setupSaving}
                >
                  <option value="">Select a bank</option>
                  {banks.map((bank) => (
                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                  ))}
                </select>
              </label>
              <label className="settings-field">
                <span>Account number</span>
                <input
                  className="settings-input"
                  value={setupForm.accountNumber}
                  onChange={(e) => {
                    setSetupForm((prev) => ({ ...prev, accountNumber: e.target.value.trim() }));
                    setResolvedAccountName('');
                  }}
                  disabled={setupSaving}
                />
              </label>
              <label className="settings-field">
                <span>Business name</span>
                <input
                  className="settings-input"
                  value={setupForm.businessName}
                  onChange={(e) => setSetupForm((prev) => ({ ...prev, businessName: e.target.value }))}
                  disabled={setupSaving}
                />
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
              <button
                type="button"
                className="settings-save-btn settings-save-btn--secondary"
                onClick={handleVerifyAccount}
                disabled={resolving || !setupForm.bankCode || !setupForm.accountNumber}
              >
                {resolving ? (<><FontAwesomeIcon icon={faSpinner} spin /> Verifying...</>) : 'Verify account'}
              </button>
              {resolvedAccountName && (
                <span style={{ color: '#22c55e', fontSize: '13px', fontWeight: 600 }}>
                  <FontAwesomeIcon icon={faCheck} /> {resolvedAccountName}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                type="button"
                className="settings-save-btn"
                onClick={handleEnableAutomatic}
                disabled={setupSaving || !resolvedAccountName || !setupForm.businessName.trim()}
              >
                {setupSaving ? (<><FontAwesomeIcon icon={faSpinner} spin /> Saving...</>) : 'Enable automatic payment'}
              </button>
              {editingAutomatic && (
                <button
                  type="button"
                  className="settings-save-btn settings-save-btn--secondary"
                  onClick={() => setEditingAutomatic(false)}
                  disabled={setupSaving}
                >
                  Cancel
                </button>
              )}
            </div>
          </>
        )}
      </section>

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
