import React, { useEffect, useState } from 'react';
import PrimaryRow from './PrimaryRow';
import SecondaryRow from './SecondaryRow';
import AdvancedFilterOverlay from './AdvancedFilterOverlay/AdvancedFilterOverlay';

const SearchHeader = ({
  filters,
  onFilterChange,
  viewType,
  onViewToggle,
  filterMeta,
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
      bathroomsCount,
      advancedBedrooms,
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
    if (bathroomsCount && bathroomsCount !== 'all') count++;
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
    if (nextExpanded) {
      setShowAdvancedFilters(false);
    }
    onFilterChange?.({ isExpanded: nextExpanded });
  };

  const handleAdvancedToggle = () => {
    setShowAdvancedFilters((prev) => {
      const nextOpen = !prev;
      if (nextOpen) {
        setIsExpanded(false);
        onFilterChange?.({ isExpanded: false });
      }
      return nextOpen;
    });
  };

  const handleClearFilters = () => {
    onFilterChange?.({
      state: 'all',
      area: 'all',
      location: 'all',
      propertyType: 'all',
      bedrooms: 'all',
      bathroomsCount: 'all',
      advancedBedrooms: [],
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
        onAdvancedToggle={handleAdvancedToggle}
        searchDraft={searchDraft}
        onSearchDraftChange={setSearchDraft}
        isSyncing={isSyncing}
        lastSyncedAt={lastSyncedAt}
        onRefresh={onRefresh}
      />

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
            filterMeta={filterMeta}
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
