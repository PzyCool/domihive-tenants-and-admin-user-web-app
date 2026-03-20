// src/dashboards/rent/components/property-details/components/tabs/LocationTab/MapSection.jsx
import React from 'react';

const MapSection = ({ property }) => {
  // Single map embed (street view)
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.104457067132!2d3.422360576048309!3d6.449705493556914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b0b6e3a5c1f%3A0xa132fe7e9187ee3c!2sIkoyi%2C%20Lagos!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng`;

  return (
    <div className="map-section">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xl font-bold text-[#0e1f42]">Location Map</h4>
        
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#0e1f42] hover:bg-[#f8fafc] transition-colors duration-300 flex items-center gap-2"
            onClick={() => window.open('https://maps.google.com/?q=Ikoyi+Lagos', '_blank')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Open in Maps</span>
          </button>
          
          <button className="px-4 py-2 bg-[#0e1f42] text-white rounded-lg hover:bg-[#0e1f42]/90 transition-colors duration-300 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Directions</span>
          </button>
        </div>
      </div>

      {/* Google Maps Container */}
      <div className="relative rounded-2xl overflow-hidden border border-[#e2e8f0] h-96">
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Property Location Map"
          className="absolute inset-0"
        />
        
        {/* Map Overlay Info */}
        <div className="absolute bottom-4 left-4 bg-white rounded-xl p-4 shadow-lg max-w-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#9f7539]/10 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#9f7539]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h5 className="font-bold text-[#0e1f42] mb-1">Property Location</h5>
              <p className="text-sm text-[#64748b]">
                <span className="font-medium">Ikoyi, Lagos Island</span>
                <br />
                Lagos, Nigeria
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="property-location-card bg-[#f8fafc] p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-[#9f7539]/10 rounded-lg flex items-center justify-center">
              <span className="text-sm font-medium text-[#9f7539]">GPS</span>
            </div>
            <div>
              <div className="text-sm text-[#64748b]">Coordinates</div>
              <div className="font-medium text-[#0e1f42]">6.4497° N, 3.4224° E</div>
            </div>
          </div>
        </div>
        
        <div className="property-location-card bg-[#f8fafc] p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-[#9f7539]/10 rounded-lg flex items-center justify-center">
              <span className="text-sm font-medium text-[#9f7539]">ZIP</span>
            </div>
            <div>
              <div className="text-sm text-[#64748b]">Postal Code</div>
              <div className="font-medium text-[#0e1f42]">106104</div>
            </div>
          </div>
        </div>
        
        <div className="property-location-card bg-[#f8fafc] p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-[#9f7539]/10 rounded-lg flex items-center justify-center">
              <span className="text-sm font-medium text-[#9f7539]">Zone</span>
            </div>
            <div>
              <div className="text-sm text-[#64748b]">Local Government</div>
              <div className="font-medium text-[#0e1f42]">Eti-Osa LGA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSection;
