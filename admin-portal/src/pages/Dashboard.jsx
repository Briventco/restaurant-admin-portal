import React, { useState, useEffect } from 'react';

const StatusBadge = ({ status }) => {
  const map = {
    completed:  { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.2)'  },
    pending:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)' },
    processing: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)' },
  };
  const s = map[status?.toLowerCase()] || { color: '#888', bg: '#1a1a1a', border: '#333' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '999px',
      fontSize: '11px', fontWeight: 600, letterSpacing: '0.3px',
      backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: s.color }} />
      {status}
    </span>
  );
};

const StatCard = ({ title, value, change, icon, accent = '#22c55e' }) => {
  const isPositive = change?.startsWith('+');
  return (
    <div style={{
      backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e',
      borderRadius: '12px', padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: '10px',
      transition: 'border-color 0.2s', cursor: 'default',
    }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e1e1e'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{ margin: 0, fontSize: '11px', fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {title}
        </p>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          backgroundColor: `${accent}18`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <i className={icon} style={{ color: accent, fontSize: '12px' }} />
        </div>
      </div>
      <p style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>
        {value}
      </p>
      {change && (
        <p style={{ margin: 0, fontSize: '11px', color: isPositive ? '#22c55e' : '#ef4444', fontWeight: 500 }}>
          <i className={`fas fa-arrow-${isPositive ? 'up' : 'down'}`} style={{ fontSize: '9px', marginRight: '4px' }} />
          {change} from last period
        </p>
      )}
    </div>
  );
};

const SectionCard = ({ title, action, children }) => (
  <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 20px', borderBottom: '1px solid #1a1a1a',
    }}>
      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff' }}>{title}</p>
      {action}
    </div>
    <div>{children}</div>
  </div>
);

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { title: 'Total Orders',    value: '1,234',        change: '+12%', icon: 'fas fa-receipt',      accent: '#22c55e' },
    { title: 'Revenue',         value: '₦2,456,789',   change: '+8%',  icon: 'fas fa-naira-sign',   accent: '#3b82f6' },
    { title: 'Customers',       value: '892',           change: '+5%',  icon: 'fas fa-users',        accent: '#a855f7' },
    { title: 'Pending Orders',  value: '23',            change: '-3%',  icon: 'fas fa-clock',        accent: '#f59e0b' },
  ];

  const recentOrders = [
    { id: '#ORD-001', customer: 'Oluwaseun Adebayo', amount: '₦45,000',  status: 'Completed',  time: '2 hours ago' },
    { id: '#ORD-002', customer: 'Ngozi Okonkwo',     amount: '₦120,000', status: 'Pending',    time: '3 hours ago' },
    { id: '#ORD-003', customer: 'Chidi Eze',          amount: '₦78,500',  status: 'Processing', time: '5 hours ago' },
    { id: '#ORD-004', customer: 'Fatima Bello',       amount: '₦210,000', status: 'Completed',  time: 'Yesterday'   },
    { id: '#ORD-005', customer: 'Emeka Okafor',       amount: '₦32,000',  status: 'Pending',    time: 'Yesterday'   },
  ];

  const topItems = [
    { name: 'Jollof Rice',     sales: 234, revenue: '₦3,510,000' },
    { name: 'Grilled Chicken', sales: 189, revenue: '₦2,835,000' },
    { name: 'Fried Rice',      sales: 156, revenue: '₦2,340,000' },
    { name: 'Suya',            sales: 142, revenue: '₦1,420,000' },
    { name: 'Pounded Yam',     sales: 98,  revenue: '₦980,000'   },
  ];

  const notifications = [
    { id: 1, message: 'New order #ORD-006 from Amina Mohammed', time: '5 mins ago', read: false },
    { id: 2, message: 'Payment received for #ORD-003',           time: '1 hour ago', read: false },
    { id: 3, message: 'Order #ORD-002 is pending',               time: '3 hours ago', read: true  },
    { id: 4, message: 'New customer registered: Ifeanyi Nwosu',  time: 'Yesterday',   read: true  },
  ];

  const unread = notifications.filter((n) => !n.read).length;
  const formatTime = (d) => d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d) => d.toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' });

  const periods = [
    { id: 'day',   label: 'Today'      },
    { id: 'week',  label: 'This Week'  },
    { id: 'month', label: 'This Month' },
    { id: 'year',  label: 'This Year'  },
  ];

  const quickActions = [
    { icon: 'fas fa-plus-circle',    label: 'New Order',      action: () => window.location.href = '/orders'    },
    { icon: 'fas fa-user-plus',      label: 'Add Customer',   action: () => window.location.href = '/customers' },
    { icon: 'fas fa-download',       label: 'Export Report',  action: () => {}                                  },
    { icon: 'fas fa-print',          label: 'Print Invoice',  action: () => window.print()                      },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#fff', letterSpacing: '-0.4px' }}>
            Dashboard
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#555' }}>
            Welcome back, Admin
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Clock */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '12px', color: '#666',
            backgroundColor: '#0f0f0f', padding: '8px 14px',
            borderRadius: '8px', border: '1px solid #1e1e1e',
          }}>
            <i className="fas fa-calendar-alt" />
            <span>{formatDate(currentTime)}</span>
            <span style={{ color: '#333' }}>·</span>
            <i className="fas fa-clock" />
            <span>{formatTime(currentTime)}</span>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                position: 'relative', backgroundColor: '#0f0f0f',
                border: '1px solid #1e1e1e', color: '#aaa',
                width: '38px', height: '38px', borderRadius: '8px',
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '14px',
              }}
            >
              <i className="fas fa-bell" />
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  backgroundColor: '#ef4444', color: '#fff',
                  fontSize: '9px', fontWeight: 700,
                  width: '15px', height: '15px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {unread}
                </span>
              )}
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute', top: '46px', right: 0,
                width: '300px', backgroundColor: '#0f0f0f',
                border: '1px solid #1e1e1e', borderRadius: '10px',
                zIndex: 300, overflow: 'hidden',
                boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '13px 16px', borderBottom: '1px solid #1a1a1a',
                }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff' }}>Notifications</p>
                  <button style={{ background: 'none', border: 'none', color: '#555', fontSize: '11px', cursor: 'pointer' }}>
                    Mark all read
                  </button>
                </div>
                {notifications.map((n) => (
                  <div key={n.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    padding: '11px 16px', borderBottom: '1px solid #111',
                    backgroundColor: n.read ? 'transparent' : '#111',
                  }}>
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%', marginTop: '6px', flexShrink: 0,
                      backgroundColor: n.read ? '#333' : '#22c55e',
                    }} />
                    <div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#ccc' }}>{n.message}</p>
                      <p style={{ margin: '3px 0 0', fontSize: '10px', color: '#555' }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPeriod(p.id)}
            style={{
              padding: '7px 14px',
              backgroundColor: selectedPeriod === p.id ? '#fff' : 'transparent',
              border: `1px solid ${selectedPeriod === p.id ? '#fff' : '#1e1e1e'}`,
              borderRadius: '7px',
              color: selectedPeriod === p.id ? '#000' : '#666',
              fontSize: '12px', fontWeight: selectedPeriod === p.id ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '14px',
      }}>
        {stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>

        <SectionCard
          title="Recent Orders"
          action={
            <a href="/orders" style={{ fontSize: '12px', color: '#22c55e', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
              View all <i className="fas fa-arrow-right" style={{ fontSize: '10px' }} />
            </a>
          }
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Order ID', 'Customer', 'Amount', 'Status', 'Time'].map((h) => (
                    <th key={h} style={{
                      textAlign: 'left', fontSize: '10px', fontWeight: 600,
                      color: '#444', textTransform: 'uppercase', letterSpacing: '0.6px',
                      padding: '10px 16px', borderBottom: '1px solid #1a1a1a',
                      whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} style={{ transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#fff', borderBottom: '1px solid #111' }}>
                      {order.id}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#aaa', borderBottom: '1px solid #111' }}>
                      {order.customer}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 500, color: '#fff', borderBottom: '1px solid #111' }}>
                      {order.amount}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #111' }}>
                      <StatusBadge status={order.status} />
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '11px', color: '#555', borderBottom: '1px solid #111' }}>
                      {order.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Top Selling Items */}
        <SectionCard
          title="Top Selling Items"
          action={<i className="fas fa-chart-line" style={{ color: '#444', fontSize: '13px' }} />}
        >
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {topItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, color: '#555', flexShrink: 0,
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#fff' }}>{item.name}</p>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '10px', color: '#555' }}>
                    <span><i className="fas fa-shopping-bag" style={{ marginRight: '3px' }} />{item.sales} sold</span>
                    <span>{item.revenue}</span>
                  </div>
                </div>
                {/* Mini progress */}
                <div style={{ width: '48px', height: '3px', backgroundColor: '#1a1a1a', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '99px',
                    backgroundColor: '#22c55e',
                    width: `${(item.sales / topItems[0].sales) * 100}%`,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Quick Actions ── */}
      <SectionCard title="Quick Actions">
        <div style={{
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '10px',
        }}>
          {quickActions.map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                padding: '16px 12px',
                backgroundColor: '#111', border: '1px solid #1e1e1e',
                borderRadius: '10px', color: '#aaa',
                fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2a2a2a';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.backgroundColor = '#1a1a1a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1e1e1e';
                e.currentTarget.style.color = '#aaa';
                e.currentTarget.style.backgroundColor = '#111';
              }}
            >
              <i className={btn.icon} style={{ fontSize: '18px', color: '#22c55e' }} />
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </SectionCard>

    </div>
  );
};

export default Dashboard;