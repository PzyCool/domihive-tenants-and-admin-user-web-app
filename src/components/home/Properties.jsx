// src/components/home/Properties.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListingType } from '../../context/ListingTypeContext';
import PropertyGrid from "./properties/components/PropertyGrid/PropertyGrid";
import SearchHeader from "./properties/components/SearchHeader/SearchHeader";
import PropertyDetailsPage from "./properties/components/PropertyDetailsPage/PropertyDetailsPage";
// import BookInspectionPage from "./properties/components/BookInspectionPage/BookInspectionPage";
import { generateNigerianProperties } from "./properties/components/utils/propertyData";
import { showNotification } from '../auth/utils/notifications';

const Properties = () => {
  const navigate = useNavigate();
  const { listingType } = useListingType();
  const lastListingTypeRef = useRef('rent');
  const isManualToggleRef = useRef(false);
  
  const [allProperties, setAllProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [displayedProperties, setDisplayedProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [showBookInspection, setShowBookInspection] = useState(false);
  const [selectedPropertyForBooking, setSelectedPropertyForBooking] = useState(null);
  
  const [filters, setFilters] = useState({
    searchQuery: '',
    areaType: 'all',
    location: 'all',
    propertyType: 'all',
    bedrooms: 'all',
    priceRange: 'all',
    managementType: 'all',
    listingType: 'rent',
    isExpanded: false
  });
  
  const [viewType, setViewType] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // Handle context changes (from HowItWorks/FinalCta buttons)
  useEffect(() => {
    // Only update if listingType changed AND it's not from a manual toggle
    if (listingType && listingType !== lastListingTypeRef.current && !isManualToggleRef.current) {
      setFilters(prev => ({
        ...prev,
        listingType: listingType
      }));
      lastListingTypeRef.current = listingType;
    }
  }, [listingType]);

  useEffect(() => {
    if (!showPropertyDetails) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow || 'auto';
    };
  }, [showPropertyDetails]);

  useEffect(() => {
    const loadProperties = () => {
      setIsLoading(true);
      try {
        const properties = generateNigerianProperties(80);
        localStorage.setItem('domihive_home_properties_cache_v1', JSON.stringify(properties));
        setAllProperties(properties);
        setFilteredProperties(properties);
        const totalPages = Math.ceil(properties.length / 6);
        setTotalPages(totalPages);
        updateDisplayedProperties(properties, 1);
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProperties();
    // Initialize lastListingTypeRef
    lastListingTypeRef.current = filters.listingType;
  }, []);
  
  const updateDisplayedProperties = (properties, page) => {
    const startIndex = (page - 1) * 6;
    const endIndex = startIndex + 6;
    setDisplayedProperties(properties.slice(startIndex, endIndex));
  };
  
  const handleFilterChange = (newFilters) => {
    // Check if this is a listingType change from manual toggle
    if (newFilters.listingType && newFilters.listingType !== filters.listingType) {
      isManualToggleRef.current = true;
      setTimeout(() => {
        isManualToggleRef.current = false;
      }, 100);
      lastListingTypeRef.current = newFilters.listingType;
    }
    
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };
  
  useEffect(() => {
    if (allProperties.length === 0) return;
    
    let filtered = [...allProperties];
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.description.toLowerCase().includes(query)
      );
    }
    
    if (filters.listingType !== 'all') {
      filtered = filtered.filter(property => 
        property.forRent === (filters.listingType === 'rent')
      );
    }
    
    if (filters.managementType !== 'all') {
      filtered = filtered.filter(property => 
        property.managementType === filters.managementType
      );
    }
    
    if (filters.areaType !== 'all') {
      filtered = filtered.filter(property => 
        property.areaType === filters.areaType
      );
    }
    
    if (filters.location !== 'all') {
      filtered = filtered.filter(property => 
        property.location.includes(filters.location)
      );
    }
    
    if (filters.propertyType !== 'all') {
      filtered = filtered.filter(property => 
        property.propertyType.toLowerCase() === filters.propertyType.toLowerCase()
      );
    }
    
    if (filters.bedrooms !== 'all') {
      if (filters.bedrooms === '4') {
        filtered = filtered.filter(property => property.bedrooms >= 4);
      } else {
        filtered = filtered.filter(property => 
          property.bedrooms === parseInt(filters.bedrooms)
        );
      }
    }
    
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(str => {
        if (str.includes('+')) return parseInt(str.replace('+', '')) + 1;
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
    
    setFilteredProperties(filtered);
    const totalPages = Math.ceil(filtered.length / 6);
    setTotalPages(totalPages);
    updateDisplayedProperties(filtered, currentPage);
  }, [filters, allProperties, currentPage]);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateDisplayedProperties(filteredProperties, page);
    const section = document.getElementById('properties');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleViewToggle = (type) => {
    setViewType(type);
  };
  
  const handlePropertyClick = (propertyId) => {
    setSelectedPropertyId(propertyId);
    setShowPropertyDetails(true);
    setShowBookInspection(false);
  };
  
  const handleFavoriteToggle = (propertyId, isFavorite) => {
    console.log('Toggle favorite:', propertyId, isFavorite);
  };
  
  const handleBookNowClick = (propertyId) => {
    showNotification('Please sign up first to book.', 'warning');
    navigate('/signup');
  };
  
  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      areaType: 'all',
      location: 'all',
      propertyType: 'all',
      bedrooms: 'all',
      priceRange: 'all',
      managementType: 'all',
      listingType: 'rent',
      isExpanded: false
    });
    lastListingTypeRef.current = 'rent';
    isManualToggleRef.current = false;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden">
      <section id="properties" className="properties-section px-3 py-4 md:p-6">
        <div className="bg-white rounded-lg shadow-md border border-[#e2e8f0] p-3 md:p-6">
          {showBookInspection ? (
            <div className="book-inspection-container">
              {/* <BookInspectionPage propertyId={selectedPropertyForBooking} /> */}
            </div>
          ) : showPropertyDetails ? (
            <div className="property-details-container fixed inset-0 z-50 overflow-y-auto bg-white">
              <PropertyDetailsPage
                propertyId={selectedPropertyId}
                isOpen={showPropertyDetails}
                onBookInspection={handleBookNowClick}
                onClose={() => setShowPropertyDetails(false)}
              />
            </div>
          ) : (
            <>
              <div className="relative mb-6 md:mb-8">
                <div className="sticky top-0 z-40 relative md:sticky md:top-0 md:z-40 -mx-3 md:mx-0 bg-white/95 backdrop-blur md:bg-white/95">
                  <SearchHeader 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    viewType={viewType}
                    onViewToggle={handleViewToggle}
                  />
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-[#0E1F42] mb-2">
                  {filters.listingType === 'rent' ? 'Properties for Rent' : 'Properties for Sale'}
                </h2>
                <p className="text-gray-600">
                  Showing {displayedProperties.length} of {filteredProperties.length} properties
                  {filters.areaType !== 'all' && ` in ${filters.areaType === 'island' ? 'Lagos Island' : 'Lagos Mainland'}`}
                </p>
              </div>
              
              <div className="mb-8 md:mb-10">
                <PropertyGrid 
                  properties={displayedProperties}
                  onPropertyClick={handlePropertyClick}
                  onFavoriteToggle={handleFavoriteToggle}
                  onBookNowClick={handleBookNowClick}
                />
              </div>
              
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
                      { length: end - start + 1 },
                      (_, i) => start + i
                    );

                    return pages.map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg ${currentPage === page ? 'bg-[#1a2d5f] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
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
                  6 per page
                </div>
              </div>
              
              {(filters.searchQuery || filters.areaType !== 'all' || filters.location !== 'all' || 
                filters.propertyType !== 'all' || filters.bedrooms !== 'all' || 
                filters.priceRange !== 'all' || filters.managementType !== 'all' || filters.listingType !== 'rent') && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Clear All Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Properties;

