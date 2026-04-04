
import React from 'react';

const EmptyState = ({ title = 'No records found', description = 'There is no data to display yet.', action }) => {
  return (
    <div className="empty-state">
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-description">{description}</p>
      {action ? <div>{action}</div> : null}
    </div>
  );
};

export default EmptyState;
