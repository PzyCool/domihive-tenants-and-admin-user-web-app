// src/dashboards/rent/components/book-inspection/PropertySummary.jsx
import React from 'react';

const PropertySummary = ({ propertyData }) => {
  const fallbackProperty = {
    title: 'Luxury 3-Bedroom Apartment in Ikoyi',
    price: 4500000,
    location: 'Ikoyi, Lagos Island',
    bedrooms: 3,
    bathrooms: 3,
    size: '180 sqm',
    image: '/ASSECT/3d-rendering-modern-dining-room-living-room-with-luxury-decor (1).jpg'
  };

  const property = { ...fallbackProperty, ...(propertyData || {}) };

  const formatPrice = (price) => `₦${Number(price || 0).toLocaleString()}/year`;

  const formatPriceWords = (price) => {
    const amount = Number(price || 0);
    if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)} billion naira yearly`;
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)} million naira yearly`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)} thousand naira yearly`;
    return `${amount.toLocaleString('en-NG')} naira yearly`;
  };

  return (
    <section className="inspection-summary-card bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[rgba(14,31,66,0.05)] p-6 md:p-8">
      <div className="text-center mb-8 pb-6 border-b border-[#e2e8f0]">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0e1f42] mb-2">Book Property Inspection</h1>
        <p className="text-[#64748b] text-lg">Schedule a physical viewing of the property before making your decision</p>
      </div>

      <div className="inspection-summary-inner rounded-xl border border-[var(--border-color,#e2e8f0)] bg-[var(--card-bg,#f8fafc)] px-4 py-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-[var(--border-color,#e2e8f0)] bg-[var(--surface-2,#f1f5f9)] shrink-0">
            <img
              src={property.image}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop';
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="property-price-main text-xl font-bold leading-tight">{formatPrice(property.price)}</p>
            <p className="text-xs text-[var(--text-muted,#64748b)] mt-0.5">{formatPriceWords(property.price)}</p>

            <h3 className="text-2xl md:text-3xl font-semibold text-[var(--text-color,#0e1f42)] mt-1">{property.title}</h3>

            <div className="text-sm text-[var(--text-muted,#64748b)] inline-flex items-center gap-1.5 mt-1">
              <i className="fas fa-map-marker-alt text-[var(--accent-color,#9f7539)] text-[11px]"></i>
              <span className="font-medium">{property.location}</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted,#64748b)]">
              <span className="inline-flex items-center gap-1">
                <i className="fas fa-bed text-[var(--accent-color,#9f7539)] text-[11px]"></i>
                {Number(property.bedrooms || 0)} bed
              </span>
              <span className="inline-flex items-center gap-1">
                <i className="fas fa-bath text-[var(--accent-color,#9f7539)] text-[11px]"></i>
                {Number(property.bathrooms || 0)} bath
              </span>
              <span className="inline-flex items-center gap-1">
                <i className="fas fa-ruler-combined text-[var(--accent-color,#9f7539)] text-[11px]"></i>
                {property.size || '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertySummary;
