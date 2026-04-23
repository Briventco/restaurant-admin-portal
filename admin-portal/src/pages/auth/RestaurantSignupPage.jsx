import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ROLES } from '../../auth/roleConfig';
import onboardingApi from '../../api/onboarding';
import './RestaurantSignupPage.css';

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
};

const RestaurantSignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await onboardingApi.signup(form);
      const result = await login({
        email: form.adminEmail.trim(),
        password: form.adminPassword,
        role: ROLES.RESTAURANT_ADMIN,
      });

      if (!result.success) {
        throw new Error(result.message || 'Your restaurant was created, but auto sign-in failed.');
      }

      navigate('/onboarding', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to create your restaurant workspace.');
      setSubmitting(false);
    }
  };

  return (
    <div className="restaurant-signup-page">
      <div className="restaurant-signup-shell">
        <section className="restaurant-signup-intro">
          <p className="restaurant-signup-eyebrow">For Restaurants</p>
          <h1>Launch your WhatsApp ordering workspace.</h1>
          <p className="restaurant-signup-copy">
            Create your restaurant admin account, set up your business details, and continue into a
            guided onboarding checklist right after signup.
          </p>

          <div className="restaurant-signup-feature-list">
            <div>
              <strong>Own workspace</strong>
              <span>Your restaurant gets its own portal access and scoped data.</span>
            </div>
            <div>
              <strong>Guided setup</strong>
              <span>Finish profile, menu, delivery, and WhatsApp connection step by step.</span>
            </div>
            <div>
              <strong>Fast first launch</strong>
              <span>Start with the essentials, then grow into the rest of the tools later.</span>
            </div>
          </div>
        </section>

        <section className="restaurant-signup-card">
          <div className="restaurant-signup-card-head">
            <h2>Create restaurant account</h2>
            <button type="button" className="restaurant-signup-link" onClick={() => navigate('/login/restaurant-admin')}>
              Already have an account?
            </button>
          </div>

          {error ? <div className="restaurant-signup-error">{error}</div> : null}

          <form className="restaurant-signup-form" onSubmit={handleSubmit}>
            <div className="restaurant-signup-grid">
              <label>
                <span>Restaurant name</span>
                <input
                  value={form.restaurantName}
                  onChange={(event) => updateField('restaurantName', event.target.value)}
                  placeholder="Lead Mall Kitchen"
                  required
                />
              </label>

              <label>
                <span>Workspace ID</span>
                <input
                  value={form.restaurantId}
                  onChange={(event) => updateField('restaurantId', event.target.value)}
                  placeholder="Optional"
                />
              </label>

              <label>
                <span>Owner or admin name</span>
                <input
                  value={form.adminDisplayName}
                  onChange={(event) => updateField('adminDisplayName', event.target.value)}
                  placeholder="Jane Doe"
                />
              </label>

              <label>
                <span>Admin email</span>
                <input
                  type="email"
                  value={form.adminEmail}
                  onChange={(event) => updateField('adminEmail', event.target.value)}
                  placeholder="owner@restaurant.com"
                  required
                />
              </label>

              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={form.adminPassword}
                  onChange={(event) => updateField('adminPassword', event.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
              </label>

              <label>
                <span>Phone</span>
                <input
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  placeholder="+234..."
                />
              </label>

              <label className="full">
                <span>Address</span>
                <input
                  value={form.address}
                  onChange={(event) => updateField('address', event.target.value)}
                  placeholder="Street, area, city"
                />
              </label>

              <label>
                <span>Timezone</span>
                <input
                  value={form.timezone}
                  onChange={(event) => updateField('timezone', event.target.value)}
                />
              </label>

              <label>
                <span>Opening hours</span>
                <input
                  type="time"
                  value={form.openingHours}
                  onChange={(event) => updateField('openingHours', event.target.value)}
                />
              </label>

              <label>
                <span>Closing hours</span>
                <input
                  type="time"
                  value={form.closingHours}
                  onChange={(event) => updateField('closingHours', event.target.value)}
                />
              </label>
            </div>

            <div className="restaurant-signup-actions">
              <button type="button" className="restaurant-signup-secondary" onClick={() => navigate('/')}>
                Back to home
              </button>
              <button type="submit" className="restaurant-signup-primary" disabled={submitting}>
                {submitting ? 'Creating workspace...' : 'Create restaurant workspace'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default RestaurantSignupPage;
