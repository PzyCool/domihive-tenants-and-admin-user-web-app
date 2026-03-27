// src/components/home/properties/components/PropertyGrid/PropertyCard.jsx
import React, { useState } from 'react';

const PropertyCard = ({
  property,
  onViewDetails,
  onToggleFavorite,
  onBookNowClick,
  isFavorite = false,
  viewType = 'grid'
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  
  if (!property) return null;
  
  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M/year`;
    }
    return `₦${price.toLocaleString('en-NG')}/year`;
  };

  const formatPriceWords = (price) => {
    const amount = Number(price) || 0;
    if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)} billion naira yearly`;
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)} million naira yearly`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)} thousand naira yearly`;
    return `${amount.toLocaleString('en-NG')} naira yearly`;
  };
  const formatSize = (size) => {
    const raw = String(size ?? '').trim();
    if (!raw) return '—';
    const normalized = raw.toLowerCase();
    if (normalized.includes('sqm') || normalized.includes('sq m') || normalized.includes('m²')) {
      return raw;
    }
    return `${raw} sqm`;
  };
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(property, !isFavorite);
  };
  
  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(property.id);
    }
  };
  
  const handleBookNowClick = (e) => {
    e.stopPropagation();
    if (onBookNowClick) {
      onBookNowClick(property.id);
    }
  };
  
  const handleNextImage = (e) => {
    e.stopPropagation();
    if (property.images && property.images.length > 1) {
      setCurrentImageIndex((currentImageIndex + 1) % property.images.length);
    }
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (property.images && property.images.length > 1) {
      setCurrentImageIndex((currentImageIndex - 1 + property.images.length) % property.images.length);
    }
  };

  const openImageModal = (e) => {
    e.stopPropagation();
    setShowImageModal(true);
  };

  const closeImageModal = (e) => {
    if (e) e.stopPropagation();
    setShowImageModal(false);
  };
  
  const getPropertyStatus = () => {
    if (property.status === 'rented') {
      return { label: 'Rented', color: 'bg-gray-500', icon: 'fas fa-check-circle' };
    }
    return { label: 'Available', color: 'bg-green-500', icon: 'fas fa-calendar-check' };
  };
  
  const propertyStatus = getPropertyStatus();
  
  const getEstateType = () => {
    if (property.isEstate) {
      return { 
        label: 'Estate Property', 
        color: '#0e1f42'
      };
    }
    return { 
      label: 'Individual Property', 
      color: '#10b981'
    };
  };
  
  const estateTypeInfo = getEstateType();

  if (viewType === 'list') {
    return (
      <>
      <div className="property-card w-full bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <div className="flex flex-col lg:flex-row">
          <div className="relative lg:w-[42%] h-56 lg:h-[320px] min-h-[220px]">
            <img
              src={property.images?.[currentImageIndex] || 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop'}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop';
              }}
            />

            {property.images && property.images.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 w-9 h-9 bg-white/85 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:scale-105 transition-transform"
                title="Next image"
              >
                <i className="fas fa-chevron-right text-gray-700 text-sm"></i>
              </button>
            )}

            <div className="absolute bottom-3 right-3 bg-[#2f2648]/90 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-2">
              <i className="far fa-image"></i>
              <span>{currentImageIndex + 1}/{Math.max(1, property.images?.length || 1)}</span>
            </div>

            <button
              type="button"
              onClick={openImageModal}
              className="absolute top-3 left-3 bg-[#0e1f42]/85 hover:bg-[#0e1f42] text-white text-xs px-3 py-1.5 rounded-full transition-colors"
            >
              Click to view full image
            </button>
          </div>

          <div className="lg:w-[58%] p-4 md:p-5 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="property-price-main text-2xl font-bold text-[#0e1f42] leading-tight">
                  {formatPrice(property.price)}
                </div>
                <div className="text-xs text-gray-500 mt-1">{formatPriceWords(property.price)}</div>
                <div className="text-gray-700 font-medium mt-1">{property.title}</div>
                <div className="flex items-center gap-4 text-gray-600 text-sm mt-2">
                  <span className="inline-flex items-center gap-1.5">
                    <i className="fas fa-bed text-[#9f7539] text-[11px]"></i>
                    {property.bedrooms} bed
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <i className="fas fa-bath text-[#9f7539] text-[11px]"></i>
                    {property.bathrooms} bath
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <i className="fas fa-ruler-combined text-[#9f7539] text-[11px]"></i>
                    {formatSize(property.size)}
                  </span>
                </div>
                <div className="text-gray-600 text-sm mt-1 inline-flex items-center gap-1.5">
                  <i className="fas fa-map-marker-alt text-[#9f7539] text-[11px]"></i>
                  {property.location}
                </div>
              </div>

              <button
                onClick={handleFavoriteClick}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#9f7539] transition-colors"
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <i className={`fas fa-heart ${isFavorite ? 'text-[#9f7539]' : 'text-gray-500'} text-base`}></i>
              </button>
            </div>

            <div className="mt-3">
              <div className="flex items-center gap-2 mb-1">
                <i className="fas fa-align-left text-[#9f7539] text-[11px]"></i>
                <span className="text-[11px] font-semibold text-gray-800">About this property:</span>
              </div>
              <p className="text-gray-700 leading-relaxed line-clamp-3">
                {property.description || `Modern ${property.bedrooms}-bed property in ${property.location} with ${property.bathrooms} bathrooms.`}
              </p>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-gray-600 font-medium">{estateTypeInfo.label}</div>
                <div className="text-[11px] text-gray-500 mt-0.5 inline-flex items-center gap-1.5">
                  <i className="fas fa-clock text-[#9f7539]"></i>
                  Listed {new Date(property.dateAdded).toLocaleDateString('en-NG', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleViewDetails}
                  className="property-view-details-btn px-4 py-2 border border-[#0e1f42] text-[#0e1f42] rounded-lg font-semibold text-sm hover:bg-[#0e1f42] hover:text-white transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={handleBookNowClick}
                  className="px-4 py-2 bg-gradient-to-r from-[#9f7539] to-[#b58a4a] text-white rounded-lg font-semibold text-sm"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showImageModal && (
        <div
          className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div
            className="relative w-full max-w-6xl max-h-[90vh] rounded-xl overflow-hidden bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={property.images?.[currentImageIndex] || 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=1400&h=900&fit=crop'}
              alt={property.title}
              className="w-full h-auto max-h-[90vh] object-contain"
            />

            {property.images && property.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/55 hover:bg-black/70 text-white flex items-center justify-center"
                  aria-label="Previous image"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/55 hover:bg-black/70 text-white flex items-center justify-center"
                  aria-label="Next image"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={closeImageModal}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/55 hover:bg-black/70 text-white flex items-center justify-center"
              aria-label="Close image preview"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
      </>
    );
  }
  
  return (
    <div 
      className="property-card w-full max-w-none md:max-w-[640px] md:min-h-[300px] bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] cursor-pointer group flex flex-col"
    >
      <div className="relative h-48 md:h-[190px] shrink-0">
        <img
          src={property.images?.[currentImageIndex] || 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop';
          }}
        />
        
        {property.images && property.images.length > 1 && (
          <button
            onClick={handleNextImage}
            className="absolute top-1/2 right-3 transform -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
            title="Next image"
          >
            <i className="fas fa-chevron-right text-gray-700 text-sm"></i>
          </button>
        )}
        
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200"
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <i className={`fas fa-heart ${isFavorite ? 'text-[#9f7539]' : 'text-gray-500'} text-base`}></i>
        </button>
        
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="property-price-main text-2xl font-bold text-white leading-tight">
                {formatPrice(property.price)}
              </div>
              <div className="text-white/90 text-sm mt-1">
                {formatPriceWords(property.price)}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openImageModal}
          className="absolute top-3 left-3 bg-[#0e1f42]/85 hover:bg-[#0e1f42] text-white text-xs px-3 py-1.5 rounded-full transition-colors"
        >
          Click to view full image
        </button>
      </div>
      
      <div className="p-3 flex-1 flex flex-col">
        <div className="mb-2 min-h-[24px]">
          <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1 line-clamp-2 leading-snug">
            {property.title}
          </h3>
          <div className="flex items-start gap-2">
            <i className="fas fa-map-marker-alt text-[#9f7539] mt-0.5 flex-shrink-0 text-xs"></i>
            <div className="min-h-[32px]">
              <span className="text-xs md:text-sm text-gray-700 font-medium block line-clamp-2">{property.location}</span>
              <div className="hidden sm:block text-[11px] text-gray-500 mt-0.5">
                <i className="fas fa-clock mr-1"></i>
                Listed {new Date(property.dateAdded).toLocaleDateString('en-NG', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="flex flex-col items-center p-1.5 bg-gray-50 rounded-lg">
            <i className="fas fa-bed text-[#9f7539] text-xs mb-0.5"></i>
            <span className="text-xs md:text-sm font-bold text-gray-900">{property.bedrooms}</span>
            <span className="text-[11px] text-gray-600 font-medium">Beds</span>
          </div>
          <div className="flex flex-col items-center p-1.5 bg-gray-50 rounded-lg">
            <i className="fas fa-bath text-[#9f7539] text-xs mb-0.5"></i>
            <span className="text-xs md:text-sm font-bold text-gray-900">{property.bathrooms}</span>
            <span className="text-[11px] text-gray-600 font-medium">Baths</span>
          </div>
          <div className="flex flex-col items-center p-1.5 bg-gray-50 rounded-lg">
            <i className="fas fa-ruler-combined text-[#9f7539] text-xs mb-0.5"></i>
            <span className="text-xs md:text-sm font-bold text-gray-900">{formatSize(property.size)}</span>
            <span className="text-[11px] text-gray-600 font-medium">Size</span>
          </div>
        </div>
        
        <div className="mb-2 min-h-[16px]">
          <div className="flex items-center gap-2 mb-1">
            <i className="fas fa-align-left text-[#9f7539] text-[11px]"></i>
            <div className="text-[11px] font-semibold text-gray-800">About this property:</div>
          </div>
          <div className="text-xs md:text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {property.description || `Modern ${property.bedrooms}-bed property in ${property.location} with ${property.bathrooms} bath${property.bathrooms > 1 ? 's' : ''}.`}
          </div>
        </div>
        
        <div className="mb-1 flex items-center justify-between min-h-[16px] hidden sm:flex">
          <div className="flex items-center gap-2">
            <div>
              <div className="text-[11px] text-gray-500">{estateTypeInfo.label}</div>
            </div>
          </div>
        </div>
        
        <div className="mt-auto pt-2 border-t border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={handleViewDetails}
              className="property-view-details-btn flex-1 bg-[#0e1f42] text-white font-semibold py-2 rounded-lg hover:bg-[#1a2d5f] transition-colors flex items-center justify-center gap-2 text-xs shadow-sm hover:shadow"
            >
              <i className="fas fa-eye text-[11px]"></i>
              View Details
            </button>
            <button
              onClick={handleBookNowClick}
              className="flex-1 bg-gradient-to-r from-[#9f7539] to-[#b58a4a] text-white font-semibold py-2 rounded-lg hover:from-[#b58a4a] hover:to-[#9f7539] transition-all flex items-center justify-center gap-2 text-xs shadow-sm hover:shadow"
            >
              <i className="fas fa-calendar-check text-[11px]"></i>
              Book Now
            </button>
          </div>
        </div>
      </div>

      {showImageModal && (
        <div
          className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div
            className="relative w-full max-w-6xl max-h-[90vh] rounded-xl overflow-hidden bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={property.images?.[currentImageIndex] || 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=1400&h=900&fit=crop'}
              alt={property.title}
              className="w-full h-auto max-h-[90vh] object-contain"
            />

            {property.images && property.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/55 hover:bg-black/70 text-white flex items-center justify-center"
                  aria-label="Previous image"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/55 hover:bg-black/70 text-white flex items-center justify-center"
                  aria-label="Next image"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={closeImageModal}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/55 hover:bg-black/70 text-white flex items-center justify-center"
              aria-label="Close image preview"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyCard;
