import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { firebaseConfirmPasswordReset } from '../../services/authService';
import './AdminLogin.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = useMemo(
    () => String(searchParams.get('oobCode') || '').trim(),
    [searchParams]
  );

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await firebaseConfirmPasswordReset({ oobCode, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(err.message || 'Unable to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!oobCode) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-brand-section">
            <h1>Invalid reset link</h1>
            <p className="admin-muted-text">
              This password reset link is missing or invalid. Request a new one from the login page.
            </p>
          </div>
          <Link to="/forgot-password" className="admin-submit-btn admin-submit-btn--link">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <button className="back-button" onClick={() => navigate('/login')}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>

        <div className="admin-brand-section">
          <h1>Choose a new password</h1>
          <p className="admin-muted-text">Enter and confirm your new password below.</p>
        </div>

        {error && (
          <div className="admin-error-box">
            {error}
          </div>
        )}

        {done ? (
          <div className="admin-success-box">
            <p>Your password has been updated. You can now sign in with your new password.</p>
            <Link to="/login" className="admin-submit-btn admin-submit-btn--link">
              Go to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-input-group">
              <label className="admin-input-label">New password</label>
              <div className="admin-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="admin-input"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="admin-input-group">
              <label className="admin-input-label">Confirm new password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="admin-input"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your new password"
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="admin-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
