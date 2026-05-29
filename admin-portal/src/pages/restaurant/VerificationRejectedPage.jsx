import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { verificationApi } from '../../api/verification';
import './VerificationPage.css';

const VerificationRejectedPage = () => {
  const { user, logout, refreshUser } = useAuth();
  const restaurantName = user?.restaurantName || 'Your Restaurant';
  const reason = user?.verificationRejectionReason || '';
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleResubmit = async () => {
    if (!user?.restaurantId) return;
    setLoading(true);
    setError('');
    try {
      await verificationApi.resubmit(user.restaurantId);
      await refreshUser();
      setDone(true);
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="vpage-shell">
        <div className="vpage-card">
          <div className="vpage-icon vpage-icon--pending">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <p className="vpage-eyebrow">Resubmitted</p>
          <h1 className="vpage-title">Back Under Review</h1>
          <p className="vpage-body">
            Your application has been resubmitted. The Servra team will review it again shortly.
          </p>
          <button className="vpage-logout-btn" onClick={logout}>Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="vpage-shell">
      <div className="vpage-card">

        <div className="vpage-icon vpage-icon--rejected">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>

        <p className="vpage-eyebrow vpage-eyebrow--red">Verification Rejected</p>
        <h1 className="vpage-title">Application Not Approved</h1>

        <p className="vpage-body">
          Unfortunately, <strong>{restaurantName}</strong>'s application was not approved at
          this time. You can review the reason below and resubmit once addressed.
        </p>

        {reason && (
          <div className="vpage-reason-box">
            <p className="vpage-reason-label">Reason from Servra</p>
            <p className="vpage-reason-text">{reason}</p>
          </div>
        )}

        {error && <p className="vpage-error">{error}</p>}

        <button
          className="vpage-primary-btn"
          onClick={handleResubmit}
          disabled={loading}
        >
          {loading ? 'Resubmitting…' : 'Resubmit Application'}
        </button>

        <p className="vpage-help">
          Need help? Email{' '}
          <a href="mailto:support@servra.app">support@servra.app</a>
        </p>

        <button className="vpage-logout-btn" onClick={logout}>
          Sign out
        </button>
      </div>
    </div>
  );
};

export default VerificationRejectedPage;
