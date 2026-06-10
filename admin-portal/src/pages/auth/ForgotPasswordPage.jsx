import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { firebaseSendPasswordResetEmail } from '../../services/authService';
import './AdminLogin.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await firebaseSendPasswordResetEmail({ email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Unable to send reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1>Reset your password</h1>
          <p className="admin-muted-text">
            Enter the email on your account and we&apos;ll send a reset link.
          </p>
        </div>

        {error && (
          <div className="admin-error-box">
            {error}
          </div>
        )}

        {sent ? (
          <div className="admin-success-box">
            <p>
              If an account exists for <strong>{email.trim()}</strong>, a password reset link
              has been sent. Check your inbox and spam folder.
            </p>
            <Link to="/login" className="admin-submit-btn admin-submit-btn--link">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-input-group">
              <label className="admin-input-label">Email Address</label>
              <input
                type="email"
                className="admin-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <button type="submit" className="admin-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
