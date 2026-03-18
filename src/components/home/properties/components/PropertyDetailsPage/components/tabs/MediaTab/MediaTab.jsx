// src/components/home/properties/components/PropertyDetailsPage/components/tabs/MediaTab/MediaTab.jsx
import React from 'react';
import RoomGallery from './RoomGallery';
import VideoSection from './VideoSection';

const MediaTab = ({ property, listingType, onBookInspection }) => {
  return (
    <div className="media-tab space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-[#0e1f42] mb-6">
          Property Images & Videos
        </h3>
        <p className="text-gray-600 mb-8">
          Explore detailed visuals of this property
        </p>
      </div>
      
      {/* Room Gallery */}
      <RoomGallery property={property} />
      
      {/* Video Section */}
      <VideoSection property={property} />
      
      <div className="bg-[#f8fafc] p-6 rounded-xl border border-[#e2e8f0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#9f7539] rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-[#0e1f42]">
              Professional Photography
            </h4>
            <p className="text-gray-600 text-sm">
              All images are professionally captured to showcase the property accurately
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaTab;
