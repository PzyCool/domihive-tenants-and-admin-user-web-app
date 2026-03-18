import React from 'react';

// Remove this import or fix path:
// import { VIEW_TYPES } from '../../utils/constants';

// Instead, define locally or use string values
const VIEW_TYPES = {
  GRID: 'grid',
  LIST: 'list'
};

const ViewToggle = ({ currentView, onChange }) => {
  return (
    <div className="view-toggle flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChange(VIEW_TYPES.GRID)}
        className={`view-toggle-btn h-8 w-8 flex items-center justify-center rounded-md transition-colors ${currentView === VIEW_TYPES.GRID ? 'active bg-white shadow-sm' : 'hover:bg-gray-200'}`}
        title="Grid View"
      >
        <i className="fas fa-th text-sm text-gray-700"></i>
      </button>
      <button
        onClick={() => onChange(VIEW_TYPES.LIST)}
        className={`view-toggle-btn h-8 w-8 flex items-center justify-center rounded-md transition-colors ${currentView === VIEW_TYPES.LIST ? 'active bg-white shadow-sm' : 'hover:bg-gray-200'}`}
        title="List View"
      >
        <i className="fas fa-list text-sm text-gray-700"></i>
      </button>
    </div>
  );
};

export default ViewToggle;
