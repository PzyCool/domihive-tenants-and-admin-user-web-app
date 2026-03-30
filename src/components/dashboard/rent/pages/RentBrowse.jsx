import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VIEW_TYPES, ITEMS_PER_PAGE } from '../components/browse-properties/utils/constants';
import PropertyDetailsModal from '../components/property-details/PropertyDetailsModal';
import BookInspectionPage from '../components/book-inspection/BookInspectionPage';
import { useProperties } from '../contexts/PropertiesContext';
import { fetchBrowseSnapshot } from '../services/mockBrowseService';
import SearchHeader from '../components/browse-properties/components/SearchHeader/SearchHeader';
import PropertyGrid from '../components/browse-properties/components/PropertyGrid/PropertyGrid';
import { buildListingFilterMeta } from '../../../shared/services/adminListings';

const DEFAULT_FILTERS = {
  searchQuery: '',
  state: 'all',
  area: 'all',
  location: 'all',
  propertyType: 'all',
  bedrooms: 'all',
  bathroomsCount: 'all',
  managementType: 'all',
  sortBy: 'newest',
  isExpanded: false,
  amenities: [],
  furnishing: '',
  petsAllowed: false,
  propertyAge: '',
  priceMin: null,
  priceMax: null
};

const FILTER_KEYS = [
  'searchQuery',
  'state',
  'area',
  'location',
  'propertyType',
  'bedrooms',
  'bathroomsCount',
  'managementType',
  'sortBy',
  'priceMin',
  'priceMax',
  'furnishing',
  'propertyAge',
  'petsAllowed'
];

const parseList = (value) => (value ? value.split(',').filter(Boolean) : []);

const parseParamsToState = (searchParams) => {
  const nextFilters = { ...DEFAULT_FILTERS };
  FILTER_KEYS.forEach((key) => {
    const value = searchParams.get(key);
    if (value !== null) {
      if (key === 'priceMin' || key === 'priceMax') {
        nextFilters[key] = value === '' ? null : Number(value);
      } else if (key === 'petsAllowed') {
        nextFilters[key] = value === 'true';
      } else {
        nextFilters[key] = value;
      }
    }
  });

  nextFilters.amenities = parseList(searchParams.get('amenities'));

  const nextViewType = searchParams.get('view') || VIEW_TYPES.LIST;
  const nextPage = Math.max(1, Number(searchParams.get('page') || '1'));

  return { nextFilters, nextViewType, nextPage };
};

const buildSearchParamsFromState = ({ filters, currentPage, viewType }) => {
  const params = new URLSearchParams();

  FILTER_KEYS.forEach((key) => {
    const value = filters[key];
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      value !== 'all' &&
      !(key === 'petsAllowed' && value === false)
    ) {
      params.set(key, String(value));
    }
  });

  if (Array.isArray(filters.amenities) && filters.amenities.length) {
    params.set('amenities', filters.amenities.join(','));
  }

  if (viewType && viewType !== VIEW_TYPES.LIST) {
    params.set('view', viewType);
  }
  if (currentPage > 1) {
    params.set('page', String(currentPage));
  }

  return params;
};

const applyFilters = (allProperties, filters) => {
  const normalize = (value) =>
    String(value || '')
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

  let filtered = [...allProperties];

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (property) =>
        property.title.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.description.toLowerCase().includes(query)
    );
  }

  if (filters.managementType !== 'all') {
    filtered = filtered.filter((property) => property.managementType === filters.managementType);
  }

  if (filters.state !== 'all') {
    filtered = filtered.filter((property) => property.state === filters.state);
  }

  if (filters.area !== 'all') {
    filtered = filtered.filter((property) => property.area === filters.area);
  }

  if (filters.location !== 'all') {
    filtered = filtered.filter((property) => property.location.includes(filters.location));
  }

  if (filters.propertyType !== 'all') {
    filtered = filtered.filter(
      (property) => normalize(property.propertyType) === normalize(filters.propertyType)
    );
  }

  if (filters.bedrooms !== 'all') {
    if (filters.bedrooms === '4') {
      filtered = filtered.filter((property) => property.bedrooms >= 4);
    } else {
      filtered = filtered.filter((property) => property.bedrooms === Number(filters.bedrooms));
    }
  }

  if (filters.bathroomsCount !== 'all') {
    if (filters.bathroomsCount === '4') {
      filtered = filtered.filter((property) => Number(property.bathrooms) >= 4);
    } else {
      filtered = filtered.filter(
        (property) => Number(property.bathrooms) === Number(filters.bathroomsCount)
      );
    }
  }

  if (typeof filters.priceMin === 'number' && !Number.isNaN(filters.priceMin)) {
    filtered = filtered.filter((property) => property.price >= filters.priceMin);
  }

  if (typeof filters.priceMax === 'number' && !Number.isNaN(filters.priceMax)) {
    filtered = filtered.filter((property) => property.price <= filters.priceMax);
  }

  if (filters.furnishing) {
    filtered = filtered.filter((property) => property.furnishing === filters.furnishing);
  }

  if (filters.propertyAge) {
    filtered = filtered.filter((property) => property.propertyAge === filters.propertyAge);
  }

  if (filters.petsAllowed) {
    filtered = filtered.filter((property) => property.petsAllowed);
  }

  if (Array.isArray(filters.amenities) && filters.amenities.length) {
    filtered = filtered.filter((property) => {
      const ids = property.amenityIds || [];
      return filters.amenities.every((amenity) => ids.includes(amenity));
    });
  }

  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      case 'featured':
        return Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
      case 'verified':
        return Number(Boolean(b.isVerified)) - Number(Boolean(a.isVerified));
      default:
        return 0;
    }
  });

  return filtered;
};

