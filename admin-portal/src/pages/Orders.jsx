import React, { useState } from 'react';
import '../styles/orders.css';

const Orders = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [newOrder, setNewOrder] = useState({
    customer: '',
    phone: '',
    address: '',
    amount: '',
    status: 'Pending',
    items: [{ name: '', qty: 1, price: '' }]
  });

  const [orders, setOrders] = useState([
    { id: '#ORD-001', customer: 'Oluwaseun Adebayo', phone: '08012345678', address: '12 Adeola Street, Lagos', date: '2024-01-15', amount: '₦45,000.00', status: 'Completed', items: [{ name: 'Jollof Rice', qty: 2, price: '₦15,000' }, { name: 'Grilled Chicken', qty: 1, price: '₦15,000' }] },
    { id: '#ORD-002', customer: 'Ngozi Okonkwo', phone: '08023456789', address: '5 Unity Road, Abuja', date: '2024-01-15', amount: '₦120,000.00', status: 'Pending', items: [{ name: 'Fried Rice', qty: 3, price: '₦25,000' }, { name: 'Beef Suya', qty: 2, price: '₦22,500' }] },
    { id: '#ORD-003', customer: 'Chidi Eze', phone: '08034567890', address: '8 Enugu Street, Enugu', date: '2024-01-14', amount: '₦78,500.00', status: 'Processing', items: [{ name: 'Egusi Soup', qty: 2, price: '₦20,000' }, { name: 'Pounded Yam', qty: 2, price: '₦10,000' }] },
    { id: '#ORD-004', customer: 'Fatima Bello', phone: '08045678901', address: '22 Kaduna Road, Kano', date: '2024-01-14', amount: '₦210,000.00', status: 'Completed', items: [{ name: 'Grilled Fish', qty: 3, price: '₦45,000' }, { name: 'Plantain', qty: 4, price: '₦20,000' }] },
    { id: '#ORD-005', customer: 'Emeka Okafor', phone: '08056789012', address: '15 Owerri Street, Imo', date: '2024-01-13', amount: '₦32,000.00', status: 'Pending', items: [{ name: 'Beans Porridge', qty: 2, price: '₦12,000' }, { name: 'Fried Plantain', qty: 2, price: '₦8,000' }] },
    { id: '#ORD-006', customer: 'Amina Mohammed', phone: '08067890123', address: '7 Jos Road, Plateau', date: '2024-01-13', amount: '₦67,500.00', status: 'Completed', items: [{ name: 'Suya', qty: 5, price: '₦35,000' }, { name: 'Zobo Drink', qty: 5, price: '₦12,500' }] },
    { id: '#ORD-007', customer: 'Tunde Bakare', phone: '08078901234', address: '45 Ibadan Road, Oyo', date: '2024-01-12', amount: '₦153,000.00', status: 'Processing', items: [{ name: 'Seafood Okro', qty: 2, price: '₦50,000' }, { name: 'Amala', qty: 3, price: '₦18,000' }] },
    { id: '#ORD-008', customer: 'Ifeanyi Nwosu', phone: '08089012345', address: '10 Port Harcourt Road, Rivers', date: '2024-01-12', amount: '₦89,000.00', status: 'Failed', items: [{ name: 'Pepper Soup', qty: 3, price: '₦30,000' }, { name: 'Catfish', qty: 2, price: '₦35,000' }] },
  ]);

  const itemsPerPage = 10;

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    showToast(`Order ${orderId} status updated to ${newStatus}`, 'success');
  };

  const deleteOrder = (orderId) => {
    setOrders(orders.filter(order => order.id !== orderId));
    setShowDeleteConfirm(null);
    showToast(`Order ${orderId} deleted successfully`, 'success');
  };

  const editOrder = () => {
    setOrders(orders.map(order => 
      order.id === editingOrder.id ? editingOrder : order
    ));
    setShowEditModal(false);
    setEditingOrder(null);
    showToast(`Order ${editingOrder.id} updated successfully`, 'success');
  };

  const addNewOrder = () => {
    const newId = `#ORD-${String(orders.length + 1).padStart(3, '0')}`;
    const order = {
      id: newId,
      ...newOrder,
      date: new Date().toISOString().split('T')[0],
      amount: `₦${calculateTotal().toLocaleString()}`,
    };
    setOrders([order, ...orders]);
    setShowAddModal(false);
    setNewOrder({
      customer: '',
      phone: '',
      address: '',
      amount: '',
      status: 'Pending',
      items: [{ name: '', qty: 1, price: '' }]
    });
    showToast(`Order ${newId} added successfully`, 'success');
  };

  const addOrderItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { name: '', qty: 1, price: '' }]
    });
  };

  const updateOrderItem = (index, field, value) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index][field] = value;
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const removeOrderItem = (index) => {
    const updatedItems = newOrder.items.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const calculateTotal = () => {
    return newOrder.items.reduce((total, item) => {
      const price = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
      const qty = parseInt(item.qty) || 0;
      return total + (price * qty);
    }, 0);
  };

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'failed': return 'status-failed';
      default: return 'status-pending';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.phone.includes(search);
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="orders">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="toast-close">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <div className="header-actions">
          <button className="add-order-btn" onClick={() => setShowAddModal(true)}>
            <i className="fas fa-plus"></i>
            Add Order
          </button>
          <button className="export-btn" onClick={() => showToast('Export feature coming soon', 'info')}>
            <i className="fas fa-download"></i>
            Export
          </button>
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by ID, name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
        <div className="stats-info">
          <span>Total Orders: <strong>{filteredOrders.length}</strong></span>
        </div>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order) => (
              <tr key={order.id}>
                <td className="order-id">{order.id}</td>
                <td className="customer-name">{order.customer}</td>
                <td>{order.phone}</td>
                <td>{order.date}</td>
                <td className="amount">{order.amount}</td>
                <td>
                  <select
                    className={`status-select ${getStatusClass(order.status)}`}
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </td>
                <td className="actions">
                  <button
                    className="view-btn"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowModal(true);
                    }}
                    title="View Details"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setEditingOrder({ ...order });
                      setShowEditModal(true);
                    }}
                    title="Edit Order"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => setShowDeleteConfirm(order.id)}
                    title="Delete Order"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - {selectedOrder.id}</h2>
              <button className="close-modal" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="details-grid">
                <div className="details-section">
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.customer}</p>
                  <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                  <p><strong>Address:</strong> {selectedOrder.address}</p>
                </div>
                <div className="details-section">
                  <h3>Order Information</h3>
                  <p><strong>Date:</strong> {selectedOrder.date}</p>
                  <p><strong>Status:</strong> <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>{selectedOrder.status}</span></p>
                  <p><strong>Total:</strong> {selectedOrder.amount}</p>
                </div>
              </div>
              <div className="details-section">
                <h3>Items</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => {
                      const price = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
                      const qty = parseInt(item.qty) || 0;
                      return (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.qty}</td>
                          <td>{item.price}</td>
                          <td>₦{(price * qty).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-btn" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="close-modal" onClick={() => setShowDeleteConfirm(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this order?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="delete-confirm-btn" onClick={() => deleteOrder(showDeleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && editingOrder && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Order - {editingOrder.id}</h2>
              <button className="close-modal" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  value={editingOrder.customer}
                  onChange={(e) => setEditingOrder({ ...editingOrder, customer: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={editingOrder.phone}
                  onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={editingOrder.address}
                  onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingOrder.status}
                  onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="save-btn" onClick={editOrder}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Order Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Order</h2>
              <button className="close-modal" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    value={newOrder.customer}
                    onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={newOrder.phone}
                    onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Delivery Address</label>
                <input
                  type="text"
                  value={newOrder.address}
                  onChange={(e) => setNewOrder({ ...newOrder, address: e.target.value })}
                  placeholder="Enter delivery address"
                />
              </div>
              <div className="form-group">
                <label>Items</label>
                {newOrder.items.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateOrderItem(index, 'name', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => updateOrderItem(index, 'qty', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Price (₦)"
                      value={item.price}
                      onChange={(e) => updateOrderItem(index, 'price', e.target.value)}
                    />
                    {newOrder.items.length > 1 && (
                      <button
                        type="button"
                        className="remove-item"
                        onClick={() => removeOrderItem(index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-item-btn" onClick={addOrderItem}>
                  <i className="fas fa-plus"></i> Add Item
                </button>
              </div>
              <div className="order-total">
                <strong>Total Amount:</strong> ₦{calculateTotal().toLocaleString()}
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="save-btn" onClick={addNewOrder}>Add Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;