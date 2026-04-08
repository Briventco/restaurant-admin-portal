import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faBolt,
  faCheckCircle,
  faClock,
  faEnvelope,
  faGlobeAfrica,
  faIdBadge,
  faLayerGroup,
  faMagicWandSparkles,
  faMapMarkerAlt,
  faPhone,
  faSeedling,
  faSpinner,
  faStore,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons';
import adminApi from '../../api/admin';
import './CreateRestaurantPage.css';

const initialForm = {
  restaurantName: '',
  restaurantId: '',
  adminDisplayName: '',
  adminEmail: '',
  adminPassword: '',
  phone: '',
  address: '',
  timezone: 'Africa/Lagos',
  openingHours: '08:00',
  closingHours: '22:00',
  seedSampleMenu: true,
};

function slugPreview(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function fallbackAdminName(restaurantName) {
  const trimmed = String(restaurantName || '').trim();
  return trimmed ? `${trimmed} Admin` : 'Restaurant Admin';
}

const previewSeedItems = ['Rice Bowl', 'Signature Drink'];

function CreateRestaurantPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const previewRestaurantId = useMemo(
    () => slugPreview(form.restaurantId || form.restaurantName) || 'restaurant_id_preview',
    [form.restaurantId, form.restaurantName]
  );

  const previewAdminName = useMemo(
    () => String(form.adminDisplayName || '').trim() || fallbackAdminName(form.restaurantName),
    [form.adminDisplayName, form.restaurantName]
  );

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const payload = {
        restaurantName: form.restaurantName.trim(),
        restaurantId: form.restaurantId.trim(),
        adminDisplayName: form.adminDisplayName.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword,
        phone: form.phone.trim(),
        address: form.address.trim(),
        timezone: form.timezone.trim(),
        openingHours: form.openingHours,
        closingHours: form.closingHours,
        seedSampleMenu: Boolean(form.seedSampleMenu),
      };

      const created = await adminApi.createRestaurant(payload);
      setResult(created);
      setForm({
        ...initialForm,
        timezone: form.timezone || initialForm.timezone,
      });
    } catch (requestError) {
      setError(requestError.message || 'Failed to create restaurant. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-restaurant-page">
      <section className="create-restaurant-hero">
        <div className="create-restaurant-hero-card">
          <p className="create-restaurant-eyebrow">Super Admin Onboarding</p>
          <h1 className="create-restaurant-title">Create a new restaurant workspace.</h1>
          <p className="create-restaurant-subtitle">
            Spin up a new tenant with its own admin login, restaurant profile, operating hours,
            and optional starter menu so the team can begin testing immediately.
          </p>
          <div className="create-restaurant-hero-pills">
            <span className="create-restaurant-pill">
              <FontAwesomeIcon icon={faUserShield} />
              Restaurant admin account
            </span>
            <span className="create-restaurant-pill">
              <FontAwesomeIcon icon={faLayerGroup} />
              Scoped restaurant record
            </span>
            <span className="create-restaurant-pill">
              <FontAwesomeIcon icon={faMagicWandSparkles} />
              Optional starter menu
            </span>
          </div>
        </div>

        <aside className="create-restaurant-side-card">
          <p className="create-restaurant-side-title">What gets created</p>
          <div className="create-restaurant-side-list">
            <div className="create-restaurant-side-item">
              <div className="create-restaurant-side-icon">
                <FontAwesomeIcon icon={faStore} />
              </div>
              <div className="create-restaurant-side-copy">
                <strong>Restaurant workspace</strong>
                <span>Profile, hours, timezone, bot defaults, and plan scaffolding are initialized.</span>
              </div>
            </div>
            <div className="create-restaurant-side-item">
              <div className="create-restaurant-side-icon">
                <FontAwesomeIcon icon={faUserShield} />
              </div>
              <div className="create-restaurant-side-copy">
                <strong>Admin portal user</strong>
                <span>Firebase auth account plus Firestore role mapping for restaurant access.</span>
              </div>
            </div>
            <div className="create-restaurant-side-item">
              <div className="create-restaurant-side-icon">
                <FontAwesomeIcon icon={faSeedling} />
              </div>
              <div className="create-restaurant-side-copy">
                <strong>Starter operating setup</strong>
                <span>Seed a simple menu so the WhatsApp ordering flow can be tested right away.</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {result ? (
        <section className="create-restaurant-success">
          <div className="create-restaurant-success-header">
            <div className="create-restaurant-success-icon">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div>
              <h2 className="create-restaurant-success-title">Restaurant created successfully</h2>
              <p className="create-restaurant-success-copy">
                The workspace, admin account, and optional starter menu are ready for the next setup step.
              </p>
            </div>
          </div>

          <div className="create-restaurant-success-grid">
            <div className="create-restaurant-success-chip">
              <span className="create-restaurant-success-chip-label">Restaurant ID</span>
              <span className="create-restaurant-success-chip-value">{result.restaurant.id}</span>
            </div>
            <div className="create-restaurant-success-chip">
              <span className="create-restaurant-success-chip-label">Restaurant Name</span>
              <span className="create-restaurant-success-chip-value">{result.restaurant.name}</span>
            </div>
            <div className="create-restaurant-success-chip">
              <span className="create-restaurant-success-chip-label">Admin Login</span>
              <span className="create-restaurant-success-chip-value">{result.adminUser.email}</span>
            </div>
            <div className="create-restaurant-success-chip">
              <span className="create-restaurant-success-chip-label">Seeded Menu Items</span>
              <span className="create-restaurant-success-chip-value">
                {Number(result.onboarding.seededMenuCount || 0)} item(s)
              </span>
            </div>
          </div>

          <div className="create-restaurant-success-actions">
            <button
              type="button"
              className="create-restaurant-button-secondary"
              onClick={() => setResult(null)}
            >
              <FontAwesomeIcon icon={faStore} />
              Create another restaurant
            </button>
            <button
              type="button"
              className="create-restaurant-button"
              onClick={() => navigate('/restaurants')}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to restaurants
            </button>
          </div>
        </section>
      ) : (
        <section className="create-restaurant-grid">
          <div className="create-restaurant-form-card">
            <div className="create-restaurant-section-header">
              <div>
                <h2 className="create-restaurant-section-title">Restaurant details</h2>
                <p className="create-restaurant-section-copy">
                  Fill in the tenant identity and the admin contact that should own this workspace.
                </p>
              </div>
              <span className="create-restaurant-section-badge">
                <FontAwesomeIcon icon={faBolt} />
                Live onboarding
              </span>
            </div>

            {error ? <div className="create-restaurant-error">{error}</div> : null}

            <form className="create-restaurant-form" onSubmit={handleSubmit}>
              <div className="create-restaurant-fieldset two">
                <div className="create-restaurant-field">
                  <div className="create-restaurant-label-row">
                    <label className="create-restaurant-label" htmlFor="restaurantName">Restaurant name</label>
                    <span className="create-restaurant-hint">Required</span>
                  </div>
                  <input
                    id="restaurantName"
                    className="create-restaurant-input"
                    type="text"
                    value={form.restaurantName}
                    onChange={(event) => updateField('restaurantName', event.target.value)}
                    placeholder="Lead Mall"
                    required
                  />
                </div>

                <div className="create-restaurant-field">
                  <div className="create-restaurant-label-row">
                    <label className="create-restaurant-label" htmlFor="restaurantId">Custom restaurant ID</label>
                    <span className="create-restaurant-hint">Optional</span>
                  </div>
                  <input
                    id="restaurantId"
                    className="create-restaurant-input"
                    type="text"
                    value={form.restaurantId}
                    onChange={(event) => updateField('restaurantId', event.target.value)}
                    placeholder="lead_mall"
                  />
                </div>
              </div>

              <div className="create-restaurant-fieldset two">
                <div className="create-restaurant-field">
                  <div className="create-restaurant-label-row">
                    <label className="create-restaurant-label" htmlFor="adminEmail">Admin email</label>
                    <span className="create-restaurant-hint">Required</span>
                  </div>
                  <input
                    id="adminEmail"
                    className="create-restaurant-input"
                    type="email"
                    value={form.adminEmail}
                    onChange={(event) => updateField('adminEmail', event.target.value)}
                    placeholder="owner@restaurant.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="create-restaurant-field">
                  <div className="create-restaurant-label-row">
                    <label className="create-restaurant-label" htmlFor="adminPassword">Admin password</label>
                    <span className="create-restaurant-hint">Required</span>
                  </div>
                  <input
                    id="adminPassword"
                    className="create-restaurant-input"
                    type="password"
                    value={form.adminPassword}
                    onChange={(event) => updateField('adminPassword', event.target.value)}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="create-restaurant-fieldset two">
                <div className="create-restaurant-field">
                  <div className="create-restaurant-label-row">
                    <label className="create-restaurant-label" htmlFor="adminDisplayName">Admin display name</label>
                    <span className="create-restaurant-hint">Optional</span>
                  </div>
                  <input
                    id="adminDisplayName"
                    className="create-restaurant-input"
                    type="text"
                    value={form.adminDisplayName}
                    onChange={(event) => updateField('adminDisplayName', event.target.value)}
                    placeholder="Lead Mall Admin"
                  />
                </div>

                <div className="create-restaurant-field">
                  <div className="create-restaurant-label-row">
                    <label className="create-restaurant-label" htmlFor="phone">Phone</label>
                    <span className="create-restaurant-hint">Optional</span>
                  </div>
                  <input
                    id="phone"
                    className="create-restaurant-input"
                    type="text"
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    placeholder="+234..."
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="create-restaurant-fieldset">
                <div className="create-restaurant-field full">
                  <div className="create-restaurant-label-row">
                    <label className="create-restaurant-label" htmlFor="address">Address</label>
                    <span className="create-restaurant-hint">Optional</span>
                  </div>
                  <textarea
                    id="address"
                    className="create-restaurant-textarea"
                    value={form.address}
                    onChange={(event) => updateField('address', event.target.value)}
                    placeholder="Street, area, city"
                  />
                </div>
              </div>

              <div className="create-restaurant-fieldset three">
                <div className="create-restaurant-field">
                  <div className="create-restaurant-label-row">
                    <label className="create-restaurant-label" htmlFor="timezone">Timezone</label>
                  </div>
                  <input
                    id="timezone"
                    className="create-restaurant-input"
                    type="text"
                    value={form.timezone}
                    onChange={(event) => updateField('timezone', event.target.value)}
                    placeholder="Africa/Lagos"
                  />
                </div>

                <div className="create-restaurant-field">
                  <div className="create-restaurant-label-row">
                    <label className="create-restaurant-label" htmlFor="openingHours">Opening hour</label>
                  </div>
                  <input
                    id="openingHours"
                    className="create-restaurant-input"
                    type="time"
                    value={form.openingHours}
                    onChange={(event) => updateField('openingHours', event.target.value)}
                  />
                </div>

                <div className="create-restaurant-field">
                  <div className="create-restaurant-label-row">
                    <label className="create-restaurant-label" htmlFor="closingHours">Closing hour</label>
                  </div>
                  <input
                    id="closingHours"
                    className="create-restaurant-input"
                    type="time"
                    value={form.closingHours}
                    onChange={(event) => updateField('closingHours', event.target.value)}
                  />
                </div>
              </div>

              <label className="create-restaurant-checkbox">
                <input
                  type="checkbox"
                  checked={form.seedSampleMenu}
                  onChange={(event) => updateField('seedSampleMenu', event.target.checked)}
                />
                <div>
                  <strong>Seed starter menu</strong>
                  <span>
                    Create a couple of starter items so the restaurant can test portal and WhatsApp
                    ordering immediately after onboarding.
                  </span>
                </div>
              </label>

              <div className="create-restaurant-actions">
                <div className="create-restaurant-actions-left">
                  This creates both the restaurant workspace and the first restaurant admin login.
                </div>
                <div className="create-restaurant-actions-right">
                  <button
                    type="button"
                    className="create-restaurant-button-secondary"
                    onClick={() => navigate('/restaurants')}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Cancel
                  </button>
                  <button type="submit" className="create-restaurant-button" disabled={loading}>
                    <FontAwesomeIcon icon={loading ? faSpinner : faCheckCircle} spin={loading} />
                    {loading ? 'Creating workspace...' : 'Create restaurant'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <aside className="create-restaurant-preview-card">
            <div className="create-restaurant-section-header">
              <div>
                <h2 className="create-restaurant-section-title">Live preview</h2>
                <p className="create-restaurant-section-copy">
                  This is how the workspace will be initialized if you submit the form right now.
                </p>
              </div>
            </div>

            <div className="create-restaurant-preview-block">
              <p className="create-restaurant-preview-kicker">Restaurant workspace</p>
              <p className="create-restaurant-preview-name">
                {form.restaurantName.trim() || 'New Restaurant'}
              </p>
              <div className="create-restaurant-preview-id">
                <FontAwesomeIcon icon={faIdBadge} />
                {previewRestaurantId}
              </div>
            </div>

            <div className="create-restaurant-preview-meta">
              <div className="create-restaurant-preview-row">
                <span className="create-restaurant-preview-label">Admin</span>
                <span className="create-restaurant-preview-value">{previewAdminName}</span>
              </div>
              <div className="create-restaurant-preview-row">
                <span className="create-restaurant-preview-label">Email</span>
                <span className="create-restaurant-preview-value">
                  {form.adminEmail.trim() || 'owner@restaurant.com'}
                </span>
              </div>
              <div className="create-restaurant-preview-row">
                <span className="create-restaurant-preview-label">Timezone</span>
                <span className="create-restaurant-preview-value">{form.timezone || 'Africa/Lagos'}</span>
              </div>
              <div className="create-restaurant-preview-row">
                <span className="create-restaurant-preview-label">Operating hours</span>
                <span className="create-restaurant-preview-value">
                  {form.openingHours || '08:00'} to {form.closingHours || '22:00'}
                </span>
              </div>
              <div className="create-restaurant-preview-row">
                <span className="create-restaurant-preview-label">Contact</span>
                <span className="create-restaurant-preview-value">
                  {form.phone.trim() || 'Phone not set yet'}
                </span>
              </div>
            </div>

            <div className="create-restaurant-preview-block">
              <p className="create-restaurant-preview-kicker">Starter configuration</p>
              <div className="create-restaurant-preview-seed">
                <div className="create-restaurant-preview-seed-item">
                  <span className="create-restaurant-preview-dot" />
                  <span>Plan scaffold: Starter</span>
                </div>
                <div className="create-restaurant-preview-seed-item">
                  <span className="create-restaurant-preview-dot" />
                  <span>Bot enabled with manual confirmation</span>
                </div>
                <div className="create-restaurant-preview-seed-item">
                  <span className="create-restaurant-preview-dot" />
                  <span>
                    {form.seedSampleMenu
                      ? `Seed menu: ${previewSeedItems.join(' and ')}`
                      : 'No sample menu will be created'}
                  </span>
                </div>
              </div>
            </div>

            <div className="create-restaurant-preview-block">
              <p className="create-restaurant-preview-kicker">Captured from this form</p>
              <div className="create-restaurant-preview-seed">
                <div className="create-restaurant-preview-seed-item">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span>Admin login credentials</span>
                </div>
                <div className="create-restaurant-preview-seed-item">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span>Restaurant address and phone</span>
                </div>
                <div className="create-restaurant-preview-seed-item">
                  <FontAwesomeIcon icon={faClock} />
                  <span>Timezone and operating hours</span>
                </div>
                <div className="create-restaurant-preview-seed-item">
                  <FontAwesomeIcon icon={faGlobeAfrica} />
                  <span>Tenant scope for portal access</span>
                </div>
              </div>
            </div>
          </aside>
        </section>
      )}
    </div>
  );
}

export default CreateRestaurantPage;
