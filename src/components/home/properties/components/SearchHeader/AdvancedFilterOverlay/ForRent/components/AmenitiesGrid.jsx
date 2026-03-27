import React from 'react';

const AmenitiesGrid = ({ selected = [], onToggle }) => {
  const amenities = [
    { id: 'wifi', label: 'WiFi', icon: 'wifi' },
    { id: 'parking', label: 'Parking', icon: 'car' },
    { id: 'security', label: 'Security', icon: 'shield-alt' },
    { id: 'generator', label: 'Gen', icon: 'bolt' },
    { id: 'ac', label: 'A/C', icon: 'snowflake' },
    { id: 'swimming_pool', label: 'Pool', icon: 'swimmer' },
    { id: 'inverter', label: 'Inverter', icon: 'battery-half' },
    { id: 'solar_system', label: 'Solar', icon: 'sun' },
    { id: 'external_garden', label: 'Garden', icon: 'leaf' },
    { id: 'jacuzzi', label: 'Jacuzzi', icon: 'hot-tub' },
    { id: 'central_water_heater_system', label: 'Water Heater', icon: 'fire' },
    { id: 'pop_ceilings', label: 'POP Ceilings', icon: 'building' }
  ];

  const handleToggle = (amenityId) => {
    if (onToggle) onToggle(amenityId);
  };

  const isSelected = (amenityId) => selected.includes(amenityId);

  return (
    <div className="amenities-grid">
      <p className="font-medium text-gray-700 mb-2 flex items-center gap-2 text-sm">
        <i className="fas fa-star text-[#9f7539]"></i>
        Amenities
      </p>
      
      <div className="overflow-x-auto pb-1">
        <div className="grid grid-flow-col grid-rows-2 auto-cols-[96px] gap-1 min-w-max">
        {amenities.map((amenity) => {
          const checked = isSelected(amenity.id);
          
          return (
            <button
              key={amenity.id}
              type="button"
              onClick={() => handleToggle(amenity.id)}
              title={amenity.label}
              className={`
                p-1.5 rounded border text-xs transition-all duration-150
                flex flex-col items-center justify-center
                ${checked 
                  ? 'bg-[#9f7539] text-white border-[#9f7539]' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <i className={`fas fa-${amenity.icon} ${checked ? 'text-white' : 'text-gray-500'} text-xs`}></i>
              <span className="truncate w-full text-center text-[10px] mt-0.5">{amenity.label}</span>
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default AmenitiesGrid;
