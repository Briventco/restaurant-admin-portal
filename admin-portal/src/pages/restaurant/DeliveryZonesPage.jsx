import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { deliveryZonesApi } from '../../api/deliveryZones';
import DataTable from '../../components/ui/DataTable';
import ConfirmActionModal from '../../components/ui/ConfirmActionModal';
import StatusBadge from '../../components/ui/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';

const initialForm = {
  name: '',
  keywords: '',
  fee: '',
  active: true,
};

const DeliveryZonesPage = () => {
  const { user } = useAuth();
  const [zones, setZones] = useState([]);
  const [zoneToDelete, setZoneToDelete] = useState(null);
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    const response = await deliveryZonesApi.listByRestaurant(user.restaurantId);
    setZones(response);
  };

  useEffect(() => {
    let active = true;
    deliveryZonesApi.listByRestaurant(user.restaurantId).then((response) => {
      if (active) {
        setZones(response);
      }
    });

    return () => {
      active = false;
    };
  }, [user.restaurantId]);

  const addZone = async (event) => {
    event.preventDefault();
    if (!form.name || !form.keywords || !form.fee) {
      return;
    }

    await deliveryZonesApi.addZone(user.restaurantId, {
      name: form.name,
      keywords: form.keywords,
      fee: Number(form.fee),
      active: true,
    });

    setForm(initialForm);
    load();
  };

  const editZone = async (zone) => {
    const nextName = window.prompt('Zone name', zone.name);
    if (!nextName) {
      return;
    }

    const nextFee = window.prompt('Zone fee', zone.fee);
    if (!nextFee) {
      return;
    }

    await deliveryZonesApi.updateZone(user.restaurantId, zone.id, {
      name: nextName,
      fee: Number(nextFee),
    });

    load();
  };

  const toggleZone = async (zone) => {
    await deliveryZonesApi.updateZone(user.restaurantId, zone.id, { active: !zone.active });
    load();
  };

  const deleteZone = async () => {
    if (!zoneToDelete) {
      return;
    }

    await deliveryZonesApi.deleteZone(user.restaurantId, zoneToDelete.id);
    setZoneToDelete(null);
    load();
  };

  const columns = [
    { key: 'name', header: 'Zone Name' },
    { key: 'keywords', header: 'Keywords' },
    { key: 'fee', header: 'Fee', render: (row) => `$${row.fee}` },
    { key: 'active', header: 'Active', render: (row) => <StatusBadge value={row.active ? 'active' : 'suspended'} label={row.active ? 'Active' : 'Inactive'} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="actions-row">
          <button type="button" className="button button-ghost button-sm" onClick={() => editZone(row)}>
            Edit
          </button>
          <button type="button" className="button button-ghost button-sm" onClick={() => toggleZone(row)}>
            Toggle
          </button>
          <button type="button" className="button button-ghost button-sm" onClick={() => setZoneToDelete(row)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="stack-lg">
      <PageHeader
        title="Delivery Zones"
        subtitle="Configure zone keywords and delivery fee rules used by order matching."
      />

      <form className="card form-grid form-grid-4" onSubmit={addZone}>
        <div>
          <label htmlFor="zone-name" className="input-label">Zone Name</label>
          <input id="zone-name" className="input" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="zone-keywords" className="input-label">Keywords</label>
          <input id="zone-keywords" className="input" value={form.keywords} onChange={(event) => setForm((prev) => ({ ...prev, keywords: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="zone-fee" className="input-label">Fee</label>
          <input id="zone-fee" className="input" type="number" min="0" value={form.fee} onChange={(event) => setForm((prev) => ({ ...prev, fee: event.target.value }))} />
        </div>
        <div className="button-align-end">
          <button type="submit" className="button">Add Zone</button>
        </div>
      </form>

      <DataTable
        columns={columns}
        rows={zones}
        emptyTitle="No delivery zones"
        emptyDescription="Configure keywords and fees so delivery pricing works for parsed addresses."
      />

      <ConfirmActionModal
        isOpen={Boolean(zoneToDelete)}
        title="Delete delivery zone?"
        message="This action removes the selected zone from mock data."
        confirmLabel="Delete"
        onCancel={() => setZoneToDelete(null)}
        onConfirm={deleteZone}
      />
    </div>
  );
};

export default DeliveryZonesPage;
