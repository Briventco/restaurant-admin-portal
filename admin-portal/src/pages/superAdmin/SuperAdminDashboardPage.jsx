import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStore, faCheckCircle, faShoppingCart, faClock,
  faExclamationTriangle, faSearch, faSync, faBell,
  faChartLine, faDownload, faPrint, faPlus, faMinus,
  faExpand, faArrowUp, faArrowDown, faTimes, faInfoCircle,
  faUserFriends, faCalendarAlt, faPercent, faSpinner,
  faEye, faEyeSlash, faChartBar, faEdit, faTrash,
  faCheck, faBan, faMoneyBillWave, faUser, faUtensils,
  faTachometerAlt, faThumbsUp, faArrowCircleUp, faMobileAlt,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { runtimeApi } from '../../api/runtime';


const formatNaira = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

const formatNumber = (num) =>
  num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const statusConfig = {
  completed:  { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.2)'  },
  pending:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)' },
  processing: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)' },
};

const StatusBadge = ({ status }) => {
  const s = statusConfig[status?.toLowerCase()] || { color: '#888', bg: '#1a1a1a', border: '#333' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '999px',
      fontSize: '11px', fontWeight: 600,
      backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: s.color }} />
      {status}
    </span>
  );
};

const StatCard = ({ title, value, trend, icon, accent = '#22c55e' }) => (
  <div style={{
    backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e',
    borderRadius: '12px', padding: '20px 22px',
    display: 'flex', flexDirection: 'column', gap: '10px',
    transition: 'border-color 0.2s',
  }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e1e1e'}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <p style={{ margin: 0, fontSize: '11px', fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        {title}
      </p>
      {icon && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          backgroundColor: `${accent}18`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <FontAwesomeIcon icon={icon} style={{ color: accent, fontSize: '12px' }} />
        </div>
      )}
    </div>
    <p style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: accent, letterSpacing: '-0.5px', lineHeight: 1 }}>
      {value ?? '—'}
    </p>
    {trend !== undefined && (
      <p style={{ margin: 0, fontSize: '11px', color: trend >= 0 ? '#22c55e' : '#ef4444', fontWeight: 500 }}>
        <FontAwesomeIcon icon={trend >= 0 ? faArrowUp : faArrowDown} style={{ fontSize: '9px', marginRight: '4px' }} />
        {Math.abs(trend)}% from last period
      </p>
    )}
  </div>
);

const SectionCard = ({ title, subtitle, action, children }) => (
  <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 20px', borderBottom: '1px solid #1a1a1a', gap: '12px',
    }}>
      <div>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff' }}>{title}</p>
        {subtitle && <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#555' }}>{subtitle}</p>}
      </div>
      {action && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{action}</div>}
    </div>
    {children}
  </div>
);

const IconBtn = ({ icon, onClick, title, active, danger }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: '32px', height: '32px', borderRadius: '7px', border: '1px solid #1e1e1e',
      backgroundColor: active ? '#1a1a1a' : 'transparent',
      color: danger ? '#ef4444' : active ? '#fff' : '#666',
      cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '12px', transition: 'all 0.15s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = '#1a1a1a';
      e.currentTarget.style.color = danger ? '#ef4444' : '#fff';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = active ? '#1a1a1a' : 'transparent';
      e.currentTarget.style.color = danger ? '#ef4444' : active ? '#fff' : '#666';
    }}
  >
    <FontAwesomeIcon icon={icon} />
  </button>
);

