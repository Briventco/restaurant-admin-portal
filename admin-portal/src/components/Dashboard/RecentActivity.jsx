import React from 'react';
import '../../styles/recent-activity.css';

const RecentActivity = () => {
  const activities = [
    { id: 1, order: '#ORD-001', customer: 'John Doe', amount: '$45.00', status: 'Completed' },
    { id: 2, order: '#ORD-002', customer: 'Jane Smith', amount: '$120.00', status: 'Pending' },
    { id: 3, order: '#ORD-003', customer: 'Mike Johnson', amount: '$78.50', status: 'Processing' },
    { id: 4, order: '#ORD-004', customer: 'Sarah Williams', amount: '$210.00', status: 'Completed' },
  ];

  return (
    <div className="recent-activity">
      <div className="section-header">
        <h2>Recent Orders</h2>
        <a href="/orders" className="view-all">View All</a>
      </div>
      <table className="activity-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id}>
              <td>{activity.order}</td>
              <td>{activity.customer}</td>
              <td>{activity.amount}</td>
              <td>
                <span className={`status ${activity.status.toLowerCase()}`}>
                  {activity.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentActivity;