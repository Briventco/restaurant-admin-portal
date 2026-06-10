import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faStore, faSpinner, faSync, faSearch, faTimes,
  faUser, faChevronRight, faCommentDots,
} from '@fortawesome/free-solid-svg-icons';
import adminApi from '../../api/admin';
import './OutboxMonitorPage.css';

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const OutboxCustomersPage = () => {
  const { restaurantId } = useParams();
  const { state }        = useLocation();
  const navigate         = useNavigate();

  const [restaurant, setRestaurant] = useState(state?.restaurantName ? { name: state.restaurantName } : null);
  const [customers, setCustomers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listOutboxCustomers(restaurantId);
      setRestaurant(data.restaurant);
      setCustomers(data.items);
      setError(null);
    } catch (err) {
      setCustomers([]);
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [restaurantId]);

  const filtered = customers.filter((c) => {
    const term = search.toLowerCase();
    return (
      (c.displayName || '').toLowerCase().includes(term) ||
      (c.customerPhone || '').toLowerCase().includes(term) ||
      (c.channelCustomerId || '').toLowerCase().includes(term)
    );
  });

  const handleRowClick = (c) => {
    navigate(`/outbox/${restaurantId}/customers/${c.id}/chat`, {
      state: {
        restaurantName: restaurant?.name || state?.restaurantName || 'Restaurant',
        restaurantId,
        customerId: c.id,
        customerName: c.displayName || c.customerPhone || c.channelCustomerId || 'Customer',
        customerPhone: c.customerPhone || c.channelCustomerId,
      },
    });
  };

  if (loading && customers.length === 0) return (
    <div className="omp-loader">
      <FontAwesomeIcon icon={faSpinner} spin /> Loading customers…
    </div>
  );

  return (
    <div className="omp-page">
      <div className="omp-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/outbox')} className="omp-btn-ghost">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div>
            <p className="omp-header-meta">
              <FontAwesomeIcon icon={faStore} /> {restaurant?.name || state?.restaurantName || 'Restaurant'}
            </p>
            <p className="omp-header-sub">
              {customers.length} customers · sorted by most recent activity
            </p>
          </div>
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
            placeholder="Search customer name or phone…"
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
        <div className="omp-table-header" style={{ gridTemplateColumns: '1fr 1fr 160px 32px' }}>
          {['Customer', 'Phone / ID', 'Last activity', ''].map((h) => (
            <p key={h} className="omp-table-header-cell">{h}</p>
          ))}
        </div>

        <div className="omp-table-body">
          {filtered.length === 0 ? (
            <div className="omp-table-empty">
              <FontAwesomeIcon icon={faCommentDots} /> No customers found
            </div>
          ) : filtered.map((c) => (
            <div
              key={c.id}
              className="omp-table-row"
              style={{ gridTemplateColumns: '1fr 1fr 160px 32px' }}
              onClick={() => handleRowClick(c)}
            >
              <div className="omp-restaurant-cell">
                <div className="omp-restaurant-avatar">
                  <FontAwesomeIcon icon={faUser} className="omp-restaurant-avatar-icon" />
                </div>
                <p className="omp-restaurant-name">{c.displayName || 'Unknown'}</p>
              </div>

              <p className="omp-recipient-text">{c.customerPhone || c.channelCustomerId}</p>
              <p className="omp-recipient-text">
                {fmtDate(c.lastActivityAt || c.updatedAt)}
                {c.orderCount > 0 ? ` · ${c.orderCount} order${c.orderCount === 1 ? '' : 's'}` : ''}
              </p>

              <FontAwesomeIcon icon={faChevronRight} style={{ color: '#444' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OutboxCustomersPage;
