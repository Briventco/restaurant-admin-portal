import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../auth/AuthContext';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
import FilterBar from '../../components/ui/FilterBar';
// import { ordersApi } from '../../api/orders';
import { ORDER_STATUS_OPTIONS } from '../../data/mockData';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const isWithinRecentWindow = (createdAt, filter) => {
  if (filter === 'all') {
    return true;
  }

  const createdMs = new Date(createdAt).getTime();
  const nowMs = Date.now();
  const hours = filter === '24h' ? 24 : filter === '48h' ? 48 : 72;
  return nowMs - createdMs <= hours * 60 * 60 * 1000;
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [statusFilter, setStatusFilter] = useState('all');
  const [recentFilter, setRecentFilter] = useState('all');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let active = true;
    ordersApi.listByRestaurant(user.restaurantId, { status: statusFilter }).then((response) => {
      if (active) {
        setOrders(response);
      }
    });

    return () => {
      active = false;
    };
  }, [statusFilter, user.restaurantId]);

  const visibleOrders = useMemo(() => {
    return orders.filter((order) => isWithinRecentWindow(order.createdAt, recentFilter));
  }, [orders, recentFilter]);

  const columns = [
    { key: 'id', header: 'Order ID' },
    { key: 'customer', header: 'Customer' },
    { key: 'items', header: 'Items' },
    { key: 'total', header: 'Total', render: (row) => formatCurrency(row.total) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'createdAt', header: 'Created At', render: (row) => formatDateTime(row.createdAt) },
  ];

  return (
    <div className="stack-md">
      <PageHeader
        title="Orders"
        subtitle="Review parsed WhatsApp orders and move them through the fulfillment workflow."
      />

      <FilterBar>
        <div>
          <label htmlFor="order-status-filter" className="input-label">Status</label>
          <select
            id="order-status-filter"
            className="input"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All</option>
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="order-recent-filter" className="input-label">Recent Orders</label>
          <select
            id="order-recent-filter"
            className="input"
            value={recentFilter}
            onChange={(event) => setRecentFilter(event.target.value)}
          >
            <option value="all">All</option>
            <option value="24h">Last 24 hours</option>
            <option value="48h">Last 48 hours</option>
            <option value="72h">Last 72 hours</option>
          </select>
        </div>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={visibleOrders}
        onRowClick={(row) => navigate(`/orders/${row.id}`)}
        emptyTitle="No orders"
        emptyDescription="Orders will appear here when WhatsApp requests are parsed."
      />
    </div>
  );
};

export default OrdersPage;