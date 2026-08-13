import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCheck,
  faClock,
  faGear,
  faSave,
  faSpinner,
  faStore,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../auth/AuthContext';
import { settingsApi } from '../../api/settings';
import './SettingsPage.css';

const defaultForm = {
  name: '',
  email: '',
  phone: '',
  orderAlertRecipient: '',
  address: '',
  timezone: 'Africa/Lagos',
  openingHours: '08:00',
  closingHours: '22:00',
  acceptOrders: true,
  autoConfirm: false,
  notifyOnOrder: true,
  customWelcomeMessage: '',
};

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
          setForm({ ...data });
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

  const welcomeMessagePreview = form.customWelcomeMessage?.trim()
    ? form.customWelcomeMessage
        .replace(/\{restaurant_name\}/gi, form.name?.trim() || 'your restaurant')
        .replace(/\{customer_name\}/gi, 'John')
    : `Hi there. You're welcome at ${form.name?.trim() || 'your restaurant'}.`;

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const updated = await settingsApi.update(user.restaurantId, form);
      setForm({ ...updated });
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
              <span>Order alert number</span>
              <input
                className="settings-input"
                value={form.orderAlertRecipient}
                onChange={(event) => update('orderAlertRecipient', event.target.value)}
                disabled={saving}
                placeholder="+234... WhatsApp number that receives order alerts"
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

            <label className="settings-field">
              <span>Timezone</span>
              <input
                className="settings-input"
                value={form.timezone}
                onChange={(event) => update('timezone', event.target.value)}
                disabled={saving}
                placeholder="Africa/Lagos"
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

          <div className="settings-toggle-list">
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

          <div className="settings-central-alert-notice">
            <div className="settings-central-alert-icon">
              <FontAwesomeIcon icon={faShieldHalved} />
            </div>
            <div className="settings-central-alert-body">
              <strong>Alerts routed through Servra</strong>
              <p>
                Order alerts are sent from the shared Servra sender to the WhatsApp number saved above.
                If you leave it blank, the restaurant phone is used instead. From that number, staff can reply&nbsp;
                <code>#confirm &lt;ref&gt;</code> or <code>#reject &lt;ref&gt; &lt;reason&gt;</code> to act on any order directly from WhatsApp.
              </p>
            </div>
          </div>
        </section>

        <section className="settings-panel">
          <div className="settings-panel-head">
            <div>
              <h2>
                <FontAwesomeIcon icon={faBell} />
                Welcome Message
              </h2>
              <p>Set the greeting customers receive the first time they message the bot.</p>
            </div>
          </div>

          <label className="settings-field settings-field-full">
            <span>Custom welcome message</span>
            <textarea
              className="settings-input settings-textarea"
              value={form.customWelcomeMessage}
              onChange={(event) => update('customWelcomeMessage', event.target.value)}
              disabled={saving}
              placeholder="Hey {customer_name}, welcome to {restaurant_name}. Reply MENU to order."
              rows={4}
            />
            <p className="settings-field-hint">
              Use <code>{'{customer_name}'}</code> for the customer’s name and{' '}
              <code>{'{restaurant_name}'}</code> for the restaurant name.
            </p>
          </label>

          <div className="settings-message-preview">
            <span>Preview</span>
            <strong>{welcomeMessagePreview}</strong>
            <p>
              This is the text the bot sends when a new customer starts a chat and no existing
              order session is active.
            </p>
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