// src/components/home/properties/components/SearchHeader/SearchHeader.jsx
import React, { useState, useEffect } from 'react';
import PrimaryRow from './PrimaryRow';
import SecondaryRow from './SecondaryRow';
import ForRentOverlay from './AdvancedFilterOverlay/ForRent/ForRentOverlay';
import ForSalesOverlay from './AdvancedFilterOverlay/ForSales/ForSalesOverlay';

const SearchHeader = ({ 
  filters, 
  onFilterChange,
  viewType,
  onViewToggle
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  useEffect(() => {
    let count = 0;
    const { areaType, location, propertyType, bedrooms, priceRange, managementType, listingType } = filters;
    
    if (areaType && areaType !== 'all') count++;
    if (location && location !== 'all') count++;
    if (propertyType && propertyType !== 'all') count++;
    if (bedrooms && bedrooms !== 'all') count++;
    if (priceRange && priceRange !== 'all') count++;
    if (managementType && managementType !== 'all') count++;
    if (listingType && listingType !== 'rent') count++;
    
    setActiveFiltersCount(count);
  }, [filters]);
  
  const handleFilterChange = (newFilters) => {
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };
  
  const handleToggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    if (onFilterChange) {
      onFilterChange({ isExpanded: newExpandedState });
    }
  };
  
  const handleClearFilters = () => {
    if (onFilterChange) {
      onFilterChange({
        areaType: 'all',
        location: 'all',
        propertyType: 'all',
        bedrooms: 'all',
        priceRange: 'all',
        managementType: 'all',
        listingType: 'rent',
        searchQuery: filters.searchQuery || ''
      });
    }
  };

  const handleAdvancedToggle = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };
  
  return (
    <div className="search-header relative z-50 bg-white border-b-2 border-[#9f7539] shadow-sm transition-all duration-300 ease-in-out">
      <PrimaryRow
        filters={filters}
        onFilterChange={handleFilterChange}
        viewType={viewType}
        onViewToggle={onViewToggle}
        activeFiltersCount={activeFiltersCount}
        isExpanded={isExpanded}
        onToggleExpand={handleToggleExpand}
        showAdvancedFilters={showAdvancedFilters}
        onAdvancedToggle={handleAdvancedToggle}
      />
      
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
      
      {showAdvancedFilters && (
        filters.listingType === 'rent' ? (
          <ForRentOverlay
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
        ) : (
          <ForSalesOverlay
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
        )
      )}
    </div>
  );
};

export default SearchHeader;
