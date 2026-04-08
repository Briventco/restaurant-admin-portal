import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStore, faCheckCircle, faBan, faTimesCircle, faSearch,
  faDownload, faEye, faEdit, faPlay, faPause, faCheck,
  faTrashAlt, faTimes, faQrcode, faSpinner, faChartLine,
  faExclamationTriangle, faEllipsisV, faCopy, faClock,
  faFileExport, faColumns, faSort, faSortUp, faSortDown,
  faSync, faCalendarAlt, faMapMarkerAlt, faUser,
  faChevronDown, faChevronUp, faSlidersH, faStar,
  faMobileAlt, faGlobe, faDollarSign, faChartBar, faFilter,
  faBell, faEllipsisH,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import restaurantsApi from '../../api/restaurants';
import { getWhatsappBindingMeta, getWhatsappStatusLabel } from '../../utils/whatsappPresentation';
import './RestaurantsListPage.css';

const formatDateTime = (val) => {
  if (!val) return '—';
  try { return new Date(val).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return val; }
};

const Badge = ({ label, type = 'default' }) => {
  const colors = {
    active:       { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e', border: 'rgba(34,197,94,0.25)'  },
    suspended:    { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', border: 'rgba(239,68,68,0.25)'  },
    connected:    { bg: 'rgba(37,211,102,0.12)', color: '#25d366', border: 'rgba(37,211,102,0.25)' },
    disconnected: { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', border: 'rgba(239,68,68,0.25)'  },
    qr_required:  { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
    not_configured:{ bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: 'rgba(148,163,184,0.22)' },
    pending:      { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
    degraded:     { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
    critical:     { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
    healthy:      { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.25)' },
    overdue:      { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', border: 'rgba(239,68,68,0.25)'  },
    default:      { bg: 'rgba(255,255,255,0.06)', color: '#888',   border: 'rgba(255,255,255,0.1)' },
  };
  const s = colors[type] || colors.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 9px', borderRadius: '999px',
      fontSize: '11px', fontWeight: 600,
      backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
      {label}
    </span>
  );
};

const StatCard = ({ label, value, sub, accent, icon, onClick }) => (
  <div className="rl-stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
    <div className="rl-stat-top">
      <p className="rl-stat-label">{label}</p>
      <FontAwesomeIcon icon={icon} style={{ color: '#444', fontSize: '13px' }} />
    </div>
    <p className="rl-stat-value" style={{ color: accent }}>{value}</p>
    {sub && <p className="rl-stat-sub">{sub}</p>}
  </div>
);

const ConfirmModal = ({ title, message, onConfirm, onCancel, danger }) => (
  <div className="rl-overlay">
    <div className="rl-modal">
      <p className="rl-modal-title">{title}</p>
      <p className="rl-modal-msg">{message}</p>
      <div className="rl-modal-footer">
        <button className="rl-btn-ghost" onClick={onCancel}>Cancel</button>
        <button
          className={danger ? 'rl-btn-danger' : 'rl-btn-primary'}
          onClick={onConfirm}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

const RestaurantsListPage = () => {
  const navigate = useNavigate();

  const [restaurants, setRestaurants]         = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [searchTerm, setSearchTerm]           = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter]       = useState('all');
  const [whatsappFilter, setWhatsappFilter]   = useState('all');
  const [sortConfig, setSortConfig]           = useState({ key: 'name', dir: 'asc' });
  const [selected, setSelected]               = useState([]);
  const [pendingAction, setPendingAction]     = useState(null);
  const [bulkAction, setBulkAction]           = useState(null);
  const [openMenu, setOpenMenu]               = useState(null);
  const [toasts, setToasts]                   = useState([]);
  const [autoRefresh, setAutoRefresh]         = useState(false);
  const searchRef = useRef(null);

  const counts = useMemo(() => ({
    all:       restaurants.length,
    active:    restaurants.filter((r) => r.status === 'active').length,
    suspended: restaurants.filter((r) => r.status === 'suspended').length,
    ready:     restaurants.filter((r) => r.activationState === 'ready_for_activation').length,
    connected: restaurants.filter((r) => r.whatsappStatus === 'connected').length,
    qr:        restaurants.filter((r) => r.whatsappStatus === 'qr_required').length,
  }), [restaurants]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await restaurantsApi.list();
      setRestaurants(data);
    } catch (e) {
      addToast('Failed to load restaurants', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, [autoRefresh]);

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  const filtered = useMemo(() => {
    let list = [...restaurants];
    if (debouncedSearch)
      list = list.filter((r) =>
        r.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        r.id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (r.owner || '').toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    if (statusFilter !== 'all') list = list.filter((r) => r.status === statusFilter);
    if (whatsappFilter !== 'all') list = list.filter((r) => r.whatsappStatus === whatsappFilter);
    list.sort((a, b) => {
      const av = a[sortConfig.key] ?? '';
      const bv = b[sortConfig.key] ?? '';
      return sortConfig.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return list;
  }, [restaurants, debouncedSearch, statusFilter, whatsappFilter, sortConfig]);

  const handleSort = (key) =>
    setSortConfig((p) => ({ key, dir: p.key === key && p.dir === 'asc' ? 'desc' : 'asc' }));

  const toggleSelect = (id) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const selectAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((r) => r.id));

  const copyId = (id) => {
    navigator.clipboard.writeText(id);
    addToast('ID copied!', 'success');
  };

  const handleStatusChange = async () => {
    if (!pendingAction) return;
    const next = pendingAction.currentStatus === 'active' ? 'suspended' : 'active';
    setRestaurants((p) =>
      p.map((r) => r.id === pendingAction.id ? { ...r, status: next } : r)
    );
    addToast(`Restaurant ${next}`, 'success');
    setPendingAction(null);
  };

  const handleBulkConfirm = async () => {
    if (bulkAction === 'delete') {
      setRestaurants((p) => p.filter((r) => !selected.includes(r.id)));
      addToast(`${selected.length} restaurants deleted`, 'success');
    } else {
      setRestaurants((p) =>
        p.map((r) => selected.includes(r.id) ? { ...r, status: bulkAction } : r)
      );
      addToast(`${selected.length} restaurants ${bulkAction}`, 'success');
    }
    setSelected([]);
    setBulkAction(null);
  };

  const exportCSV = () => {
    const rows = filtered.map((r) => `${r.name},${r.id},${r.status},${r.whatsappStatus},${r.city}`);
    const blob = new Blob([['Name,ID,Status,WhatsApp,City', ...rows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'restaurants.csv';
    a.click();
    addToast('Exported!', 'success');
  };

  const SortIcon = ({ col }) => {
    if (sortConfig.key !== col) return <FontAwesomeIcon icon={faSort} style={{ opacity: 0.3, fontSize: '10px' }} />;
    return <FontAwesomeIcon icon={sortConfig.dir === 'asc' ? faSortUp : faSortDown} style={{ fontSize: '10px', color: '#fff' }} />;
  };

  if (loading && restaurants.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '12px', color: '#555', fontSize: '13px' }}>
      <FontAwesomeIcon icon={faSpinner} spin />
      Loading restaurants…
    </div>
  );

  return (
    <div className="rl-page">

      <div className="rl-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`rl-toast rl-toast-${t.type}`}>
            {t.msg}
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ))}
      </div>

      <div className="rl-title-row">
        {/* <div>
          <p className="rl-section-label">MANAGEMENT</p>
          <h1 className="rl-title">All Restaurants</h1>
          <p className="rl-subtitle">{counts.all} restaurants · {counts.active} active</p>
        </div> */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="rl-btn-ghost-sm" onClick={() => setAutoRefresh((a) => !a)} title="Auto-refresh">
            <FontAwesomeIcon icon={faSync} spin={autoRefresh} />
          </button>
          <button className="rl-btn-ghost-sm" onClick={exportCSV} title="Export CSV">
            <FontAwesomeIcon icon={faDownload} />
          </button>
          <button className="rl-btn-primary" onClick={() => navigate('/restaurants/new')}>
            <FontAwesomeIcon icon={faStore} style={{ fontSize: '11px' }} />
            Add Restaurant
          </button>
        </div>
      </div>

      <div className="rl-stats">
        <StatCard label="TOTAL RESTAURANTS" value={counts.all}       sub="all registered"        accent="#ffffff" icon={faStore}       onClick={() => setStatusFilter('all')}       />
        <StatCard label="ACTIVE"            value={counts.active}    sub="currently operating"   accent="#22c55e" icon={faCheckCircle} onClick={() => setStatusFilter('active')}    />
        <StatCard label="SUSPENDED"         value={counts.suspended} sub="need attention"        accent="#ef4444" icon={faBan}         onClick={() => setStatusFilter('suspended')} />
        <StatCard label="READY TO GO LIVE"  value={counts.ready}     sub="awaiting activation"   accent="#f59e0b" icon={faClock}       />
        <StatCard label="WA CONNECTED"      value={counts.connected} sub="WhatsApp sessions live" accent="#25d366" icon={faWhatsapp}   onClick={() => setWhatsappFilter('connected')} />
      </div>

      <div className="rl-controls">
        <div className="rl-search">
          <FontAwesomeIcon icon={faSearch} className="rl-search-icon" />
          <input
            ref={searchRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search restaurants, owners, IDs…"
            className="rl-search-input"
          />
          {searchTerm && (
            <button className="rl-search-clear" onClick={() => setSearchTerm('')}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select className="rl-select" value={whatsappFilter} onChange={(e) => setWhatsappFilter(e.target.value)}>
            <option value="all">All WhatsApp</option>
            <option value="connected">Connected</option>
            <option value="disconnected">Disconnected</option>
            <option value="qr_required">QR Required</option>
          </select>

          <div className="rl-view-toggle">
            <button className="rl-view-btn active">
              <FontAwesomeIcon icon={faColumns} /> List
            </button>
          </div>
        </div>
      </div>

      <div className="rl-tabs">
        {[
          { key: 'all',       label: 'All',        count: counts.all       },
          { key: 'active',    label: 'Active',     count: counts.active    },
          { key: 'suspended', label: 'Suspended',  count: counts.suspended },
          { key: 'connected', label: 'WA Connected', count: counts.connected },
          { key: 'qr_required', label: 'QR Required', count: counts.qr, warn: true },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`rl-tab ${statusFilter === tab.key || whatsappFilter === tab.key || (tab.key === 'all' && statusFilter === 'all' && whatsappFilter === 'all') ? 'rl-tab-active' : ''}`}
            onClick={() => {
              if (tab.key === 'all') { setStatusFilter('all'); setWhatsappFilter('all'); }
              else if (tab.key === 'active' || tab.key === 'suspended') { setStatusFilter(tab.key); setWhatsappFilter('all'); }
              else { setWhatsappFilter(tab.key); setStatusFilter('all'); }
            }}
          >
            {tab.warn && <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#f59e0b', fontSize: '10px' }} />}
            {tab.label}
            <span className="rl-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="rl-bulk-bar">
          <span className="rl-bulk-count">
            <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#22c55e' }} />
            {selected.length} selected
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="rl-btn-ghost-sm" onClick={() => { setBulkAction('active'); }}>Activate</button>
            <button className="rl-btn-ghost-sm" style={{ color: '#f59e0b', borderColor: '#f59e0b33' }} onClick={() => setBulkAction('suspended')}>Suspend</button>
            <button className="rl-btn-ghost-sm" style={{ color: '#ef4444', borderColor: '#ef444433' }} onClick={() => setBulkAction('delete')}>Delete</button>
            <button className="rl-btn-ghost-sm" onClick={() => setSelected([])}>
              <FontAwesomeIcon icon={faTimes} /> Clear
            </button>
          </div>
        </div>
      )}

      <div className="rl-list">
        {filtered.length === 0 ? (
          <div className="rl-empty">
            <FontAwesomeIcon icon={faStore} style={{ fontSize: '28px', color: '#333', marginBottom: '12px' }} />
            <p style={{ color: '#555', fontSize: '13px' }}>No restaurants found</p>
          </div>
        ) : (
          filtered.map((r) => {
            const pct = Math.round((r.orders / 400) * 100);
            const isSelected = selected.includes(r.id);
            return (
              <div
                key={r.id}
                className={`rl-row ${isSelected ? 'rl-row-selected' : ''}`}
                onClick={() => navigate(`/restaurants/${r.id}`)}
              >
                {/* Left: checkbox + icon + info */}
                <div className="rl-row-left">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(r.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="rl-checkbox"
                  />
                  <div className="rl-row-icon">
                    <FontAwesomeIcon icon={faStore} />
                  </div>
                  <div className="rl-row-info">
                    <div className="rl-row-name-row">
                      <span className="rl-row-name">{r.name}</span>
                      <Badge label={r.status === 'active' ? 'Active' : 'Suspended'} type={r.status} />
                      <Badge
                        label={(r.activationState || 'draft').replace(/_/g, ' ')}
                        type={r.activationState === 'active' ? 'active' : r.activationState === 'ready_for_activation' ? 'pending' : 'default'}
                      />
                      <Badge label={getWhatsappStatusLabel(r.whatsappStatus)} type={r.whatsappStatus} />
                      <Badge
                        label={getWhatsappBindingMeta(r.whatsappBindingMode).label}
                        type={
                          getWhatsappBindingMeta(r.whatsappBindingMode).tone === 'shared'
                            ? 'connected'
                            : r.whatsappStatus
                        }
                      />
                      <Badge label={`Health ${r.healthStatus || 'unknown'}`} type={r.healthStatus || 'default'} />
                    </div>
                    <div className="rl-row-meta">
                      <span><FontAwesomeIcon icon={faUser} /> {r.owner}</span>
                      <span><FontAwesomeIcon icon={faMapMarkerAlt} /> {r.city}</span>
                      <span className="rl-row-id">{r.id}</span>
                    </div>

                    <div className="rl-progress-wrap">
                      <div className="rl-progress-track">
                        <div className="rl-progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <div className="rl-progress-dots">
                        <span className="rl-dot rl-dot-done" />
                        <span className={`rl-dot ${pct > 40 ? 'rl-dot-done' : ''}`} />
                        <span className={`rl-dot ${pct > 70 ? 'rl-dot-done' : ''}`} />
                      </div>
                    </div>

                    <div className="rl-row-bottom">
                      <span className="rl-row-date">
                        <FontAwesomeIcon icon={faClock} /> {formatDateTime(r.lastActivity)}
                      </span>
                      <span className="rl-row-tag">{r.city}</span>
                    </div>
                  </div>
                </div>

                <div className="rl-row-right" onClick={(e) => e.stopPropagation()}>
                  <div className="rl-row-revenue">
                    <span className="rl-revenue-amount">{r.revenue}</span>
                    <span className="rl-revenue-sub">{r.orders} orders</span>
                  </div>
                  <div className="rl-row-pct">{pct}% capacity</div>

                  <div className="rl-row-action">
                      <span className="rl-row-action-label">
                        <FontAwesomeIcon icon={faWhatsapp} />
                        {getWhatsappBindingMeta(r.whatsappBindingMode).description}
                      </span>
                  </div>

                  <button
                    className="rl-menu-btn"
                    onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === r.id ? null : r.id); }}
                  >
                    <FontAwesomeIcon icon={faEllipsisH} />
                  </button>

                  {openMenu === r.id && (
                    <div className="rl-dropdown" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { navigate(`/restaurants/${r.id}`); setOpenMenu(null); }}>
                        <FontAwesomeIcon icon={faEye} /> View Details
                      </button>
                      <button onClick={() => { copyId(r.id); setOpenMenu(null); }}>
                        <FontAwesomeIcon icon={faCopy} /> Copy ID
                      </button>
                      <button onClick={() => {
                        setPendingAction({ id: r.id, currentStatus: r.status });
                        setOpenMenu(null);
                      }}>
                        <FontAwesomeIcon icon={r.status === 'active' ? faPause : faPlay} />
                        {r.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        style={{ color: '#ef4444' }}
                        onClick={() => {
                          setRestaurants((p) => p.filter((x) => x.id !== r.id));
                          addToast('Restaurant deleted', 'success');
                          setOpenMenu(null);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {pendingAction && (
        <ConfirmModal
          title={pendingAction.currentStatus === 'active' ? 'Suspend restaurant?' : 'Activate restaurant?'}
          message="This action can be reversed later."
          onConfirm={handleStatusChange}
          onCancel={() => setPendingAction(null)}
        />
      )}
      {bulkAction && (
        <ConfirmModal
          title={`${bulkAction === 'delete' ? 'Delete' : bulkAction === 'active' ? 'Activate' : 'Suspend'} ${selected.length} restaurant(s)?`}
          message={bulkAction === 'delete' ? 'This cannot be undone.' : 'This can be reversed later.'}
          onConfirm={handleBulkConfirm}
          onCancel={() => setBulkAction(null)}
          danger={bulkAction === 'delete'}
        />
      )}

      {openMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 10 }}
          onClick={() => setOpenMenu(null)}
        />
      )}
    </div>
  );
};

export default RestaurantsListPage;
