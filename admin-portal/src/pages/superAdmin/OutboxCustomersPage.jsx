import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faStore, faSpinner, faSync, faSearch, faTimes,
  faUser, faChevronRight, faCommentDots,
} from '@fortawesome/free-solid-svg-icons';
import adminApi from '../../api/admin';
import './OutboxMonitorPage.css';

const fmtDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const buildCustomerLabel = (customer = {}) => {
  const displayName = String(customer.displayName || '').trim();
  if (displayName) return displayName;

  const phone = String(customer.customerPhone || '').trim();
  if (phone) return phone;

  const channelCustomerId = String(customer.channelCustomerId || '').trim();
  if (channelCustomerId) {
    const numeric = channelCustomerId.replace(/\D/g, '').slice(-4);
    if (numeric) {
      return `Customer #${numeric.padStart(4, '0')}`;
    }
  }

  const id = String(customer.id || '').trim();
  if (id) {
    const numeric = parseInt(id.slice(-6), 16);
    if (Number.isFinite(numeric)) {
      return `Customer #${String(Math.abs(numeric % 10000)).padStart(4, '0')}`;
    }
  }

  return 'Customer';
};

const OutboxCustomersPage = () => {
  const { restaurantId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(state?.restaurantName ? { name: state.restaurantName } : null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
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
  }, [restaurantId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      load();
    }, 10000);

    return () => {
      window.clearInterval(interval);
    };
  }, [load]);

  const filtered = customers.filter((c) => {
    const term = search.toLowerCase();
    return (
      buildCustomerLabel(c).toLowerCase().includes(term) ||
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
        customerName: buildCustomerLabel(c),
        customerPhone: c.customerPhone || c.channelCustomerId,
      },
    });
  };

  if (loading && customers.length === 0) {
    return (
      <div className="omp-loader">
        <FontAwesomeIcon icon={faSpinner} spin /> Loading customers...
      </div>
    );
  }

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
              {customers.length} customers - sorted by most recent activity
            </p>
          </div>
        </div>
        <div className="omp-header-actions">
          <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: 600 }}>Live</span>
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
            placeholder="Search customer name or phone..."
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
                <p className="omp-restaurant-name">{buildCustomerLabel(c)}</p>
              </div>

              <p className="omp-recipient-text">{c.customerPhone || c.channelCustomerId || c.id}</p>
              <p className="omp-recipient-text">
                {fmtDate(c.lastActivityAt || c.updatedAt)}
                {c.orderCount > 0 ? ` - ${c.orderCount} order${c.orderCount === 1 ? '' : 's'}` : ''}
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
