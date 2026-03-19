// src/dashboards/rent/components/book-inspection/PropertySummary.jsx
import React from 'react';

const PropertySummary = ({ propertyData }) => {
  const fallbackProperty = {
    title: "Luxury 3-Bedroom Apartment in Ikoyi",
    price: 4500000,
    location: "Ikoyi, Lagos Island",
    bedrooms: 3,
    bathrooms: 3,
    size: "180 sqm",
    image: "/ASSECT/3d-rendering-modern-dining-room-living-room-with-luxury-decor (1).jpg"
  };
  const property = { ...fallbackProperty, ...(propertyData || {}) };

  const formatPrice = (price) => {
    return `₦${price.toLocaleString()}/year`;
  };

  return (
    <section className="inspection-summary-card bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[rgba(14,31,66,0.05)] p-6 md:p-8">
      <div className="text-center mb-8 pb-6 border-b border-[#e2e8f0]">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0e1f42] mb-2">
          Book Property Inspection
        </h1>
        <p className="text-[#64748b] text-lg">
          Schedule a physical viewing of the property before making your decision
        </p>
      </div>

      <div className="inspection-summary-inner flex flex-col md:flex-row gap-8 items-center bg-[#f8fafc] rounded-xl p-6 hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300">
        {/* Property Image */}
        <div className="w-full md:w-48 lg:w-56 xl:w-64 h-48 md:h-auto flex-shrink-0 rounded-lg overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop";
            }}
          />
        </div>

        {/* Property Info */}
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-semibold text-[#0e1f42] mb-2">
            {property.title}
          </h3>
          
          <div className="text-2xl md:text-3xl font-bold text-[#9f7539] mb-4">
            {formatPrice(property.price)}
          </div>

          <div className="flex items-center gap-2 text-[#64748b] mb-4">
            <i className="fas fa-map-marker-alt text-[#9f7539]"></i>
            <span className="font-medium">{property.location}</span>
          </div>

          <div className="flex flex-wrap gap-4 md:gap-6">
            <div className="flex items-center gap-2 text-[#334155] font-medium">
              <i className="fas fa-bed text-[#9f7539]"></i>
              <span>{property.bedrooms} bed</span>
            </div>
            <div className="flex items-center gap-2 text-[#334155] font-medium">
              <i className="fas fa-bath text-[#9f7539]"></i>
              <span>{property.bathrooms} bath</span>
            </div>
            <div className="flex items-center gap-2 text-[#334155] font-medium">
              <i className="fas fa-ruler-combined text-[#9f7539]"></i>
              <span>{property.size}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertySummary;
