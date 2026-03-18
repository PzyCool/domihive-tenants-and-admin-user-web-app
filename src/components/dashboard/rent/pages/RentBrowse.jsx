// src/dashboards/rent/pages/RentBrowse.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { generateNigerianProperties } from '../../../home/properties/components/utils/propertyData';
import { VIEW_TYPES, SORT_OPTIONS, ITEMS_PER_PAGE } from '../components/browse-properties/utils/constants';
import PropertyDetailsModal from '../components/property-details/PropertyDetailsModal';
import BookInspectionPage from '../components/book-inspection/BookInspectionPage';
import { useProperties } from '../contexts/PropertiesContext';

// Correct imports based on your folder structure
import SearchHeader from '../components/browse-properties/components/SearchHeader/SearchHeader';
import PropertyGrid from '../components/browse-properties/components/PropertyGrid/PropertyGrid';

const RentBrowse = () => {
  const { toggleFavorite, isFavorite, favorites } = useProperties();
  // State for properties
  const [allProperties, setAllProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [displayedProperties, setDisplayedProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  
  // ADD THESE STATES FOR BOOK INSPECTION
  const [showBookInspection, setShowBookInspection] = useState(false);
  const [selectedPropertyForBooking, setSelectedPropertyForBooking] = useState(null);
  
  // Filter states - UPDATED to match SearchHeader needs
  const [filters, setFilters] = useState({
    searchQuery: '',
    areaType: 'all',
    location: 'all',
    propertyType: 'all',
    bedrooms: 'all',
    priceRange: 'all',
    managementType: 'all',
    sortBy: 'newest',
    isExpanded: false // ADD THIS
  });
  
  // View states
  const [viewType, setViewType] = useState(VIEW_TYPES.GRID);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // ADD THIS FUNCTION - Handle Book Now Click
  const handleBookNowClick = (propertyId) => {
    console.log('Booking property:', propertyId);
    setSelectedPropertyForBooking(propertyId);
    setShowBookInspection(true);
    setShowPropertyDetails(false); // Close property details if open
  };
  
  // Initialize properties
  useEffect(() => {
    const loadProperties = () => {
      setIsLoading(true);
      try {
        // Generate Nigerian properties
        const properties = generateNigerianProperties(80);
        setAllProperties(properties);
        setFilteredProperties(properties);
        
        // Calculate initial pagination
        const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE);
        setTotalPages(totalPages);
        
        // Display first page
        updateDisplayedProperties(properties, 1);
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProperties();
  }, []);
  
  // Update displayed properties based on pagination
  const updateDisplayedProperties = (properties, page) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDisplayedProperties(properties.slice(startIndex, endIndex));
  };
  
  // Handle filter changes - UPDATED for SearchHeader
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  // Apply filters to properties
  useEffect(() => {
    if (allProperties.length === 0) return;
    
    let filtered = [...allProperties];
    
    // Apply search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.description.toLowerCase().includes(query)
      );
    }
    
    // Apply management type filter
    if (filters.managementType !== 'all') {
      filtered = filtered.filter(property => 
        property.managementType === filters.managementType
      );
    }
    
    // Apply area type filter
    if (filters.areaType !== 'all') {
      filtered = filtered.filter(property => 
        property.areaType === filters.areaType
      );
    }
    
    // Apply location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(property => 
        property.location.includes(filters.location)
      );
    }
    
    // Apply property type filter
    if (filters.propertyType !== 'all') {
      filtered = filtered.filter(property => 
        property.propertyType.toLowerCase() === filters.propertyType.toLowerCase()
      );
    }
    
    // Apply bedrooms filter
    if (filters.bedrooms !== 'all') {
      if (filters.bedrooms === '4') {
        filtered = filtered.filter(property => property.bedrooms >= 4);
      } else {
        filtered = filtered.filter(property => 
          property.bedrooms === parseInt(filters.bedrooms)
        );
      }
    }
    
    // Apply price range filter
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(str => {
        if (str.includes('+')) return parseInt(str.replace('+', '')) + 1;
        // Handle Nigerian price format like "₦1M - ₦3M/year"
        const num = str.replace('₦', '').replace('M', '000000').replace('/year', '').trim();
        return parseInt(num);
      });
      
      filtered = filtered.filter(property => {
        if (filters.priceRange.includes('+')) {
          return property.price >= min;
        }
        return property.price >= min && property.price <= max;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return new Date(b.dateAdded) - new Date(a.dateAdded);
        case 'featured':
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        case 'verified':
          return (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0);
        default:
          return 0;
      }
    });
    
    setFilteredProperties(filtered);
    
    // Update pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    setTotalPages(totalPages);
    
    // Update displayed properties for current page
    updateDisplayedProperties(filtered, currentPage);
  }, [filters, allProperties, currentPage]);
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateDisplayedProperties(filteredProperties, page);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle view type toggle
  const handleViewToggle = (type) => {
    setViewType(type);
  };
  
  // Handle property click
  const handlePropertyClick = (propertyId) => {
    console.log('Opening property details for:', propertyId);
    setSelectedPropertyId(propertyId);
    setShowPropertyDetails(true);
    setShowBookInspection(false); // Close booking if open
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = (property) => {
    if (property) toggleFavorite(property);
  };

  const displayedWithFavorites = useMemo(
    () =>
      displayedProperties.map((prop) => ({
        ...prop,
        isFavorite: isFavorite(prop.id || prop.propertyId)
      })),
    [displayedProperties, favorites, isFavorite]
  );
  
  if (isLoading) {
    return (
      <div className="rent-browse-container min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-md border border-[#e2e8f0] p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#9f7539]"></div>
              <p className="mt-4 text-gray-600">Loading Nigerian properties...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="rent-browse-container min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* SHOW EITHER BOOK INSPECTION, PROPERTY DETAILS, OR BROWSE PROPERTIES */}
      {showBookInspection ? (
        // Book Inspection Page
        <BookInspectionPage 
          propertyId={selectedPropertyForBooking}
        />
      ) : showPropertyDetails ? (
        // Property Details Modal as a page
        <PropertyDetailsModal
          propertyId={selectedPropertyId}
          isOpen={showPropertyDetails}
          onClose={() => setShowPropertyDetails(false)}
        />
      ) : (
        // Original Browse Properties content
        <>
          {/* ADD THIS WRAPPER DIV */}
          <div
            className="bg-white w-full"
            style={{ position: 'sticky', top: 0, zIndex: 1100 }}
          >
            <SearchHeader 
              filters={filters}
              onFilterChange={handleFilterChange}
              viewType={viewType}
              onViewToggle={handleViewToggle}
            />
          </div>
          
          {/* Main Content Area */}
          <div className="p-4 md:p-6 gap-6">
            <div className="bg-white rounded-lg shadow-md border border-[#e2e8f0] p-4 md:p-6">
              {/* Page Header Stats */}
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0e1f42] mb-2">
                  Browse Properties
                </h1>
                <p className="text-gray-600">
                  Showing {displayedProperties.length} of {filteredProperties.length} properties
                  {filters.areaType !== 'all' && ` in ${filters.areaType === 'island' ? 'Lagos Island' : 'Lagos Mainland'}`}
                </p>
              </div>
              
              {/* Property Grid Section */}
              <div className="mb-10">
                <PropertyGrid 
                  properties={displayedWithFavorites}
                  viewType={viewType}
                  onPropertyClick={handlePropertyClick}
                  onFavoriteToggle={handleFavoriteToggle}
                  onBookNowClick={handleBookNowClick} // ADD THIS PROP
                />
              </div>
              
              {/* Pagination */}
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
                      (_, i) => start + i
                    );

                    return pages.map(page => (
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
                
                <div className="text-sm text-gray-600">
                  {ITEMS_PER_PAGE} per page
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RentBrowse;
