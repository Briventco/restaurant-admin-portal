import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch, faTimes, faSpinner, faShoppingBag, faClock,
  faCheckCircle, faSort, faSortUp, faSortDown, faEye,
  faCheck, faColumns, faSync,
} from '@fortawesome/free-solid-svg-icons';
import { runtimeApi } from '../../api/runtime';

const fmtNaira  = (n) => `₦${Number(n || 0).toLocaleString()}`;
const fmtDate   = (iso) => iso ? new Date(iso).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const withinWindow = (iso, filter) => {
  if (filter === 'all') return true;
  const h = filter === '24h' ? 24 : filter === '48h' ? 48 : 72;
  return Date.now() - new Date(iso).getTime() <= h * 3600000;
};

const Badge = ({ type, label }) => {
  const map = {
    completed:  { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)'  },
    pending:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    processing: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
    preparing:  { color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)' },
    cancelled:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)'  },
  };
  const s = map[type?.toLowerCase()] || { color: '#888', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: s.color }} />
      {label || type}
    </span>
  );
};

const StatCard = ({ label, value, accent, icon, onClick }) => (
  <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'border-color 0.2s', cursor: onClick ? 'pointer' : 'default' }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e1e1e'}
    onClick={onClick}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</p>
      <FontAwesomeIcon icon={icon} style={{ color: '#333', fontSize: '13px' }} />
    </div>
    <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: accent, letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</p>
  </div>
);

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState('all');
  const [recentFilter, setRecent]     = useState('all');
  const [selected, setSelected]       = useState([]);
  const [sort, setSort]               = useState({ key: 'time', dir: 'desc' });
  const [viewMode, setViewMode]       = useState('table');
  const [toasts, setToasts]           = useState([]);

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await runtimeApi.getOrders(user?.restaurantId);
      setOrders(data);
    } catch {
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = orders.filter((o) => withinWindow(o.date === 'Today' ? new Date().toISOString() : new Date(Date.now() - 86400000).toISOString(), recentFilter));
    if (statusFilter !== 'all') list = list.filter((o) => o.status === statusFilter);
    if (search) list = list.filter((o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      const av = a[sort.key] ?? '', bv = b[sort.key] ?? '';
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return list;
  }, [orders, statusFilter, recentFilter, search, sort]);

  const stats = useMemo(() => ({
    total:     orders.length,
    pending:   orders.filter((o) => o.status === 'pending').length,
    preparing: orders.filter((o) => o.status === 'processing').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    revenue:   orders.reduce((s, o) => s + (o.amount || 0), 0),
  }), [orders]);

  const handleSort = (key) => setSort((p) => ({ key, dir: p.key === key && p.dir === 'asc' ? 'desc' : 'asc' }));
  const toggleSelect = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const selectAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map((o) => o.id));

  const bulkUpdate = (status) => {
    setOrders((p) => p.map((o) => selected.includes(o.id) ? { ...o, status } : o));
    addToast(`${selected.length} orders marked as ${status}`, 'success');
    setSelected([]);
  };

  const SortIcon = ({ col }) => {
    if (sort.key !== col) return <FontAwesomeIcon icon={faSort} style={{ opacity: 0.3, fontSize: '10px' }} />;
    return <FontAwesomeIcon icon={sort.dir === 'asc' ? faSortUp : faSortDown} style={{ fontSize: '10px', color: '#fff' }} />;
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '12px', color: '#555', fontSize: '13px' }}>
      <FontAwesomeIcon icon={faSpinner} spin /> Loading orders…
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 14px', borderRadius: '9px', backgroundColor: '#111', border: '1px solid #222', fontSize: '12px', color: t.type === 'success' ? '#22c55e' : t.type === 'error' ? '#ef4444' : '#aaa', minWidth: '200px' }}>
            {t.msg}
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>RESTAURANT</p>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>All Orders</h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#555' }}>{stats.total} orders · {stats.pending} pending</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#666', fontSize: '12px', cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faSync} />
          </button>
          <button onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#666', fontSize: '12px', cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faColumns} /> {viewMode === 'table' ? 'Grid' : 'Table'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px' }}>
        <StatCard label="TOTAL ORDERS" value={stats.total}              accent="#ffffff" icon={faShoppingBag} onClick={() => setStatus('all')}        />
        <StatCard label="PENDING"      value={stats.pending}            accent="#f59e0b" icon={faClock}       onClick={() => setStatus('pending')}    />
        <StatCard label="PREPARING"    value={stats.preparing}          accent="#a855f7" icon={faSpinner}     onClick={() => setStatus('processing')} />
        <StatCard label="COMPLETED"    value={stats.completed}          accent="#22c55e" icon={faCheckCircle} onClick={() => setStatus('completed')}  />
        <StatCard label="REVENUE"      value={fmtNaira(stats.revenue)}  accent="#3b82f6" icon={faShoppingBag} />
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '9px', padding: '9px 14px' }}>
          <FontAwesomeIcon icon={faSearch} style={{ color: '#444', fontSize: '12px' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order ID or customer…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '13px' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>}
        </div>
        <select value={statusFilter} onChange={(e) => setStatus(e.target.value)} style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', color: '#aaa', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', outline: 'none' }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
        </select>
        <select value={recentFilter} onChange={(e) => setRecent(e.target.value)} style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', color: '#aaa', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', outline: 'none' }}>
          <option value="all">All Time</option>
          <option value="24h">Last 24h</option>
          <option value="48h">Last 48h</option>
          <option value="72h">Last 72h</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {[
          { key: 'all',        label: 'All',        count: stats.total     },
          { key: 'pending',    label: 'Pending',    count: stats.pending   },
          { key: 'processing', label: 'Processing', count: stats.preparing },
          { key: 'completed',  label: 'Completed',  count: stats.completed },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setStatus(tab.key)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: statusFilter === tab.key ? '#1a1a1a' : 'transparent', border: `1px solid ${statusFilter === tab.key ? '#2a2a2a' : 'transparent'}`, borderRadius: '8px', color: statusFilter === tab.key ? '#fff' : '#555', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
            {tab.label}
            <span style={{ padding: '1px 6px', background: '#222', borderRadius: '999px', fontSize: '10px', color: statusFilter === tab.key ? '#fff' : '#666' }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#111', border: '1px solid #1e1e1e', borderRadius: '10px', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#22c55e' }} /> {selected.length} selected
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => bulkUpdate('processing')} style={{ padding: '6px 12px', backgroundColor: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '7px', color: '#a855f7', fontSize: '12px', cursor: 'pointer' }}>Mark Preparing</button>
            <button onClick={() => bulkUpdate('completed')} style={{ padding: '6px 12px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '7px', color: '#22c55e', fontSize: '12px', cursor: 'pointer' }}>Mark Completed</button>
            <button onClick={() => setSelected([])} style={{ padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '7px', color: '#666', fontSize: '12px', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>
          </div>
        </div>
      )}

      {viewMode === 'table' && (
        <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <th style={{ padding: '10px 16px', width: '32px' }}>
                    <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={selectAll} style={{ accentColor: '#22c55e', cursor: 'pointer' }} />
                  </th>
                  {[
                    { label: 'Order ID', key: 'id'       },
                    { label: 'Customer', key: 'customer' },
                    { label: 'Items',    key: null        },
                    { label: 'Amount',   key: 'amount'   },
                    { label: 'Status',   key: 'status'   },
                    { label: 'Date',     key: 'date'     },
                  ].map(({ label, key }) => (
                    <th key={label} onClick={() => key && handleSort(key)} style={{ textAlign: 'left', fontSize: '10px', fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '10px 16px', cursor: key ? 'pointer' : 'default', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {label} {key && <SortIcon col={key} />}
                      </span>
                    </th>
                  ))}
                  <th style={{ padding: '10px 16px' }} />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#555', fontSize: '13px' }}>No orders found</td></tr>
                ) : filtered.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #111', transition: 'background 0.15s', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }} onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggleSelect(o.id)} style={{ accentColor: '#22c55e', cursor: 'pointer' }} />
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#fff' }} onClick={() => navigate(`/orders/${o.id}`)}>{o.id}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#aaa' }}>{o.customer}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#666' }}>{o.items}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#22c55e' }}>{fmtNaira(o.amount)}</td>
                    <td style={{ padding: '12px 16px' }}><Badge type={o.status} label={o.status} /></td>
                    <td style={{ padding: '12px 16px', fontSize: '11px', color: '#555' }}>{o.time} · {o.date}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => navigate(`/orders/${o.id}`)} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '6px', color: '#555', cursor: 'pointer', fontSize: '11px' }}>
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
          {filtered.length === 0 ? (
            <p style={{ color: '#555', fontSize: '13px', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No orders found</p>
          ) : filtered.map((o) => (
            <div key={o.id} onClick={() => navigate(`/orders/${o.id}`)} style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e1e1e'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{o.id}</span>
                <Badge type={o.status} label={o.status} />
              </div>
              <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#aaa' }}>{o.customer}</p>
              <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#555' }}>{o.items} · {o.time}</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#22c55e' }}>{fmtNaira(o.amount)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;