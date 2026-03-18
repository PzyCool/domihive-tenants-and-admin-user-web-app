// src/components/home/properties/components/SearchHeader/AdvancedFilterOverlay/ForRent/ForRentOverlayIcon.jsx
import React from 'react';

const ForRentOverlayIcon = ({ isActive, onClick }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) onClick();
  };
  
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive 
          ? 'bg-[#9f7539] text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      title="Advanced rental filters"
    >
      <i className="fas fa-sliders-h text-sm"></i>
      <span>Advanced Filters</span>
    </button>
  );
};

export default ForRentOverlayIcon;
