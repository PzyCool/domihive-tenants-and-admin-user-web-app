// src/components/home/properties/components/PropertyGrid/PropertyGrid.jsx
import React from 'react';
import PropertyCard from './PropertyCard';

const PropertyGrid = ({ 
  properties, 
  onPropertyClick,
  onFavoriteToggle,
  onBookNowClick,
  viewType = 'grid'
}) => {
  
  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-search text-gray-400 text-2xl"></i>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Properties Found</h3>
        <p className="text-gray-600 mb-6">Try adjusting your filters</p>
      </div>
    );
  }
  
  return (
    <div
      className={
        viewType === 'list'
          ? 'space-y-4'
          : 'flex gap-3 overflow-x-auto pb-3 -mx-3 px-3 snap-x snap-mandatory sm:-mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:overflow-visible'
      }
    >
      {properties.map((property) => (
        <div
          key={property.id || property.propertyId}
          className={viewType === 'list' ? 'w-full' : 'w-[85%] flex-shrink-0 snap-start sm:w-full'}
        >
          <PropertyCard
            property={property}
            viewType={viewType}
            onViewDetails={() => onPropertyClick?.(property.id || property.propertyId)}
            onToggleFavorite={(prop, fav) => onFavoriteToggle?.(prop, fav)}
            onBookNowClick={onBookNowClick}
            isFavorite={property.isFavorite}
          />
        </div>
      ))}
    </div>
  );
};

export default PropertyGrid;
