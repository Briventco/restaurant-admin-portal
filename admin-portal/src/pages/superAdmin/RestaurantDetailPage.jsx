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
import restaurantsApi from '../../api/restaurants';
import { getWhatsappBindingMeta, getWhatsappStatusLabel } from '../../utils/whatsappPresentation';

/* ── helpers ─────────────────────────────────────────────────── */
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtNaira = (n) => `₦${Number(n || 0).toLocaleString()}`;
const defaultWhatsappForm = { provider: 'meta-whatsapp-cloud-api', configured: false, provisioningState: 'unassigned', phone: '', phoneNumberId: '', wabaId: '', notes: '' };
const emptyValidation = {
  summary: { blockerCount: 0, warningCount: 0, completedCount: 0, totalCount: 0, isFullyValid: false },
  checklist: { completedCount: 0, totalCount: 0, ready: false, items: [] },
  sections: {},
};
const ACTIVATION_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'configured', label: 'Configured' },
  { value: 'ready_for_activation', label: 'Ready For Activation' },
  { value: 'active', label: 'Active' },
];

/* ── Badge ───────────────────────────────────────────────────── */
const Badge = ({ type, label }) => {
  const map = {
    active:       { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)'  },
    inactive:     { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)'  },
    degraded:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    critical:     { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
    healthy:      { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
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
  const [healthEvents, setHealthEvents] = useState([]);
  const [waStatus, setWaStatus]       = useState(null);
  const [waForm, setWaForm]           = useState(defaultWhatsappForm);
  const [waSaving, setWaSaving]       = useState(false);
  const [activationState, setActivationState] = useState('draft');
  const [activationNote, setActivationNote]   = useState('');
  const [activationSaving, setActivationSaving] = useState(false);
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
        const detail = await restaurantsApi.getById(restaurantId);
        setRestaurant(detail.restaurant);
        setActivationState(detail.restaurant.activationState || 'draft');
        setActivationNote(detail.restaurant.activationNote || '');
        setMenuItems(detail.menuItems);
        setOrders(detail.orders);
        setPayments(detail.payments);
        setZones(detail.deliveryZones);
        setHealthEvents(detail.healthEvents || []);
        setWaStatus(detail.whatsapp);
        setWaForm({
          provider: detail.whatsapp?.provider || 'meta-whatsapp-cloud-api',
          configured: Boolean(detail.whatsapp?.configured),
          provisioningState: detail.whatsapp?.provisioningState || 'unassigned',
          phone: detail.whatsapp?.phone || '',
          phoneNumberId: detail.whatsapp?.phoneNumberId || '',
          wabaId: detail.whatsapp?.wabaId || '',
          notes: detail.whatsapp?.notes || '',
        });
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

  const handleSaveLifecycle = async () => {
    try {
      setActivationSaving(true);
      const updated = await restaurantsApi.updateLifecycle(restaurantId, {
        activationState,
        note: activationNote,
      });

      setRestaurant((previous) => ({
        ...previous,
        ...(updated || {}),
      }));
      if (updated?.activationState) {
        setActivationState(updated.activationState);
      }
      if (typeof updated?.activationNote === 'string') {
        setActivationNote(updated.activationNote);
      }
      addToast('Restaurant lifecycle updated', 'success');
    } catch (error) {
      const fallbackValidation = error?.payload?.validation || emptyValidation;
      const fallbackRestaurant = error?.payload?.restaurant || null;

      if (fallbackRestaurant) {
        setRestaurant((previous) => ({
          ...previous,
          activationState: fallbackRestaurant.activationState || previous?.activationState || 'draft',
          activationChecklist: fallbackRestaurant.activationChecklist || fallbackValidation.checklist || previous?.activationChecklist || emptyValidation.checklist,
          activationValidation: fallbackRestaurant.activationValidation || fallbackValidation || previous?.activationValidation || emptyValidation,
        }));
        if (fallbackRestaurant.activationState) {
          setActivationState(fallbackRestaurant.activationState);
        }
      } else if (error?.payload?.validation) {
        setRestaurant((previous) => ({
          ...previous,
          activationValidation: fallbackValidation,
          activationChecklist: fallbackValidation.checklist || previous?.activationChecklist || emptyValidation.checklist,
        }));
      }

      addToast(error.message || 'Failed to update lifecycle', 'error');
    } finally {
      setActivationSaving(false);
    }
  };

  const updateWhatsappField = (field, value) => {
    setWaForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSaveWhatsappConfig = async () => {
    try {
      setWaSaving(true);
      const updated = await restaurantsApi.updateWhatsappConfig(restaurantId, waForm);
      setWaStatus(updated);
      setWaForm({
        provider: updated?.provider || waForm.provider,
        configured: Boolean(updated?.configured),
        provisioningState: updated?.provisioningState || waForm.provisioningState,
        phone: updated?.phone || '',
        phoneNumberId: updated?.phoneNumberId || '',
        wabaId: updated?.wabaId || '',
        notes: updated?.notes || '',
      });
      addToast('WhatsApp provisioning updated', 'success');
    } catch (error) {
      addToast(error.message || 'Failed to update WhatsApp config', 'error');
    } finally {
      setWaSaving(false);
    }
  };

  const handleClearWhatsappConfig = async () => {
    try {
      setWaSaving(true);
      const updated = await restaurantsApi.updateWhatsappConfig(restaurantId, {
        provider: '',
        configured: false,
        provisioningState: 'unassigned',
        phone: '',
        phoneNumberId: '',
        wabaId: '',
        notes: '',
      });
      setWaStatus(updated);
      setWaForm(defaultWhatsappForm);
      addToast('WhatsApp config cleared', 'success');
    } catch (error) {
      addToast(error.message || 'Failed to clear WhatsApp config', 'error');
    } finally {
      setWaSaving(false);
    }
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
  const activationValidation = restaurant.activationValidation || emptyValidation;
  const activationChecklist = restaurant.activationChecklist || activationValidation.checklist || emptyValidation.checklist;
  const lifecycleItems = activationChecklist.items || [];

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
            <Badge type={restaurant.activationState === 'active' ? 'active' : restaurant.activationState === 'ready_for_activation' ? 'pending' : 'default'} label={`Lifecycle ${restaurant.activationState || 'draft'}`} />
            <Badge type={waStatus?.status || 'disconnected'} label={`WA ${waStatus?.status || 'Disconnected'}`} />
            <span style={{ fontSize: '11px', color: '#555' }}>Joined {restaurant.joined}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => navigate(`/restaurants/${restaurantId}/activation`)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#bbb', fontSize: '12px', cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faCheckCircle} /> Activation Center
          </button>
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

          <SectionCard title="Activation Lifecycle" icon={faCheckCircle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', padding: '12px 14px', borderRadius: '10px', border: '1px solid #1e1e1e', backgroundColor: '#111' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#fff' }}>Readiness checklist</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>
                    {activationChecklist.completedCount || 0} of {activationChecklist.totalCount || 0} checks fully valid
                  </p>
                </div>
                <Badge
                  type={activationValidation.summary?.isFullyValid ? 'active' : 'pending'}
                  label={activationValidation.summary?.isFullyValid ? 'Ready for go-live' : 'Needs setup'}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', padding: '12px 14px', borderRadius: '10px', border: '1px solid #1e1e1e', backgroundColor: '#111' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#fff' }}>Runtime health</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>
                    Last checked {restaurant.healthLastCheckedAt ? fmtDate(restaurant.healthLastCheckedAt) : 'not yet'}
                  </p>
                </div>
                <Badge type={restaurant.healthStatus || 'default'} label={restaurant.healthStatus || 'unknown'} />
              </div>

              {Array.isArray(restaurant.healthIssues) && restaurant.healthIssues.length > 0 && (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {restaurant.healthIssues.map((issue, index) => (
                    <div key={`${issue.key || issue.label}-${index}`} style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #1e1e1e', backgroundColor: '#111' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff' }}>{issue.label || issue.key}</p>
                        <Badge type={issue.severity === 'warning' ? 'pending' : issue.severity || 'default'} label={issue.severity || 'info'} />
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#666', lineHeight: 1.6 }}>{issue.message || 'Runtime issue detected.'}</p>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
                {[
                  ['Valid checks', activationValidation.summary?.completedCount || 0, '#22c55e'],
                  ['Blockers', activationValidation.summary?.blockerCount || 0, '#ef4444'],
                  ['Warnings', activationValidation.summary?.warningCount || 0, '#f59e0b'],
                ].map(([label, value, color]) => (
                  <div key={label} style={{ border: '1px solid #1e1e1e', backgroundColor: '#111', borderRadius: '10px', padding: '12px' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
                    <p style={{ margin: '8px 0 0', fontSize: '20px', fontWeight: 700, color }}>{value}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gap: '10px' }}>
                {lifecycleItems.map((item) => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', borderRadius: '10px', border: '1px solid #1e1e1e', backgroundColor: '#111' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff' }}>{item.label}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666', lineHeight: 1.6 }}>{item.detail}</p>
                      {Array.isArray(item.issues) && item.issues.length > 0 && (
                        <div style={{ display: 'grid', gap: '4px', marginTop: '8px' }}>
                          {item.issues.map((issue) => (
                            <span key={`${item.key}-${issue}`} style={{ fontSize: '11px', color: item.severity === 'warning' ? '#fbbf24' : '#f87171' }}>
                              • {issue}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge
                      type={item.status === 'valid' ? 'active' : item.status === 'warning' ? 'pending' : 'inactive'}
                      label={item.status === 'valid' ? 'Valid' : item.status === 'warning' ? 'Warning' : 'Blocked'}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Lifecycle State</span>
                  <select value={activationState} onChange={(event) => setActivationState(event.target.value)} style={{ width: '100%', backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '13px', outline: 'none' }}>
                    {ACTIVATION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Current stage</span>
                  <div style={{ minHeight: '42px', display: 'flex', alignItems: 'center' }}>
                    <Badge type={restaurant.activationState === 'active' ? 'active' : restaurant.activationState === 'ready_for_activation' ? 'pending' : 'default'} label={restaurant.activationState || 'draft'} />
                  </div>
                </div>
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Operational note</span>
                <textarea value={activationNote} onChange={(event) => setActivationNote(event.target.value)} placeholder="Why is this tenant in this stage? What is left before activation?" style={{ minHeight: '96px', resize: 'vertical', width: '100%', backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </label>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <p style={{ margin: 0, maxWidth: '420px', fontSize: '12px', color: '#666', lineHeight: 1.7 }}>
                  Use this to move restaurants from setup into go-live readiness. This keeps multi-seller onboarding visible and prevents half-configured tenants from being treated as fully active.
                </p>
                <button onClick={handleSaveLifecycle} disabled={activationSaving} style={{ padding: '10px 14px', backgroundColor: '#22c55e', border: 'none', borderRadius: '8px', color: '#000', fontSize: '12px', fontWeight: 700, cursor: activationSaving ? 'not-allowed' : 'pointer' }}>
                  {activationSaving ? 'Saving...' : 'Save Lifecycle'}
                </button>
              </div>

              {healthEvents.length > 0 && (
                <div style={{ display: 'grid', gap: '8px' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#fff' }}>Recent health events</p>
                  {healthEvents.slice(0, 5).map((event) => (
                    <div key={event.id} style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #1e1e1e', backgroundColor: '#111' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <Badge type={event.newStatus || 'default'} label={event.newStatus || 'unknown'} />
                          <span style={{ fontSize: '12px', color: '#777' }}>{event.source || 'health_check'}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#666' }}>{fmtDate(event.createdAt)}</span>
                      </div>
                      {event.lifecycleSync?.reason && (
                        <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#f59e0b', lineHeight: 1.6 }}>{event.lifecycleSync.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
              { label: 'Status',     value: <Badge type={waStatus.status} label={getWhatsappStatusLabel(waStatus.status)} /> },
              { label: 'Phone',      value: waStatus.phone,              accent: '#fff'     },
              { label: 'Binding',    value: getWhatsappBindingMeta(waStatus.bindingMode).label, accent: '#3b82f6' },
              { label: 'Routing',    value: waStatus.routingMode || 'unknown', accent: '#22c55e'  },
              { label: 'Provider',   value: waStatus.provider || 'Not set', accent: '#ef4444'  },
            ].map(({ label, value, accent }) => (
              <div key={label} style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '9px', padding: '14px' }}>
                <p style={{ margin: '0 0 6px', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: accent || '#fff' }}>{value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)', gap: '16px' }}>
            <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>Provision restaurant line</p>
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#666', lineHeight: 1.6 }}>
                    Save or update the dedicated WhatsApp identifiers for this tenant. This is the super-admin control point for multi-restaurant line setup.
                  </p>
                </div>
                <Badge type={waStatus.status} label={getWhatsappStatusLabel(waStatus.status)} />
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '14px', borderRadius: '10px', border: '1px solid #1e1e1e', backgroundColor: '#0d0d0d', marginBottom: '14px' }}>
                <input
                  type="checkbox"
                  checked={waForm.configured}
                  onChange={(event) => updateWhatsappField('configured', event.target.checked)}
                  style={{ marginTop: '2px', accentColor: '#22c55e' }}
                />
                <div>
                  <strong style={{ display: 'block', color: '#fff', fontSize: '13px' }}>Restaurant has a dedicated WhatsApp setup</strong>
                  <span style={{ display: 'block', marginTop: '4px', color: '#777', fontSize: '12px', lineHeight: 1.5 }}>
                    Turn this on when the line should resolve directly to this restaurant instead of behaving like an unconfigured tenant.
                  </span>
                </div>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Provider</span>
                  <select value={waForm.provider} onChange={(event) => updateWhatsappField('provider', event.target.value)} style={{ width: '100%', backgroundColor: '#0b0b0b', border: '1px solid #1e1e1e', borderRadius: '9px', color: '#fff', padding: '11px 12px', fontSize: '13px', outline: 'none' }}>
                    <option value="meta-whatsapp-cloud-api">Meta WhatsApp Cloud API</option>
                    <option value="whatsapp-web">WhatsApp Web Runtime</option>
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Display phone</span>
                  <input value={waForm.phone} onChange={(event) => updateWhatsappField('phone', event.target.value)} placeholder="+234..." style={{ width: '100%', backgroundColor: '#0b0b0b', border: '1px solid #1e1e1e', borderRadius: '9px', color: '#fff', padding: '11px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Provisioning state</span>
                  <select value={waForm.provisioningState} onChange={(event) => updateWhatsappField('provisioningState', event.target.value)} style={{ width: '100%', backgroundColor: '#0b0b0b', border: '1px solid #1e1e1e', borderRadius: '9px', color: '#fff', padding: '11px 12px', fontSize: '13px', outline: 'none' }}>
                    <option value="unassigned">Unassigned</option>
                    <option value="reserved">Number Reserved</option>
                    <option value="connecting">Connecting</option>
                    <option value="verified">Verified</option>
                    <option value="active">Active</option>
                    <option value="failed">Failed</option>
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Phone Number ID</span>
                  <input value={waForm.phoneNumberId} onChange={(event) => updateWhatsappField('phoneNumberId', event.target.value)} placeholder="Meta phone number id" style={{ width: '100%', backgroundColor: '#0b0b0b', border: '1px solid #1e1e1e', borderRadius: '9px', color: '#fff', padding: '11px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>WABA ID</span>
                  <input value={waForm.wabaId} onChange={(event) => updateWhatsappField('wabaId', event.target.value)} placeholder="Meta WABA id" style={{ width: '100%', backgroundColor: '#0b0b0b', border: '1px solid #1e1e1e', borderRadius: '9px', color: '#fff', padding: '11px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </label>
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Provisioning notes</span>
                <textarea value={waForm.notes} onChange={(event) => updateWhatsappField('notes', event.target.value)} placeholder="Optional admin notes about setup, ownership, or activation state" style={{ minHeight: '110px', resize: 'vertical', width: '100%', backgroundColor: '#0b0b0b', border: '1px solid #1e1e1e', borderRadius: '9px', color: '#fff', padding: '11px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </label>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '14px', flexWrap: 'wrap' }}>
                <button onClick={handleClearWhatsappConfig} disabled={waSaving} style={{ padding: '10px 14px', backgroundColor: 'transparent', border: '1px solid #262626', borderRadius: '8px', color: '#aaa', fontSize: '12px', cursor: waSaving ? 'not-allowed' : 'pointer' }}>
                  Clear
                </button>
                <button onClick={handleSaveWhatsappConfig} disabled={waSaving} style={{ padding: '10px 14px', backgroundColor: '#22c55e', border: 'none', borderRadius: '8px', color: '#000', fontSize: '12px', fontWeight: 700, cursor: waSaving ? 'not-allowed' : 'pointer' }}>
                  {waSaving ? 'Saving...' : 'Save Provisioning'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '18px' }}>
                <p style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 700, color: '#fff' }}>Routing visibility</p>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {[
                    ['Binding', getWhatsappBindingMeta(waStatus.bindingMode).label],
                    ['Provisioning state', waStatus.provisioningState || 'unassigned'],
                    ['Routing mode', waStatus.routingMode || 'unknown'],
                    ['Phone Number ID', waStatus.phoneNumberId || 'Not set'],
                    ['WABA ID', waStatus.wabaId || 'Not set'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid #1b1b1b', fontSize: '12px' }}>
                      <span style={{ color: '#666' }}>{label}</span>
                      <span style={{ color: '#fff', fontWeight: 500, textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
                    </div>
                  ))}
                </div>
                {Array.isArray(waStatus.provisioningTransitions) && waStatus.provisioningTransitions.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
                    {waStatus.provisioningTransitions.map((transition) => (
                      <button
                        key={transition.targetState}
                        onClick={() => {
                          updateWhatsappField('configured', true);
                          updateWhatsappField('provisioningState', transition.targetState);
                        }}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#141414',
                          border: '1px solid #232323',
                          borderRadius: '999px',
                          color: '#eee',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Move to {transition.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '18px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#fff' }}>How this resolves</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#7c7c7c', lineHeight: 1.7 }}>
                  {waStatus.routingHint || 'No routing hint is available yet for this restaurant.'}
                </p>
              </div>

              <div style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.16)', borderRadius: '12px', padding: '18px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 700, color: '#fbbf24' }}>Provisioning note</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#b08c2d', lineHeight: 1.7 }}>
                  Saving config here assigns the tenant identity and routing metadata. It does not automatically create a Meta number yet, but it prepares the restaurant for dedicated line activation.
                </p>
              </div>
            </div>
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