const sliceForPage = (items, page) => {
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
};

const RentBrowse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toggleFavorite, isFavorite, favorites } = useProperties();

  const [allProperties, setAllProperties] = useState([]);
  const initialFromUrl = useMemo(() => parseParamsToState(searchParams), [searchParams]);
  const [filters, setFilters] = useState(initialFromUrl.nextFilters);
  const [viewType, setViewType] = useState(initialFromUrl.nextViewType);
  const [currentPage, setCurrentPage] = useState(initialFromUrl.nextPage);
  const [totalPages, setTotalPages] = useState(1);
  const [filterMeta, setFilterMeta] = useState({
    states: [],
    areasByState: {},
    locationsByArea: {},
    propertyTypeOptions: []
  });

  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [showBookInspection, setShowBookInspection] = useState(false);
  const [selectedPropertyForBooking, setSelectedPropertyForBooking] = useState(null);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filterSyncing, setFilterSyncing] = useState(false);
  const [error, setError] = useState('');
  const [syncedAt, setSyncedAt] = useState('');
  const [isStale, setIsStale] = useState(false);

  const syncBrowse = async ({ forceRefresh = false } = {}) => {
    if (allProperties.length === 0 || forceRefresh) setLoading(true);
    else setSyncing(true);
    setError('');
    try {
      const snapshot = await fetchBrowseSnapshot({ forceRefresh });
      const items = snapshot.items || [];
      setAllProperties(items);
      setFilterMeta(buildListingFilterMeta(items));
      setSyncedAt(snapshot.syncedAt || new Date().toISOString());
      setIsStale(false);
    } catch (syncError) {
      setError(syncError?.message || 'Could not load properties right now.');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    syncBrowse();
  }, []);

  useEffect(() => {
    const { nextFilters, nextViewType, nextPage } = parseParamsToState(searchParams);
    setFilters((prev) => {
      const prevSerialized = JSON.stringify(prev);
      const nextSerialized = JSON.stringify(nextFilters);
      return prevSerialized === nextSerialized ? prev : nextFilters;
    });
    setViewType((prev) => (prev === nextViewType ? prev : nextViewType));
    setCurrentPage((prev) => (prev === nextPage ? prev : nextPage));
  }, [searchParams]);

  useEffect(() => {
    if (!syncedAt) return undefined;
    const timer = window.setTimeout(() => setIsStale(true), 60_000);
    return () => window.clearTimeout(timer);
  }, [syncedAt]);

  useEffect(() => {
    const nextParams = buildSearchParamsFromState({ filters, currentPage, viewType });
    const current = searchParams.toString();
    const next = nextParams.toString();
    if (current !== next) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [filters, currentPage, viewType, searchParams, setSearchParams]);

  const filteredProperties = useMemo(() => applyFilters(allProperties, filters), [allProperties, filters]);
  const displayedProperties = useMemo(
    () => sliceForPage(filteredProperties, currentPage),
    [filteredProperties, currentPage]
  );

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredProperties.length / ITEMS_PER_PAGE));
    setTotalPages(pages);
    if (currentPage > pages) setCurrentPage(1);
  }, [filteredProperties.length, currentPage]);

  const displayedWithFavorites = useMemo(
    () =>
      displayedProperties.map((property) => ({
        ...property,
        isFavorite: isFavorite(property.id || property.propertyId)
      })),
    [displayedProperties, favorites, isFavorite]
  );

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  useEffect(() => {
    if (loading) return undefined;
    setFilterSyncing(true);
    const timer = window.setTimeout(() => setFilterSyncing(false), 250);
    return () => window.clearTimeout(timer);
  }, [filters, loading]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookNowClick = (propertyId) => {
    const matchedProperty =
      allProperties.find((property) => (property.id || property.propertyId) === propertyId) || null;
    const normalized = String(matchedProperty?.tenantStatus || matchedProperty?.status || '').toLowerCase();
    const isBookable =
      matchedProperty?.canBook !== false && !['reserved', 'occupied', 'rented'].includes(normalized);
    if (!isBookable) {
      window.alert(
        normalized === 'reserved'
          ? 'This unit is currently reserved by another applicant.'
          : 'This unit is occupied and not available for booking.'
      );
      return;
    }
    setSelectedPropertyForBooking(matchedProperty || { id: propertyId });
    setShowBookInspection(true);
    setShowPropertyDetails(false);
  };

  const handleBookFromDetails = (propertyId) => {
    handleBookNowClick(propertyId);
  };

  const handlePropertyClick = (propertyId) => {
    setSelectedPropertyId(propertyId);
    setShowPropertyDetails(true);
    setShowBookInspection(false);
  };

  const handleFavoriteToggle = (property) => {
    if (property) toggleFavorite(property);
  };

  if (showBookInspection) {
    return (
      <div className="rent-browse-container min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <BookInspectionPage
          propertyId={selectedPropertyForBooking?.propertyId || selectedPropertyForBooking?.id}
          propertyData={selectedPropertyForBooking}
        />
      </div>
    );
  }

  if (showPropertyDetails) {
    return (
      <div className="rent-browse-container min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <PropertyDetailsModal
          propertyId={selectedPropertyId}
          isOpen={showPropertyDetails}
          onClose={() => setShowPropertyDetails(false)}
          onBookInspection={handleBookFromDetails}
        />
      </div>
    );
  }

  return (
    <div className="rent-browse-container min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white w-full" style={{ position: 'sticky', top: 0, zIndex: 1100 }}>
        <SearchHeader
          filters={filters}
          onFilterChange={handleFilterChange}
          viewType={viewType}
          onViewToggle={setViewType}
          filterMeta={filterMeta}
          isSyncing={syncing || filterSyncing}
          lastSyncedAt={syncedAt}
          onRefresh={() => syncBrowse({ forceRefresh: true })}
          onApplyFilters={() => {
            setFilterSyncing(true);
            window.setTimeout(() => setFilterSyncing(false), 250);
          }}
        />
      </div>

      <div className="p-4 md:p-6 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-[#e2e8f0] p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0e1f42] mb-1">Browse Properties</h1>
              <p className="text-gray-600 text-sm">
                {loading ? 'Syncing listings...' : `Showing ${displayedProperties.length} of ${filteredProperties.length} properties`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#64748b]">
                {syncedAt ? `Last synced ${new Date(syncedAt).toLocaleTimeString()}` : 'Waiting for sync...'}
              </span>
              {isStale && (
                <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                  Stale
                </span>
              )}
              <button
                onClick={() => syncBrowse({ forceRefresh: true })}
                className="text-xs px-2.5 py-1.5 rounded-full border border-[#e2e8f0] text-[#475467] hover:text-[#9f7539] hover:border-[#9f7539]/40"
              >
                {syncing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => syncBrowse({ forceRefresh: true })}
                className="ml-3 text-xs font-semibold px-2 py-1 rounded border border-red-300 hover:bg-red-100"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="rounded-xl border border-[#e2e8f0] p-3">
                  <div className="h-40 rounded-lg bg-gray-100 animate-pulse mb-3"></div>
                  <div className="h-4 w-3/4 bg-gray-100 animate-pulse rounded mb-2"></div>
                  <div className="h-3 w-1/2 bg-gray-100 animate-pulse rounded mb-4"></div>
                  <div className="h-9 w-full bg-gray-100 animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-10">
              <PropertyGrid
                properties={displayedWithFavorites}
                viewType={viewType}
                onPropertyClick={handlePropertyClick}
                onFavoriteToggle={handleFavoriteToggle}
                onBookNowClick={handleBookNowClick}
              />
            </div>
          )}

          {!loading && filteredProperties.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-gray-600">
                Page {currentPage} of {totalPages}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>

                {(() => {
                  const windowSize = 5;
                  const half = Math.floor(windowSize / 2);
                  let start = Math.max(1, currentPage - half);
                  let end = Math.min(totalPages, start + windowSize - 1);
                  start = Math.max(1, end - windowSize + 1);
                  const pages = Array.from(
                    { length: Math.max(0, end - start + 1) },
                    (_, index) => start + index
                  );
                  return pages.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg ${
                        currentPage === page ? 'bg-[#0e1f42] text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ));
                })()}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>

              <div className="text-sm text-gray-600">{ITEMS_PER_PAGE} per page</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentBrowse;

