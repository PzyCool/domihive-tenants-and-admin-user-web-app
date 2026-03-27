import React, { useState } from 'react';

const PropertyCard = ({ property, onViewDetails, onToggleFavorite, onBookNowClick }) => { // ADD onBookNowClick prop
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!property) return null;
  
  // Property type icons and labels
  const getPropertyTypeInfo = () => {
    const types = {
      'luxury_apartment': { 
        icon: 'fas fa-crown', 
        label: 'Luxury Apartment',
        description: 'Premium apartment with luxury amenities',
        color: '#9f7539'
      },
      'apartment': { 
        icon: 'fas fa-building', 
        label: 'Apartment',
        description: 'Modern apartment unit',
        color: '#0e1f42'
      },
      'flat': { 
        icon: 'fas fa-home', 
        label: 'Flat',
        description: 'Self-contained residential unit',
        color: '#10b981'
      },
      'duplex': { 
        icon: 'fas fa-hotel', 
        label: 'Duplex',
        description: 'Two-story residential unit',
        color: '#3b82f6'
      },
      'penthouse': { 
        icon: 'fas fa-star', 
        label: 'Penthouse',
        description: 'Top-floor luxury residence',
        color: '#8b5cf6'
      },
      'townhouse': { 
        icon: 'fas fa-city', 
        label: 'Townhouse',
        description: 'Multi-floor attached home',
        color: '#ef4444'
      },
      'house': { 
        icon: 'fas fa-house', 
        label: 'House',
        description: 'Standalone residential building',
        color: '#f59e0b'
      }
    };
    
    const typeKey = property.propertyType?.toLowerCase() || 'apartment';
    return types[typeKey] || types['apartment'];
  };
  
  const propertyTypeInfo = getPropertyTypeInfo();
  
  // Format price with Nigerian formatting
  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M/year`;
    }
    return `₦${price.toLocaleString('en-NG')}/year`;
  };
  
  // Handle favorite toggle
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (onToggleFavorite) {
      onToggleFavorite(property.id, !isFavorite);
    }
  };
  
  // Handle view details
  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(property.id);
    }
  };
  
  // ADD THIS FUNCTION - Handle Book Now Click
  const handleBookNowClick = (e) => {
    e.stopPropagation();
    if (onBookNowClick) {
      onBookNowClick(property.id);
    }
  };
  
  // Handle next image
  const handleNextImage = (e) => {
    e.stopPropagation();
    if (property.images && property.images.length > 1) {
      setCurrentImageIndex((currentImageIndex + 1) % property.images.length);
    }
  };
  
  // Get property status (available/rented)
  const getPropertyStatus = () => {
    if (property.status === 'rented') {
      return { label: 'Rented', color: 'bg-gray-500', icon: 'fas fa-check-circle' };
    }
    return { label: 'Available', color: 'bg-green-500', icon: 'fas fa-calendar-check' };
  };
  
  const propertyStatus = getPropertyStatus();
  
  // Get estate type (for estate badge)
  const getEstateType = () => {
    if (property.isEstate) {
      return { 
        label: 'Estate Property', 
        color: '#0e1f42', 
        icon: 'fas fa-building-shield',
        description: 'Gated community with security'
      };
    }
    return { 
      label: 'Individual Property', 
      color: '#10b981', 
      icon: 'fas fa-house-user',
      description: 'Standalone property'
    };
  };
  
  const estateTypeInfo = getEstateType();
  
  return (
    <div 
      className="property-card bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] cursor-pointer group flex flex-col"
      style={{
        width: '100%',
        maxWidth: '465px',
        minHeight: '580px',
        height: 'auto',
      }}
    >
      {/* Property Image Section - Fixed height */}
      <div 
        className="relative"
        style={{
          height: '220px',
          flexShrink: 0
        }}
      >
        <img
          src={property.images?.[currentImageIndex] || 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop';
          }}
        />
        
        {/* Image Navigation (only if multiple images) */}
        {property.images && property.images.length > 1 && (
          <button
            onClick={handleNextImage}
            className="absolute top-1/2 right-3 transform -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
            title="Next image"
          >
            <i className="fas fa-chevron-right text-gray-700 text-sm"></i>
          </button>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {/* Property Type Badge */}
          <div 
            className="px-3 py-1.5 rounded-lg text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            style={{ backgroundColor: propertyTypeInfo.color }}
          >
            <i className={propertyTypeInfo.icon}></i>
            <span>{propertyTypeInfo.label}</span>
          </div>
          
          {/* Property Status Badge */}
          <div className={`px-3 py-1.5 ${propertyStatus.color} rounded-lg text-white text-xs font-bold shadow-md flex items-center gap-1.5`}>
            <i className={propertyStatus.icon}></i>
            <span>{propertyStatus.label}</span>
          </div>
        </div>
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200"
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <i className={`fas fa-heart ${isFavorite ? 'text-[#9f7539]' : 'text-gray-500'} text-base`}></i>
        </button>
        
        {/* Price Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="property-price-main text-2xl font-bold text-white leading-tight">
                {formatPrice(property.price)}
              </div>
              <div className="text-white/90 text-sm mt-1">
                {property.isNegotiable ? 'Price Negotiable' : 'Fixed Price'}
              </div>
            </div>
            <div className="text-white/80 text-xs">
              <i className="fas fa-info-circle mr-1"></i>
              DomiHive Managed
            </div>
          </div>
        </div>
      </div>
      
      {/* Property Details - Flexible height container */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title and Location Section */}
        <div className="mb-3 min-h-[80px]">
          <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">
            {property.title}
          </h3>
          <div className="flex items-start gap-2">
            <i className="fas fa-map-marker-alt text-[#9f7539] mt-0.5 flex-shrink-0"></i>
            <div className="min-h-[40px]">
              <span className="text-sm text-gray-700 font-medium block line-clamp-2">{property.location}</span>
              <div className="text-xs text-gray-500 mt-0.5">
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
        
        {/* Property Features Grid - 3 columns only */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
            <i className="fas fa-bed text-[#9f7539] text-sm mb-1"></i>
            <span className="text-sm font-bold text-gray-900">{property.bedrooms}</span>
            <span className="text-xs text-gray-600 font-medium">Beds</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
            <i className="fas fa-bath text-[#9f7539] text-sm mb-1"></i>
            <span className="text-sm font-bold text-gray-900">{property.bathrooms}</span>
            <span className="text-xs text-gray-600 font-medium">Baths</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
            <i className="fas fa-ruler-combined text-[#9f7539] text-sm mb-1"></i>
            <span className="text-sm font-bold text-gray-900">{property.size}</span>
            <span className="text-xs text-gray-600 font-medium">Size</span>
          </div>
        </div>
        
        {/* Property Description Section */}
        <div className="mb-4 min-h-[70px]">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-align-left text-[#9f7539] text-xs"></i>
            <div className="text-xs font-semibold text-gray-800">About this property:</div>
          </div>
          <div className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {`Beautiful ${propertyTypeInfo.label.toLowerCase()} in ${property.location}. 
            ${property.bedrooms} bedroom${property.bedrooms > 1 ? 's' : ''}, ${property.bathrooms} bathroom${property.bathrooms > 1 ? 's' : ''}, ${property.size} of elegant living space. 
            Modern design with premium finishes and amenities.`}
          </div>
        </div>
        
        {/* Property Type and Estate Info */}
        <div className="mb-4 flex items-center justify-between min-h-[40px]">
          <div className="flex items-center gap-2">
            <div 
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${propertyTypeInfo.color}20` }}
            >
              <i 
                className={propertyTypeInfo.icon} 
                style={{ color: propertyTypeInfo.color }}
              ></i>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-900">{propertyTypeInfo.label}</div>
              <div className="text-xs text-gray-500">{estateTypeInfo.label}</div>
            </div>
          </div>
          
          {/* DomiHive Badge */}
          <div className="px-2 py-1 bg-[#f8f3ed] rounded-lg border border-[#e9d9c5]">
            <div className="flex items-center gap-1">
              <i className="fas fa-shield-alt text-[#9f7539] text-xs"></i>
              <span className="text-xs font-bold text-[#9f7539]">DomiHive Managed</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons - ALWAYS VISIBLE AT BOTTOM */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={handleViewDetails}
              className="property-view-details-btn flex-1 bg-[#0e1f42] text-white font-semibold py-2.5 rounded-lg hover:bg-[#1a2d5f] transition-colors flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow"
            >
              <i className="fas fa-eye text-xs"></i>
              View Details
            </button>
            <button
              onClick={handleBookNowClick} // UPDATE THIS LINE
              className="flex-1 bg-gradient-to-r from-[#9f7539] to-[#b58a4a] text-white font-semibold py-2.5 rounded-lg hover:from-[#b58a4a] hover:to-[#9f7539] transition-all flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow"
            >
              <i className="fas fa-calendar-check text-xs"></i>
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