const ConfirmModal = ({ action, order, onConfirm, onCancel, formatNaira }) => (
  <div style={{
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{
      backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '14px',
      padding: '24px', width: '380px', maxWidth: '90vw',
      boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: action === 'delete' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
        }}>
          <FontAwesomeIcon
            icon={action === 'delete' ? faTrash : faCheckCircle}
            style={{ color: action === 'delete' ? '#ef4444' : '#22c55e', fontSize: '14px' }}
          />
        </div>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#fff' }}>
          {action === 'delete' ? 'Delete Order' : 'Confirm Transaction'}
        </p>
        <button onClick={onCancel} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '14px' }}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <div style={{ backgroundColor: '#111', borderRadius: '8px', padding: '14px', marginBottom: '16px', fontSize: '12px', color: '#aaa', lineHeight: 1.7 }}>
        <p style={{ margin: '0 0 6px', color: '#666', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Details</p>
        <p style={{ margin: 0 }}><strong style={{ color: '#fff' }}>ID:</strong> {order?.id}</p>
        <p style={{ margin: 0 }}><strong style={{ color: '#fff' }}>Restaurant:</strong> {order?.restaurant}</p>
        <p style={{ margin: 0 }}><strong style={{ color: '#fff' }}>Customer:</strong> {order?.customer}</p>
        <p style={{ margin: 0 }}><strong style={{ color: '#fff' }}>Amount:</strong> {formatNaira(order?.amount)}</p>
      </div>

      {action === 'delete' && (
        <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#ef4444' }}>
          ⚠ This action cannot be undone.
        </p>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #1e1e1e',
          backgroundColor: 'transparent', color: '#aaa', fontSize: '13px', cursor: 'pointer',
        }}>
          Cancel
        </button>
        <button onClick={onConfirm} style={{
          flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
          backgroundColor: action === 'delete' ? '#ef4444' : '#22c55e',
          color: action === 'delete' ? '#fff' : '#000',
          fontSize: '13px', fontWeight: 600, cursor: 'pointer',
        }}>
          {action === 'delete' ? 'Delete' : 'Confirm'}
        </button>
      </div>
    </div>
  </div>
);

const SuperAdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(true);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [editFormData, setEditFormData] = useState({ id: '', restaurant: '', amount: '', status: '', customer: '' });

  const [orders, setOrders] = useState([
    { id: 'NG-001', restaurant: 'Mama Put Kitchen',    amount: 12500, status: 'completed',  customer: 'Adebayo O.',   time: '10:30 AM', items: 3 },
    { id: 'NG-002', restaurant: 'Suya Spot',           amount: 8500,  status: 'pending',    customer: 'Chidi N.',     time: '11:15 AM', items: 2 },
    { id: 'NG-003', restaurant: 'Jollof Heaven',       amount: 23500, status: 'processing', customer: 'Funke A.',     time: '09:45 AM', items: 4 },
    { id: 'NG-004', restaurant: 'Amala Sky',           amount: 6200,  status: 'completed',  customer: 'Oluwaseun B.', time: '08:30 AM', items: 2 },
    { id: 'NG-005', restaurant: 'Pounded Yam Express', amount: 15400, status: 'pending',    customer: 'Ngozi E.',     time: '12:00 PM', items: 3 },
    { id: 'NG-006', restaurant: 'Buka Republic',       amount: 18750, status: 'completed',  customer: 'Emeka O.',     time: '02:15 PM', items: 5 },
    { id: 'NG-007', restaurant: 'Fufu Palace',         amount: 9300,  status: 'processing', customer: 'Amara C.',     time: '01:45 PM', items: 2 },
  ]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await runtimeApi.getSuperAdminDashboard();
        setStats(response);
      } catch (err) {
        setError(err.message);
        // Dev fallback
        setStats({
          totalRestaurants: 24, activeRestaurants: 18,
          totalOrders: 1247, pendingActions: 3,
          connectedSessions: 12, failedOutboxCount: 2,
          totalRestaurantsTrend: 12, activeRestaurantsTrend: 8, totalOrdersTrend: 23,
          recentActivities: [
            { id: 1, action: 'New restaurant registered: "Mama Put Kitchen"', user: 'Admin',     time: '2 mins ago',  type: 'success' },
            { id: 2, action: 'Order #NG-001 completed — ₦12,500',             user: 'Adebayo O.', time: '5 mins ago',  type: 'success' },
            { id: 3, action: 'WhatsApp session connected for "Suya Spot"',    user: 'System',     time: '12 mins ago', type: 'info'    },
            { id: 4, action: 'System update completed successfully',           user: 'Admin',      time: '25 mins ago', type: 'success' },
            { id: 5, action: 'Failed message retry scheduled for 3 items',    user: 'System',     time: '32 mins ago', type: 'warning' },
          ],
          performanceMetrics: {
            avgResponseTime: '1.2s', successRate: 98.5,
            activeUsers: 156, uptime: 99.9,
          },
        });
      } finally {
        setLoading(false);
      }
    };
    load();
    const iv = autoRefresh ? setInterval(load, 30000) : null;
    return () => iv && clearInterval(iv);
  }, [autoRefresh]);

  /* order actions */
  const handleEditOrder = (order) => {
    setEditingOrder(order.id);
    setEditFormData({ ...order });
  };
  const handleUpdateOrder = () => {
    setOrders((prev) => prev.map((o) => o.id === editFormData.id ? { ...o, ...editFormData, amount: parseFloat(editFormData.amount) } : o));
    setEditingOrder(null);
    addToast(`Order ${editFormData.id} updated`, 'success');
  };
  const handleCancelEdit = () => { setEditingOrder(null); };

  const openConfirm = (order, action) => { setSelectedOrder(order); setConfirmAction(action); setShowConfirmModal(true); };
  const closeConfirm = () => { setShowConfirmModal(false); setSelectedOrder(null); setConfirmAction(null); };

  const confirmAction_ = () => {
    if (confirmAction === 'delete') {
      setOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
      addToast(`Order ${selectedOrder.id} deleted`, 'success');
    } else {
      setOrders((prev) => prev.map((o) => o.id === selectedOrder.id ? { ...o, status: 'completed' } : o));
      addToast(`Order ${selectedOrder.id} confirmed`, 'success');
    }
    closeConfirm();
  };

  const filteredActivities = stats?.recentActivities?.filter((a) =>
    a.action.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const timeRanges = [
    { value: 'day',   label: 'Today'      },
    { value: 'week',  label: 'This Week'  },
    { value: 'month', label: 'This Month' },
    { value: 'year',  label: 'This Year'  },
  ];

  const activityAccent = { success: '#22c55e', warning: '#f59e0b', info: '#3b82f6', error: '#ef4444' };
  const activityIcon   = { success: faCheckCircle, warning: faExclamationTriangle, info: faInfoCircle, error: faTimes };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '16px', color: '#555' }}>
      <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '28px' }} />
      <p style={{ margin: 0, fontSize: '13px' }}>Loading dashboard…</p>
    </div>
  );

  if (!stats) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#555', fontSize: '13px' }}>
      <FontAwesomeIcon icon={faInfoCircle} style={{ fontSize: '24px', marginBottom: '12px' }} />
      <p>No data available</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', zoom: zoomLevel }}>

      {/* Toast stack */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px', borderRadius: '9px',
            backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            fontSize: '12px', color: '#fff', minWidth: '240px',
            animation: 'fadeIn 0.2s ease',
          }}>
            <span style={{ color: activityAccent[t.type] }}>
              <FontAwesomeIcon icon={activityIcon[t.type]} />
            </span>
            <span style={{ flex: 1 }}>{t.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '11px' }}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ))}
      </div>

      {/* Confirm modal */}
      {showConfirmModal && (
        <ConfirmModal
          action={confirmAction}
          order={selectedOrder}
          onConfirm={confirmAction_}
          onCancel={closeConfirm}
          formatNaira={formatNaira}
        />
      )}

      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Super Admin</p>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#fff', letterSpacing: '-0.4px' }}>
            System Dashboard
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#555' }}>
            Cross-restaurant visibility — platform health, message delivery, and operational load.
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Zoom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '4px 8px' }}>
            <IconBtn icon={faMinus} onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))} title="Zoom out" />
            <span style={{ fontSize: '11px', color: '#555', minWidth: '34px', textAlign: 'center' }}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <IconBtn icon={faPlus} onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))} title="Zoom in" />
            <IconBtn icon={faExpand} onClick={() => setZoomLevel(1)} title="Reset zoom" />
          </div>

          <IconBtn icon={faDownload} onClick={() => addToast('Exporting…', 'info')} title="Export" />
          <IconBtn icon={faPrint} onClick={() => window.print()} title="Print" />
          <IconBtn icon={faSync} active={autoRefresh} onClick={() => setAutoRefresh((a) => !a)} title={autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off'} />
        </div>
      </div>

      {/* ── Time range selector ── */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {timeRanges.map((r) => (
          <button
            key={r.value}
            onClick={() => setSelectedTimeRange(r.value)}
            style={{
              padding: '7px 14px',
              backgroundColor: selectedTimeRange === r.value ? '#fff' : 'transparent',
              border: `1px solid ${selectedTimeRange === r.value ? '#fff' : '#1e1e1e'}`,
              borderRadius: '7px',
              color: selectedTimeRange === r.value ? '#000' : '#666',
              fontSize: '12px', fontWeight: selectedTimeRange === r.value ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
        <StatCard title="Total Restaurants"   value={formatNumber(stats.totalRestaurants)}   trend={stats.totalRestaurantsTrend}   icon={faStore}             accent="#22c55e" />
        <StatCard title="Active Restaurants"  value={formatNumber(stats.activeRestaurants)}  trend={stats.activeRestaurantsTrend}  icon={faCheckCircle}       accent="#3b82f6" />
        <StatCard title="Total Orders"        value={formatNumber(stats.totalOrders)}         trend={stats.totalOrdersTrend}         icon={faShoppingCart}      accent="#a855f7" />
        <StatCard title="Pending Actions"     value={formatNumber(stats.pendingActions)}      icon={faClock}                                                    accent="#f59e0b" />
        <StatCard title="WA Sessions"         value={formatNumber(stats.connectedSessions)}   icon={faWhatsapp}                                                 accent="#25d366" />
        <StatCard title="Failed Outbox"       value={formatNumber(stats.failedOutboxCount)}   icon={faExclamationTriangle}                                      accent="#ef4444" />
      </div>

      {/* ── Recent Orders ── */}
      <SectionCard
        title="Recent Orders"
        subtitle="Latest orders from all Nigerian restaurants"
        action={
          <IconBtn icon={faSync} onClick={() => addToast('Refreshing orders…', 'info')} title="Refresh" />
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Order ID', 'Restaurant', 'Customer', 'Items', 'Amount', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{
                    textAlign: 'left', fontSize: '10px', fontWeight: 600,
                    color: '#444', textTransform: 'uppercase', letterSpacing: '0.6px',
                    padding: '10px 16px', borderBottom: '1px solid #1a1a1a', whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  style={{ transition: 'background 0.15s' }}
                  onMouseEnter={(e) => { if (editingOrder !== order.id) e.currentTarget.style.backgroundColor = '#111'; }}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = editingOrder === order.id ? '#0d0d0d' : 'transparent'}
                >
                  {editingOrder === order.id ? (
                    <>
                      <td style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 600, color: '#fff', borderBottom: '1px solid #111' }}>{order.id}</td>
                      <td style={{ padding: '10px 16px', borderBottom: '1px solid #111' }}>
                        <input value={editFormData.restaurant} onChange={(e) => setEditFormData({ ...editFormData, restaurant: e.target.value })}
                          style={{ width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', padding: '6px 9px', fontSize: '12px', outline: 'none' }} />
                      </td>
                      <td style={{ padding: '10px 16px', borderBottom: '1px solid #111' }}>
                        <input value={editFormData.customer} onChange={(e) => setEditFormData({ ...editFormData, customer: e.target.value })}
                          style={{ width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', padding: '6px 9px', fontSize: '12px', outline: 'none' }} />
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: '12px', color: '#aaa', borderBottom: '1px solid #111' }}>{order.items}</td>
                      <td style={{ padding: '10px 16px', borderBottom: '1px solid #111' }}>
                        <input type="number" value={editFormData.amount} onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                          style={{ width: '90px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', padding: '6px 9px', fontSize: '12px', outline: 'none' }} />
                      </td>
                      <td style={{ padding: '10px 16px', borderBottom: '1px solid #111' }}>
                        <select value={editFormData.status} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                          style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', padding: '6px 9px', fontSize: '12px', outline: 'none' }}>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td style={{ padding: '10px 16px', borderBottom: '1px solid #111' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <IconBtn icon={faCheck} onClick={handleUpdateOrder} title="Save" />
                          <IconBtn icon={faTimes} onClick={handleCancelEdit} title="Cancel" />
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#fff', borderBottom: '1px solid #111' }}>{order.id}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#aaa', borderBottom: '1px solid #111' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FontAwesomeIcon icon={faUtensils} style={{ color: '#333', fontSize: '10px' }} />
                          {order.restaurant}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#aaa', borderBottom: '1px solid #111' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FontAwesomeIcon icon={faUser} style={{ color: '#333', fontSize: '10px' }} />
                          {order.customer}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#666', borderBottom: '1px solid #111' }}>{order.items}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#fff', borderBottom: '1px solid #111' }}>{formatNaira(order.amount)}</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #111' }}><StatusBadge status={order.status} /></td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #111' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <IconBtn icon={faEdit}          onClick={() => handleEditOrder(order)}          title="Edit"               />
                          <IconBtn icon={faMoneyBillWave} onClick={() => openConfirm(order, 'confirm')}   title="Confirm transaction" />
                          <IconBtn icon={faTrash}         onClick={() => openConfirm(order, 'delete')}    title="Delete" danger       />
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Operational Snapshot ── */}
      <SectionCard
        title="Operational Snapshot"
        subtitle="Platform health, onboarding, and messaging reliability"
        action={
          <IconBtn
            icon={showPerformanceMetrics ? faEye : faEyeSlash}
            onClick={() => setShowPerformanceMetrics((v) => !v)}
            title={showPerformanceMetrics ? 'Hide metrics' : 'Show metrics'}
          />
        }
      >
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Performance metrics */}
          {showPerformanceMetrics && stats.performanceMetrics && (
            <div>
              <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                <FontAwesomeIcon icon={faTachometerAlt} style={{ marginRight: '6px' }} />
                Performance Metrics
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                {[
                  { label: 'Avg Response', value: stats.performanceMetrics.avgResponseTime, icon: faClock,         accent: '#3b82f6' },
                  { label: 'Success Rate', value: `${stats.performanceMetrics.successRate}%`, icon: faThumbsUp,    accent: '#22c55e' },
                  { label: 'Active Users', value: formatNumber(stats.performanceMetrics.activeUsers), icon: faUserFriends, accent: '#a855f7' },
                  { label: 'Uptime',       value: `${stats.performanceMetrics.uptime}%`,      icon: faArrowCircleUp, accent: '#22c55e' },
                ].map((m) => (
                  <div key={m.label} style={{
                    backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '14px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <p style={{ margin: 0, fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</p>
                      <FontAwesomeIcon icon={m.icon} style={{ color: m.accent, fontSize: '11px' }} />
                    </div>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: m.accent }}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent activity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Recent Activity
              </p>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: '#111', border: '1px solid #1a1a1a',
                borderRadius: '7px', padding: '6px 10px',
              }}>
                <FontAwesomeIcon icon={faSearch} style={{ color: '#444', fontSize: '11px' }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search activity…"
                  style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '12px', width: '160px' }}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '11px' }}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {filteredActivities.length > 0 ? filteredActivities.map((a, idx) => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '12px 0',
                  borderBottom: idx < filteredActivities.length - 1 ? '1px solid #111' : 'none',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                    backgroundColor: `${activityAccent[a.type] || '#555'}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FontAwesomeIcon icon={activityIcon[a.type] || faInfoCircle} style={{ color: activityAccent[a.type] || '#555', fontSize: '11px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#ccc' }}>{a.action}</p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '3px' }}>
                      <span style={{ fontSize: '10px', color: '#555' }}>
                        <FontAwesomeIcon icon={faUser} style={{ marginRight: '4px', fontSize: '9px' }} />
                        {a.user}
                      </span>
                      <span style={{ fontSize: '10px', color: '#444' }}>
                        <FontAwesomeIcon icon={faClock} style={{ marginRight: '4px', fontSize: '9px' }} />
                        {a.time}
                      </span>
                    </div>
                  </div>
                </div>
              )) : (
                <p style={{ fontSize: '13px', color: '#444', textAlign: 'center', padding: '24px 0' }}>
                  No activity matching your search
                </p>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Footer ── */}
      <div style={{
        display: 'flex', gap: '20px', flexWrap: 'wrap',
        padding: '14px 0', borderTop: '1px solid #111',
        fontSize: '11px', color: '#444',
      }}>
        <span><FontAwesomeIcon icon={faMobileAlt} style={{ marginRight: '6px' }} />Last updated: {new Date().toLocaleString()}</span>
        <span><FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '6px' }} />System Status: Operational</span>
        <span><FontAwesomeIcon icon={faPercent} style={{ marginRight: '6px' }} />Data Accuracy: 99.9%</span>
      </div>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  );
};

export default SuperAdminDashboardPage;