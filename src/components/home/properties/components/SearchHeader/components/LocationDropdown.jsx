import React, { useState } from 'react';

const LOCATION_BY_AREA = {
  'Lagos Island': ['Ikoyi', 'Lekki Phase 1', 'Victoria Island', 'Ajah', 'Sangotedo', 'Chevron', 'Oniru'],
  'Lagos Mainland': ['Ikeja', 'Ikeja GRA', 'Yaba', 'Surulere', 'Ojota', 'Oshodi', 'Ilupeju'],
  'Delta North': ['Asaba', 'Ibusa', 'Okpanam', 'Agbor', 'Issele-Uku'],
  'Delta Central': ['Warri', 'Effurun', 'Sapele', 'Ughelli', 'Abraka'],
  'Delta South': ['Ozoro', 'Oleh', 'Burutu', 'Koko', 'Bomadi']
};

const LocationDropdown = ({ value, state, area, locationsByArea, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const source =
    locationsByArea && Object.keys(locationsByArea).length
      ? locationsByArea
      : LOCATION_BY_AREA;
  const locations = area && area !== 'all' ? (source[area] || []) : [];
  const selectedLabel = value === 'all' ? 'All Locations' : value;
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!state || state === 'all' || !area || area === 'all'}
        className={`
          w-full px-3 py-2 text-left rounded-lg border transition-colors text-sm
          ${!state || state === 'all' || !area || area === 'all'
            ? 'bg-gray-100 cursor-not-allowed border-gray-200' 
            : 'bg-white border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <div className="flex justify-between items-center">
          <span className="truncate">
            {!state || state === 'all' || !area || area === 'all' ? 'Choose Area First' : selectedLabel}
          </span>
          <i className="fas fa-chevron-down text-xs text-gray-500"></i>
        </div>
      </button>
      
      {isOpen && state && state !== 'all' && area && area !== 'all' && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-60 overflow-y-auto">
          <button
            onClick={() => {
              onChange('all');
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm"
          >
            All Locations
          </button>
          {locations.map((location) => (
            <button
              key={location}
              onClick={() => {
                onChange(location);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm"
            >
              {location}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationDropdown;
