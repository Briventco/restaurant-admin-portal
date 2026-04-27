import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import onboardingApi from '../../api/onboarding';
import './OnboardingPage.css';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      if (!user?.restaurantId) {
        setLoading(false);
        return;
      }

      // Check if onboarding is already completed
      if (user?.onboarding?.status === 'completed') {
        navigate('/overview', { replace: true });
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await onboardingApi.getSummary(user.restaurantId);
        if (!cancelled) {
          setSummary(response);
          // Double-check onboarding status after loading summary
          if (response?.onboarding?.status === 'completed') {
            navigate('/overview', { replace: true });
          }
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message || 'Failed to load onboarding progress.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, [user?.restaurantId, user?.onboarding?.status, navigate]);

  const handleRefresh = async () => {
    if (!user?.restaurantId) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [response] = await Promise.all([
        onboardingApi.getSummary(user.restaurantId),
        refreshUser(),
      ]);
      setSummary(response);
    } catch (requestError) {
      setError(requestError.message || 'Failed to refresh onboarding progress.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!user?.restaurantId) {
      return;
    }

    setFinishing(true);
    setError('');
    try {
      await onboardingApi.complete(user.restaurantId);
      await refreshUser();
      navigate('/overview', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to finish onboarding yet.');
      setFinishing(false);
    }
  };

  const progress = summary?.onboarding?.progress;
  const checks = Array.isArray(progress?.checks) ? progress.checks : [];

  return (
    <div className="restaurant-onboarding-page">
      <section className="restaurant-onboarding-hero">
        <div>
          <p className="restaurant-onboarding-eyebrow">Restaurant Onboarding</p>
          <h1>Finish setup before you go live.</h1>
          <p className="restaurant-onboarding-copy">
            Work through the essentials below. The required items unlock your live restaurant
            overview and the rest of the operator flow.
          </p>
        </div>

        <div className="restaurant-onboarding-score">
          <strong>
            {progress?.completedCount || 0}/{progress?.totalCount || 0}
          </strong>
          <span>Checklist items completed</span>
        </div>
      </section>

      {error ? <div className="restaurant-onboarding-alert">{error}</div> : null}

      <section className="restaurant-onboarding-card">
        <div className="restaurant-onboarding-card-head">
          <div>
            <h2>{summary?.restaurant?.name || user?.restaurantName || 'Your restaurant'}</h2>
            <p>
              {summary?.restaurant?.timezone || 'Africa/Lagos'} ·{' '}
              {summary?.onboarding?.status || user?.onboarding?.status || 'in_progress'}
            </p>
          </div>

          <button type="button" className="restaurant-onboarding-refresh" onClick={handleRefresh} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh progress'}
          </button>
        </div>

        <div className="restaurant-onboarding-list">
          {checks.map((item) => (
            <div className={`restaurant-onboarding-item ${item.complete ? 'done' : 'todo'}`} key={item.id}>
              <div className="restaurant-onboarding-item-mark">{item.complete ? 'Done' : 'Todo'}</div>
              <div className="restaurant-onboarding-item-copy">
                <strong>{item.label}</strong>
                <span>
                  {item.complete
                    ? 'This setup item is already in place.'
                    : 'Open the linked page to complete this step.'}
                </span>
              </div>
              <Link to={item.href} className="restaurant-onboarding-item-link">
                Open
              </Link>
            </div>
          ))}
        </div>

        <div className="restaurant-onboarding-footer">
          <div>
            <strong>
              {progress?.requiredComplete
                ? 'Required setup is complete.'
                : 'Complete profile, hours, menu, WhatsApp, and order settings to finish onboarding.'}
            </strong>
            <p>
              Delivery zones are recommended, but the required checks are enough for the first
              launch pass. Make sure to configure Manual Payment, Notify on New Order, and Accept Orders settings.
            </p>
          </div>

          <button
            type="button"
            className="restaurant-onboarding-finish"
            onClick={handleFinish}
            disabled={finishing || !progress?.requiredComplete}
          >
            {finishing ? 'Finishing...' : 'Finish onboarding'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default OnboardingPage;
