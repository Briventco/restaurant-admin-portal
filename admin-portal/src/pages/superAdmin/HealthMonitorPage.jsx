import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeartbeat,
  faSpinner,
  faSync,
  faSearch,
  faTriangleExclamation,
  faCircleExclamation,
  faCheckCircle,
  faArrowUpRightFromSquare,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import adminApi from '../../api/admin';
import './HealthMonitorPage.css';

function minutesSince(value) {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const parsed = new Date(value).getTime();
  if (!Number.isFinite(parsed)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(0, Math.round((Date.now() - parsed) / 60000));
}

function formatRelativeMinutes(value) {
  const minutes = minutesSince(value);
  if (!Number.isFinite(minutes)) {
    return 'Never checked';
  }
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes === 1) {
    return '1 minute ago';
  }
  if (minutes < 60) {
    return `${minutes} minutes ago`;
  }
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

function Badge({ label, tone = 'default' }) {
  const tones = {
    healthy: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.24)' },
    degraded: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.24)' },
    critical: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.24)' },
    stale: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: 'rgba(148,163,184,0.24)' },
    default: { bg: 'rgba(255,255,255,0.06)', color: '#999', border: 'rgba(255,255,255,0.1)' },
  };
  const style = tones[tone] || tones.default;

  return (
    <span className="hm-badge" style={{ backgroundColor: style.bg, color: style.color, borderColor: style.border }}>
      <span className="hm-badge-dot" style={{ backgroundColor: style.color }} />
      {label}
    </span>
  );
}

function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div className="hm-stat-card">
      <div className="hm-stat-top">
        <p className="hm-stat-label">{label}</p>
        <FontAwesomeIcon icon={icon} />
      </div>
      <p className="hm-stat-value" style={{ color: accent }}>{value}</p>
      {sub ? <p className="hm-stat-sub">{sub}</p> : null}
    </div>
  );
}

const STALE_MINUTES = 30;

