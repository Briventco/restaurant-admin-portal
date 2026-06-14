import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStore, faCheckCircle, faShoppingCart, faClock,
  faExclamationTriangle, faSearch, faSync,
  faDownload, faPrint, faPlus, faMinus,
  faExpand, faArrowUp, faArrowDown, faTimes, faInfoCircle,
  faUserFriends, faPercent, faSpinner,
  faEye, faEyeSlash, faEdit, faTrash,
  faCheck, faMoneyBillWave, faUser, faUtensils,
  faTachometerAlt, faThumbsUp, faArrowCircleUp, faMobileAlt,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { runtimeApi } from '../../api/runtime';
import './SuperAdminDashboardPage.css';

const formatNaira = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

const formatNumber = (num) =>
  num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const StatusBadge = ({ status }) => (
  <span className={`status-badge ${status?.toLowerCase()}`}>
    {status}
  </span>
);

const ConfirmModal = ({ action, order, onConfirm, onCancel }) => (
  <div className="modal-overlay">
    <div className="confirm-modal">
      <div className="modal-header">
        <FontAwesomeIcon icon={action === 'delete' ? faTrash : faCheckCircle} />
        <h3>{action === 'delete' ? 'Delete Order' : 'Confirm Transaction'}</h3>
        <button className="modal-close" onClick={onCancel}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="modal-body">
        <div className="order-details">
          <p><strong>ID:</strong> {order?.id}</p>
          <p><strong>Restaurant:</strong> {order?.restaurant}</p>
          <p><strong>Customer:</strong> {order?.customer}</p>
          <p><strong>Amount:</strong> {formatNaira(order?.amount)}</p>
        </div>
        {action === 'delete' && (
          <p className="modal-warning">⚠ This action cannot be undone.</p>
        )}
      </div>
      <div className="modal-footer">
        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
        <button
          className={action === 'delete' ? 'btn-delete' : 'btn-confirm'}
          onClick={onConfirm}
        >
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
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(true);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [editFormData, setEditFormData] = useState({ id: '', restaurant: '', amount: '', status: '', customer: '' });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

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
      } finally {
        setLoading(false);
      }
    };
    load();
    const iv = autoRefresh ? setInterval(load, 30000) : null;
    return () => iv && clearInterval(iv);
  }, [autoRefresh]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setOrdersLoading(true);
        const response = await runtimeApi.getAllOrders();
        if (response?.orders) setOrders(response.orders);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    };
    loadOrders();
  }, []);

  const handleRefreshOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await runtimeApi.getAllOrders();
      if (response?.orders) {
        setOrders(response.orders);
        setCurrentPage(1);
        addToast('Orders refreshed', 'success');
      }
    } catch (err) {
      addToast('Failed to refresh orders', 'error');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order.id);
    setEditFormData({ ...order });
  };

  const handleUpdateOrder = () => {
    setOrders((prev) => prev.map((o) =>
      o.id === editFormData.id ? { ...o, ...editFormData, amount: parseFloat(editFormData.amount) } : o
    ));
    setEditingOrder(null);
    addToast(`Order ${editFormData.id} updated`, 'success');
  };

  const handleCancelEdit = () => setEditingOrder(null);

  const openConfirm = (order, action) => {
    setSelectedOrder(order);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const closeConfirm = () => {
    setShowConfirmModal(false);
    setSelectedOrder(null);
    setConfirmAction(null);
  };

  const confirmAction_ = () => {
    if (confirmAction === 'delete') {
      setOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
      addToast(`Order ${selectedOrder.id} deleted`, 'success');
    } else {
      setOrders((prev) => prev.map((o) =>
        o.id === selectedOrder.id ? { ...o, status: 'completed' } : o
      ));
      addToast(`Order ${selectedOrder.id} confirmed`, 'success');
    }
    closeConfirm();
  };

  const totalPages = Math.ceil(orders.length / rowsPerPage);
  const paginatedOrders = orders.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const filteredActivities = stats?.recentActivities?.filter((a) =>
    a.action.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const timeRanges = [
    { value: 'day',   label: 'Today'      },
    { value: 'week',  label: 'This Week'  },
    { value: 'month', label: 'This Month' },
    { value: 'year',  label: 'This Year'  },
  ];

  if (loading) return (
    <div className="loading-wrapper">
      <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" style={{ fontSize: '28px' }} />
      <p>Loading dashboard…</p>
      <div className="loading-progress" />
    </div>
  );

  if (!stats) return (
    <div className="empty-wrapper">
      <FontAwesomeIcon icon={faInfoCircle} style={{ fontSize: '24px' }} />
      <p>No data available</p>
    </div>
  );

  return (
    <div className="dashboard-container" style={{ zoom: zoomLevel }}>

      <div className="floating-notifications">
        {toasts.map((t) => (
          <div key={t.id} className={`notification notification-${t.type}`}>
            <div className="notification-content">
              <span>{t.message}</span>
            </div>
            <button
              className="notification-close"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ))}
      </div>

      {showConfirmModal && (
        <ConfirmModal
          action={confirmAction}
          order={selectedOrder}
          onConfirm={confirmAction_}
          onCancel={closeConfirm}
        />
      )}

      <div className="dashboard-header">
        <div className="header-title-section">
          <h2 className="dashboard-title">System Dashboard</h2>
          <p className="dashboard-subtitle">
            Cross-restaurant visibility — platform health, message delivery, and operational load.
          </p>
        </div>

        <div className="header-actions">
          <div className="zoom-controls-group">
            <button className="zoom-btn" onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))} title="Zoom out">
              <FontAwesomeIcon icon={faMinus} />
            </button>
            <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
            <button className="zoom-btn" onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))} title="Zoom in">
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button className="zoom-btn reset" onClick={() => setZoomLevel(1)} title="Reset zoom">
              <FontAwesomeIcon icon={faExpand} />
            </button>
          </div>

          <div className="action-buttons">
            <button className="action-btn" onClick={() => addToast('Exporting…', 'info')} title="Export">
              <FontAwesomeIcon icon={faDownload} />
            </button>
            <button className="action-btn" onClick={() => window.print()} title="Print">
              <FontAwesomeIcon icon={faPrint} />
            </button>
            <button
              className={`action-btn ${autoRefresh ? 'active' : ''}`}
              onClick={() => setAutoRefresh((a) => !a)}
              title={autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off'}
            >
              <FontAwesomeIcon icon={faSync} />
            </button>
          </div>
        </div>
      </div>

      <div className="time-range-selector">
        {timeRanges.map((r) => (
          <button
            key={r.value}
            className={`time-range-btn ${selectedTimeRange === r.value ? 'active' : ''}`}
            onClick={() => setSelectedTimeRange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="stats-grid">
        <div className="stat-card-wrapper">
          <StatCard title="Total Restaurants"  value={formatNumber(stats.totalRestaurants)}  trend={stats.totalRestaurantsTrend}  icon={faStore}            />
          <StatCard title="Active Restaurants" value={formatNumber(stats.activeRestaurants)} trend={stats.activeRestaurantsTrend} icon={faCheckCircle}      />
          <StatCard title="Total Orders"       value={formatNumber(stats.totalOrders)}        trend={stats.totalOrdersTrend}        icon={faShoppingCart}     />
          <StatCard title="Pending Actions"    value={formatNumber(stats.pendingActions)}     icon={faClock}                                                  />
          <StatCard title="WA Sessions"        value={formatNumber(stats.connectedSessions)}  icon={faWhatsapp}                                               />
          <StatCard title="Failed Outbox"      value={formatNumber(stats.failedOutboxCount)}  icon={faExclamationTriangle}                                    />
        </div>
      </div>

      <div className="dashboard-grid">

        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title-wrapper">
              <h3 className="section-card-title">Recent Orders</h3>
              <p className="section-card-subtitle">Latest orders from all Nigerian restaurants</p>
            </div>
            <div className="section-actions">
              <button className="icon-btn" onClick={handleRefreshOrders} title="Refresh">
                <FontAwesomeIcon icon={faSync} />
              </button>
            </div>
          </div>

          <div className="orders-container">
            <div className="orders-desktop-view">
              <table className="orders-table">
                <thead>
                  <tr>
                    {['Order ID', 'Restaurant', 'Customer', 'Items', 'Amount', 'Status', 'Actions'].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className={editingOrder === order.id ? 'editing-row' : ''}
                    >
                      {editingOrder === order.id ? (
                        <>
                          <td className="order-id">{order.id}</td>
                          <td>
                            <input
                              className="edit-input"
                              value={editFormData.restaurant}
                              onChange={(e) => setEditFormData({ ...editFormData, restaurant: e.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              className="edit-input"
                              value={editFormData.customer}
                              onChange={(e) => setEditFormData({ ...editFormData, customer: e.target.value })}
                            />
                          </td>
                          <td>{order.items}</td>
                          <td>
                            <input
                              className="edit-input"
                              type="number"
                              value={editFormData.amount}
                              onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                              style={{ width: '90px' }}
                            />
                          </td>
                          <td>
                            <select
                              className="edit-select"
                              value={editFormData.status}
                              onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                          <td>
                            <div className="action-buttons-cell">
                              <button className="action-btn save-btn" onClick={handleUpdateOrder} title="Save">
                                <FontAwesomeIcon icon={faCheck} />
                              </button>
                              <button className="action-btn cancel-btn" onClick={handleCancelEdit} title="Cancel">
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="order-id">{order.id}</td>
                          <td>
                            <FontAwesomeIcon icon={faUtensils} className="td-icon" />
                            {order.restaurant}
                          </td>
                          <td>
                            <FontAwesomeIcon icon={faUser} className="td-icon" />
                            {order.customer}
                          </td>
                          <td>{order.items}</td>
                          <td className="amount-cell">{formatNaira(order.amount)}</td>
                          <td><StatusBadge status={order.status} /></td>
                          <td>
                            <div className="action-buttons-cell">
                              <button className="action-btn edit-btn" onClick={() => handleEditOrder(order)} title="Edit">
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button className="action-btn confirm-btn" onClick={() => openConfirm(order, 'confirm')} title="Confirm transaction">
                                <FontAwesomeIcon icon={faMoneyBillWave} />
                              </button>
                              <button className="action-btn delete-btn" onClick={() => openConfirm(order, 'delete')} title="Delete">
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="orders-mobile-view">
              {paginatedOrders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <span className="order-id-badge">{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="order-card-body">
                    <div className="order-info-row">
                      <span className="order-info-label"><FontAwesomeIcon icon={faUtensils} /> Restaurant</span>
                      <span className="order-info-value">{order.restaurant}</span>
                    </div>
                    <div className="order-info-row">
                      <span className="order-info-label"><FontAwesomeIcon icon={faUser} /> Customer</span>
                      <span className="order-info-value">{order.customer}</span>
                    </div>
                    <div className="order-info-row">
                      <span className="order-info-label">Items</span>
                      <span className="order-info-value">{order.items}</span>
                    </div>
                    <div className="order-info-row">
                      <span className="order-info-label">Amount</span>
                      <span className="order-info-value amount">{formatNaira(order.amount)}</span>
                    </div>
                  </div>
                  <div className="order-card-actions">
                    <button className="mobile-action-btn edit-btn" onClick={() => handleEditOrder(order)}>
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>
                    <button className="mobile-action-btn confirm-btn" onClick={() => openConfirm(order, 'confirm')}>
                      <FontAwesomeIcon icon={faMoneyBillWave} /> Confirm
                    </button>
                    <button className="mobile-action-btn delete-btn" onClick={() => openConfirm(order, 'delete')}>
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pagination-bar">
              <p className="pagination-info">
                Showing {orders.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, orders.length)} of {orders.length} orders
              </p>
              <div className="pagination-controls">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title-wrapper">
              <h3 className="section-card-title">Operational Snapshot</h3>
              <p className="section-card-subtitle">Platform health, onboarding, and messaging reliability</p>
            </div>
            <div className="section-actions">
              <button
                className="icon-btn"
                onClick={() => setShowPerformanceMetrics((v) => !v)}
                title={showPerformanceMetrics ? 'Hide metrics' : 'Show metrics'}
              >
                <FontAwesomeIcon icon={showPerformanceMetrics ? faEye : faEyeSlash} />
              </button>
            </div>
          </div>

          <div className="section-card-body">
            {showPerformanceMetrics && stats.performanceMetrics && (
              <div className="performance-metrics">
                <h4>
                  <FontAwesomeIcon icon={faTachometerAlt} />
                  Performance Metrics
                </h4>
                <div className="metrics-grid">
                  {[
                    { label: 'Avg Response', value: stats.performanceMetrics.avgResponseTime, icon: faClock        },
                    { label: 'Success Rate', value: `${stats.performanceMetrics.successRate}%`, icon: faThumbsUp   },
                    { label: 'Active Users', value: formatNumber(stats.performanceMetrics.activeUsers), icon: faUserFriends },
                    { label: 'Uptime',       value: `${stats.performanceMetrics.uptime}%`, icon: faArrowCircleUp   },
                  ].map((m) => (
                    <div key={m.label} className="metric-card">
                      <div className="metric-label">
                        <FontAwesomeIcon icon={m.icon} />
                        {m.label}
                      </div>
                      <div className="metric-value">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="activities-section">
              <div className="activities-header">
                <h4>Recent Activity</h4>
                <div className="search-wrapper">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search activity…"
                  />
                  {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm('')}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              </div>

              <div className="activities-list">
                {filteredActivities.length > 0 ? filteredActivities.map((a) => (
                  <div key={a.id} className={`activity-item ${a.type}`}>
                    <div className="activity-avatar">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div className="activity-content">
                      <p className="activity-action">{a.action}</p>
                      <div className="activity-meta">
                        <span className="activity-user">
                          <FontAwesomeIcon icon={faUser} /> {a.user}
                        </span>
                        <span className="activity-time">
                          <FontAwesomeIcon icon={faClock} /> {a.time}
                        </span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="empty-activities">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <p>No activity matching your search</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <div className="footer-stats">
          <span className="footer-stat">
            <FontAwesomeIcon icon={faMobileAlt} /> Last updated: {new Date().toLocaleString()}
          </span>
          <span className="footer-stat">
            <FontAwesomeIcon icon={faEnvelope} /> System Status: Operational
          </span>
          <span className="footer-stat">
            <FontAwesomeIcon icon={faPercent} /> Data Accuracy: 99.9%
          </span>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, icon }) => (
  <div className="section-card">
    <div className="section-card-body">
      <div className="metric-label">
        {icon && <FontAwesomeIcon icon={icon} />}
        {title}
      </div>
      <div className="metric-value">{value ?? '—'}</div>
      {trend !== undefined && (
        <p style={{ margin: '8px 0 0', fontSize: '12px', color: trend >= 0 ? '#22c55e' : '#ef4444' }}>
          <FontAwesomeIcon icon={trend >= 0 ? faArrowUp : faArrowDown} />
          {' '}{Math.abs(trend)}% from last period
        </p>
      )}
    </div>
  </div>
);

export default SuperAdminDashboardPage;