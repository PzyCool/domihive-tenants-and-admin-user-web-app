// src/components/home/properties/components/SearchHeader/AdvancedFilterOverlay/ForRent/ForRentOverlay.jsx
import React from 'react';
import HorizontalScroll from './components/HorizontalScroll';
import PriceSlider from './components/PriceSlider';
import FurnishingOptions from './components/FurnishingOptions';
import AmenitiesGrid from './components/AmenitiesGrid';
import GymToggle from './components/GymToggle';
import PetPolicyToggle from './components/PetPolicyToggle';
import PropertyAgeSelect from './components/PropertyAgeSelect';

const ForRentOverlay = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters
}) => {
  if (!isOpen) return null;

  return (
    <div className="advanced-filter-overlay fixed inset-0 z-50 bg-white flex flex-col md:static md:w-full md:border-t md:border-gray-200 md:shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-bold text-[#0e1f42]">
            <i className="fas fa-sliders-h mr-2 text-[#9f7539]"></i>
            Advanced Rental Filters
          </h3>
          <p className="text-sm text-gray-600 hidden md:block">
            Select multiple options to narrow your search
          </p>
        </div>
        
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          <i className="fas fa-times text-xl text-gray-700"></i>
        </button>
      </div>
      
      {/* Mobile Stack */}
      <div className="px-4 py-4 space-y-6 overflow-y-auto md:hidden">
        <PriceSlider
          min={filters.priceMin || 0}
          max={filters.priceMax || 10000000}
          onPriceChange={(min, max) => onFilterChange({ priceMin: min, priceMax: max })}
        />
        
        <FurnishingOptions
          selected={filters.furnishing || ''}
          onChange={(furnishing) => onFilterChange({ furnishing })}
        />
        
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

        <GymToggle
          enabled={Boolean((filters.amenities || []).includes('gym'))}
          onChange={(enabled) => {
            const current = filters.amenities || [];
            const hasGym = current.includes('gym');
            if (enabled && !hasGym) onFilterChange({ amenities: [...current, 'gym'] });
            if (!enabled && hasGym) onFilterChange({ amenities: current.filter((id) => id !== 'gym') });
          }}
        />
        
        <PetPolicyToggle
          allowed={filters.petsAllowed || false}
          onChange={(petsAllowed) => onFilterChange({ petsAllowed })}
        />
        
        <PropertyAgeSelect
          age={filters.propertyAge || ''}
          onChange={(propertyAge) => onFilterChange({ propertyAge })}
        />
      </div>

      {/* Horizontal Scroll Area (Desktop) */}
      <div className="px-6 py-4 hidden md:block">
        <HorizontalScroll>
          <div className="filter-section min-w-[220px] p-4">
            <PriceSlider
              min={filters.priceMin || 0}
              max={filters.priceMax || 10000000}
              onPriceChange={(min, max) => onFilterChange({ priceMin: min, priceMax: max })}
            />
          </div>
          
          <div className="filter-section min-w-[200px] p-4">
            <FurnishingOptions
              selected={filters.furnishing || ''}
              onChange={(furnishing) => onFilterChange({ furnishing })}
            />
          </div>
          
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
          
          <div className="filter-section min-w-[180px] p-4">
            <PetPolicyToggle
              allowed={filters.petsAllowed || false}
              onChange={(petsAllowed) => onFilterChange({ petsAllowed })}
            />
          </div>
          
          <div className="filter-section min-w-[200px] p-4">
            <PropertyAgeSelect
              age={filters.propertyAge || ''}
              onChange={(propertyAge) => onFilterChange({ propertyAge })}
            />
          </div>
        </HorizontalScroll>
      </div>
      
      {/* Action Buttons (Mobile) */}
      <div className="mt-auto px-4 py-3 border-t border-gray-200 bg-white flex gap-3 md:hidden">
        <button
          onClick={onClearFilters}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
        >
          Clear
        </button>
        <button
          onClick={onApplyFilters}
          className="flex-1 px-4 py-2.5 bg-[#9f7539] text-white rounded-lg hover:bg-[#b58a4a] font-medium"
        >
          Apply
        </button>
      </div>

      {/* Action Buttons (Desktop) */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 hidden md:flex justify-between">
        <button
          onClick={onClearFilters}
          className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
        >
          <i className="fas fa-times mr-2"></i>
          Clear All
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
          >
            Cancel
          </button>
          
          <button
            onClick={onApplyFilters}
            className="px-5 py-2.5 bg-[#9f7539] text-white rounded-lg hover:bg-[#b58a4a] font-medium"
          >
            <i className="fas fa-check mr-2"></i>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForRentOverlay;
