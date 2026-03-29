import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { runtimeApi } from '../../api/runtime';

/* ─── tiny helpers ────────────────────────────────────────────── */

const Badge = ({ label, color = '#22c55e' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '3px 9px', borderRadius: '999px',
    fontSize: '11px', fontWeight: 600, letterSpacing: '0.2px',
    backgroundColor: `${color}18`, color, border: `1px solid ${color}33`,
  }}>
    <span style={{
      width: '5px', height: '5px', borderRadius: '50%',
      backgroundColor: color, display: 'inline-block',
    }} />
    {label}
  </span>
);

const StatCard = ({ title, value, sub, accent = '#22c55e', icon }) => (
  <div style={{
    backgroundColor: '#0f0f0f',
    border: '1px solid #1e1e1e',
    borderRadius: '12px',
    padding: '20px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    position: 'relative',
    overflow: 'hidden',
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
          backgroundColor: `${accent}15`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <i className={icon} style={{ color: accent, fontSize: '12px' }} />
        </div>
      )}
    </div>
    <p style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: accent, letterSpacing: '-0.5px', lineHeight: 1 }}>
      {value}
    </p>
    {sub && (
      <p style={{ margin: 0, fontSize: '11px', color: '#555' }}>{sub}</p>
    )}
  </div>
);

const SectionCard = ({ title, children, action }) => (
  <div style={{
    backgroundColor: '#0f0f0f',
    border: '1px solid #1e1e1e',
    borderRadius: '12px',
    overflow: 'hidden',
  }}>
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 20px', borderBottom: '1px solid #1a1a1a',
    }}>
      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff' }}>{title}</p>
      {action}
    </div>
    <div style={{ padding: '16px 20px' }}>{children}</div>
  </div>
);

/* ─── main page ───────────────────────────────────────────────── */

const RestaurantOverviewPage = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await runtimeApi.getRestaurantOverview(user.restaurantId);
        setOverview(response);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.restaurantId]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '200px', color: '#555', fontSize: '13px',
      }}>
        <i className="fas fa-circle-notch fa-spin" style={{ marginRight: '10px' }} />
        Loading overview…
      </div>
    );
  }

  if (!overview) {
    return (
      <div style={{
        padding: '20px', backgroundColor: '#0f0f0f', borderRadius: '12px',
        border: '1px solid #1e1e1e', color: '#555', fontSize: '13px',
        textAlign: 'center',
      }}>
        No overview data available.
      </div>
    );
  }

  const stats = [
    {
      title: "Today's Orders",
      value: overview.todayOrders ?? '—',
      sub: 'orders placed today',
      accent: '#22c55e',
      icon: 'fas fa-shopping-bag',
    },
    {
      title: 'Pending Review',
      value: overview.pendingStaffReview ?? '—',
      sub: 'awaiting staff action',
      accent: '#f59e0b',
      icon: 'fas fa-clock',
    },
    {
      title: 'Awaiting Payment',
      value: overview.awaitingPayment ?? '—',
      sub: 'need collection',
      accent: '#ef4444',
      icon: 'fas fa-credit-card',
    },
    {
      title: 'Confirmed Orders',
      value: overview.confirmedOrders ?? '—',
      sub: 'ready to fulfil',
      accent: '#3b82f6',
      icon: 'fas fa-check-circle',
    },
    {
      title: 'WhatsApp Session',
      value: overview.whatsappStatus ?? '—',
      sub: 'connection status',
      accent: '#25d366',
      icon: 'fab fa-whatsapp',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <p style={{ margin: 0, fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Restaurant
            </p>
            <Badge label="Live" color="#22c55e" />
          </div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#fff', letterSpacing: '-0.4px' }}>
            Restaurant Overview
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#555' }}>
            Daily operational pulse — staff review, payment queue, and WhatsApp health.
          </p>
        </div>

        <button
          type="button"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '9px 16px',
            backgroundColor: '#22c55e', border: 'none',
            borderRadius: '8px', color: '#000',
            fontSize: '13px', fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 0 12px rgba(34,197,94,0.25)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
        >
          <i className="fas fa-bolt" style={{ fontSize: '11px' }} />
          New Order
        </button>
      </div>

      {/* Stat cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '14px',
      }}>
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Recent Activity */}
      <SectionCard
        title="Recent Activity"
        action={
          <button type="button" style={{
            background: 'none', border: 'none', color: '#22c55e',
            fontSize: '12px', cursor: 'pointer', fontWeight: 500,
          }}>
            View all →
          </button>
        }
      >
        {overview.recentActivity?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {overview.recentActivity.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 0',
                  borderBottom: idx < overview.recentActivity.length - 1 ? '1px solid #1a1a1a' : 'none',
                }}
              >
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  backgroundColor: '#22c55e', flexShrink: 0,
                }} />
                <p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>{item}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '13px', color: '#444', textAlign: 'center', padding: '16px 0' }}>
            No recent activity
          </p>
        )}
      </SectionCard>
    </div>
  );
};

export default RestaurantOverviewPage;