import React from 'react';

const MapSection = ({ property }) => {
  const locationLabel = property?.location || property?.address || 'Lagos, Nigeria';
  const mapQuery = encodeURIComponent(locationLabel);
  const mapUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const openMapUrl = `https://maps.google.com/?q=${mapQuery}`;
  const coords = property?.locationDetails?.coordinates || null;

  return (
    <div className="map-section">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xl font-bold text-[#0e1f42]">Location Map</h4>
        <button
          className="px-4 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#0e1f42] hover:bg-[#f8fafc] transition-colors duration-300 flex items-center gap-2"
          onClick={() => window.open(openMapUrl, '_blank')}
        >
          <i className="fas fa-map-marker-alt" />
          <span className="text-sm font-medium">Open in Maps</span>
        </button>
      </div>

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-[#f8fafc] p-4 rounded-xl">
          <p className="text-sm text-[#64748b]">Address</p>
          <p className="font-medium text-[#0e1f42]">{property?.address || locationLabel}</p>
        </div>
        <div className="bg-[#f8fafc] p-4 rounded-xl">
          <p className="text-sm text-[#64748b]">Coordinates</p>
          <p className="font-medium text-[#0e1f42]">
            {coords?.lat && coords?.lng ? `${coords.lat}°, ${coords.lng}°` : 'Not provided'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapSection;
