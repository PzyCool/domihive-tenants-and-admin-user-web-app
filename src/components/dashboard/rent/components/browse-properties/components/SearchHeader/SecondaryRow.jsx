import React from 'react';
import AreaToggle from './components/AreaToggle';
import LocationDropdown from './components/LocationDropdown';
import PropertyTypeDropdown from './components/PropertyTypeDropdown';
import PriceRangeDropdown from './components/PriceRangeDropdown';
import BedroomsDropdown from './components/BedroomsDropdown';
import ApplyFilterButton from './components/ApplyFilterButton';
import ClearButton from './components/ClearButton';

const SecondaryRow = ({ filters, onFilterChange, onClearFilters, onApplyFilters, isSyncing = false }) => {
  // Handler functions
  const handleAreaChange = (areaType) => {
    onFilterChange({ areaType, location: 'all' }); // Reset location when area changes
  };
  
  const handleLocationChange = (location) => {
    onFilterChange({ location });
  };
  
  const handlePropertyTypeChange = (propertyType) => {
    onFilterChange({ propertyType });
  };
  
  const handlePriceRangeChange = (priceRange) => {
    onFilterChange({ priceRange });
  };
  
  const handleBedroomsChange = (bedrooms) => {
    onFilterChange({ bedrooms });
  };
  
  return (
    <div className="secondary-row px-4 lg:px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Filter Grid - 5 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 flex-1">
          
          <div>
  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
    <i className="fas fa-map-marker-alt mr-1 text-[#9f7539]"></i>
    Area
  </label>
  <AreaToggle
    value={filters.areaType || 'all'}
    onChange={handleAreaChange}
  />
</div>
          
          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
              <i className="fas fa-location-dot mr-1 text-[#9f7539]"></i>
              Location
            </label>
            <LocationDropdown
              value={filters.location || 'all'}
              areaType={filters.areaType}
              onChange={handleLocationChange}
            />
          </div>
          
          {/* Property Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
              <i className="fas fa-home mr-1 text-[#9f7539]"></i>
              Property Type
            </label>
            <PropertyTypeDropdown
              value={filters.propertyType || 'all'}
              onChange={handlePropertyTypeChange}
            />
          </div>
          
          {/* Bedrooms */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
              <i className="fas fa-bed mr-1 text-[#9f7539]"></i>
              Bedrooms
            </label>
            <BedroomsDropdown
              value={filters.bedrooms || 'all'}
              onChange={handleBedroomsChange}
            />
          </div>
          
          {/* Price Range */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
              <i className="fas fa-tag mr-1 text-[#9f7539]"></i>
              Price Range
            </label>
            <PriceRangeDropdown
              value={filters.priceRange || 'all'}
              onChange={handlePriceRangeChange}
            />
          </div>
          
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-end gap-2">
          <ClearButton onClick={onClearFilters} disabled={isSyncing} />
          <ApplyFilterButton 
            onClick={() => {
              onApplyFilters?.();
            }}
            disabled={isSyncing}
          />
        </div>
      </div>
    </div>
  );
};

export default SecondaryRow;
