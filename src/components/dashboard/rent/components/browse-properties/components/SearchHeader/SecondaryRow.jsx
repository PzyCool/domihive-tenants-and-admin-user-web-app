import React from 'react';
import LocationDropdown from './components/LocationDropdown';
import PropertyTypeDropdown from './components/PropertyTypeDropdown';
import PriceRangeDropdown from './components/PriceRangeDropdown';
import BedroomsDropdown from './components/BedroomsDropdown';
import ApplyFilterButton from './components/ApplyFilterButton';
import ClearButton from './components/ClearButton';

const AREA_BY_STATE = {
  Lagos: ['Lagos Island', 'Lagos Mainland'],
  Delta: ['Delta North', 'Delta Central', 'Delta South']
};

const SecondaryRow = ({ filters, onFilterChange, onClearFilters, onApplyFilters, isSyncing = false }) => {
  // Handler functions
  const handleStateChange = (state) => {
    onFilterChange({ state, area: 'all', location: 'all' });
  };

  const handleAreaChange = (area) => {
    onFilterChange({ area, location: 'all' }); // Reset location when area changes
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
  
  const areaOptions = filters.state && filters.state !== 'all' ? (AREA_BY_STATE[filters.state] || []) : [];

  return (
    <div className="secondary-row px-4 lg:px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div className="grid grid-cols-8 items-end gap-3">
        <div className="min-w-0">
            <label className="block h-6 text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide whitespace-nowrap">
              <i className="fas fa-map mr-1 text-[#9f7539]"></i>
              State
            </label>
            <select
              value={filters.state || 'all'}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors text-sm bg-white"
            >
              <option value="all">All States</option>
              <option value="Lagos">Lagos</option>
              <option value="Delta">Delta</option>
            </select>
          </div>

          
          <div className="min-w-0">
  <label className="block h-6 text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide whitespace-nowrap">
    <i className="fas fa-map-marker-alt mr-1 text-[#9f7539]"></i>
    Area
  </label>
  <select
    value={filters.area || 'all'}
    onChange={(e) => handleAreaChange(e.target.value)}
    disabled={!filters.state || filters.state === 'all'}
    className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
      !filters.state || filters.state === 'all'
        ? 'bg-gray-100 cursor-not-allowed border-gray-200'
        : 'bg-white border-gray-300 hover:border-gray-400'
    }`}
  >
    <option value="all">All Areas</option>
    {areaOptions.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
</div>
          
          {/* Location */}
          <div className="min-w-0">
            <label className="block h-6 text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide whitespace-nowrap">
              <i className="fas fa-location-dot mr-1 text-[#9f7539]"></i>
              Location
            </label>
            <LocationDropdown
              value={filters.location || 'all'}
              state={filters.state}
              area={filters.area}
              onChange={handleLocationChange}
            />
          </div>
          
          {/* Property Type */}
          <div className="min-w-0">
            <label className="block h-6 text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide whitespace-nowrap">
              <i className="fas fa-home mr-1 text-[#9f7539]"></i>
              Property Type
            </label>
            <PropertyTypeDropdown
              value={filters.propertyType || 'all'}
              onChange={handlePropertyTypeChange}
            />
          </div>
          
          {/* Bedrooms */}
          <div className="min-w-0">
            <label className="block h-6 text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide whitespace-nowrap">
              <i className="fas fa-bed mr-1 text-[#9f7539]"></i>
              Bedrooms
            </label>
            <BedroomsDropdown
              value={filters.bedrooms || 'all'}
              onChange={handleBedroomsChange}
            />
          </div>
          
          {/* Price Range */}
          <div className="min-w-0">
            <label className="block h-6 text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide whitespace-nowrap">
              <i className="fas fa-tag mr-1 text-[#9f7539]"></i>
              Price Range
            </label>
            <PriceRangeDropdown
              value={filters.priceRange || 'all'}
              onChange={handlePriceRangeChange}
            />
          </div>
          
        <div className="col-span-2 flex items-end justify-end gap-2 min-w-0">
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
