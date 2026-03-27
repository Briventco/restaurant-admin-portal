import React, { useEffect, useState } from 'react';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import { runtimeApi } from '../../api/runtime';

const SuperAdminDashboardPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      const response = await runtimeApi.getSuperAdminDashboard();
      setStats(response);
    };

    load();
  }, []);

  if (!stats) {
    return <div className="card">Loading dashboard...</div>;
  }

  return (
    <div className="stack-lg">
      <PageHeader
        title="System Dashboard"
        subtitle="Cross-restaurant visibility for platform health, message delivery, and operational load."
      />

      <div className="cards-grid">
        <StatCard title="Total Restaurants" value={stats.totalRestaurants} />
        <StatCard title="Active Restaurants" value={stats.activeRestaurants} />
        <StatCard title="Total Orders" value={stats.totalOrders} />
        <StatCard title="Pending Actions" value={stats.pendingActions} />
        <StatCard title="Connected WhatsApp Sessions" value={stats.connectedSessions} />
        <StatCard title="Failed Outbox Count" value={stats.failedOutboxCount} />
      </div>

      <SectionCard
        title="Operational Snapshot"
        subtitle="This view is intended for Brivent internal monitoring of onboarding, runtime health, and messaging reliability."
      />
    </div>
  );
};

export default SuperAdminDashboardPage;
