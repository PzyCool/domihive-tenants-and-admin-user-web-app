// src/dashboards/rent/components/book-inspection/PropertySummary.jsx
import React from 'react';
import TenantUnitCard, { formatUnitSize } from '../common/TenantUnitCard';

const PropertySummary = ({ propertyData }) => {
  const fallbackProperty = {
    title: 'Luxury 3-Bedroom Apartment in Ikoyi',
    price: 4500000,
    location: 'Ikoyi, Lagos Island',
    bedrooms: 3,
    bathrooms: 3,
    size: '180 sqm',
    description: 'No unit description available yet.',
    image: '/ASSECT/3d-rendering-modern-dining-room-living-room-with-luxury-decor (1).jpg'
  };

  const property = { ...fallbackProperty, ...(propertyData || {}) };
  const inspectionMeta = propertyData?.inspectionDate ? `Inspection: ${propertyData.inspectionDate}` : null;

  return (
    <section className="inspection-summary-card bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[rgba(14,31,66,0.05)] p-6 md:p-8">
      <div className="text-center mb-8 pb-6 border-b border-[#e2e8f0]">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0e1f42] mb-2">Book Property Inspection</h1>
        <p className="text-[#64748b] text-lg">
          Schedule a physical viewing of the property before making your decision
        </p>
      </div>

      <TenantUnitCard
        className="inspection-summary-inner"
        image={property.image}
        imageAlt={property.title}
        price={property.price}
        topMeta={inspectionMeta}
        title={property.title}
        location={property.location}
        bedrooms={Number(property.bedrooms || 0)}
        bathrooms={Number(property.bathrooms || 0)}
        size={formatUnitSize(property.size)}
        description={property.description || 'No unit description available yet.'}
      />
    </section>
  );
};

export default PropertySummary;