export default function HealthMonitorPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getHealthMonitor();
      setRestaurants(response.items || []);
      setEvents(response.events || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchesSearch = !search || [restaurant.name, restaurant.id, restaurant.ownerEmail]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search.toLowerCase()));

      const stale = minutesSince(restaurant.healthLastCheckedAt) > STALE_MINUTES;
      const recurringIssueCodes = Array.isArray(restaurant.healthIssues)
        ? restaurant.healthIssues.map((issue) => issue.code)
        : [];

      const matchesFilter =
        filter === 'all' ||
        (filter === 'critical' && restaurant.healthStatus === 'critical') ||
        (filter === 'degraded' && restaurant.healthStatus === 'degraded') ||
        (filter === 'stale' && stale) ||
        (filter === 'recurring_whatsapp' && recurringIssueCodes.includes('WHATSAPP_DISCONNECTED'));

      return matchesSearch && matchesFilter;
    });
  }, [restaurants, search, filter]);

  const stats = useMemo(() => ({
    critical: restaurants.filter((restaurant) => restaurant.healthStatus === 'critical').length,
    degraded: restaurants.filter((restaurant) => restaurant.healthStatus === 'degraded').length,
    stale: restaurants.filter((restaurant) => minutesSince(restaurant.healthLastCheckedAt) > STALE_MINUTES).length,
    recurring: events.reduce((acc, event) => {
      const issues = Array.isArray(event.issues) ? event.issues : [];
      issues.forEach((issue) => {
        const code = issue.code || 'UNKNOWN';
        acc[code] = (acc[code] || 0) + 1;
      });
      return acc;
    }, {}),
  }), [restaurants, events]);

  const recurringTop = Object.entries(stats.recurring)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);

  const handleRecheck = async (restaurantId) => {
    try {
      setRefreshingId(restaurantId);
      await adminApi.recheckRestaurantHealth(restaurantId);
      await load();
    } finally {
      setRefreshingId('');
    }
  };

  return (
    <div className="hm-page">
      <div className="hm-header">
        <div>
          <p className="hm-eyebrow">SYSTEM HEALTH</p>
          <h1 className="hm-title">Restaurant Health Monitor</h1>
          <p className="hm-subtitle">Triage live tenant health, stale checks, and recurring operational issues.</p>
        </div>
        <button className="hm-refresh-button" onClick={load} disabled={loading}>
          <FontAwesomeIcon icon={faSync} spin={loading} />
          Refresh
        </button>
      </div>

      <div className="hm-stats">
        <StatCard label="Critical" value={stats.critical} sub="Need immediate attention" icon={faTriangleExclamation} accent="#ef4444" />
        <StatCard label="Degraded" value={stats.degraded} sub="Operating with issues" icon={faCircleExclamation} accent="#f59e0b" />
        <StatCard label="Stale" value={stats.stale} sub={`Not checked in ${STALE_MINUTES}+ mins`} icon={faClock} accent="#94a3b8" />
        <StatCard label="Healthy" value={restaurants.filter((restaurant) => restaurant.healthStatus === 'healthy').length} sub="Stable live tenants" icon={faCheckCircle} accent="#22c55e" />
      </div>

      <div className="hm-toolbar">
        <div className="hm-search">
          <FontAwesomeIcon icon={faSearch} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search restaurant or email..."
          />
        </div>
        <select className="hm-select" value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">All Health</option>
          <option value="critical">Critical</option>
          <option value="degraded">Degraded</option>
          <option value="stale">Stale Checks</option>
          <option value="recurring_whatsapp">Recurring WhatsApp Issues</option>
        </select>
      </div>

      <div className="hm-grid">
        <section className="hm-panel hm-main-panel">
          <div className="hm-panel-header">
            <p>Live Health Queue</p>
            <span>{filteredRestaurants.length} restaurant(s)</span>
          </div>

          {loading ? (
            <div className="hm-loading">
              <FontAwesomeIcon icon={faSpinner} spin />
              Loading health data...
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="hm-empty">
              <FontAwesomeIcon icon={faHeartbeat} />
              <p>No restaurants match the current health filters.</p>
            </div>
          ) : (
            <div className="hm-rows">
              {filteredRestaurants.map((restaurant) => {
                const stale = minutesSince(restaurant.healthLastCheckedAt) > STALE_MINUTES;
                const issues = Array.isArray(restaurant.healthIssues) ? restaurant.healthIssues : [];

                return (
                  <div key={restaurant.id} className="hm-row">
                    <div className="hm-row-top">
                      <div>
                        <div className="hm-row-title-line">
                          <h3>{restaurant.name}</h3>
                          <Badge label={restaurant.healthStatus || 'unknown'} tone={restaurant.healthStatus || 'default'} />
                          {stale ? <Badge label="Stale" tone="stale" /> : null}
                        </div>
                        <p>{restaurant.id} · {restaurant.ownerEmail || restaurant.email || 'No owner email'}</p>
                      </div>
                      <div className="hm-row-actions">
                        <button
                          className="hm-ghost-button"
                          onClick={() => handleRecheck(restaurant.id)}
                          disabled={refreshingId === restaurant.id}
                        >
                          <FontAwesomeIcon icon={faSync} spin={refreshingId === restaurant.id} />
                          Recheck
                        </button>
                        <button className="hm-primary-button" onClick={() => navigate(`/restaurants/${restaurant.id}`)}>
                          <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                          Open
                        </button>
                      </div>
                    </div>

                    <div className="hm-row-meta">
                      <span>Lifecycle: {restaurant.activationState || 'draft'}</span>
                      <span>Last checked: {formatRelativeMinutes(restaurant.healthLastCheckedAt)}</span>
                    </div>

                    <div className="hm-issues">
                      {issues.length === 0 ? (
                        <span className="hm-issue-pill hm-issue-pill-ok">No active issues</span>
                      ) : (
                        issues.map((issue) => (
                          <span key={`${restaurant.id}-${issue.code}`} className={`hm-issue-pill hm-issue-pill-${issue.severity || 'default'}`}>
                            {issue.code}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="hm-panel hm-side-panel">
          <div className="hm-panel-header">
            <p>Recurring Issues</p>
            <span>From recent health events</span>
          </div>
          <div className="hm-issue-summary">
            {recurringTop.length === 0 ? (
              <p className="hm-empty-note">No recurring issue codes yet.</p>
            ) : recurringTop.map(([code, count]) => (
              <div key={code} className="hm-summary-row">
                <span>{code}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>

          <div className="hm-panel-header hm-panel-header-spaced">
            <p>Recent Events</p>
            <span>{events.length}</span>
          </div>
          <div className="hm-events">
            {events.slice(0, 8).map((event) => (
              <div key={event.id} className="hm-event">
                <div className="hm-event-top">
                  <Badge label={event.newStatus || 'unknown'} tone={event.newStatus || 'default'} />
                  <span>{event.restaurantId}</span>
                </div>
                <p>{event.source || 'health_check'}</p>
                <small>{formatRelativeMinutes(event.createdAt)}</small>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
