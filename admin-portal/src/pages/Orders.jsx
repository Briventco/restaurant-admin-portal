import React, { useState, useEffect } from 'react';
import '../styles/orders.css';
import { listByRestaurant } from '../api/orders';
import { useAuth } from '../auth/AuthContext';

const Orders = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const restaurantId = user?.restaurantId || 'lead_mall'; // Use user's restaurant ID
      const fetchedOrders = await listByRestaurant(restaurantId);
      setOrders(fetchedOrders);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(search.toLowerCase()) ||
    order.customer.toLowerCase().includes(search.toLowerCase())
  ).map(order => ({
    id: order.id,
    customer: order.customer,
    date: new Date(order.createdAt).toLocaleDateString(),
    amount: `₦${order.amount.toLocaleString()}`,
    status: order.uiStatus,
  }));

  return (
    <div className="orders">
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
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
      
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '20px' }}>
          Error loading orders: {error}
        </div>
      )}
      
      <div className="orders-table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <i className="fas fa-spinner fa-spin"></i> Loading orders...
          </div>
        ) : (
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
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '50px' }}>
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.date}</td>
                    <td>{order.amount}</td>
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
        )}
      </div>
    </div>
  );
};

export default Orders;