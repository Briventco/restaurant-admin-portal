import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowTrendUp,
  faBoxesStacked,
  faEye,
  faEyeSlash,
  faLayerGroup,
  faPenToSquare,
  faPlus,
  faStore,
  faTrashCan,
  faChevronLeft,
  faChevronRight,
  faAnglesLeft,
  faAnglesRight,
} from '@fortawesome/free-solid-svg-icons';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmActionModal from '../../components/ui/ConfirmActionModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useAuth } from '../../auth/useAuth';
import { menuApi } from '../../api/menu';
import './MenuManagementPage.css';

const initialForm = {
  name: '',
  category: '',
  price: '',
  available: true,
};

const formatNaira = (value) => `N${Number(value || 0).toLocaleString()}`;

const StatCard = ({ icon, label, value, hint }) => (
  <article className="menu-stat-card">
    <div className="menu-stat-head">
      <span>{label}</span>
      <div className="menu-stat-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
    </div>
    <strong className="menu-stat-value">{value}</strong>
    <p className="menu-stat-hint">{hint}</p>
  </article>
);

const MenuManagementPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const load = async () => {
    if (!user?.restaurantId) return;
    setLoading(true);
    setError('');
    try {
      const response = await menuApi.listByRestaurant(user.restaurantId);
      setItems(response);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.restaurantId]);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    document.querySelector('.menu-list-shell')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getPageNumbers = () => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const stats = useMemo(() => {
    const availableCount = items.filter((i) => i.available).length;
    const categories = new Set(items.map((i) => String(i.category || '').trim()).filter(Boolean));
    const averagePrice =
      items.length > 0
        ? Math.round(items.reduce((s, i) => s + Number(i.price || 0), 0) / items.length)
        : 0;
    return { availableCount, unavailableCount: items.length - availableCount, categoryCount: categories.size, averagePrice };
  }, [items]);

  const addItem = async (event) => {
    event.preventDefault();
    if (!form.name || !form.category || !form.price) {
      setError('Please fill item name, category, and price before adding a menu item.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await menuApi.create(user.restaurantId, {
        name: form.name.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        available: form.available,
      });
      setForm(initialForm);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to add menu item.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAvailability = async (row) => {
    setSubmitting(true);
    setError('');
    try {
      await menuApi.update(user.restaurantId, row.id, { available: !row.available });
      await load();
    } catch (err) {
      setError(err.message || 'Failed to update availability.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (row) => {
    setEditForm({ name: row.name || '', category: row.category || '', price: String(row.price || ''), available: row.available !== false });
    setItemToEdit(row);
  };

  const closeEditModal = () => {
    if (submitting) return;
    setItemToEdit(null);
    setEditForm(initialForm);
  };

  const saveEdit = async () => {
    if (!itemToEdit) return;
    if (!editForm.name || !editForm.category || !editForm.price) {
      setError('Please complete the item name, category, and price before saving.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await menuApi.update(user.restaurantId, itemToEdit.id, {
        name: editForm.name.trim(),
        category: editForm.category.trim(),
        price: Number(editForm.price),
        available: editForm.available,
      });
      setItemToEdit(null);
      setEditForm(initialForm);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to update menu item.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = async () => {
    if (!itemToDelete) return;
    setSubmitting(true);
    setError('');
    try {
      await menuApi.delete(user.restaurantId, itemToDelete.id);
      setItemToDelete(null);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to delete menu item.');
    } finally {
      setSubmitting(false);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, items.length);

  return (
    <div className="menu-page-shell">
      <section className="menu-hero">
        <div className="menu-hero-content">
          <p className="menu-eyebrow">Restaurant Catalog</p>
          <h1>Menu Management</h1>
          {/* <p className="menu-subtitle">
            Control exactly what customers can discover and order on WhatsApp. Update prices,
            switch availability instantly, and keep the live menu clean.
          </p> */}
          <div className="menu-hero-pills">
            <span className="menu-pill">Live Firestore menu</span>
            <span className="menu-pill">Restaurant: {user?.restaurantId || '-'}</span>
          </div>
        </div>

        <div className="menu-hero-aside">
          <div className="menu-hero-kicker">
            <span>Total items</span>
            <strong>{items.length}</strong>
          </div>
          <p>Changes here affect the exact menu the ordering bot uses.</p>
        </div>
      </section>

      <section className="menu-stats-grid">
        <StatCard icon={faStore} label="Available Now" value={stats.availableCount} hint="Items customers can order immediately" />
        <StatCard icon={faBoxesStacked} label="Hidden / Unavailable" value={stats.unavailableCount} hint="Items currently held back from ordering" />
        <StatCard icon={faLayerGroup} label="Categories" value={stats.categoryCount} hint="Distinct groups on the current menu" />
        <StatCard icon={faArrowTrendUp} label="Average Price" value={formatNaira(stats.averagePrice)} hint="Quick pricing pulse across the menu" />
      </section>

      {error ? <div className="menu-alert">{error}</div> : null}

      <section className="menu-create-panel">
        <div className="menu-section-head">
          <div>
            <h2>Add New Item</h2>
            <p>Create a menu item that the restaurant portal and WhatsApp bot can both use.</p>
          </div>
        </div>

        <form className="menu-create-form" onSubmit={addItem}>
          <label className="menu-field">
            <span>Item name</span>
            <input className="menu-input" placeholder="Smoky Jollof Rice" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} disabled={submitting} />
          </label>
          <label className="menu-field">
            <span>Category</span>
            <input className="menu-input" placeholder="Rice, Protein, Swallow" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} disabled={submitting} />
          </label>
          <label className="menu-field">
            <span>Price</span>
            <input className="menu-input" type="number" min="0" placeholder="1500" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} disabled={submitting} />
          </label>
          <button type="submit" className="menu-primary-btn" disabled={submitting}>
            <FontAwesomeIcon icon={faPlus} />
            {submitting ? 'Saving...' : 'Add Item'}
          </button>
        </form>
      </section>

      <section className="menu-list-shell">
        <div className="menu-section-head">
          <div>
            <h2>Live Menu Items</h2>
            <p>These are the exact records currently stored for this restaurant.</p>
          </div>
          <span className="menu-item-count">{items.length} items</span>
        </div>

        {loading ? (
          <div className="menu-loading-card">Loading live menu...</div>
        ) : !items.length ? (
          <div className="menu-empty-card">
            <h3>No menu items yet</h3>
            <p>Add your first item above to start matching real customer orders.</p>
          </div>
        ) : (
          <>
            <div className="menu-table-shell">
              <div className="menu-table-wrap">
                <table className="menu-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th className="align-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="menu-primary-cell">
                            <strong>{item.name}</strong>
                            <span>{item.id}</span>
                          </div>
                        </td>
                        <td>{item.category || 'Uncategorized'}</td>
                        <td className="menu-price-cell">{formatNaira(item.price)}</td>
                        <td>
                          <StatusBadge value={item.available ? 'active' : 'suspended'} label={item.available ? 'Available' : 'Unavailable'} />
                        </td>
                        <td>
                          <div className="menu-actions">
                            <button type="button" className="menu-action-btn" onClick={() => openEditModal(item)}>
                              <FontAwesomeIcon icon={faPenToSquare} />
                              <span className="menu-btn-label">Edit</span>
                            </button>
                            <button type="button" className={`menu-action-btn ${item.available ? 'warn' : 'success'}`} onClick={() => toggleAvailability(item)} disabled={submitting}>
                              <FontAwesomeIcon icon={item.available ? faEyeSlash : faEye} />
                              <span className="menu-btn-label">{item.available ? 'Hide' : 'Show'}</span>
                            </button>
                            <button type="button" className="menu-action-btn danger" onClick={() => setItemToDelete(item)} disabled={submitting}>
                              <FontAwesomeIcon icon={faTrashCan} />
                              <span className="menu-btn-label">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="menu-card-grid">
              {paginatedItems.map((item) => (
                <article key={`${item.id}-card`} className="menu-item-card">
                  <div className="menu-item-card-head">
                    <div className="menu-item-card-info">
                      <p className="menu-item-kicker">{item.category || 'Uncategorized'}</p>
                      <h3>{item.name}</h3>
                    </div>
                    <StatusBadge value={item.available ? 'active' : 'suspended'} label={item.available ? 'Available' : 'Unavailable'} />
                  </div>
                  <div className="menu-item-meta">
                    <span>Price</span>
                    <strong>{formatNaira(item.price)}</strong>
                  </div>
                  <p className="menu-item-id">{item.id}</p>
                  <div className="menu-actions stacked">
                    <button type="button" className="menu-action-btn" onClick={() => openEditModal(item)}>
                      <FontAwesomeIcon icon={faPenToSquare} /> Edit Item
                    </button>
                    <button type="button" className={`menu-action-btn ${item.available ? 'warn' : 'success'}`} onClick={() => toggleAvailability(item)} disabled={submitting}>
                      <FontAwesomeIcon icon={item.available ? faEyeSlash : faEye} />
                      {item.available ? 'Hide From Customers' : 'Make Available'}
                    </button>
                    <button type="button" className="menu-action-btn danger" onClick={() => setItemToDelete(item)} disabled={submitting}>
                      <FontAwesomeIcon icon={faTrashCan} /> Delete Item
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="menu-pagination">
                <span className="menu-pagination-meta">
                  {startItem}–{endItem} of {items.length}
                </span>
                <div className="menu-pagination-buttons">
                  <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="menu-pg-btn" aria-label="First page">
                    <FontAwesomeIcon icon={faAnglesLeft} />
                  </button>
                  <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="menu-pg-btn" aria-label="Previous page">
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  {getPageNumbers().map((page) => (
                    <button key={page} onClick={() => goToPage(page)} className={`menu-pg-btn menu-pg-num${currentPage === page ? ' active' : ''}`}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="menu-pg-btn" aria-label="Next page">
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                  <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="menu-pg-btn" aria-label="Last page">
                    <FontAwesomeIcon icon={faAnglesRight} />
                  </button>
                </div>
                <span className="menu-pagination-page">Page {currentPage} of {totalPages}</span>
              </div>
            )}
          </>
        )}
      </section>

      <ConfirmActionModal
        isOpen={Boolean(itemToDelete)}
        title="Delete menu item?"
        message={`This will remove ${itemToDelete?.name || 'this item'} from the live restaurant menu.`}
        confirmLabel="Delete Item"
        onCancel={() => setItemToDelete(null)}
        onConfirm={deleteItem}
        isLoading={submitting}
      />

      <ConfirmModal
        isOpen={Boolean(itemToEdit)}
        title={`Edit ${itemToEdit?.name || 'menu item'}`}
        message="Update the live menu record below. These changes will immediately affect what the restaurant portal and ordering bot use."
        confirmLabel="Save Changes"
        cancelLabel="Close"
        onCancel={closeEditModal}
        onConfirm={saveEdit}
        isLoading={submitting}
      >
        <div className="menu-modal-form">
          <label className="menu-field">
            <span>Item name</span>
            <input className="menu-input" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} disabled={submitting} />
          </label>
          <label className="menu-field">
            <span>Category</span>
            <input className="menu-input" value={editForm.category} onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))} disabled={submitting} />
          </label>
          <label className="menu-field">
            <span>Price</span>
            <input className="menu-input" type="number" min="0" value={editForm.price} onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))} disabled={submitting} />
          </label>
          <button
            type="button"
            className={`menu-availability-toggle ${editForm.available ? 'available' : 'hidden'}`}
            onClick={() => setEditForm((p) => ({ ...p, available: !p.available }))}
            disabled={submitting}
          >
            <FontAwesomeIcon icon={editForm.available ? faEye : faEyeSlash} />
            {editForm.available ? 'Currently visible to customers' : 'Currently hidden from customers'}
          </button>
        </div>
      </ConfirmModal>
    </div>
  );
};

export default MenuManagementPage;