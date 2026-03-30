import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStore, faCheckCircle, faEdit, faDownload, faArrowLeft,
  faSpinner, faExclamationTriangle, faUtensils, faShoppingCart,
  faCreditCard, faUsers, faChartBar, faTruck, faMapMarkerAlt,
  faPhone, faEnvelope, faStar, faBolt, faPlus, faTrash, faTimes,
  faToggleOn, faToggleOff,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { runtimeApi } from '../../api/runtime';

/* ── helpers ─────────────────────────────────────────────────── */
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtNaira = (n) => `₦${Number(n || 0).toLocaleString()}`;

/* ── Badge ───────────────────────────────────────────────────── */
const Badge = ({ type, label }) => {
  const map = {
    active:       { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)'  },
    inactive:     { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)'  },
    connected:    { color: '#25d366', bg: 'rgba(37,211,102,0.1)', border: 'rgba(37,211,102,0.2)' },
    disconnected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)'  },
    completed:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)'  },
    pending:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    processing:   { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
    confirmed:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)'  },
    available:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)'  },
    unavailable:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)'  },
  };
  const s = map[type?.toLowerCase()] || { color: '#888', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: s.color }} />
      {label || type}
    </span>
  );
};

/* ── Stat card ───────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, accent, icon }) => (
  <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'border-color 0.2s' }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e1e1e'}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</p>
      <FontAwesomeIcon icon={icon} style={{ color: '#333', fontSize: '13px' }} />
    </div>
    <p style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: accent, letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</p>
    {sub && <p style={{ margin: 0, fontSize: '11px', color: '#555' }}>{sub}</p>}
  </div>
);

/* ── Section card ────────────────────────────────────────────── */
const SectionCard = ({ title, icon, action, children }) => (
  <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #1a1a1a' }}>
      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon && <FontAwesomeIcon icon={icon} style={{ color: '#555' }} />}
        {title}
      </p>
      {action}
    </div>
    <div style={{ padding: '16px 18px' }}>{children}</div>
  </div>
);

/* ── Tab button ──────────────────────────────────────────────── */
const TabBtn = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: active ? '#1a1a1a' : 'transparent', border: `1px solid ${active ? '#2a2a2a' : 'transparent'}`, borderRadius: '8px', color: active ? '#fff' : '#555', fontSize: '13px', fontWeight: active ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
    <FontAwesomeIcon icon={icon} />
    {label}
  </button>
);

