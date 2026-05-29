import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import './VerificationPage.css';

const VerificationPendingPage = () => {
  const { user, logout } = useAuth();
  const restaurantName = user?.restaurantName || 'Your Restaurant';
  const submittedAt = user?.verificationSubmittedAt
    ? new Date(user.verificationSubmittedAt).toLocaleDateString('en-NG', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  return (
    <div className="vpage-shell">
      <div className="vpage-card">

        <div className="vpage-icon vpage-icon--pending">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>

        <p className="vpage-eyebrow">Account Under Review</p>
        <h1 className="vpage-title">Verification Pending</h1>

        <p className="vpage-body">
          <strong>{restaurantName}</strong> has been submitted and is currently being
          reviewed by the Servra team. This usually takes less than 24 hours.
        </p>

        {submittedAt && (
          <div className="vpage-meta">
            <span>Submitted</span>
            <strong>{submittedAt}</strong>
          </div>
        )}

        <div className="vpage-steps">
          <div className="vpage-step vpage-step--done">
            <div className="vpage-step-dot" />
            <div>
              <strong>Registration complete</strong>
              <p>Your account has been created</p>
            </div>
          </div>
          <div className="vpage-step vpage-step--active">
            <div className="vpage-step-dot" />
            <div>
              <strong>Under review</strong>
              <p>Servra team is reviewing your details</p>
            </div>
          </div>
          <div className="vpage-step vpage-step--upcoming">
            <div className="vpage-step-dot" />
            <div>
              <strong>Account approved</strong>
              <p>Full dashboard access unlocked</p>
            </div>
          </div>
        </div>

        <p className="vpage-help">
          Questions? Email us at{' '}
          <a href="mailto:support@servra.app">support@servra.app</a>
        </p>

        <button className="vpage-logout-btn" onClick={logout}>
          Sign out
        </button>
      </div>
    </div>
  );
};

export default VerificationPendingPage;
