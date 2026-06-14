import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faShieldHalved, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../auth/AuthContext';
import './AccountPages.css';

const ProfilePage = () => {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setSaving(true);

    const result = await changePassword({
      currentPassword,
      newPassword,
    });

    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(result.message);
    } else {
      setError(result.message);
    }

    setSaving(false);
  };

  return (
    <div className="account-page-shell">
      <section className="account-hero">
        <div>
          <p className="account-eyebrow">Account</p>
          <h1>Profile</h1>
          <p className="account-subtitle">
            Your access identity for the restaurant portal, including role and restaurant scope.
          </p>
        </div>
        <div className="account-hero-side">
          <div>
            <span>Role</span>
            <strong>{user?.role || '-'}</strong>
          </div>
          <p>This page is meant for the signed-in operator, not the restaurant settings record.</p>
        </div>
      </section>

      <div className="account-grid">
        <section className="account-panel">
          <h2>Identity</h2>
          <div className="account-list">
            <div className="account-list-row">
              <span>Name</span>
              <strong>{user?.name || user?.displayName || '-'}</strong>
            </div>
            <div className="account-list-row">
              <span>Email</span>
              <strong>{user?.email || '-'}</strong>
            </div>
            <div className="account-list-row">
              <span>Role</span>
              <strong>{user?.role || '-'}</strong>
            </div>
          </div>
        </section>

        <section className="account-panel">
          <h2>Scope</h2>
          <div className="account-list">
            <div className="account-list-row">
              <span>Restaurant ID</span>
              <strong>{user?.restaurantId || '-'}</strong>
            </div>
            <div className="account-list-row">
              <span>Permissions</span>
              <strong>{Array.isArray(user?.permissions) ? user.permissions.length : 0}</strong>
            </div>
          </div>
        </section>

        <section className="account-panel full">
          <h2>
            <FontAwesomeIcon icon={faShieldHalved} />
            Password
          </h2>
          <p>Change your password while signed in. You&apos;ll need your current password.</p>

          {error ? <div className="account-alert account-alert--error">{error}</div> : null}
          {success ? (
            <div className="account-alert account-alert--success">
              <FontAwesomeIcon icon={faCheck} />
              {success}
            </div>
          ) : null}

          <form className="account-password-form" onSubmit={handlePasswordSubmit}>
            <label className="account-field">
              <span>Current password</span>
              <input
                type="password"
                className="account-input"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                required
                disabled={saving}
              />
            </label>

            <label className="account-field">
              <span>New password</span>
              <input
                type="password"
                className="account-input"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
                disabled={saving}
              />
            </label>

            <label className="account-field">
              <span>Confirm new password</span>
              <input
                type="password"
                className="account-input"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
                disabled={saving}
              />
            </label>

            <div className="account-password-actions">
              <button type="submit" className="account-save-btn" disabled={saving}>
                {saving ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Updating...
                  </>
                ) : (
                  'Update password'
                )}
              </button>
              <p className="account-password-hint">
                Don&apos;t know your current password?{' '}
                <Link to="/forgot-password">Request a reset link</Link>
              </p>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
