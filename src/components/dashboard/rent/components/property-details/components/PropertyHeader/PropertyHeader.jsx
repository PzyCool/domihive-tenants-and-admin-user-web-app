// src/dashboards/rent/components/property-details/components/PropertyHeader/PropertyHeader.jsx
import React, { useMemo, useState } from 'react';

const PropertyHeader = ({ property }) => {
  const [showFullSpecs, setShowFullSpecs] = useState(false);

  const specificationSections = useMemo(() => {
    const defaults = {
      building: ['New construction (2023)', '6-floor building with elevator', 'Modern architectural design'],
      interior: ['Marble flooring', 'Fitted wardrobes', 'Central air conditioning'],
      exterior: ['Swimming pool', 'Landscaped gardens', 'Secure parking'],
      utilities: ['Constant water supply', 'Backup generator', 'High-speed fiber internet']
    };
    return property?.specifications || defaults;
  }, [property]);

  const compactHighlights = useMemo(() => {
    const source = [
      ...(specificationSections.building || []),
      ...(specificationSections.interior || []),
      ...(specificationSections.exterior || []),
      ...(specificationSections.utilities || [])
    ];
    return source.slice(0, 6);
  }, [specificationSections]);

  return (
    <div className="property-header mb-8">
      {/* Property Title, Price and ID */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0e1f42] mb-2">
              Luxury 3-Bedroom Apartment in Ikoyi
            </h1>
            <div className="text-[#64748b] mb-2">
              Ikoyi, Lagos Island
            </div>
          </div>
          <div className="mt-2 md:mt-0">
            <div className="text-xl md:text-2xl font-bold text-[#0e1f42] mb-1">
              ₦4,500,000/year
            </div>
            <div className="text-sm text-[#64748b]">
              <span className="font-medium">Property ID:</span> rent_123
            </div>
          </div>
        </div>

        {/* Property Features Compact */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6 py-3">
          <div className="flex items-center gap-2">
            <i className="fas fa-bed text-[#9f7539] text-lg"></i>
            <span className="font-semibold text-[#0e1f42]">3</span>
            <span className="text-[#64748b] text-sm">Beds</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-bath text-[#9f7539] text-lg"></i>
            <span className="font-semibold text-[#0e1f42]">3</span>
            <span className="text-[#64748b] text-sm">Baths</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-ruler-combined text-[#9f7539] text-lg"></i>
            <span className="font-semibold text-[#0e1f42]">180</span>
            <span className="text-[#64748b] text-sm">sqm</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-layer-group text-[#9f7539] text-lg"></i>
            <span className="font-semibold text-[#0e1f42]">Apartment</span>
          </div>
        </div>
      </div>

      {/* Property Overview */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#0e1f42] mb-3">Overview</h2>
        <p className="text-[#64748b] text-sm leading-relaxed">
          This stunning 3-bedroom apartment offers luxurious living in the heart of Ikoyi. Featuring modern finishes, spacious rooms, and premium amenities, this property is perfect for families seeking comfort and style.
        </p>
      </div>

      {/* Detailed Specifications - Compact Accordion Style */}
      <div className="spec-card bg-[#f8fafc] p-5 rounded-xl border border-[#e2e8f0]">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-bold text-[#0e1f42]">Specifications</h2>
          <button
            type="button"
            onClick={() => setShowFullSpecs((prev) => !prev)}
            className="text-sm font-medium text-[#9f7539] hover:text-[#b58a4a] transition-colors"
          >
            {showFullSpecs ? 'Hide Details' : 'View Full Specs'}
          </button>
        </div>

        {!showFullSpecs && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <div className="bg-white border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm">
                <span className="text-[#64748b]">Building</span>
                <div className="font-semibold text-[#0e1f42]">{(specificationSections.building || []).length} items</div>
              </div>
              <div className="bg-white border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm">
                <span className="text-[#64748b]">Interior</span>
                <div className="font-semibold text-[#0e1f42]">{(specificationSections.interior || []).length} items</div>
              </div>
              <div className="bg-white border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm">
                <span className="text-[#64748b]">Exterior</span>
                <div className="font-semibold text-[#0e1f42]">{(specificationSections.exterior || []).length} items</div>
              </div>
              <div className="bg-white border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm">
                <span className="text-[#64748b]">Utilities</span>
                <div className="font-semibold text-[#0e1f42]">{(specificationSections.utilities || []).length} items</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {compactHighlights.map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="inline-flex items-center rounded-full border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs text-[#475467]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {showFullSpecs && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <h3 className="font-semibold text-[#0e1f42] mb-2">Building</h3>
              <div className="space-y-1.5">
                {(specificationSections.building || []).map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <i className="fas fa-check text-[#9f7539] text-xs"></i>
                    <span className="text-[#64748b]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#0e1f42] mb-2">Interior</h3>
              <div className="space-y-1.5">
                {(specificationSections.interior || []).map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <i className="fas fa-check text-[#9f7539] text-xs"></i>
                    <span className="text-[#64748b]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#0e1f42] mb-2">Exterior</h3>
              <div className="space-y-1.5">
                {(specificationSections.exterior || []).map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <i className="fas fa-check text-[#9f7539] text-xs"></i>
                    <span className="text-[#64748b]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#0e1f42] mb-2">Utilities</h3>
              <div className="space-y-1.5">
                {(specificationSections.utilities || []).map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <i className="fas fa-check text-[#9f7539] text-xs"></i>
                    <span className="text-[#64748b]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyHeader;
