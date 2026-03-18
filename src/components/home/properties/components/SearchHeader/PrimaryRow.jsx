// src/components/home/properties/components/SearchHeader/PrimaryRow.jsx
import React from 'react';
import SearchBar from './components/SearchBar';
import FilterBadge from './components/FilterBadge';
import ViewToggle from './components/ViewToggle';
import ManagementDropdown from './components/ManagementDropdown';
import ExpandButton from './components/ExpandButton';
import ForRentOverlayIcon from './AdvancedFilterOverlay/ForRent/ForRentOverlayIcon';

const PrimaryRow = ({
  filters,
  onFilterChange,
  viewType,
  onViewToggle,
  activeFiltersCount,
  isExpanded,
  onToggleExpand,
  showAdvancedFilters,
  onAdvancedToggle
}) => {
  const handleSearch = (searchQuery) => {
    onFilterChange({ searchQuery });
  };
  
  const handleViewChange = (type) => {
    if (onViewToggle) {
      onViewToggle(type);
    }
  };
  
  const handleManagementChange = (managementType) => {
    onFilterChange({ managementType });
  };
  
  // Listing type stays on rent (for sale removed)

  return (
    <div className="primary-row px-4 lg:px-6 py-3 border-b border-[#0e1f42]/10">
      <div className="flex flex-col gap-3 md:grid md:grid-cols-[minmax(280px,1.35fr)_auto_auto] md:items-center md:gap-4">
        <div className="w-full">
          <SearchBar
            value={filters.searchQuery || ''}
            onChange={handleSearch}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap md:justify-center">
          <FilterBadge
            count={activeFiltersCount}
            onClick={onToggleExpand}
          />

          {/* Listing Type Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <span className="px-3 py-1.5 rounded text-sm font-medium bg-white shadow-sm text-[#9f7539]">
              For Rent
            </span>
          </div>

          <ForRentOverlayIcon
            isActive={showAdvancedFilters}
            onClick={onAdvancedToggle}
          />
        </div>

        <div className="hidden md:flex items-center gap-3 justify-end">
        {/* <ViewToggle
          currentView={viewType}
          onChange={handleViewChange}
        /> */}
        
        <ManagementDropdown
          value={filters.managementType || 'all'}
          onChange={handleManagementChange}
        />
        
        <ExpandButton
          isExpanded={isExpanded}
          onClick={onToggleExpand}
        />
        </div>
      </div>
    </div>
  );
};

export default PrimaryRow;
