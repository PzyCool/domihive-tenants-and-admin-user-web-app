import React from 'react';

const ClearButton = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="clear-filter-btn px-4 py-2 border border-gray-300 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <i className="fas fa-times mr-2"></i>
      Clear
    </button>
  );
};

export default ClearButton;
