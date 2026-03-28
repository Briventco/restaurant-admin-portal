import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmActionModal from '../../components/ui/ConfirmActionModal';
import PageHeader from '../../components/ui/PageHeader';
import FilterBar from '../../components/ui/FilterBar';
// import { restaurantsApi } from '../../api/restaurants';
import { formatDateTime } from '../../utils/formatters';

const RestaurantsListPage = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [pendingAction, setPendingAction] = useState(null);

  const load = async () => {
    const response = await restaurantsApi.list();
    setRestaurants(response);
  };

  useEffect(() => {
    let active = true;
    restaurantsApi.list().then((response) => {
      if (active) {
        setRestaurants(response);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const handleStatusChange = async () => {
    if (!pendingAction) {
      return;
    }

    const nextStatus = pendingAction.currentStatus === 'active' ? 'suspended' : 'active';
    await restaurantsApi.setStatus(pendingAction.restaurantId, nextStatus);
    setPendingAction(null);
    load();
  };

  const columns = [
    { key: 'name', header: 'Restaurant Name' },
    { key: 'id', header: 'Restaurant ID' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'whatsappStatus', header: 'WhatsApp Status', render: (row) => <StatusBadge value={row.whatsappStatus} /> },
    { key: 'lastActivity', header: 'Last Activity', render: (row) => formatDateTime(row.lastActivity) },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="actions-row">
          <button
            type="button"
            className="button button-ghost button-sm"
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/restaurants/${row.id}`);
            }}
          >
            Open
          </button>
          <button
            type="button"
            className="button button-ghost button-sm"
            onClick={(event) => {
              event.stopPropagation();
              setPendingAction({ restaurantId: row.id, currentStatus: row.status });
            }}
          >
            {row.status === 'active' ? 'Suspend' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="stack-md">
      <PageHeader
        title="Restaurants"
        subtitle="Manage onboarding, status, and workspace access for each restaurant."
      />

      <FilterBar
        actions={<button type="button" className="button button-outline">Add Restaurant</button>}
      >
        <p className="muted-text">Use row actions to open details or change active/suspended state.</p>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={restaurants}
        onRowClick={(row) => navigate(`/restaurants/${row.id}`)}
        emptyTitle="No restaurants"
        emptyDescription="No restaurant records are currently available."
      />

      <ConfirmActionModal
        isOpen={Boolean(pendingAction)}
        title={pendingAction?.currentStatus === 'active' ? 'Suspend restaurant?' : 'Activate restaurant?'}
        message="This is an MVP placeholder action. It updates local mock data only."
        confirmLabel="Continue"
        onCancel={() => setPendingAction(null)}
        onConfirm={handleStatusChange}
      />
    </div>
  );
};

export default RestaurantsListPage;