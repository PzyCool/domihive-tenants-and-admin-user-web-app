// src/components/home/properties/components/SearchHeader/SecondaryRow.jsx
import React from 'react';
import LocationDropdown from './components/LocationDropdown';
import PropertyTypeDropdown from './components/PropertyTypeDropdown';
import BathroomsDropdown from './components/BathroomsDropdown';
import BedroomsDropdown from './components/BedroomsDropdown';
import ApplyFiltersButton from './components/ApplyFiltersButton';
import ClearButton from './components/ClearButton';

const FALLBACK_AREA_BY_STATE = {
  Lagos: ['Lagos Island', 'Lagos Mainland'],
  Delta: ['Delta North', 'Delta Central', 'Delta South']
};

const SecondaryRow = ({ filters, onFilterChange, onClearFilters, filterMeta }) => {
  const handleStateChange = (state) => {
    onFilterChange({ state, area: 'all', location: 'all' });
  };

  const handleAreaChange = (area) => {
    onFilterChange({ area, location: 'all' });
  };
  
  const handleLocationChange = (location) => {
    onFilterChange({ location });
  };
  
  const handlePropertyTypeChange = (propertyType) => {
    onFilterChange({ propertyType });
  };
  
  const handleBathroomsChange = (bathroomsCount) => {
    onFilterChange({ bathroomsCount });
  };
  
  const handleBedroomsChange = (bedrooms) => {
    onFilterChange({ bedrooms });
  };
  
  const stateOptions = filterMeta?.states?.length ? filterMeta.states : Object.keys(FALLBACK_AREA_BY_STATE);
  const areaByState =
    filterMeta?.areasByState && Object.keys(filterMeta.areasByState).length
      ? filterMeta.areasByState
      : FALLBACK_AREA_BY_STATE;
  const areaOptions = filters.state && filters.state !== 'all' ? (areaByState[filters.state] || []) : [];

  return (
    <div className="secondary-row relative z-50 hidden md:block px-4 lg:px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
              <i className="fas fa-map mr-1 text-[#9f7539]"></i>
              State
            </label>
            <select
              value={filters.state || 'all'}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors text-sm bg-white"
            >
              <option value="all">All States</option>
              {stateOptions.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
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
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
              <i className="fas fa-location-dot mr-1 text-[#9f7539]"></i>
              Location
            </label>
            <LocationDropdown
              value={filters.location || 'all'}
              state={filters.state}
              area={filters.area}
              locationsByArea={filterMeta?.locationsByArea}
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
              options={filterMeta?.propertyTypeOptions}
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
              <i className="fas fa-bath mr-1 text-[#9f7539]"></i>
              Bathrooms
            </label>
            <BathroomsDropdown
              value={filters.bathroomsCount || 'all'}
              onChange={handleBathroomsChange}
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
