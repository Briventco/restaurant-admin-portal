import React from 'react';

const StatCard = ({ title, value, subtitle }) => {
  return (
    <div className="card stat-card">
      <p className="stat-title">{title}</p>
      <p className="stat-value">{value}</p>
      {subtitle ? <p className="stat-subtitle">{subtitle}</p> : null}
    </div>
  );
};

export default StatCard;
