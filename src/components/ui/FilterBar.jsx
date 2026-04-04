import React from 'react';

const FilterBar = ({ children, actions }) => {
  return (
    <div className="card filter-bar">
      <div className="filter-bar-content">{children}</div>
      {actions ? <div className="filter-bar-actions">{actions}</div> : null}
    </div>
  );
};

export default FilterBar;