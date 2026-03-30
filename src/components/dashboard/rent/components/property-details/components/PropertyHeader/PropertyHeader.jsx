// src/dashboards/rent/components/property-details/components/PropertyHeader/PropertyHeader.jsx
import React, { useMemo } from 'react';

const PropertyHeader = ({ property }) => {
  const numericSize = useMemo(() => {
    const raw = String(property?.size || '');
    const match = raw.match(/(\d+(\.\d+)?)/);
    return match ? match[1] : raw || '—';
  }, [property]);

  const unitTypeLabel = useMemo(
    () => property?.propertyTypeLabel || property?.propertyType || 'Unit',
    [property]
  );

  const specificationSections = useMemo(() => {
    const hasAmenity = (needle) =>
      Array.isArray(property?.amenityIds) && property.amenityIds.includes(needle);

    const buildingTypeDirect = String(
      property?.buildingTypeLabel || property?.buildingType || property?.propertyBuildingType || ''
    ).trim();

    const rawTypeCandidates = [
      property?.buildingType,
      property?.propertyBuildingType,
      property?.propertyCategory,
      property?.estateType,
      property?.tag,
      property?.title
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const derivedPropertyType = rawTypeCandidates.includes('duplex')
      ? 'Duplex'
      : rawTypeCandidates.includes('bungalow')
      ? 'Bungalow'
      : rawTypeCandidates.includes('terrace') || rawTypeCandidates.includes('terraced')
      ? 'Terraced House'
      : rawTypeCandidates.includes('block') && rawTypeCandidates.includes('flat')
      ? 'Block of Flats'
      : buildingTypeDirect || '';

    const ageValue = String(property?.propertyAge || '').toLowerCase();
    const propertyTypeText = derivedPropertyType;
    const estateTagText =
      property?.isEstate === true || String(property?.managementType || '').toLowerCase() === 'estate_property'
        ? 'Estate'
      : property?.isEstate === false || String(property?.managementType || '').toLowerCase() === 'non_estate'
        ? 'Non estate'
        : 'Non estate';
    const designLabel = ageValue.includes('new')
      ? 'New architectural design'
      : ageValue.includes('modern')
      ? 'Modern architectural design'
      : ageValue.includes('old') || ageValue.includes('established')
      ? 'Old architectural design'
      : 'Modern architectural design';
    const ageLabel = ageValue
      ? ageValue.replaceAll('_', ' ').replace(/^\w/, (c) => c.toUpperCase())
      : 'Modern';

    const building = [
      designLabel || `${ageLabel} architectural design`,
      `Estate tag: ${estateTagText}`,
      propertyTypeText || 'Building type not specified'
    ].filter(Boolean);

    const interior = [
      property?.furnishing
        ? `Furnishing: ${String(property.furnishing).replaceAll('_', ' ')}`
        : 'Furnishing not specified',
      hasAmenity('ac') ? 'Air conditioning ready' : null,
      hasAmenity('pop_ceilings') ? 'POP ceilings' : null,
      hasAmenity('jacuzzi') ? 'Jacuzzi feature' : null
    ].filter(Boolean);

    const exterior = [
      hasAmenity('swimming_pool') ? 'Swimming pool' : null,
      hasAmenity('external_garden') ? 'External garden' : null,
      hasAmenity('parking') ? 'Dedicated parking' : null,
      hasAmenity('gym') ? 'Gym access' : null
    ].filter(Boolean);

    const utilities = [
      hasAmenity('security') ? 'Security service' : null,
      hasAmenity('generator') ? 'Backup generator' : null,
      hasAmenity('wifi') ? 'High-speed internet' : null,
      hasAmenity('inverter') ? 'Inverter support' : null,
      hasAmenity('solar_system') ? 'Solar system' : null,
      hasAmenity('central_water_heater_system') ? 'Central water heater' : null,
      hasAmenity('cctv') ? 'CCTV coverage' : null
    ].filter(Boolean);

    const defaults = {
      building: building.length ? building : ['Building details not available'],
      interior: interior.length ? interior : ['Interior details not available'],
      exterior: exterior.length ? exterior : ['Exterior details not available'],
      utilities: utilities.length ? utilities : ['Utilities details not available']
    };

    return property?.specifications || defaults;
  }, [property, unitTypeLabel]);

  return (
    <div className="property-header mb-8">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0e1f42] mb-2">
              {property?.title || 'Property'}
            </h1>
            <div className="text-[#64748b] mb-2">
              {property?.location || 'Location not available'}
            </div>
          </div>
          <div className="mt-2 md:mt-0">
            <div className="property-price-main text-xl md:text-2xl font-bold text-[#0e1f42] mb-1">
              ₦{Number(property?.price || 0).toLocaleString()}/year
            </div>
            <div className="text-sm text-[#64748b]">
              <span className="font-medium">Property ID:</span> {property?.id || 'rent_123'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6 py-3">
          <div className="flex items-center gap-2">
            <i className="fas fa-bed text-[#9f7539] text-lg"></i>
            <span className="font-semibold text-[#0e1f42]">{Number(property?.bedrooms || 0)}</span>
            <span className="text-[#64748b] text-sm">Beds</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-bath text-[#9f7539] text-lg"></i>
            <span className="font-semibold text-[#0e1f42]">{Number(property?.bathrooms || 0)}</span>
            <span className="text-[#64748b] text-sm">Baths</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-ruler-combined text-[#9f7539] text-lg"></i>
            <span className="font-semibold text-[#0e1f42]">{numericSize}</span>
            <span className="text-[#64748b] text-sm">sqm</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-layer-group text-[#9f7539] text-lg"></i>
            <span className="font-semibold text-[#0e1f42]">{unitTypeLabel}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#0e1f42] mb-3">Overview</h2>
        <p className="text-[#64748b] text-sm leading-relaxed">
          {property?.description || 'Property description not available yet.'}
        </p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#0e1f42] mb-3">Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <h3 className="font-semibold text-[#0e1f42] mb-2">Building</h3>
            <div className="space-y-1.5">
              {(specificationSections.building || []).map((item, index) => (
                <div key={`building-${index}`} className="flex items-start gap-2 text-sm">
                  <i className="fas fa-check text-[#9f7539] text-xs mt-1"></i>
                  <span className="text-[#64748b]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[#0e1f42] mb-2">Exterior</h3>
            <div className="space-y-1.5">
              {(specificationSections.exterior || []).map((item, index) => (
                <div key={`exterior-${index}`} className="flex items-start gap-2 text-sm">
                  <i className="fas fa-check text-[#9f7539] text-xs mt-1"></i>
                  <span className="text-[#64748b]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[#0e1f42] mb-2">Interior</h3>
            <div className="space-y-1.5">
              {(specificationSections.interior || []).map((item, index) => (
                <div key={`interior-${index}`} className="flex items-start gap-2 text-sm">
                  <i className="fas fa-check text-[#9f7539] text-xs mt-1"></i>
                  <span className="text-[#64748b]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[#0e1f42] mb-2">Utilities</h3>
            <div className="space-y-1.5">
              {(specificationSections.utilities || []).map((item, index) => (
                <div key={`utilities-${index}`} className="flex items-start gap-2 text-sm">
                  <i className="fas fa-check text-[#9f7539] text-xs mt-1"></i>
                  <span className="text-[#64748b]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyHeader;
