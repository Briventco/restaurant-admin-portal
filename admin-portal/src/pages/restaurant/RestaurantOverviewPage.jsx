import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { runtimeApi } from '../../Api/runtime';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';

const RestaurantOverviewPage = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    const load = async () => {
      const response = await runtimeApi.getRestaurantOverview(user.restaurantId);
      setOverview(response);
    };

    load();
  }, [user.restaurantId]);

  if (!overview) {
    return <div className="card">Loading overview...</div>;
  }

  return (
    <div className="stack-lg">
      <PageHeader
        title="Restaurant Overview"
        subtitle="Daily operational pulse for staff review, payment queue, and WhatsApp health."
      />

      <div className="cards-grid">
        <StatCard title="Today's Orders" value={overview.todayOrders} />
        <StatCard title="Pending Staff Review" value={overview.pendingStaffReview} />
        <StatCard title="Awaiting Payment" value={overview.awaitingPayment} />
        <StatCard title="Confirmed Orders" value={overview.confirmedOrders} />
        <StatCard title="WhatsApp Session" value={<StatusBadge value={overview.whatsappStatus} />} />
      </div>

      <SectionCard title="Recent Activity">
        <ul className="list-reset">
          {overview.recentActivity.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
};

export default RestaurantOverviewPage;