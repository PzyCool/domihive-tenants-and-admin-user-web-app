import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const defaultStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'maintenance', label: 'Maintenance' },
];

const defaultSortOptions = [
  { value: 'newest', label: 'Sort: Newest' },
  { value: 'rent-asc', label: 'Rent: Low -> High' },
  { value: 'rent-desc', label: 'Rent: High -> Low' },
];

const PropertyFilters = ({
  filtersOpen,
  setFiltersOpen,
  search,
  setSearch,
  unitStatus,
  setUnitStatus,
  stateFilter,
  setStateFilter,
  locationFilter,
  setLocationFilter,
  sortBy,
  setSortBy,
  resetFilters,
  statesList,
  locationsList,
  searchPlaceholder = 'Search units...',
  statusOptions = defaultStatusOptions,
  sortOptions = defaultSortOptions,
  secondFilterLabel = 'All States',
  thirdFilterLabel = 'All Locations',
  secondFilterOptions,
  thirdFilterOptions,
}) => {
  const resolvedSecondOptions =
    secondFilterOptions || statesList.map((value) => ({ value, label: value }));
  const resolvedThirdOptions =
    thirdFilterOptions || locationsList.map((value) => ({ value, label: value }));

  return (
    <div className="bg-white dark:bg-[#111827] rounded-lg border border-gray-100 dark:border-white/5 transition-colors">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-gray-500 dark:text-gray-400" />
          <p className="text-sm font-semibold text-[#0e1f42] dark:text-white">Filters</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <X size={14} /> Reset
          </button>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="text-xs font-semibold text-[#9F7539] dark:hover:text-[#9F7539]/80 cursor-pointer"
          >
            {filtersOpen ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="p-4">
          <div className="grid items-center gap-3 grid-cols-[minmax(280px,1fr)_140px_140px_150px_160px]">
            <div className="relative min-w-0">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-200 dark:border-white/10 dark:placeholder-gray-500 bg-transparent dark:text-white text-sm outline-none focus:border-[#9F7539]"
              />
            </div>

            <select
              value={unitStatus}
              onChange={(e) => setUnitStatus(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white text-sm w-full outline-none cursor-pointer"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value} className="dark:bg-[#111827]">
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setLocationFilter('all');
              }}
              className="px-3 py-2 rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white text-sm w-full outline-none cursor-pointer"
            >
              <option value="all" className="dark:bg-[#111827]">
                {secondFilterLabel}
              </option>
              {resolvedSecondOptions.map((option) => (
                <option key={option.value} value={option.value} className="dark:bg-[#111827]">
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white text-sm w-full outline-none cursor-pointer"
            >
              <option value="all" className="dark:bg-[#111827]">
                {thirdFilterLabel}
              </option>
              {resolvedThirdOptions.map((option) => (
                <option key={option.value} value={option.value} className="dark:bg-[#111827]">
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white text-sm w-full outline-none cursor-pointer"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value} className="dark:bg-[#111827]">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyFilters;