/* ════════════════════════════════════════════════════════════════ */
const RestaurantDetailPage = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant]   = useState(null);
  const [menuItems, setMenuItems]     = useState([]);
  const [orders, setOrders]           = useState([]);
  const [payments, setPayments]       = useState([]);
  const [zones, setZones]             = useState([]);
  const [waStatus, setWaStatus]       = useState(null);
  const [activeTab, setActiveTab]     = useState('overview');
  const [loading, setLoading]         = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem]         = useState({ name: '', price: '', category: '' });
  const [toasts, setToasts]           = useState([]);

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [r, m, o, p, z, w] = await Promise.all([
          runtimeApi.getRestaurantDetail(restaurantId),
          runtimeApi.getMenuItems(restaurantId),
          runtimeApi.getOrders(restaurantId),
          runtimeApi.getPayments(restaurantId),
          runtimeApi.getDeliveryZones(restaurantId),
          runtimeApi.getWhatsAppStatus(restaurantId),
        ]);
        setRestaurant(r);
        setMenuItems(m);
        setOrders(o);
        setPayments(p);
        setZones(z);
        setWaStatus(w);
      } catch (e) {
        addToast('Failed to load restaurant data', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [restaurantId]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ restaurant, orders, payments }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `restaurant-${restaurantId}.json`;
    a.click();
    addToast('Exported!', 'success');
  };

  const handleAddMenuItem = () => {
    setMenuItems((p) => [...p, { id: `mi_${Date.now()}`, ...newItem, price: Number(newItem.price), available: true }]);
    setNewItem({ name: '', price: '', category: '' });
    setShowAddItem(false);
    addToast('Menu item added', 'success');
  };

  const handleToggleItem = (id) => {
    setMenuItems((p) => p.map((m) => m.id === id ? { ...m, available: !m.available } : m));
  };

  const handleDeleteItem = (id) => {
    setMenuItems((p) => p.filter((m) => m.id !== id));
    addToast('Item removed', 'success');
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '12px', color: '#555', fontSize: '13px' }}>
      <FontAwesomeIcon icon={faSpinner} spin /> Loading restaurant…
    </div>
  );

  if (!restaurant) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#555' }}>
      <FontAwesomeIcon icon={faExclamationTriangle} style={{ fontSize: '28px', marginBottom: '12px', display: 'block' }} />
      <p>Restaurant not found</p>
      <button onClick={() => navigate('/restaurants')} style={{ marginTop: '12px', padding: '8px 16px', backgroundColor: '#22c55e', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
        ← Back
      </button>
    </div>
  );

  const totalRevenue = payments.filter((p) => p.status === 'confirmed').reduce((s, p) => s + p.amount, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 14px', borderRadius: '9px', backgroundColor: '#111', border: '1px solid #222', fontSize: '12px', color: t.type === 'success' ? '#22c55e' : t.type === 'error' ? '#ef4444' : '#aaa', minWidth: '200px' }}>
            {t.msg}
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <button onClick={() => navigate('/restaurants')} style={{ background: 'none', border: 'none', color: '#555', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <FontAwesomeIcon icon={faArrowLeft} /> All Restaurants
          </button>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>{restaurant.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
            <Badge type={restaurant.status} label={restaurant.status} />
            <Badge type={waStatus?.status || 'disconnected'} label={`WA ${waStatus?.status || 'Disconnected'}`} />
            <span style={{ fontSize: '11px', color: '#555' }}>Joined {restaurant.joined}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#666', fontSize: '12px', cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faDownload} /> Export
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#22c55e', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faEdit} /> Edit
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
        <StatCard label="TOTAL REVENUE"   value={fmtNaira(totalRevenue)}     sub="collected"        accent="#22c55e" icon={faCreditCard}  />
        <StatCard label="TOTAL ORDERS"    value={orders.length}              sub={`${pendingOrders} pending`} accent="#3b82f6" icon={faShoppingCart} />
        <StatCard label="MENU ITEMS"      value={menuItems.length}           sub="on menu"          accent="#a855f7" icon={faUtensils}    />
        <StatCard label="DELIVERY ZONES"  value={zones.length}               sub="coverage areas"   accent="#f59e0b" icon={faMapMarkerAlt} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', overflowX: 'auto' }}>
        <TabBtn active={activeTab === 'overview'}  icon={faStore}       label="Overview"  onClick={() => setActiveTab('overview')}  />
        <TabBtn active={activeTab === 'menu'}      icon={faUtensils}    label="Menu"      onClick={() => setActiveTab('menu')}      />
        <TabBtn active={activeTab === 'orders'}    icon={faTruck}       label="Orders"    onClick={() => setActiveTab('orders')}    />
        <TabBtn active={activeTab === 'payments'}  icon={faCreditCard}  label="Payments"  onClick={() => setActiveTab('payments')}  />
        <TabBtn active={activeTab === 'zones'}     icon={faMapMarkerAlt} label="Delivery" onClick={() => setActiveTab('zones')}    />
        <TabBtn active={activeTab === 'whatsapp'}  icon={faWhatsapp}    label="WhatsApp"  onClick={() => setActiveTab('whatsapp')}  />
      </div>

      {/* ── Overview ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <SectionCard title="Restaurant Info" icon={faStore}>
            {[
              { label: 'Owner',   value: restaurant.owner   },
              { label: 'Email',   value: restaurant.email   },
              { label: 'Phone',   value: restaurant.phone   },
              { label: 'Address', value: restaurant.address },
              { label: 'Plan',    value: restaurant.plan    },
              { label: 'City',    value: restaurant.city    },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #111', fontSize: '12px' }}>
                <span style={{ color: '#555' }}>{label}</span>
                <span style={{ color: '#fff', fontWeight: 500, textAlign: 'right', maxWidth: '200px' }}>{value || '—'}</span>
              </div>
            ))}
          </SectionCard>

          <SectionCard title="Quick Actions" icon={faBolt}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Add Menu Item',  icon: faPlus,      action: () => { setShowAddItem(true); setActiveTab('menu'); } },
                { label: 'View Orders',    icon: faShoppingCart, action: () => setActiveTab('orders') },
                { label: 'Payments',       icon: faCreditCard,   action: () => setActiveTab('payments') },
                { label: 'WhatsApp',       icon: faWhatsapp,     action: () => setActiveTab('whatsapp') },
              ].map((b) => (
                <button key={b.label} onClick={b.action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '14px', backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '9px', color: '#aaa', fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.color = '#aaa'; }}
                >
                  <FontAwesomeIcon icon={b.icon} style={{ fontSize: '16px', color: '#22c55e' }} />
                  {b.label}
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Menu ── */}
      {activeTab === 'menu' && (
        <SectionCard title="Menu Items" icon={faUtensils} action={
          <button onClick={() => setShowAddItem(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: '#22c55e', border: 'none', borderRadius: '7px', color: '#000', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faPlus} /> Add Item
          </button>
        }>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Item', 'Category', 'Price', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '10px', fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '10px 12px', borderBottom: '1px solid #1a1a1a' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.id}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '12px', fontSize: '13px', color: '#fff', fontWeight: 500, borderBottom: '1px solid #111' }}>{item.name}</td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#666', borderBottom: '1px solid #111' }}>{item.category}</td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#22c55e', fontWeight: 600, borderBottom: '1px solid #111' }}>₦{Number(item.price).toLocaleString()}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #111' }}><Badge type={item.available ? 'available' : 'unavailable'} label={item.available ? 'Available' : 'Unavailable'} /></td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #111' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleToggleItem(item.id)} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '6px', color: '#555', cursor: 'pointer' }}>
                          <FontAwesomeIcon icon={item.available ? faToggleOn : faToggleOff} />
                        </button>
                        <button onClick={() => handleDeleteItem(item.id)} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}>
                          <FontAwesomeIcon icon={faTrash} style={{ fontSize: '10px' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* ── Orders ── */}
      {activeTab === 'orders' && (
        <SectionCard title="Orders" icon={faTruck}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Order ID', 'Customer', 'Amount', 'Items', 'Status', 'Date'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '10px', fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '10px 12px', borderBottom: '1px solid #1a1a1a' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '12px', fontSize: '12px', fontWeight: 600, color: '#fff', borderBottom: '1px solid #111' }}>{o.id}</td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#aaa', borderBottom: '1px solid #111' }}>{o.customer}</td>
                    <td style={{ padding: '12px', fontSize: '12px', fontWeight: 600, color: '#22c55e', borderBottom: '1px solid #111' }}>{fmtNaira(o.amount)}</td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#666', borderBottom: '1px solid #111' }}>{o.items}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #111' }}><Badge type={o.status} label={o.status} /></td>
                    <td style={{ padding: '12px', fontSize: '11px', color: '#555', borderBottom: '1px solid #111' }}>{o.time} · {o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* ── Payments ── */}
      {activeTab === 'payments' && (
        <SectionCard title="Payment History" icon={faCreditCard} action={
          <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600 }}>Total: {fmtNaira(totalRevenue)}</span>
        }>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {payments.map((p, idx) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx < payments.length - 1 ? '1px solid #111' : 'none', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#fff' }}>{p.orderId}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#555' }}>{p.customer} · {p.method} · {p.date}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Badge type={p.status} label={p.status} />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: p.status === 'confirmed' ? '#22c55e' : '#f59e0b' }}>{fmtNaira(p.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── Delivery Zones ── */}
      {activeTab === 'zones' && (
        <SectionCard title="Delivery Zones" icon={faMapMarkerAlt}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {zones.map((z) => (
              <div key={z.id} style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '9px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff' }}>{z.name}</p>
                  <Badge type={z.active ? 'active' : 'inactive'} label={z.active ? 'Active' : 'Off'} />
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#555' }}>Fee: <span style={{ color: '#22c55e', fontWeight: 600 }}>₦{z.fee}</span></p>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#555' }}>Min order: ₦{z.minOrder?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── WhatsApp ── */}
      {activeTab === 'whatsapp' && waStatus && (
        <SectionCard title="WhatsApp Status" icon={faWhatsapp}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Status',     value: <Badge type={waStatus.status} label={waStatus.status} /> },
              { label: 'Phone',      value: waStatus.phone,              accent: '#fff'     },
              { label: 'Sent',       value: waStatus.messagesSent,       accent: '#3b82f6'  },
              { label: 'Delivered',  value: waStatus.messagesDelivered,  accent: '#22c55e'  },
              { label: 'Failed',     value: waStatus.messagesFailed,     accent: '#ef4444'  },
            ].map(({ label, value, accent }) => (
              <div key={label} style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '9px', padding: '14px' }}>
                <p style={{ margin: '0 0 6px', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: accent || '#fff' }}>{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Add menu item modal */}
      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '24px', width: '360px', maxWidth: '90vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }}>Add Menu Item</p>
              <button onClick={() => setShowAddItem(false)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            {['name', 'price', 'category'].map((field) => (
              <input key={field} type={field === 'price' ? 'number' : 'text'} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} value={newItem[field]} onChange={(e) => setNewItem((p) => ({ ...p, [field]: e.target.value }))}
                style={{ width: '100%', backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '13px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' }} />
            ))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button onClick={() => setShowAddItem(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#aaa', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAddMenuItem} style={{ flex: 1, padding: '10px', backgroundColor: '#22c55e', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Add Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetailPage;