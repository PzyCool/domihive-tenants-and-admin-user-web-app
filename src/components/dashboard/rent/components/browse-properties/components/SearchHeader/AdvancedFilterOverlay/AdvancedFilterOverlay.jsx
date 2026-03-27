import React from 'react';
import HorizontalScroll from './components/HorizontalScroll';

// Import components
import PriceSlider from './components/PriceSlider';
import FurnishingOptions from './components/FurnishingOptions';
import AmenitiesGrid from './components/AmenitiesGrid';
import GymToggle from './components/GymToggle';
import PetPolicyToggle from './components/PetPolicyToggle';
import PropertyAgeSelect from './components/PropertyAgeSelect';

const AdvancedFilterOverlay = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  activeFiltersCount = 0,
  isSyncing = false
}) => {
  if (!isOpen) return null;
  
  return (
    <div 
      className="relative w-full bg-white rounded-b-xl shadow-2xl z-[60] border border-gray-200 animate-slide-down transition-all duration-300 ease-in-out"
      style={{
        borderLeft: '3px solid #9f7539',
        boxShadow: '0 10px 25px -5px rgba(159, 117, 57, 0.1), 0 10px 10px -5px rgba(159, 117, 57, 0.04)'
      }}
    >
      {/* Header with accent color */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-white to-[#9f7539]/5">
        <div>
          <h3 className="text-lg font-bold text-[#0e1f42]">
            <i className="fas fa-sliders-h mr-2 text-[#9f7539]"></i>
            Advanced Filters
          </h3>
          <p className="text-sm text-gray-600">
            Select multiple options to narrow your search
          </p>
          <p className="text-xs text-[#9f7539] font-semibold mt-1">
            {activeFiltersCount} active filters
          </p>
        </div>
        
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full hover:bg-[#9f7539]/10 flex items-center justify-center transition-colors"
          title="Close"
        >
          <i className="fas fa-times text-xl text-gray-700 hover:text-[#9f7539]"></i>
        </button>
      </div>
      
      {/* Horizontal Scroll Container */}
      <HorizontalScroll>
        {/* Price Range */}
        <div className="filter-section min-w-[220px] p-4">
          <PriceSlider
            min={filters.priceMin || 0}
            max={filters.priceMax || 10000000}
            onPriceChange={(min, max) => onFilterChange({ priceMin: min, priceMax: max })}
          />
        </div>
        
        {/* Furnishing */}
        <div className="filter-section min-w-[200px] p-4">
          <FurnishingOptions
            selected={filters.furnishing || ''}
            onChange={(furnishing) => onFilterChange({ furnishing })}
          />
        </div>
        
        {/* Amenities */}
        <div className="filter-section min-w-[220px] p-4">
          <AmenitiesGrid
            selected={filters.amenities || []}
            onToggle={(amenityId) => {
              const current = filters.amenities || [];
              const newAmenities = current.includes(amenityId)
                ? current.filter(id => id !== amenityId)
                : [...current, amenityId];
              onFilterChange({ amenities: newAmenities });
            }}
          />
        </div>

        <div className="filter-section min-w-[180px] p-4">
          <GymToggle
            enabled={Boolean((filters.amenities || []).includes('gym'))}
            onChange={(enabled) => {
              const current = filters.amenities || [];
              const hasGym = current.includes('gym');
              if (enabled && !hasGym) onFilterChange({ amenities: [...current, 'gym'] });
              if (!enabled && hasGym) onFilterChange({ amenities: current.filter((id) => id !== 'gym') });
            }}
          />
        </div>
        
        {/* Pet Policy */}
        <div className="filter-section min-w-[180px] p-4">
          <PetPolicyToggle
            allowed={filters.petsAllowed || false}
            onChange={(petsAllowed) => onFilterChange({ petsAllowed })}
          />
        </div>
        
        {/* Property Age */}
        <div className="filter-section min-w-[200px] p-4">
          <PropertyAgeSelect
            age={filters.propertyAge || ''}
            onChange={(propertyAge) => onFilterChange({ propertyAge })}
          />
        </div>
      </HorizontalScroll>
      
      {/* Action Buttons */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-[#9f7539]/5 flex justify-between">
        <button
          type="button"
          onClick={onClearFilters}
          className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-[#9f7539]/10 transition-colors font-medium flex items-center"
        >
          <i className="fas fa-times mr-2"></i>
          Clear All
        </button>
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-[#9f7539]/10 transition-colors font-medium"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={onApplyFilters}
            disabled={isSyncing}
            className="px-5 py-2.5 bg-[#9f7539] text-white rounded-lg hover:bg-[#b58a4a] transition-colors font-medium flex items-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-check mr-2"></i>
            {isSyncing ? 'Applying...' : 'Apply Filters'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilterOverlay;
