// src/dashboards/rent/components/property-details/components/tabs/LocationTab/LocationTab.jsx
import React from 'react';
import MapSection from './MapSection';

const LocationTab = ({ property }) => {
  return (
    <div className="location-tab">
      {/* Map Section */}
      <div className="mb-8">
        <MapSection property={property} />
      </div>
    </div>
  );
};

export default LocationTab;
