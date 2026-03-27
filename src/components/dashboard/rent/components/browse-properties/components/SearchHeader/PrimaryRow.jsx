import React from 'react';

// Import components from the SearchHeader/components folder
import SearchBar from './components/SearchBar';
import FilterBadge from './components/FilterBadge';
import ViewToggle from './components/ViewToggle';
import ManagementDropdown from './components/ManagementDropdown';
import ExpandButton from './components/ExpandButton';
import AdvancedFilterIcon from "./AdvancedFilterOverlay/AdvancedFilterIcon";


const PrimaryRow = ({
  filters,
  onFilterChange,
  viewType,
  onViewToggle,
  activeFiltersCount,
  isExpanded,
  onToggleExpand,
  showAdvancedFilters, // ADD THIS
  onAdvancedToggle,     // ADD THIS
  searchDraft,
  onSearchDraftChange,
  isSyncing,
  lastSyncedAt,
  onRefresh
}) => {
  // Handle search
  const handleSearch = (searchQuery) => {
    onFilterChange({ searchQuery });
  };
  
  // Handle view toggle
  const handleViewChange = (type) => {
    if (onViewToggle) {
      onViewToggle(type);
    }
  };
  
  // Handle management type change
  const handleManagementChange = (managementType) => {
    onFilterChange({ managementType });
  };
  
  return (
    <div className="primary-row flex items-center justify-between px-4 lg:px-6 py-3 border-b border-gray-100">
      {/* Left Section */}
      <div className="flex items-center gap-3 lg:gap-4 flex-1">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchDraft ?? (filters.searchQuery || '')}
            onChange={onSearchDraftChange || handleSearch}
          />
        </div>
        
        {/* Filter Badge */}
        <FilterBadge
          count={activeFiltersCount}
          onClick={onToggleExpand}
        />

        {/* NEW: Advanced Filter Icon */}
        <AdvancedFilterIcon
          isActive={showAdvancedFilters}
          onClick={onAdvancedToggle}
        />
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-2 lg:gap-3 ml-3 lg:ml-5">
        {/* View Toggle */}
        <ViewToggle
          currentView={viewType}
          onChange={handleViewChange}
        />
        
        {/* Management Dropdown */}
        <ManagementDropdown
          value={filters.managementType || 'all'}
          onChange={handleManagementChange}
        />
        
        {/* Expand/Collapse Button */}
        <ExpandButton
          isExpanded={isExpanded}
          onClick={onToggleExpand}
        />
      </div>
    </div>
  );
};

export default PrimaryRow;
