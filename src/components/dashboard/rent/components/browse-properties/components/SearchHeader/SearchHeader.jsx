import React, { useEffect, useMemo, useState } from 'react';
import PrimaryRow from './PrimaryRow';
import SecondaryRow from './SecondaryRow';
import AdvancedFilterOverlay from './AdvancedFilterOverlay/AdvancedFilterOverlay';

const SearchHeader = ({
  filters,
  onFilterChange,
  viewType,
  onViewToggle,
  isSyncing = false,
  lastSyncedAt,
  onRefresh = () => {},
  onApplyFilters = () => {}
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchDraft, setSearchDraft] = useState(filters.searchQuery || '');

  useEffect(() => {
    setSearchDraft(filters.searchQuery || '');
  }, [filters.searchQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if ((filters.searchQuery || '') !== searchDraft) {
        onFilterChange?.({ searchQuery: searchDraft });
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchDraft, filters.searchQuery, onFilterChange]);

  useEffect(() => {
    let count = 0;
    const {
      state,
      area,
      location,
      propertyType,
      bedrooms,
      advancedBedrooms,
      priceRange,
      managementType,
      priceMin,
      priceMax,
      bathrooms,
      furnishing,
      amenities,
      petsAllowed,
      propertyAge
    } = filters;

    if (state && state !== 'all') count++;
    if (area && area !== 'all') count++;
    if (location && location !== 'all') count++;
    if (propertyType && propertyType !== 'all') count++;
    if (bedrooms && bedrooms !== 'all') count++;
    if (priceRange && priceRange !== 'all') count++;
    if (Array.isArray(advancedBedrooms) && advancedBedrooms.length) count++;
    if (managementType && managementType !== 'all') count++;
    if (priceMin || priceMax) count++;
    if (Array.isArray(bathrooms) && bathrooms.length) count++;
    if (furnishing) count++;
    if (Array.isArray(amenities) && amenities.length) count++;
    if (petsAllowed) count++;
    if (propertyAge) count++;

    setActiveFiltersCount(count);
  }, [filters]);

  const handleToggleExpand = () => {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);
    onFilterChange?.({ isExpanded: nextExpanded });
  };

  const handleClearFilters = () => {
    onFilterChange?.({
      state: 'all',
      area: 'all',
      location: 'all',
      propertyType: 'all',
      bedrooms: 'all',
      advancedBedrooms: [],
      priceRange: 'all',
      managementType: 'all',
      searchQuery: '',
      priceMin: null,
      priceMax: null,
      bathrooms: [],
      furnishing: '',
      amenities: [],
      petsAllowed: false,
      propertyAge: ''
    });
    setSearchDraft('');
  };

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (filters.state && filters.state !== 'all') chips.push({ key: 'state', label: `State: ${filters.state}` });
    if (filters.area && filters.area !== 'all') chips.push({ key: 'area', label: `Area: ${filters.area}` });
    if (filters.location && filters.location !== 'all') chips.push({ key: 'location', label: `Location: ${filters.location}` });
    if (filters.propertyType && filters.propertyType !== 'all') chips.push({ key: 'propertyType', label: `Type: ${filters.propertyType}` });
    if (filters.bedrooms && filters.bedrooms !== 'all') chips.push({ key: 'bedrooms', label: `Beds: ${filters.bedrooms}` });
    if (Array.isArray(filters.advancedBedrooms) && filters.advancedBedrooms.length)
      chips.push({ key: 'advancedBedrooms', label: `Advanced Beds: ${filters.advancedBedrooms.join(', ')}` });
    if (filters.priceRange && filters.priceRange !== 'all') chips.push({ key: 'priceRange', label: `Price: ${filters.priceRange}` });
    if (filters.managementType && filters.managementType !== 'all') chips.push({ key: 'managementType', label: `Management: ${filters.managementType}` });
    if (filters.furnishing) chips.push({ key: 'furnishing', label: `Furnishing: ${filters.furnishing}` });
    if (filters.propertyAge) chips.push({ key: 'propertyAge', label: `Age: ${filters.propertyAge}` });
    if (filters.petsAllowed) chips.push({ key: 'petsAllowed', label: 'Pets allowed' });
    if (Array.isArray(filters.amenities) && filters.amenities.length)
      chips.push({ key: 'amenities', label: `Amenities: ${filters.amenities.length}` });
    if (Array.isArray(filters.bathrooms) && filters.bathrooms.length)
      chips.push({ key: 'bathrooms', label: `Baths: ${filters.bathrooms.join(', ')}` });
    return chips;
  }, [filters]);

  const clearSingleFilter = (chipKey) => {
    const resetMap = {
      state: 'all',
      area: 'all',
      location: 'all',
      propertyType: 'all',
      bedrooms: 'all',
      advancedBedrooms: [],
      priceRange: 'all',
      managementType: 'all',
      furnishing: '',
      propertyAge: '',
      petsAllowed: false,
      amenities: [],
      bathrooms: []
    };
    onFilterChange?.({ [chipKey]: resetMap[chipKey] });
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
      <PrimaryRow
        filters={filters}
        onFilterChange={onFilterChange}
        viewType={viewType}
        onViewToggle={onViewToggle}
        activeFiltersCount={activeFiltersCount}
        isExpanded={isExpanded}
        onToggleExpand={handleToggleExpand}
        showAdvancedFilters={showAdvancedFilters}
        onAdvancedToggle={() => setShowAdvancedFilters((prev) => !prev)}
        searchDraft={searchDraft}
        onSearchDraftChange={setSearchDraft}
        isSyncing={isSyncing}
        lastSyncedAt={lastSyncedAt}
        onRefresh={onRefresh}
      />

      {activeFilterChips.length > 0 && (
        <div className="px-4 lg:px-6 py-2 border-t border-gray-100 bg-[#fcfcfc] flex flex-wrap gap-2">
          {activeFilterChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => clearSingleFilter(chip.key)}
              className="text-xs px-2.5 py-1 rounded-full border border-[#e2e8f0] bg-white hover:border-[#9f7539]/40 text-[#475467]"
            >
              {chip.label} <span className="ml-1">×</span>
            </button>
          ))}
          <button
            onClick={handleClearFilters}
            className="text-xs px-2.5 py-1 rounded-full border border-[#f1d6af] bg-[#fff7ed] text-[#9f7539] font-semibold"
          >
            Clear all
          </button>
        </div>
      )}

      <div
        className={`
        transition-all duration-300 ease-out
        ${isExpanded ? 'max-h-96 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'}
      `}
      >
        {isExpanded && (
          <SecondaryRow
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={handleClearFilters}
            onApplyFilters={onApplyFilters}
            isSyncing={isSyncing}
          />
        )}
      </div>

      <AdvancedFilterOverlay
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={filters}
        onFilterChange={onFilterChange}
        onApplyFilters={() => {
          onApplyFilters?.();
          setShowAdvancedFilters(false);
        }}
        onClearFilters={() => {
          onFilterChange({
            priceMin: null,
            priceMax: null,
            advancedBedrooms: [],
            bathrooms: [],
            furnishing: '',
            amenities: [],
            petsAllowed: false,
            propertyAge: ''
          });
          setShowAdvancedFilters(false);
        }}
        activeFiltersCount={activeFiltersCount}
        isSyncing={isSyncing}
      />
    </div>
  );
};

export default SearchHeader;
