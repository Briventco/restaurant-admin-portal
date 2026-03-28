import React, { useState, useEffect } from 'react';
import StatsCard from '../components/Dashboard/StatsCard';

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

  const getStatusStyle = (status) => {
    const base = { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' };
    switch (status.toLowerCase()) {
      case 'completed': return { ...base, backgroundColor: '#0a2a0a', color: '#44ff44' };
      case 'pending': return { ...base, backgroundColor: '#2a2a0a', color: '#ffff44' };
      case 'processing': return { ...base, backgroundColor: '#0a1a2a', color: '#4488ff' };
      default: return base;
    }
  };

  const formatTime = (date) => date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date) => date.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const cardStyle = {
    backgroundColor: '#111111',
    border: '1px solid #222222',
    borderRadius: '12px',
    padding: '20px',
  };

  const cardHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  };

  const cardTitleStyle = {
    fontSize: '16px',
    fontWeight: 600,
    color: '#ffffff',
    margin: 0,
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#ffffff' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: '0 0 4px 0' }}>Dashboard</h1>
          <p style={{ fontSize: '13px', color: '#888888', margin: 0 }}>Welcome back, Admin</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#888888', backgroundColor: '#1a1a1a', padding: '8px 14px', borderRadius: '8px', border: '1px solid #222222' }}>
            <i className="fas fa-calendar-alt"></i>
            <span>{formatDate(currentTime)}</span>
            <i className="fas fa-clock"></i>
            <span>{formatTime(currentTime)}</span>
          </div>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ position: 'relative', backgroundColor: '#1a1a1a', border: '1px solid #222222', color: '#ffffff', width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}
            >
              <i className="fas fa-bell"></i>
              {notifications.filter(n => !n.read).length > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ff4444', color: '#ffffff', fontSize: '10px', fontWeight: 700, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div style={{ position: 'absolute', top: '48px', right: 0, width: '320px', backgroundColor: '#1a1a1a', border: '1px solid #222222', borderRadius: '10px', zIndex: 300, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #222222' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', margin: 0 }}>Notifications</h3>
                  <button style={{ background: 'none', border: 'none', color: '#888888', fontSize: '12px', cursor: 'pointer' }}>Mark all as read</button>
                </div>
                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {notifications.map(notif => (
                    <div key={notif.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 16px', borderBottom: '1px solid #222222', backgroundColor: notif.read ? 'transparent' : '#111111' }}>
                      <i className="fas fa-circle" style={{ fontSize: '8px', color: notif.read ? '#333333' : '#ffffff', marginTop: '5px', flexShrink: 0 }}></i>
                      <div>
                        <p style={{ fontSize: '13px', color: '#ffffff', margin: '0 0 4px 0' }}>{notif.message}</p>
                        <span style={{ fontSize: '11px', color: '#888888' }}>{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['day', 'week', 'month', 'year'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedPeriod === period ? '#ffffff' : 'transparent',
              border: `1px solid ${selectedPeriod === period ? '#ffffff' : '#222222'}`,
              borderRadius: '6px',
              color: selectedPeriod === period ? '#000000' : '#888888',
              fontSize: '13px',
              fontWeight: selectedPeriod === period ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {period === 'day' ? 'Today' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Year'}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {stats.map((stat, index) => (
          <StatsCard key={index} title={stat.title} value={stat.value} change={stat.change} icon={stat.icon} />
        ))}
      </div>

      {/* Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>

        {/* Recent Orders */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={cardTitleStyle}>Recent Orders</h2>
            <a href="/orders" style={{ fontSize: '13px', color: '#888888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              View All <i className="fas fa-arrow-right"></i>
            </a>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Order ID', 'Customer', 'Amount', 'Status', 'Time'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#555555', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 12px', borderBottom: '1px solid #222222' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#ffffff', fontWeight: 600, borderBottom: '1px solid #1a1a1a' }}>{order.id}</td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#cccccc', borderBottom: '1px solid #1a1a1a' }}>{order.customer}</td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#ffffff', fontWeight: 500, borderBottom: '1px solid #1a1a1a' }}>{order.amount}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #1a1a1a' }}>
                    <span style={getStatusStyle(order.status)}>{order.status}</span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#555555', borderBottom: '1px solid #1a1a1a' }}>{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Selling Items */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={cardTitleStyle}>Top Selling Items</h2>
            <i className="fas fa-chart-line" style={{ color: '#555555', fontSize: '16px' }}></i>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {topItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', backgroundColor: '#222222', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#888888', flexShrink: 0 }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff', marginBottom: '4px' }}>{item.name}</div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#555555' }}>
                    <span><i className="fas fa-shopping-cart"></i> {item.sales} sold</span>
                    <span>{item.revenue}</span>
                  </div>
                </div>
                <div style={{ width: '60px', height: '4px', backgroundColor: '#222222', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', backgroundColor: '#ffffff', borderRadius: '2px', width: `${(item.sales / topItems[0].sales) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h2 style={cardTitleStyle}>Quick Actions</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          {[
            { icon: 'fas fa-plus-circle', label: 'New Order', action: () => window.location.href = '/orders' },
            { icon: 'fas fa-user-plus', label: 'Add Customer', action: () => window.location.href = '/customers' },
            { icon: 'fas fa-download', label: 'Export Report', action: () => alert('Export feature coming soon') },
            { icon: 'fas fa-print', label: 'Print Invoice', action: () => alert('Print feature coming soon') },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', backgroundColor: '#1a1a1a', border: '1px solid #222222', borderRadius: '10px', color: '#ffffff', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
            >
              <i className={btn.icon} style={{ fontSize: '20px', color: '#888888' }}></i>
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;