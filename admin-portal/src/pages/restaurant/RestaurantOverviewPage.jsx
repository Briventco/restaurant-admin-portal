import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { runtimeApi } from '../../api/runtime';

/* ── Mock fallback (used when API unavailable or no restaurantId) ─ */
const MOCK_OVERVIEW = {
  todayOrders: 24,
  pendingStaffReview: 5,
  awaitingPayment: 8,
  confirmedOrders: 11,
  whatsappStatus: 'Connected',
  recentActivity: [
    'Order #NG-024 placed by Adebayo O. — ₦12,500',
    'Order #NG-023 confirmed by staff',
    'Payment received for Order #NG-021 — ₦8,000',
    'Order #NG-020 marked as delivered',
    'WhatsApp session reconnected successfully',
  ],
};

/* ── StatCard ──────────────────────────────────────────────────── */
const StatCard = ({ title, value, sub, accent = '#22c55e', icon }) => (
  <div
    style={{
      backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e',
      borderRadius: '12px', padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: '10px',
      transition: 'border-color 0.2s', cursor: 'default',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e1e1e')}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <p style={{ margin: 0, fontSize: '11px', fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        {title}
      </p>
      {icon && (
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className={icon} style={{ color: accent, fontSize: '12px' }} />
        </div>
      )}
    </div>
    <p style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: accent, letterSpacing: '-0.5px', lineHeight: 1 }}>
      {value}
    </p>
    {sub && <p style={{ margin: 0, fontSize: '11px', color: '#555' }}>{sub}</p>}
  </div>
);

/* ── SectionCard ───────────────────────────────────────────────── */
const SectionCard = ({ title, action, children }) => (
  <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #1a1a1a' }}>
      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff' }}>{title}</p>
      {action}
    </div>
    <div style={{ padding: '16px 20px' }}>{children}</div>
  </div>
);

/* ── Main Page ─────────────────────────────────────────────────── */
const RestaurantOverviewPage = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (!user?.restaurantId) {
          // No restaurantId on user object — use mock data
          setOverview(MOCK_OVERVIEW);
          return;
        }
        const response = await runtimeApi.getRestaurantOverview(user.restaurantId);
        setOverview(response ?? MOCK_OVERVIEW);
      } catch (err) {
        console.warn('Overview API failed, using mock data:', err.message);
        setOverview(MOCK_OVERVIEW);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.restaurantId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#555', fontSize: '13px', gap: '10px' }}>
        <i className="fas fa-circle-notch fa-spin" />
        Loading overview…
      </div>
    );
  }

  const stats = [
    { title: "Today's Orders",  value: overview.todayOrders ?? '—',        sub: 'orders placed today',   accent: '#22c55e', icon: 'fas fa-shopping-bag'  },
    { title: 'Pending Review',  value: overview.pendingStaffReview ?? '—', sub: 'awaiting staff action', accent: '#f59e0b', icon: 'fas fa-clock'          },
    { title: 'Awaiting Payment',value: overview.awaitingPayment ?? '—',    sub: 'need collection',       accent: '#ef4444', icon: 'fas fa-credit-card'    },
    { title: 'Confirmed Orders',value: overview.confirmedOrders ?? '—',    sub: 'ready to fulfil',       accent: '#3b82f6', icon: 'fas fa-check-circle'   },
    { title: 'WhatsApp Session',value: overview.whatsappStatus ?? '—',     sub: 'connection status',     accent: '#25d366', icon: 'fab fa-whatsapp'       },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
        {stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Recent Activity */}
      <SectionCard
        title="Recent Activity"
        action={
          <button type="button" style={{ background: 'none', border: 'none', color: '#22c55e', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>
            View all →
          </button>
        }
      >
        {overview.recentActivity?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {overview.recentActivity.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 0', borderBottom: idx < overview.recentActivity.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>{item}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '13px', color: '#444', textAlign: 'center', padding: '16px 0' }}>No recent activity</p>
        )}
      </SectionCard>
    </div>
  );
};

export default RestaurantOverviewPage;