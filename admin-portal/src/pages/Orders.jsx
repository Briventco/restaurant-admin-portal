import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '../styles/orders.css';
import ordersApi from '../api/orders';
import { useAuth } from '../auth/AuthContext';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'customer', label: 'Customer' },
  { value: 'status', label: 'Status' },
  { value: 'id', label: 'Order ID' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const Orders = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const restaurantId = user?.restaurantId || 'lead_mall';
      const fetchedOrders = await ordersApi.listByRestaurant(restaurantId);
      setOrders(fetchedOrders);
    } catch (err) {
      setError(err?.message || 'Unable to load orders');
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, loadOrders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortBy, sortOrder, pageSize]);

  const processedOrders = useMemo(() => {
    const lowerSearch = (search || '').trim().toLowerCase();

    const filtered = orders
      .map((order) => ({
        id: order.id,
        customer: order.customer,
        date: new Date(order.createdAt).toLocaleDateString(),
        amount: Number(order.amount || 0),
        status: order.uiStatus || 'pending',
        createdAt: order.createdAt || order.updatedAt || '',
      }))
      .filter((order) => {
        const matchesSearch =
          !lowerSearch ||
          order.id.toLowerCase().includes(lowerSearch) ||
          order.customer.toLowerCase().includes(lowerSearch);

        const matchesStatus =
          statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
      });

    return filtered.sort((a, b) => {
      const direction = sortOrder === 'asc' ? 1 : -1;

      if (sortBy === 'amount') {
        return direction * (a.amount - b.amount);
      }

      if (sortBy === 'createdAt') {
        return (
          direction *
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        );
      }

      return direction * String(a[sortBy] || '').localeCompare(String(b[sortBy] || ''), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });
  }, [orders, search, statusFilter, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(processedOrders.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visibleOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedOrders.slice(startIndex, startIndex + pageSize);
  }, [processedOrders, currentPage, pageSize]);

  return (
    <div className="orders">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <div className="page-meta">Restaurant ID: {user?.restaurantId || 'lead_mall'}</div>
        </div>

        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <label>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort by</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Order</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Rows</label>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">Error loading orders: {error}</div>
      )}

      <div className="orders-table-container">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i> Loading orders...
          </div>
        ) : (
          <>
            <div className="orders-meta">
              Showing {visibleOrders.length} of {processedOrders.length} orders
            </div>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  visibleOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.date}</td>
                      <td>{`₦${order.amount.toLocaleString()}`}</td>
                      <td>
                        <span className={`status ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}
      </div>

      {!loading && processedOrders.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={page === currentPage ? 'active' : ''}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;
