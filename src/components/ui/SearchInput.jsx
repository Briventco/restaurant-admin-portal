import React from 'react';

const SearchInput = ({ value, onChange, placeholder = 'Search', className = '', onKeyDown }) => {
  return (
    <label className={`search-input ${className}`}>
      <span className="search-icon" aria-hidden="true">⌕</span>
      <input
        className="search-field"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
      />
    </label>
  );
};

export default SearchInput;