import React, { useState, useEffect } from 'react';
import StatsCard from '../components/Dashboard/StatsCard';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { title: 'Total Orders', value: '1,234', change: '+12%', icon: 'fas fa-receipt' },
    { title: 'Revenue', value: '₦2,456,789', change: '+8%', icon: 'fas fa-naira-sign' },
    { title: 'Customers', value: '892', change: '+5%', icon: 'fas fa-users' },
    { title: 'Pending Orders', value: '23', change: '-3%', icon: 'fas fa-clock' },
  ];

  const recentOrders = [
    { id: '#ORD-001', customer: 'Oluwaseun Adebayo', amount: '₦45,000', status: 'Completed', time: '2 hours ago' },
    { id: '#ORD-002', customer: 'Ngozi Okonkwo', amount: '₦120,000', status: 'Pending', time: '3 hours ago' },
    { id: '#ORD-003', customer: 'Chidi Eze', amount: '₦78,500', status: 'Processing', time: '5 hours ago' },
    { id: '#ORD-004', customer: 'Fatima Bello', amount: '₦210,000', status: 'Completed', time: 'Yesterday' },
    { id: '#ORD-005', customer: 'Emeka Okafor', amount: '₦32,000', status: 'Pending', time: 'Yesterday' },
  ];

  const topItems = [
    { name: 'Jollof Rice', sales: 234, revenue: '₦3,510,000' },
    { name: 'Grilled Chicken', sales: 189, revenue: '₦2,835,000' },
    { name: 'Fried Rice', sales: 156, revenue: '₦2,340,000' },
    { name: 'Suya', sales: 142, revenue: '₦1,420,000' },
    { name: 'Pounded Yam', sales: 98, revenue: '₦980,000' },
  ];

  const notifications = [
    { id: 1, message: 'New order #ORD-006 from Amina Mohammed', time: '5 mins ago', read: false },
    { id: 2, message: 'Payment received for #ORD-003', time: '1 hour ago', read: false },
    { id: 3, message: 'Order #ORD-002 is pending', time: '3 hours ago', read: true },
    { id: 4, message: 'New customer registered: Ifeanyi Nwosu', time: 'Yesterday', read: true },
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="page-title">Dashboard</h1>
          <p className="welcome-text">Welcome back, Admin</p>
        </div>
        <div className="header-right">
          <div className="date-time">
            <i className="fas fa-calendar-alt"></i>
            <span>{formatDate(currentTime)}</span>
            <i className="fas fa-clock"></i>
            <span>{formatTime(currentTime)}</span>
          </div>
          <div className="notifications-wrapper">
            <button 
              className="notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="fas fa-bell"></i>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  <button className="mark-all">Mark all as read</button>
                </div>
                <div className="notifications-list">
                  {notifications.map(notif => (
                    <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                      <i className="fas fa-circle"></i>
                      <div className="notification-content">
                        <p>{notif.message}</p>
                        <span>{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="period-selector">
        <button 
          className={selectedPeriod === 'day' ? 'active' : ''} 
          onClick={() => setSelectedPeriod('day')}
        >
          Today
        </button>
        <button 
          className={selectedPeriod === 'week' ? 'active' : ''} 
          onClick={() => setSelectedPeriod('week')}
        >
          This Week
        </button>
        <button 
          className={selectedPeriod === 'month' ? 'active' : ''} 
          onClick={() => setSelectedPeriod('month')}
        >
          This Month
        </button>
        <button 
          className={selectedPeriod === 'year' ? 'active' : ''} 
          onClick={() => setSelectedPeriod('year')}
        >
          This Year
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="recent-orders-card">
          <div className="card-header">
            <h2>Recent Orders</h2>
            <a href="/orders" className="view-all">View All <i className="fas fa-arrow-right"></i></a>
          </div>
          <table className="recent-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">{order.id}</td>
                  <td>{order.customer}</td>
                  <td className="amount">{order.amount}</td>
                  <td>
                    <span className={`status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="time">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="top-items-card">
          <div className="card-header">
            <h2>Top Selling Items</h2>
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="top-items-list">
            {topItems.map((item, index) => (
              <div key={index} className="top-item">
                <div className="item-rank">{index + 1}</div>
                <div className="item-info">
                  <div className="item-name">{item.name}</div>
                  <div className="item-stats">
                    <span><i className="fas fa-shopping-cart"></i> {item.sales} sold</span>
                    <span><i className="fas fa-naira-sign"></i> {item.revenue}</span>
                  </div>
                </div>
                <div className="item-progress">
                  <div className="progress-bar" style={{ width: `${(item.sales / topItems[0].sales) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <div className="card-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => window.location.href = '/orders'}>
            <i className="fas fa-plus-circle"></i>
            <span>New Order</span>
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/customers'}>
            <i className="fas fa-user-plus"></i>
            <span>Add Customer</span>
          </button>
          <button className="action-btn" onClick={() => alert('Export feature coming soon')}>
            <i className="fas fa-download"></i>
            <span>Export Report</span>
          </button>
          <button className="action-btn" onClick={() => alert('Print feature coming soon')}>
            <i className="fas fa-print"></i>
            <span>Print Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;