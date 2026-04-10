import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowUpRightFromSquare,
  faCheckCircle,
  faCircleExclamation,
  faClock,
  faLink,
  faListCheck,
  faMobileScreenButton,
  faSpinner,
  faStore,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons';
import restaurantsApi from '../../api/restaurants';
import adminApi from '../../api/admin';
import { getWhatsappProvisioningMeta } from '../../utils/whatsappPresentation';
import './RestaurantActivationPage.css';

const STATE_LABELS = {
  draft: 'Draft',
  configured: 'Configured',
  ready_for_activation: 'Ready for Activation',
  activating: 'Activating',
  active: 'Active',
  degraded: 'Degraded',
};

const STEP_LABELS = {
  queued: 'Queued',
  validate_readiness: 'Validating readiness',
  verify_whatsapp_provisioning: 'Verifying WhatsApp provisioning',
  verify_runtime_health: 'Verifying runtime health',
  mark_live: 'Marking restaurant live',
  completed: 'Completed',
};

function Badge({ label, tone = 'default' }) {
  return <span className={`activation-badge activation-badge-${tone}`}>{label}</span>;
}

const ACTION_PATHS = {
  settings: '/restaurants/:restaurantId',
  menu: '/restaurants/:restaurantId',
  whatsapp: '/restaurants/:restaurantId',
  detail: '/restaurants/:restaurantId',
};

function resolveActionHref(restaurantId, actionPath) {
  const template = ACTION_PATHS[actionPath] || `/restaurants/${restaurantId}`;
  return template.replace(':restaurantId', restaurantId);
}

function getNextRecommendedTransition(restaurant) {
  const options = Array.isArray(restaurant?.activationTransitions)
    ? restaurant.activationTransitions
    : [];
  return options.find((option) => option.allowed) || null;
}

function getStepStatus(item) {
  if (!item) {
    return { tone: 'default', label: 'Unknown' };
  }
  if (item.status === 'valid') {
    return { tone: 'healthy', label: 'Ready' };
  }
  if (item.status === 'warning') {
    return { tone: 'warning', label: 'Needs review' };
  }
  return { tone: 'critical', label: 'Blocked' };
}

function createRequestId() {
  return `activation_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getActivationJobTone(status) {
  if (status === 'completed') {
    return 'healthy';
  }
  if (status === 'failed') {
    return 'critical';
  }
  if (status === 'running' || status === 'pending') {
    return 'warning';
  }
  return 'default';
}

function formatStepStatusLabel(status) {
  if (status === 'completed') {
    return 'Completed';
  }
  if (status === 'failed') {
    return 'Failed';
  }
  if (status === 'running') {
    return 'Running';
  }
  return 'Queued';
}

function RestaurantActivationPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rechecking, setRechecking] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [healthEvents, setHealthEvents] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const detail = await restaurantsApi.getById(restaurantId);
      setRestaurant(detail.restaurant);
      setHealthEvents(detail.healthEvents || []);
    } catch (requestError) {
      setError(requestError.message || 'Failed to load activation workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurant?.latestActivationJob) {
      return undefined;
    }

    const status = String(restaurant.latestActivationJob.status || '').trim().toLowerCase();
    if (!['pending', 'running', 'retrying'].includes(status)) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      load();
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [restaurant?.latestActivationJob?.id, restaurant?.latestActivationJob?.status, restaurantId]);

  const nextRecommendedTransition = useMemo(
    () => getNextRecommendedTransition(restaurant),
    [restaurant]
  );

  async function applyLifecycle(targetState) {
    if (!targetState) {
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await restaurantsApi.transitionRestaurant(restaurantId, {
        targetState,
        requestId: createRequestId(),
        note: `Transitioned via Activation Center to ${STATE_LABELS[targetState] || targetState}.`,
      });
      setRestaurant((previous) => ({
        ...previous,
        ...(response.restaurant || {}),
      }));
    } catch (requestError) {
      const fallbackRestaurant = requestError?.payload?.restaurant || null;
      if (fallbackRestaurant) {
        setRestaurant((previous) => ({
          ...previous,
          ...fallbackRestaurant,
        }));
      }
      setError(requestError.message || 'Failed to transition lifecycle.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRecheck() {
    setRechecking(true);
    setError('');
    try {
      await adminApi.recheckRestaurantHealth(restaurantId);
      await load();
    } catch (requestError) {
      setError(requestError.message || 'Failed to recheck restaurant health.');
    } finally {
      setRechecking(false);
    }
  }

  async function handleRetryActivation() {
    const jobId = restaurant?.latestActivationJob?.id;
    if (!jobId) {
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await restaurantsApi.retryActivationJob(restaurantId, jobId);
      setRestaurant((previous) => ({
        ...previous,
        ...(response.restaurant || {}),
      }));
    } catch (requestError) {
      setError(requestError.message || 'Failed to retry activation job.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="activation-loading">
        <FontAwesomeIcon icon={faSpinner} spin />
        <span>Loading activation center...</span>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="activation-empty">
        <FontAwesomeIcon icon={faCircleExclamation} />
        <p>Restaurant activation data could not be loaded.</p>
        <button onClick={() => navigate('/restaurants')}>Back to restaurants</button>
      </div>
    );
  }

  const checklistItems = restaurant.activationChecklist?.items || [];
  const summary = restaurant.activationValidation?.summary || {};
  const activationJob = restaurant.latestActivationJob || null;
  const activationInProgress = restaurant.activationState === 'activating';
  const whatsappProvisioning = getWhatsappProvisioningMeta(restaurant.whatsappProvisioningState);

  return (
    <div className="activation-page">
      <div className="activation-header">
        <div>
          <button className="activation-back" onClick={() => navigate(`/restaurants/${restaurantId}`)}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to restaurant
          </button>
          <p className="activation-eyebrow">GO-LIVE WORKFLOW</p>
          <h1>{restaurant.name} Activation Center</h1>
          <p className="activation-subtitle">
            Run onboarding, validation, WhatsApp readiness, and launch decisions from one operational screen.
          </p>
        </div>

        <div className="activation-header-actions">
          <button className="activation-ghost" onClick={handleRecheck} disabled={rechecking}>
            <FontAwesomeIcon icon={faClock} spin={rechecking} />
            Recheck health
          </button>
          {nextRecommendedTransition ? (
            <button className="activation-primary" onClick={() => applyLifecycle(nextRecommendedTransition.targetState)} disabled={saving}>
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
              {saving ? 'Saving...' : `Move to ${STATE_LABELS[nextRecommendedTransition.targetState]}`}
            </button>
          ) : null}
        </div>
      </div>

      {error ? <div className="activation-error">{error}</div> : null}

      <div className="activation-top-grid">
        <div className="activation-summary-card">
          <div className="activation-summary-row">
            <span>Lifecycle</span>
            <Badge
              label={STATE_LABELS[restaurant.activationState] || restaurant.activationState}
              tone={
                restaurant.activationState === 'active'
                  ? 'healthy'
                  : restaurant.activationState === 'activating' || restaurant.activationState === 'ready_for_activation'
                    ? 'warning'
                    : 'default'
              }
            />
          </div>
          <div className="activation-summary-row">
            <span>Runtime health</span>
            <Badge label={restaurant.healthStatus || 'unknown'} tone={restaurant.healthStatus || 'default'} />
          </div>
          <div className="activation-summary-row">
            <span>Checklist readiness</span>
            <strong>{restaurant.activationChecklist?.completedCount || 0}/{restaurant.activationChecklist?.totalCount || 0}</strong>
          </div>
          <div className="activation-summary-row">
            <span>Blockers</span>
            <strong>{summary.blockerCount || 0}</strong>
          </div>
          <div className="activation-summary-row">
            <span>Warnings</span>
            <strong>{summary.warningCount || 0}</strong>
          </div>
          <div className="activation-summary-row">
            <span>WhatsApp</span>
            <strong>{restaurant.whatsappStatus || 'unknown'}</strong>
          </div>
          {activationJob ? (
            <div className="activation-summary-row">
              <span>Activation job</span>
              <Badge
                label={STEP_LABELS[activationJob.currentStep] || activationJob.currentStep || activationJob.status}
                tone={getActivationJobTone(activationJob.status)}
              />
            </div>
          ) : null}
        </div>

        <div className="activation-recommendation-card">
          <div className="activation-recommendation-header">
            <FontAwesomeIcon icon={faListCheck} />
            <div>
              <p>Recommended next move</p>
              <strong>
                {activationInProgress
                  ? 'Activation is running'
                  : activationJob?.status === 'failed'
                    ? 'Retry activation after fixing blockers'
                  : nextRecommendedTransition
                    ? `Move to ${STATE_LABELS[nextRecommendedTransition.targetState]}`
                    : 'No automatic recommendation yet'}
              </strong>
            </div>
          </div>
          <p className="activation-recommendation-copy">
            {activationInProgress
              ? (
                  activationJob?.error
                    || activationJob?.note
                    || `The activation job is currently on ${STEP_LABELS[activationJob?.currentStep] || activationJob?.currentStep || 'its next step'}.`
                )
              : nextRecommendedTransition
                ? (nextRecommendedTransition.message || 'The backend transition engine allows the next lifecycle move for this tenant.')
                : 'This tenant still needs more setup or review before the next lifecycle stage is safe.'}
          </p>
          <div className="activation-links">
            <button onClick={() => navigate(`/restaurants/${restaurantId}`)}>
              <FontAwesomeIcon icon={faStore} />
              Full restaurant detail
            </button>
            <button onClick={() => navigate(`/restaurants/${restaurantId}`)}>
              <FontAwesomeIcon icon={faMobileScreenButton} />
              WhatsApp setup
            </button>
            {activationJob?.status === 'failed' ? (
              <button onClick={handleRetryActivation} disabled={saving}>
                <FontAwesomeIcon icon={faSpinner} spin={saving} />
                Retry activation
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="activation-main-grid">
        <section className="activation-panel">
          <div className="activation-panel-header">
            <h2>Launch checklist</h2>
            <span>{checklistItems.length} steps</span>
          </div>
          <div className="activation-checklist">
            {checklistItems.map((item) => {
              const stepStatus = getStepStatus(item);
              return (
                <div key={item.key} className="activation-step">
                  <div className="activation-step-head">
                    <div>
                      <p>{item.label}</p>
                      <span>{item.detail}</span>
                    </div>
                    <Badge label={stepStatus.label} tone={stepStatus.tone} />
                  </div>
                  {Array.isArray(item.issues) && item.issues.length > 0 ? (
                    <div className="activation-step-issues">
                      {item.issues.map((issue) => (
                        <span key={`${item.key}-${issue}`}>{issue}</span>
                      ))}
                    </div>
                  ) : null}
                  {item.resolution ? (
                    <div className="activation-step-actions">
                      <button onClick={() => navigate(resolveActionHref(restaurantId, item.resolution.path))}>
                        <FontAwesomeIcon icon={faLink} />
                        {item.resolution.label}
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="activation-panel">
          <div className="activation-panel-header">
            <h2>Operational status</h2>
            <span>Live signals</span>
          </div>
          {activationJob ? (
            <div className="activation-issues">
              <h3>Activation job</h3>
              <div className="activation-issue-row">
                <Badge label={activationJob.status} tone={getActivationJobTone(activationJob.status)} />
                <span>{STEP_LABELS[activationJob.currentStep] || activationJob.currentStep || 'Queued'}</span>
              </div>
              {activationJob.error ? (
                <div className="activation-issue-row">
                  <Badge label="Failure" tone="critical" />
                  <span>{activationJob.error}</span>
                </div>
              ) : null}
              {Array.isArray(activationJob.stepHistory) && activationJob.stepHistory.length > 0 ? (
                <div className="activation-issues">
                  {activationJob.stepHistory.map((step) => (
                    <div key={`${step.step}-${step.status}`} className="activation-issue-row">
                      <Badge
                        label={formatStepStatusLabel(step.status)}
                        tone={step.status === 'completed' ? 'healthy' : step.status === 'failed' ? 'critical' : 'warning'}
                      />
                      <span>
                        {STEP_LABELS[step.step] || step.step}
                        {step.error ? ` - ${step.error}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="activation-status-grid">
            <div className="activation-status-card">
              <FontAwesomeIcon icon={faUserShield} />
              <strong>Admin owner</strong>
              <p>{restaurant.owner || 'Unassigned'}</p>
            </div>
            <div className="activation-status-card">
              <FontAwesomeIcon icon={faMobileScreenButton} />
              <strong>WhatsApp provisioning</strong>
              <p>{restaurant.whatsappActivationReady ? `${whatsappProvisioning.label} ready` : whatsappProvisioning.label}</p>
            </div>
            <div className="activation-status-card">
              <FontAwesomeIcon icon={faStore} />
              <strong>Menu count</strong>
              <p>{restaurant.menuItemCount || 0} item(s)</p>
            </div>
            <div className="activation-status-card">
              <FontAwesomeIcon icon={faCheckCircle} />
              <strong>Health issues</strong>
              <p>{Array.isArray(restaurant.healthIssues) ? restaurant.healthIssues.length : 0}</p>
            </div>
          </div>

          <div className="activation-issues">
            <h3>Current health issues</h3>
            {Array.isArray(restaurant.healthIssues) && restaurant.healthIssues.length > 0 ? (
              restaurant.healthIssues.map((issue) => (
                <div key={issue.code || issue.key} className="activation-issue-row">
                  <Badge label={issue.code || issue.key} tone={issue.severity === 'warning' ? 'warning' : issue.severity || 'default'} />
                  <span>{issue.message || issue.label}</span>
                </div>
              ))
            ) : (
              <p className="activation-empty-copy">No active runtime issues right now.</p>
            )}
          </div>

          <div className="activation-issues">
            <h3>Recent health events</h3>
            {healthEvents.length > 0 ? (
              healthEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="activation-event-row">
                  <div>
                    <strong>{event.newStatus || 'unknown'}</strong>
                    <span>{event.source || 'health_check'}</span>
                  </div>
                  <Badge label={(event.lifecycleSync?.code || 'event').toLowerCase()} tone="default" />
                </div>
              ))
            ) : (
              <p className="activation-empty-copy">No recent health events yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default RestaurantActivationPage;
