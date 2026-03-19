import React from 'react';

const ApplyFiltersButton = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-[#9f7539] text-white rounded-lg hover:bg-[#b58a4a] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <i className="fas fa-check mr-2"></i>
      Apply
    </button>
  );
};

export default ApplyFiltersButton;
