import React, { useState } from 'react';
import '../styles/orders.css';

const Orders = () => {
  const [search, setSearch] = useState('');
  
  const orders = [
    { id: '#ORD-001', customer: 'Oluwaseun Adebayo', date: '2024-01-15', amount: '₦45,000.00', status: 'Completed' },
    { id: '#ORD-002', customer: 'Ngozi Okonkwo', date: '2024-01-15', amount: '₦120,000.00', status: 'Pending' },
    { id: '#ORD-003', customer: 'Chidi Eze', date: '2024-01-14', amount: '₦78,500.00', status: 'Processing' },
    { id: '#ORD-004', customer: 'Fatima Bello', date: '2024-01-14', amount: '₦210,000.00', status: 'Completed' },
    { id: '#ORD-005', customer: 'Emeka Okafor', date: '2024-01-13', amount: '₦32,000.00', status: 'Pending' },
    { id: '#ORD-006', customer: 'Amina Mohammed', date: '2024-01-13', amount: '₦67,500.00', status: 'Completed' },
    { id: '#ORD-007', customer: 'Tunde Bakare', date: '2024-01-12', amount: '₦153,000.00', status: 'Processing' },
    { id: '#ORD-008', customer: 'Ifeanyi Nwosu', date: '2024-01-12', amount: '₦89,000.00', status: 'Pending' },
  ];

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(search.toLowerCase()) ||
    order.customer.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="orders-table-container">
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
            {filteredOrders.map((order) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;