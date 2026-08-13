import React, { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner, faSync, faSearch, faTimes, faUserPlus, faClipboardList,
} from '@fortawesome/free-solid-svg-icons';
import adminApi from '../../api/admin';
import './OutboxMonitorPage.css';

const fmtDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const WaitlistPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = await adminApi.listWaitlist();
      setEntries(items);
      setError(null);
    } catch (err) {
      setEntries([]);
      setError(err.message || 'Failed to load waitlist');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = entries.filter((e) => {
    const term = search.toLowerCase();
    return (
      (e.businessName || '').toLowerCase().includes(term) ||
      (e.email || '').toLowerCase().includes(term) ||
      (e.whatsappNumber || '').toLowerCase().includes(term)
    );
  });

  if (loading && entries.length === 0) {
    return (
      <div className="omp-loader">
        <FontAwesomeIcon icon={faSpinner} spin /> Loading waitlist...
      </div>
    );
  }

  return (
    <div className="omp-page">
      <div className="omp-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <p className="omp-header-meta">
              <FontAwesomeIcon icon={faUserPlus} /> Waitlist
            </p>
            <p className="omp-header-sub">
              {entries.length} sign-up{entries.length === 1 ? '' : 's'} - sorted by most recent
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
            placeholder="Search business name, email, or WhatsApp number..."
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
        <div className="omp-table-header" style={{ gridTemplateColumns: '1fr 1fr 1fr 160px' }}>
          {['Business', 'Email', 'WhatsApp number', 'Joined'].map((h) => (
            <p key={h} className="omp-table-header-cell">{h}</p>
          ))}
        </div>

        <div className="omp-table-body">
          {filtered.length === 0 ? (
            <div className="omp-table-empty">
              <FontAwesomeIcon icon={faClipboardList} /> No waitlist sign-ups found
            </div>
          ) : filtered.map((e) => (
            <div
              key={e.id}
              className="omp-table-row"
              style={{ gridTemplateColumns: '1fr 1fr 1fr 160px' }}
            >
              <div className="omp-restaurant-cell">
                <div className="omp-restaurant-avatar">
                  <FontAwesomeIcon icon={faUserPlus} className="omp-restaurant-avatar-icon" />
                </div>
                <p className="omp-restaurant-name">{e.businessName || '-'}</p>
              </div>

              <p className="omp-recipient-text">{e.email || '-'}</p>
              <p className="omp-recipient-text">{e.whatsappNumber || '-'}</p>
              <p className="omp-recipient-text">{fmtDate(e.createdAt)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WaitlistPage;
