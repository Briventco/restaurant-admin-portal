import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStore, faSpinner, faSync, faSearch, faTimes,
  faUsers, faCheckCircle, faTimesCircle, faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import adminApi from '../../api/admin';
import './OutboxMonitorPage.css';

const OutboxMonitorPage = () => {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listOutboxMessages();
      setRestaurants(data);
      setError(null);
    } catch (err) {
      setRestaurants([]);
      setError(err.message || 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = restaurants.filter((r) =>
    (r.restaurant || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleRowClick = (r) => {
    navigate(`/outbox/${r.restaurantId}/customers`, {
      state: { restaurantName: r.restaurant, restaurantId: r.restaurantId },
    });
  };

  if (loading && restaurants.length === 0) return (
    <div className="omp-loader">
      <FontAwesomeIcon icon={faSpinner} spin /> Loading outbox…
    </div>
  );

  return (
    <div className="omp-page">
      <div className="omp-header">
        <div>
          <p className="omp-header-meta">SYSTEM</p>
          <p className="omp-header-sub">{restaurants.length} restaurants</p>
        </div>
        <div className="omp-header-actions">
          <button onClick={load} className="omp-btn-ghost">
            <FontAwesomeIcon icon={faSync} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="omp-table-empty" style={{ color: '#f87171', marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div className="omp-search-row">
        <div className="omp-search-box">
          <FontAwesomeIcon icon={faSearch} className="omp-search-icon" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurant…"
            className="omp-search-input"
          />
          {search && (
            <button onClick={() => setSearch('')} className="omp-search-clear">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>

      <div className="omp-table">
        <div className="omp-table-header" style={{ gridTemplateColumns: '1fr 120px 120px 120px 32px' }}>
          {['Restaurant', 'Customers', 'Sent', 'Failed', ''].map((h) => (
            <p key={h} className="omp-table-header-cell">{h}</p>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="omp-table-empty">No restaurants found</div>
        ) : filtered.map((r) => (
          <div
            key={r.restaurantId}
            className="omp-table-row"
            style={{ gridTemplateColumns: '1fr 120px 120px 120px 32px' }}
            onClick={() => handleRowClick(r)}
          >
            <div className="omp-restaurant-cell">
              <div className="omp-restaurant-avatar">
                <FontAwesomeIcon icon={faStore} className="omp-restaurant-avatar-icon" />
              </div>
              <p className="omp-restaurant-name">{r.restaurant}</p>
            </div>

            <p className="omp-recipient-text">
              <FontAwesomeIcon icon={faUsers} /> {r.customerCount}
            </p>
            <p className="omp-recipient-text">
              <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#22c55e' }} /> {r.totalSent}
            </p>
            <p className={r.totalFailed > 0 ? 'omp-retries-high' : 'omp-recipient-text'}>
              <FontAwesomeIcon icon={faTimesCircle} /> {r.totalFailed}
            </p>

            <FontAwesomeIcon icon={faChevronRight} style={{ color: '#444' }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutboxMonitorPage;
