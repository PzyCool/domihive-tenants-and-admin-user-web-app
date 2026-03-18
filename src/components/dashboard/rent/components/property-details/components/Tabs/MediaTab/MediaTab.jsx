// src/dashboards/rent/components/property-details/components/tabs/MediaTab/MediaTab.jsx
import React from 'react';
import RoomGallery from './RoomGallery';
import VideoSection from './VideoSection';

const MediaTab = ({ property }) => {
  return (
    <div className="media-tab space-y-8">
      <RoomGallery property={property} />
      <VideoSection property={property} />
    </div>
  );
};

export default MediaTab;
