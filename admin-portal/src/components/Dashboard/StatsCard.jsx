import React from 'react';
import '../../styles/stats-card.css';

const StatsCard = ({ title, value, change, icon }) => {
  const isPositive = change && change.startsWith('+');
  
  return (
    <div className="stats-card">
      <div className="stats-card-icon">
        <i className={icon}></i>
      </div>
      <div className="stats-card-info">
        <h3>{title}</h3>
        <p>{value}</p>
        {change && (
          <span className={`stats-change ${isPositive ? 'positive' : 'negative'}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;