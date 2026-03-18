import React, { useState, useEffect } from 'react';
import PrimaryRow from './PrimaryRow';
import SecondaryRow from './SecondaryRow';
import AdvancedFilterOverlay from './AdvancedFilterOverlay/AdvancedFilterOverlay';

const SearchHeader = ({ 
  filters, 
  onFilterChange,
  viewType,
  onViewToggle
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    const { areaType, location, propertyType, bedrooms, priceRange, managementType } = filters;
    
    if (areaType && areaType !== 'all') count++;
    if (location && location !== 'all') count++;
    if (propertyType && propertyType !== 'all') count++;
    if (bedrooms && bedrooms !== 'all') count++;
    if (priceRange && priceRange !== 'all') count++;
    if (managementType && managementType !== 'all') count++;
    
    setActiveFiltersCount(count);
  }, [filters]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };
  
  // Handle expand/collapse
  const handleToggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // Tell parent about expansion state
    if (onFilterChange) {
      onFilterChange({ isExpanded: newExpandedState });
    }
  };
  
  // Handle clear all filters
  const handleClearFilters = () => {
    if (onFilterChange) {
      onFilterChange({
        areaType: 'all',
        location: 'all',
        propertyType: 'all',
        bedrooms: 'all',
        priceRange: 'all',
        managementType: 'all',
        searchQuery: filters.searchQuery || ''
      });
    }
  };

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

const handleAdvancedToggle = () => {
  setShowAdvancedFilters(!showAdvancedFilters);
};
  
return (
  <div 
    className="search-header w-full bg-white border-b border-gray-200 transition-all duration-300 ease-in-out"
    style={{
      position: 'sticky',
      top: 0,
      zIndex: 1100,
      borderBottom: '2px solid rgba(159, 117, 57, 0.3)'
    }}
  >
    
    {/* Primary Row - Always Visible */}
    <PrimaryRow
      filters={filters}
      onFilterChange={handleFilterChange}
      viewType={viewType}
      onViewToggle={onViewToggle}
      activeFiltersCount={activeFiltersCount}
      isExpanded={isExpanded}
      onToggleExpand={handleToggleExpand}
      showAdvancedFilters={showAdvancedFilters} // ADD THIS
      onAdvancedToggle={handleAdvancedToggle}   // ADD THIS
    />
      
      {/* Secondary Row - Slide Down Animation */}
      <div className={`
        transition-all duration-300 ease-out
        ${isExpanded 
          ? 'max-h-96 opacity-100 translate-y-0' 
          : 'max-h-0 opacity-0 -translate-y-2'
        }
      `}>
        {isExpanded && (
          <SecondaryRow
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        )}
      </div>
    
    {/* ADD THIS: Advanced Filter Overlay */}
    <AdvancedFilterOverlay
      isOpen={showAdvancedFilters}
      onClose={() => setShowAdvancedFilters(false)}
      filters={filters}
      onFilterChange={handleFilterChange}
      onApplyFilters={() => setShowAdvancedFilters(false)}
      onClearFilters={() => {
        onFilterChange({
          priceMin: null,
          priceMax: null,
          bedrooms: [],
          bathrooms: [],
          furnishing: '',
          amenities: [],
          petsAllowed: false,
          propertyAge: ''
        });
        setShowAdvancedFilters(false);
      }}
    />
  </div>
  );
};

export default SearchHeader;
