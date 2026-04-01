import React from 'react';
import PropertyCard from '../../../../../../home/properties/components/PropertyGrid/PropertyCard';

const PropertyGrid = ({ 
  properties, 
  onPropertyClick,
  onFavoriteToggle,
  onBookNowClick, // ADD THIS PROP
  viewType = 'grid',
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
    <div className={viewType === 'list' ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'}>
      {properties.map((property) => (
        <div key={property.id || property.propertyId} className={viewType === 'list' ? '' : 'flex justify-center'}>
          <PropertyCard
            property={property}
            viewType={viewType}
            onViewDetails={() => onPropertyClick?.(property.id || property.propertyId)}
            onToggleFavorite={(prop, fav) => onFavoriteToggle?.(prop, fav)}
            onBookNowClick={onBookNowClick} // ADD THIS PROP
            isFavorite={property.isFavorite}
          />
        </div>
      ))}
    </div>
  );
};

export default PropertyGrid;
