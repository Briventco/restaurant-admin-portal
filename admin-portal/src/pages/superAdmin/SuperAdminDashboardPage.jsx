import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStore, 
  faCheckCircle, 
  faShoppingCart, 
  faClock, 
  faExclamationTriangle,
  faSearch,
  faFilter,
  faSync,
  faBell,
  faChartLine,
  faDownload,
  faPrint,
  faExpand,
  faCompress,
  faPlus,
  faMinus,
  faArrowUp,
  faArrowDown,
  faTimes,
  faChevronLeft,
  faChevronRight,
  faInfoCircle,
  faCog,
  faUserFriends,
  faTachometerAlt,
  faEnvelope,
  faMobileAlt,
  faCalendarAlt,
  faPercent,
  faArrowCircleUp,
  faArrowCircleDown,
  faSpinner,
  faEye,
  faEyeSlash,
  faThumbsUp,
  faThumbsDown,
  faChartBar,
  faChartPie,
  faChartLine as faChartLineAlt,
  faEdit,
  faTrash,
  faCheck,
  faBan,
  faMoneyBillWave,
  faReceipt,
  faUser,
  faUtensils
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import { runtimeApi } from '../../Api/runtime';
import './SuperAdminDashboardPage.css';

const SuperAdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(true);
  const [chartView, setChartView] = useState('bar');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [editFormData, setEditFormData] = useState({
    id: '',
    restaurant: '',
    amount: '',
    status: '',
    customer: ''
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const dashboardRef = useRef(null);
  const statsRef = useRef(null);
  const cardsGridRef = useRef(null);

  const [orders, setOrders] = useState([
    { id: 'NG-001', restaurant: 'Mama Put Kitchen', amount: 12500, status: 'completed', customer: 'Adebayo O.', time: '10:30 AM', items: 3 },
    { id: 'NG-002', restaurant: 'Suya Spot', amount: 8500, status: 'pending', customer: 'Chidi N.', time: '11:15 AM', items: 2 },
    { id: 'NG-003', restaurant: 'Jollof Heaven', amount: 23500, status: 'processing', customer: 'Funke A.', time: '09:45 AM', items: 4 },
    { id: 'NG-004', restaurant: 'Amala Sky', amount: 6200, status: 'completed', customer: 'Oluwaseun B.', time: '08:30 AM', items: 2 },
    { id: 'NG-005', restaurant: 'Pounded Yam Express', amount: 15400, status: 'pending', customer: 'Ngozi E.', time: '12:00 PM', items: 3 },
    { id: 'NG-006', restaurant: 'Buka Republic', amount: 18750, status: 'completed', customer: 'Emeka O.', time: '02:15 PM', items: 5 },
    { id: 'NG-007', restaurant: 'Fufu Palace', amount: 9300, status: 'processing', customer: 'Amara C.', time: '01:45 PM', items: 2 }
  ]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleZoomIn = () => {
    if (zoomLevel < 1.5) {
      setZoomLevel(prev => prev + 0.1);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 0.7) {
      setZoomLevel(prev => prev - 0.1);
    }
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToStats = () => {
    if (statsRef.current) {
      statsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const formatNaira = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order.id);
    setEditFormData({
      id: order.id,
      restaurant: order.restaurant,
      amount: order.amount,
      status: order.status,
      customer: order.customer
    });
  };

  const handleUpdateOrder = () => {
    setOrders(orders.map(order => 
      order.id === editFormData.id 
        ? { 
            ...order, 
            restaurant: editFormData.restaurant,
            amount: parseFloat(editFormData.amount),
            status: editFormData.status,
            customer: editFormData.customer
          }
        : order
    ));
    setEditingOrder(null);
    addNotification(`Order ${editFormData.id} updated successfully`, 'success');
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setEditFormData({ id: '', restaurant: '', amount: '', status: '', customer: '' });
  };

  const handleDeleteOrder = (order) => {
    setSelectedOrder(order);
    setConfirmAction('delete');
    setShowConfirmModal(true);
  };

  const confirmDeleteOrder = () => {
    setOrders(orders.filter(order => order.id !== selectedOrder.id));
    addNotification(`Order ${selectedOrder.id} deleted successfully`, 'success');
    setShowConfirmModal(false);
    setSelectedOrder(null);
    setConfirmAction(null);
  };

  const handleConfirmTransaction = (order) => {
    setSelectedOrder(order);
    setConfirmAction('confirm');
    setShowConfirmModal(true);
  };

  const confirmTransaction = () => {
    setOrders(orders.map(order => 
      order.id === selectedOrder.id 
        ? { ...order, status: 'completed' }
        : order
    ));
    addNotification(`Order ${selectedOrder.id} confirmed and marked as completed`, 'success');
    setShowConfirmModal(false);
    setSelectedOrder(null);
    setConfirmAction(null);
  };

  const handleCancelTransaction = () => {
    setShowConfirmModal(false);
    setSelectedOrder(null);
    setConfirmAction(null);
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!runtimeApi || typeof runtimeApi.getSuperAdminDashboard !== 'function') {
          throw new Error('API service not properly configured');
        }
        
        const response = await runtimeApi.getSuperAdminDashboard();
        setStats(response);
        addNotification('Dashboard data refreshed successfully', 'success');
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
        addNotification('Failed to load dashboard data', 'error');
        
        if (process.env.NODE_ENV === 'development') {
          setStats({
            totalRestaurants: 24,
            activeRestaurants: 18,
            totalOrders: 1247,
            pendingActions: 3,
            connectedSessions: 12,
            failedOutboxCount: 2,
            totalRestaurantsTrend: 12,
            activeRestaurantsTrend: 8,
            totalOrdersTrend: 23,
            recentActivities: [
              { id: 1, action: 'New restaurant registered: "Mama Put Kitchen"', user: 'Admin', time: '2 mins ago', type: 'success' },
              { id: 2, action: 'Order #NG-001 completed - ₦12,500.00', user: 'Adebayo O.', time: '5 mins ago', type: 'success' },
              { id: 3, action: 'WhatsApp session connected for "Suya Spot"', user: 'System', time: '12 mins ago', type: 'info' },
              { id: 4, action: 'System update completed successfully', user: 'Admin', time: '25 mins ago', type: 'success' },
              { id: 5, action: 'Failed message retry scheduled for 3 items', user: 'System', time: '32 mins ago', type: 'warning' },
              { id: 6, action: 'Monthly report generated', user: 'System', time: '1 hour ago', type: 'info' },
              { id: 7, action: 'New user account created: "Oluwaseun B."', user: 'Admin', time: '2 hours ago', type: 'success' },
              { id: 8, action: 'Payment received from "Jollof Heaven"', user: 'Funke A.', time: '3 hours ago', type: 'success' }
            ],
            performanceMetrics: {
              avgResponseTime: '1.2s',
              successRate: 98.5,
              activeUsers: 156,
              uptime: 99.9,
              apiCalls: 45892,
              errorRate: 1.5
            }
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    
    let refreshInterval;
    if (autoRefresh) {
      refreshInterval = setInterval(() => {
        loadDashboardData();
      }, 30000);
    }
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [autoRefresh]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, timestamp: new Date() }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const exportData = () => {
    addNotification('Exporting dashboard data...', 'info');
    setTimeout(() => {
      addNotification('Data exported successfully', 'success');
    }, 1500);
  };

  const printDashboard = () => {
    window.print();
  };

  const filteredActivities = stats?.recentActivities?.filter(activity =>
    activity.action.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatNumber = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const timeRanges = [
    { value: 'day', label: 'Today', icon: faCalendarAlt },
    { value: 'week', label: 'This Week', icon: faChartLine },
    { value: 'month', label: 'This Month', icon: faChartBar },
    { value: 'year', label: 'This Year', icon: faChartPie }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'completed': return 'status-badge completed';
      case 'pending': return 'status-badge pending';
      case 'processing': return 'status-badge processing';
      default: return 'status-badge';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-wrapper">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" className="loading-icon" />
          <p>Loading dashboard data...</p>
          <div className="loading-progress"></div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="dashboard-container">
        <div className="error-wrapper">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="error-icon" />
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-retry">
            <FontAwesomeIcon icon={faSync} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-container">
        <div className="empty-wrapper">
          <FontAwesomeIcon icon={faInfoCircle} size="3x" />
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" ref={dashboardRef} style={{ zoom: zoomLevel }}>
      <div className="floating-notifications">
        {notifications.map(notif => (
          <div key={notif.id} className={`notification notification-${notif.type}`}>
            <div className="notification-content">
              <FontAwesomeIcon 
                icon={notif.type === 'success' ? faCheckCircle : notif.type === 'error' ? faExclamationTriangle : faInfoCircle} 
              />
              <span>{notif.message}</span>
            </div>
            <button onClick={() => removeNotification(notif.id)} className="notification-close">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ))}
      </div>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="modal-header">
              <FontAwesomeIcon icon={confirmAction === 'delete' ? faTrash : faCheckCircle} />
              <h3>{confirmAction === 'delete' ? 'Delete Order' : 'Confirm Transaction'}</h3>
              <button onClick={handleCancelTransaction} className="modal-close">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              {confirmAction === 'delete' ? (
                <>
                  <p>Are you sure you want to delete order <strong>{selectedOrder?.id}</strong>?</p>
                  <p className="modal-warning">This action cannot be undone.</p>
                  <div className="order-details">
                    <p><strong>Restaurant:</strong> {selectedOrder?.restaurant}</p>
                    <p><strong>Amount:</strong> {formatNaira(selectedOrder?.amount)}</p>
                    <p><strong>Customer:</strong> {selectedOrder?.customer}</p>
                  </div>
                </>
              ) : (
                <>
                  <p>Confirm transaction for order <strong>{selectedOrder?.id}</strong></p>
                  <div className="order-details">
                    <p><strong>Restaurant:</strong> {selectedOrder?.restaurant}</p>
                    <p><strong>Amount:</strong> {formatNaira(selectedOrder?.amount)}</p>
                    <p><strong>Customer:</strong> {selectedOrder?.customer}</p>
                  </div>
                  <p>This will mark the order as completed.</p>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={handleCancelTransaction} className="btn-cancel">
                <FontAwesomeIcon icon={faBan} />
                Cancel
              </button>
              <button 
                onClick={confirmAction === 'delete' ? confirmDeleteOrder : confirmTransaction} 
                className={confirmAction === 'delete' ? 'btn-delete' : 'btn-confirm'}
              >
                <FontAwesomeIcon icon={confirmAction === 'delete' ? faTrash : faCheck} />
                {confirmAction === 'delete' ? 'Delete' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-header">
        <div className="header-title-section">
          <h1 className="dashboard-title">System Dashboard</h1>
          <p className="dashboard-subtitle">Cross-restaurant visibility for platform health, message delivery, and operational load.</p>
        </div>
        
        <div className="header-actions">
          <div className="zoom-controls-group">
            <button onClick={handleZoomOut} className="zoom-btn" title="Zoom Out">
              <FontAwesomeIcon icon={faMinus} />
            </button>
            <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
            <button onClick={handleZoomIn} className="zoom-btn" title="Zoom In">
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button onClick={handleResetZoom} className="zoom-btn reset" title="Reset Zoom">
              <FontAwesomeIcon icon={faExpand} />
            </button>
          </div>

          <div className="action-buttons">
            <button onClick={scrollToTop} className="action-btn" title="Scroll to Top">
              <FontAwesomeIcon icon={faArrowUp} />
            </button>
            <button onClick={scrollToStats} className="action-btn" title="Scroll to Stats">
              <FontAwesomeIcon icon={faArrowDown} />
            </button>
            <button onClick={exportData} className="action-btn" title="Export Data">
              <FontAwesomeIcon icon={faDownload} />
            </button>
            <button onClick={printDashboard} className="action-btn" title="Print Dashboard">
              <FontAwesomeIcon icon={faPrint} />
            </button>
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className="action-btn notification-btn"
              title="Notifications"
            >
              <FontAwesomeIcon icon={faBell} />
              {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
            </button>
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)} 
              className={`action-btn ${autoRefresh ? 'active' : ''}`}
              title={autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
            >
              <FontAwesomeIcon icon={faSync} spin={autoRefresh} />
            </button>
          </div>
        </div>
      </div>

      <div className="time-range-selector">
        {timeRanges.map(range => (
          <button
            key={range.value}
            onClick={() => setSelectedTimeRange(range.value)}
            className={`time-range-btn ${selectedTimeRange === range.value ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={range.icon} />
            <span>{range.label}</span>
          </button>
        ))}
      </div>

      <div className="stats-grid" ref={statsRef}>
        <div className="stat-card-wrapper">
          <StatCard 
            title="Total Restaurants" 
            value={formatNumber(stats.totalRestaurants)} 
            trend={stats.totalRestaurantsTrend}
            icon={faStore}
          />
          <StatCard 
            title="Active Restaurants" 
            value={formatNumber(stats.activeRestaurants)} 
            trend={stats.activeRestaurantsTrend}
            icon={faCheckCircle}
          />
          <StatCard 
            title="Total Orders" 
            value={formatNumber(stats.totalOrders)} 
            trend={stats.totalOrdersTrend}
            icon={faShoppingCart}
          />
          <StatCard 
            title="Pending Actions" 
            value={formatNumber(stats.pendingActions)} 
            variant="warning"
            icon={faClock}
          />
          <StatCard 
            title="Connected WhatsApp Sessions" 
            value={formatNumber(stats.connectedSessions)} 
            variant="success"
            icon={faWhatsapp}
          />
          <StatCard 
            title="Failed Outbox Count" 
            value={formatNumber(stats.failedOutboxCount)} 
            variant="danger"
            icon={faExclamationTriangle}
          />
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent Orders Section - Fixed Display */}
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title-wrapper">
              <h2 className="section-card-title">Recent Orders</h2>
              <p className="section-card-subtitle">Latest orders from all Nigerian restaurants</p>
            </div>
            <div className="section-actions">
              <button className="icon-btn" onClick={() => addNotification('Refreshing orders...', 'info')}>
                <FontAwesomeIcon icon={faSync} />
              </button>
            </div>
          </div>
          <div className="section-card-body">
            <div className="orders-container">
              {/* Desktop Table View */}
              <div className="orders-desktop-view">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Restaurant</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Amount (₦)</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => (
                      <tr key={idx} className={editingOrder === order.id ? 'editing-row' : ''}>
                        {editingOrder === order.id ? (
                          <>
                            <td data-label="Order ID">{order.id}</td>
                            <td data-label="Restaurant">
                              <input
                                type="text"
                                value={editFormData.restaurant}
                                onChange={(e) => setEditFormData({...editFormData, restaurant: e.target.value})}
                                className="edit-input"
                              />
                            </td>
                            <td data-label="Customer">
                              <input
                                type="text"
                                value={editFormData.customer}
                                onChange={(e) => setEditFormData({...editFormData, customer: e.target.value})}
                                className="edit-input"
                              />
                            </td>
                            <td data-label="Items">{order.items}</td>
                            <td data-label="Amount">
                              <input
                                type="number"
                                value={editFormData.amount}
                                onChange={(e) => setEditFormData({...editFormData, amount: e.target.value})}
                                className="edit-input"
                              />
                            </td>
                            <td data-label="Status">
                              <select
                                value={editFormData.status}
                                onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                                className="edit-select"
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                              </select>
                            </td>
                            <td data-label="Actions" className="action-buttons-cell">
                              <button onClick={handleUpdateOrder} className="action-btn save-btn" title="Save">
                                <FontAwesomeIcon icon={faCheck} />
                              </button>
                              <button onClick={handleCancelEdit} className="action-btn cancel-btn" title="Cancel">
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td data-label="Order ID" className="order-id">{order.id}</td>
                            <td data-label="Restaurant">
                              <FontAwesomeIcon icon={faUtensils} className="td-icon" />
                              {order.restaurant}
                            </td>
                            <td data-label="Customer">
                              <FontAwesomeIcon icon={faUser} className="td-icon" />
                              {order.customer}
                            </td>
                            <td data-label="Items">{order.items}</td>
                            <td data-label="Amount" className="amount-cell">{formatNaira(order.amount)}</td>
                            <td data-label="Status">
                              <span className={getStatusBadgeClass(order.status)}>
                                {order.status}
                              </span>
                            </td>
                            <td data-label="Actions" className="action-buttons-cell">
                              <button onClick={() => handleEditOrder(order)} className="action-btn edit-btn" title="Edit">
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button onClick={() => handleConfirmTransaction(order)} className="action-btn confirm-btn" title="Confirm Transaction">
                                <FontAwesomeIcon icon={faMoneyBillWave} />
                              </button>
                              <button onClick={() => handleDeleteOrder(order)} className="action-btn delete-btn" title="Delete">
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="orders-mobile-view">
                {orders.map((order, idx) => (
                  <div key={idx} className="order-card">
                    <div className="order-card-header">
                      <span className="order-id-badge">{order.id}</span>
                      <span className={getStatusBadgeClass(order.status)}>{order.status}</span>
                    </div>
                    <div className="order-card-body">
                      <div className="order-info-row">
                        <span className="order-info-label">
                          <FontAwesomeIcon icon={faUtensils} />
                          Restaurant:
                        </span>
                        <span className="order-info-value">{order.restaurant}</span>
                      </div>
                      <div className="order-info-row">
                        <span className="order-info-label">
                          <FontAwesomeIcon icon={faUser} />
                          Customer:
                        </span>
                        <span className="order-info-value">{order.customer}</span>
                      </div>
                      <div className="order-info-row">
                        <span className="order-info-label">Items:</span>
                        <span className="order-info-value">{order.items}</span>
                      </div>
                      <div className="order-info-row">
                        <span className="order-info-label">Amount:</span>
                        <span className="order-info-value amount">{formatNaira(order.amount)}</span>
                      </div>
                    </div>
                    <div className="order-card-actions">
                      <button onClick={() => handleEditOrder(order)} className="mobile-action-btn edit-btn">
                        <FontAwesomeIcon icon={faEdit} />
                        Edit
                      </button>
                      <button onClick={() => handleConfirmTransaction(order)} className="mobile-action-btn confirm-btn">
                        <FontAwesomeIcon icon={faMoneyBillWave} />
                        Confirm
                      </button>
                      <button onClick={() => handleDeleteOrder(order)} className="mobile-action-btn delete-btn">
                        <FontAwesomeIcon icon={faTrash} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Operational Snapshot Section */}
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title-wrapper">
              <h2 className="section-card-title">Operational Snapshot</h2>
              <p className="section-card-subtitle">Brivent internal monitoring of onboarding, runtime health, and messaging reliability.</p>
            </div>
            <div className="section-actions">
              <button className="icon-btn" onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}>
                <FontAwesomeIcon icon={showPerformanceMetrics ? faEye : faEyeSlash} />
              </button>
              <button className="icon-btn" onClick={() => setChartView(chartView === 'bar' ? 'line' : 'bar')}>
                <FontAwesomeIcon icon={chartView === 'bar' ? faChartBar : faChartLineAlt} />
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
                  <div className="metric-card">
                    <div className="metric-label">
                      <FontAwesomeIcon icon={faClock} />
                      Avg Response Time
                    </div>
                    <div className="metric-value">{stats.performanceMetrics.avgResponseTime}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">
                      <FontAwesomeIcon icon={faThumbsUp} />
                      Success Rate
                    </div>
                    <div className="metric-value">{stats.performanceMetrics.successRate}%</div>
                    <div className="metric-progress">
                      <div className="progress-bar" style={{ width: `${stats.performanceMetrics.successRate}%` }}></div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">
                      <FontAwesomeIcon icon={faUserFriends} />
                      Active Users
                    </div>
                    <div className="metric-value">{formatNumber(stats.performanceMetrics.activeUsers)}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">
                      <FontAwesomeIcon icon={faArrowCircleUp} />
                      Uptime
                    </div>
                    <div className="metric-value">{stats.performanceMetrics.uptime || 99.9}%</div>
                  </div>
                </div>
              </div>
            )}

            <div className="activities-section">
              <div className="activities-header">
                <h4>
                  <FontAwesomeIcon icon={faChartLine} />
                  Recent Activity
                </h4>
                <div className="search-wrapper">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input
                    type="text"
                    placeholder={isMobile ? "Search..." : "Search activities..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="clear-search">
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="activities-list">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => (
                    <div key={activity.id} className={`activity-item ${activity.type}`}>
                      <div className="activity-avatar">
                        <FontAwesomeIcon icon={activity.type === 'success' ? faCheckCircle : activity.type === 'warning' ? faExclamationTriangle : faInfoCircle} />
                      </div>
                      <div className="activity-content">
                        <p className="activity-action">{activity.action}</p>
                        <div className="activity-meta">
                          <span className="activity-user">
                            <FontAwesomeIcon icon={faUser} />
                            {activity.user}
                          </span>
                          <span className="activity-time">
                            <FontAwesomeIcon icon={faClock} />
                            {activity.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-activities">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <p>No recent activity to display</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <div className="footer-stats">
          <div className="footer-stat">
            <FontAwesomeIcon icon={faMobileAlt} />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
          <div className="footer-stat">
            <FontAwesomeIcon icon={faEnvelope} />
            <span>System Status: Operational</span>
          </div>
          <div className="footer-stat">
            <FontAwesomeIcon icon={faPercent} />
            <span>Data Accuracy: 99.9%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardPage;