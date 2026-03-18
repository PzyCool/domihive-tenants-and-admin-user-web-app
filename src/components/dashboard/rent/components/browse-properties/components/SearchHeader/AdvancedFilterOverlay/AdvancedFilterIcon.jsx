// SearchHeader/components/AdvancedFilterIcon.jsx
import React from 'react';

const AdvancedFilterIcon = ({ isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-200
        ${isActive 
          ? 'bg-[#9f7539] text-white shadow-md' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
        }
      `}
      title="Advanced Filters"
    >
      <i className="fas fa-sliders-h text-sm"></i>
      <span>Advanced Filters</span>
    </button>
  );
};

export default AdvancedFilterIcon;
