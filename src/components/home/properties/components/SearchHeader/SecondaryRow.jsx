// src/components/home/properties/components/SearchHeader/SecondaryRow.jsx
import React from 'react';
import AreaToggle from './components/AreaToggle';
import LocationDropdown from './components/LocationDropdown';
import PropertyTypeDropdown from './components/PropertyTypeDropdown';
import PriceRangeDropdown from './components/PriceRangeDropdown';
import BedroomsDropdown from './components/BedroomsDropdown';
import ApplyFiltersButton from './components/ApplyFiltersButton';
import ClearButton from './components/ClearButton';

const SecondaryRow = ({ filters, onFilterChange, onClearFilters }) => {
  const handleAreaChange = (areaType) => {
    onFilterChange({ areaType, location: 'all' });
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
    <div className="secondary-row relative z-50 hidden md:block px-4 lg:px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div className="flex flex-col lg:flex-row gap-4">
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
        
        <div className="flex items-end gap-2">
          <ClearButton onClick={onClearFilters} />
          <ApplyFiltersButton 
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default SecondaryRow;
