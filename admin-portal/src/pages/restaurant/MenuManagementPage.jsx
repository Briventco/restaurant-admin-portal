import React, { useEffect, useState } from 'react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmActionModal from '../../components/ui/ConfirmActionModal';
import PageHeader from '../../components/ui/PageHeader';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../auth/useAuth';
import { menuApi } from '../../api/menu';
import './MenuManagementPage.css';

const initialForm = {
  name: '',
  category: '',
  price: '',
  available: true,
};

const MenuManagementPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [itemToDelete, setItemToDelete] = useState(null);

  const load = async () => {
    const response = await menuApi.listByRestaurant(user.restaurantId);
    setItems(response);
  };

  useEffect(() => {
    let active = true;
    menuApi.listByRestaurant(user.restaurantId).then((response) => {
      if (active) {
        setItems(response);
      }
    });

    return () => {
      active = false;
    };
  }, [user.restaurantId]);

  const addItem = async (event) => {
    event.preventDefault();

    if (!form.name || !form.category || !form.price) {
      return;
    }

    await menuApi.create(user.restaurantId, {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      available: form.available,
    });

    setForm(initialForm);
    load();
  };

  const toggleAvailability = async (row) => {
    await menuApi.update(user.restaurantId, row.id, { available: !row.available });
    load();
  };

  const editItem = async (row) => {
    const nextName = window.prompt('Item name', row.name);
    if (!nextName) {
      return;
    }

    const nextPrice = window.prompt('Item price', row.price);
    if (!nextPrice) {
      return;
    }

    await menuApi.update(user.restaurantId, row.id, {
      name: nextName,
      price: Number(nextPrice),
    });
    load();
  };

  const deleteItem = async () => {
    if (!itemToDelete) {
      return;
    }
    await menuApi.delete(user.restaurantId, itemToDelete.id);
    setItemToDelete(null);
    load();
  };

  const columns = [
    { key: 'name', header: 'Item Name' },
    { key: 'category', header: 'Category' },
    { key: 'price', header: 'Price', render: (row) => formatCurrency(row.price) },
    {
      key: 'available',
      header: 'Available',
      render: (row) => <StatusBadge value={row.available ? 'active' : 'suspended'} label={row.available ? 'Available' : 'Unavailable'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="actions-row">
          <button type="button" className="button button-ghost button-sm" onClick={() => editItem(row)}>
            Edit
          </button>
          <button type="button" className="button button-ghost button-sm" onClick={() => toggleAvailability(row)}>
            Toggle
          </button>
          <button type="button" className="button button-ghost button-sm" onClick={() => setItemToDelete(row)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="stack-lg">
      <PageHeader
        title="Menu Management"
        subtitle="Maintain item catalog, categories, pricing, and availability."
      />

      <form className="card form-grid form-grid-4" onSubmit={addItem}>
        <div>
          <label htmlFor="menu-name" className="input-label">Item Name</label>
          <input id="menu-name" className="input" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="menu-category" className="input-label">Category</label>
          <input id="menu-category" className="input" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="menu-price" className="input-label">Price</label>
          <input id="menu-price" className="input" type="number" min="0" value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))} />
        </div>
        <div className="button-align-end">
          <button type="submit" className="button">Add Item</button>
        </div>
      </form>

      <DataTable
        columns={columns}
        rows={items}
        emptyTitle="No menu items"
        emptyDescription="Add your first menu item to start order matching."
      />

      <ConfirmActionModal
        isOpen={Boolean(itemToDelete)}
        title="Delete menu item?"
        message="This action removes the selected item from mock data."
        confirmLabel="Delete"
        onCancel={() => setItemToDelete(null)}
        onConfirm={deleteItem}
      />
    </div>
  );
};

export default MenuManagementPage;