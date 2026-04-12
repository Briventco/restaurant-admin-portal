import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCheck,
  faClock,
  faGear,
  faLocationDot,
  faSave,
  faSpinner,
  faStore,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../auth/AuthContext';
import { settingsApi } from '../../api/settings';
import './SettingsPage.css';

const defaultForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
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
};

const SettingToggle = ({ label, hint, value, onChange }) => (
  <button type="button" className={`settings-toggle-card ${value ? 'on' : 'off'}`} onClick={onChange}>
    <div>
      <strong>{label}</strong>
      <p>{hint}</p>
    </div>
    <span>{value ? 'ON' : 'OFF'}</span>
  </button>
);

const SettingsPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      if (!user?.restaurantId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const data = await settingsApi.get(user.restaurantId);
        if (!cancelled) {
          setForm(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load restaurant settings.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [user?.restaurantId]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const updated = await settingsApi.update(user.restaurantId, form);
      setForm(updated);
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-loading">Loading live restaurant settings...</div>;
  }

  return (
    <div className="settings-page-shell">
      <section className="settings-hero">
        <div>
          <p className="settings-eyebrow">Restaurant Settings</p>
          <h1>Control how your restaurant shows up and takes orders</h1>
          <p className="settings-subtitle">
            Update your public business profile, opening window, and core order behavior from one
            place. These settings are now backed by the live restaurant record.
          </p>
        </div>

        <div className="settings-hero-aside">
          <div className="settings-hero-chip">
            <FontAwesomeIcon icon={faStore} />
            {user?.restaurantId || '-'}
          </div>
          <div className="settings-hero-status">
            <strong>{form.acceptOrders ? 'Orders Open' : 'Orders Paused'}</strong>
            <p>{saved ? 'Latest changes saved successfully' : 'Ready for live updates'}</p>
          </div>
        </div>
      </section>

      {error ? <div className="settings-alert">{error}</div> : null}

      <form className="settings-form-shell" onSubmit={handleSave}>
        <section className="settings-panel">
          <div className="settings-panel-head">
            <div>
              <h2>
                <FontAwesomeIcon icon={faStore} />
                Restaurant Profile
              </h2>
              <p>The basics customers and internal ops rely on.</p>
            </div>
          </div>

          <div className="settings-grid">
            <label className="settings-field">
              <span>Restaurant name</span>
              <input
                className="settings-input"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                disabled={saving}
              />
            </label>

            <label className="settings-field">
              <span>Email</span>
              <input
                className="settings-input"
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                disabled={saving}
              />
            </label>

            <label className="settings-field">
              <span>Phone</span>
              <input
                className="settings-input"
                value={form.phone}
                onChange={(event) => update('phone', event.target.value)}
                disabled={saving}
              />
            </label>

            <label className="settings-field">
              <span>Address</span>
              <input
                className="settings-input"
                value={form.address}
                onChange={(event) => update('address', event.target.value)}
                disabled={saving}
              />
            </label>
          </div>
        </section>

        <section className="settings-panel">
          <div className="settings-panel-head">
            <div>
              <h2>
                <FontAwesomeIcon icon={faClock} />
                Opening Window
              </h2>
              <p>Define the service hours your team wants to operate around.</p>
            </div>
          </div>

          <div className="settings-time-grid">
            <label className="settings-field">
              <span>Opening time</span>
              <input
                className="settings-input"
                type="time"
                value={form.openingHours}
                onChange={(event) => update('openingHours', event.target.value)}
                disabled={saving}
              />
            </label>

            <label className="settings-field">
              <span>Closing time</span>
              <input
                className="settings-input"
                type="time"
                value={form.closingHours}
                onChange={(event) => update('closingHours', event.target.value)}
                disabled={saving}
              />
            </label>

            <div className="settings-hours-card">
              <span>Current service window</span>
              <strong>
                {form.openingHours} - {form.closingHours}
              </strong>
              <p>Use this as the operational baseline for staff and customer expectations.</p>
            </div>
          </div>
        </section>

        <section className="settings-panel">
          <div className="settings-panel-head">
            <div>
              <h2>
                <FontAwesomeIcon icon={faGear} />
                Order Behavior
              </h2>
              <p>Control how the bot and restaurant team respond to new activity.</p>
            </div>
          </div>

          <div className="settings-toggle-grid">
            <SettingToggle
              label="Accept Orders"
              hint="Allow customers to place new WhatsApp orders."
              value={form.acceptOrders}
              onChange={() => update('acceptOrders', !form.acceptOrders)}
            />
            <SettingToggle
              label="Auto-confirm Orders"
              hint="Let the system auto-confirm without manual staff review."
              value={form.autoConfirm}
              onChange={() => update('autoConfirm', !form.autoConfirm)}
            />
            <SettingToggle
              label="Notify on New Order"
              hint="Push immediate alerts when a new customer order arrives."
              value={form.notifyOnOrder}
              onChange={() => update('notifyOnOrder', !form.notifyOnOrder)}
            />
          </div>
        </section>

        <section className="settings-panel">
          <div className="settings-panel-head">
            <div>
              <h2>
                <FontAwesomeIcon icon={faLocationDot} />
                Manual Payment
              </h2>
              <p>Configure the bank transfer details customers should receive after order acceptance.</p>
            </div>
          </div>

          <div className="settings-toggle-grid">
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
                onChange={(event) => update('bankName', event.target.value)}
                disabled={saving}
              />
            </label>

            <label className="settings-field">
              <span>Account name</span>
              <input
                className="settings-input"
                value={form.accountName}
                onChange={(event) => update('accountName', event.target.value)}
                disabled={saving}
              />
            </label>

            <label className="settings-field">
              <span>Account number</span>
              <input
                className="settings-input"
                value={form.accountNumber}
                onChange={(event) => update('accountNumber', event.target.value)}
                disabled={saving}
              />
            </label>

            <label className="settings-field settings-field-full">
              <span>Payment instructions</span>
              <textarea
                className="settings-input settings-textarea"
                value={form.paymentInstructions}
                onChange={(event) => update('paymentInstructions', event.target.value)}
                disabled={saving}
                rows={4}
                placeholder="Example: Send proof of transfer on WhatsApp after payment."
              />
            </label>
          </div>
        </section>

        <section className="settings-save-row">
          <div className="settings-save-note">
            <FontAwesomeIcon icon={saved ? faCheck : faBell} />
            <span>
              {saved
                ? 'Your latest changes are already saved.'
                : 'Changes here update the live restaurant configuration.'}
            </span>
          </div>

          <button type="submit" className="settings-save-btn" disabled={saving}>
            {saving ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Saving...
              </>
            ) : saved ? (
              <>
                <FontAwesomeIcon icon={faCheck} />
                Saved
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} />
                Save Settings
              </>
            )}
          </button>
        </section>
      </form>
    </div>
  );
};

export default SettingsPage;
