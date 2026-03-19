// src/dashboards/rent/components/property-details/components/tabs/LocationTab/LocationTab.jsx
import React from 'react';
import MapSection from './MapSection';
import ActionSection from '../../ActionSection/ActionSection';

const LocationTab = ({ property }) => {
  const handleBookInspection = (propertyId) => {
    console.log('Book inspection for property:', propertyId);
    // Navigation logic will go here
  };

  return (
    <div className="location-tab">
      {/* Location Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-[#0e1f42] mb-4">Location & Neighborhood</h3>
        <p className="text-[#64748b]">
          {property?.location
            ? `Explore the neighborhood around ${property.location}.`
            : 'Explore the neighborhood and nearby amenities.'}
        </p>
      </div>

      {/* Map Section */}
      <div className="mb-8">
        <MapSection property={property} />
      </div>

      {/* ActionSection */}
      <div className="mt-12 pt-8 border-t border-[#e2e8f0]">
        <ActionSection
          propertyId={property?.id || 'default'}
          onBookInspection={handleBookInspection}
        />
      </div>
    </div>
  );
};

export default LocationTab;
