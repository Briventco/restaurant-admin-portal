import React, { useState } from 'react';
import '../styles/customers.css';

const Customers = () => {
  const [search, setSearch] = useState('');
  
  const customers = [
    { id: 1, name: 'Oluwaseun Adebayo', email: 'seun.adebayo@example.com', orders: 12, total: '₦540,000.00' },
    { id: 2, name: 'Ngozi Okonkwo', email: 'ngozi.okonkwo@example.com', orders: 8, total: '₦890,000.00' },
    { id: 3, name: 'Chidi Eze', email: 'chidi.eze@example.com', orders: 5, total: '₦320,000.00' },
    { id: 4, name: 'Fatima Bello', email: 'fatima.bello@example.com', orders: 15, total: '₦1,250,000.00' },
    { id: 5, name: 'Emeka Okafor', email: 'emeka.okafor@example.com', orders: 3, total: '₦180,000.00' },
    { id: 6, name: 'Amina Mohammed', email: 'amina.mohammed@example.com', orders: 10, total: '₦760,000.00' },
    { id: 7, name: 'Tunde Bakare', email: 'tunde.bakare@example.com', orders: 7, total: '₦450,000.00' },
    { id: 8, name: 'Ifeanyi Nwosu', email: 'ifeanyi.nwosu@example.com', orders: 4, total: '₦290,000.00' },
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="customers">
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Orders</th>
              <th>Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.orders}</td>
                <td>{customer.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;