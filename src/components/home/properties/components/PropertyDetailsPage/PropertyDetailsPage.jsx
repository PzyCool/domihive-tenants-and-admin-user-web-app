// src/components/home/properties/components/PropertyDetailsPage/PropertyDetailsPage.jsx
import React from 'react';
import PropertyHeader from './components/PropertyHeader/PropertyHeader';
import PropertyGallery from './components/PropertyGallery/PropertyGallery';
import MediaTab from './components/tabs/MediaTab/MediaTab';
import ReviewsTab from './components/tabs/ReviewsTab/ReviewsTab';
import LocationTab from './components/tabs/LocationTab/LocationTab';
import ActionSection from './components/ActionSection/ActionSection';
// import FloatingCallButton from './components/FloatingCallButton';
import usePropertyDetails from './hooks/usePropertyDetails';

const PropertyDetailsPage = ({ propertyId, listingType, onBookInspection, onClose }) => {
  const { property, loading, error } = usePropertyDetails(propertyId);
  const [activeSection, setActiveSection] = React.useState('overview');
  const [viewedSections, setViewedSections] = React.useState({ media: false, location: false });
  const [validationMessage, setValidationMessage] = React.useState('');
  const [attentionSection, setAttentionSection] = React.useState(null);

  React.useEffect(() => {
    setActiveSection('overview');
    setViewedSections({ media: false, location: false });
    setValidationMessage('');
    setAttentionSection(null);
  }, [propertyId]);
  const sectionItems = [
    { id: 'media', label: 'Media', icon: 'fa-images' },
    { id: 'reviews', label: 'Reviews', icon: 'fa-star' },
    { id: 'location', label: 'Location', icon: 'fa-location-dot' }
  ];
  const isOverview = activeSection === 'overview';
  const activeSectionLabel = sectionItems.find((item) => item.id === activeSection)?.label || 'Section';

  React.useEffect(() => {
    if (activeSection === 'media' || activeSection === 'location') {
      setViewedSections((prev) => ({ ...prev, [activeSection]: true }));
      if (attentionSection === activeSection) {
        setAttentionSection(null);
        setValidationMessage('');
      }
    }
  }, [activeSection, attentionSection]);

  const handleProtectedBookInspection = (resolvedPropertyId) => {
    if (!viewedSections.media) {
      setValidationMessage('Please click the Media floating icon to view photos and videos before you continue.');
      setAttentionSection('media');
      return;
    }

    if (!viewedSections.location) {
      setValidationMessage('Please click the Location floating icon to review the property location before you continue.');
      setAttentionSection('location');
      return;
    }

    setValidationMessage('');
    setAttentionSection(null);
    if (onBookInspection) {
      onBookInspection(resolvedPropertyId);
    }
  };

  if (loading) {
    return (
      <div className="property-details-page min-h-screen bg-white py-8">
        <div className="container max-w-[1200px] mx-auto px-4">
          <div className="text-center text-gray-600">Loading property details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="property-details-page min-h-screen bg-white py-8">
        <div className="container max-w-[1200px] mx-auto px-4">
          <div className="text-center text-red-600">Error loading property.</div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="property-details-page min-h-screen bg-white py-8">
        <div className="container max-w-[1200px] mx-auto px-4">
          <div className="text-center text-gray-600">Property not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="property-details-page min-h-screen bg-white py-8">
      {isOverview && (
      <div className="hidden lg:flex fixed left-1 top-1/2 -translate-y-1/2 z-40 flex-col gap-3">
        {sectionItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveSection(item.id)}
            className={`w-11 h-11 rounded-full border flex items-center justify-center shadow-md transition-all ${
              activeSection === item.id
                ? 'bg-[#9f7539] text-white border-[#9f7539]'
                : 'bg-white text-[#0e1f42] border-[#e2e8f0] hover:border-[#9f7539] hover:text-[#9f7539]'
            } ${
              attentionSection === item.id ? 'ring-2 ring-[#9f7539] animate-pulse' : ''
            }`}
            title={item.label}
          >
            <i className={`fas ${item.icon}`}></i>
          </button>
        ))}
      </div>
      )}

      <div className="container max-w-[1200px] mx-auto px-4">
        {!isOverview && (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className="inline-flex items-center gap-2 text-[#0e1f42] hover:text-[#9f7539] transition-colors"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Return to Overview</span>
            </button>
          </div>
        )}

        {isOverview && (
        <>
        {/* Property Gallery - FIRST */}
        <PropertyGallery images={property.images} />

        {/* Property Header - SECOND */}
        <PropertyHeader property={property} listingType={listingType} />

        <div className="mt-6 mb-6 lg:hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                activeSection === 'overview'
                  ? 'bg-[#9f7539] text-white border-[#9f7539]'
                  : 'bg-white text-[#0e1f42] border-[#e2e8f0]'
              }`}
            >
              Overview
            </button>
            {sectionItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                  activeSection === item.id
                    ? 'bg-[#9f7539] text-white border-[#9f7539]'
                    : 'bg-white text-[#0e1f42] border-[#e2e8f0]'
                } ${
                  attentionSection === item.id ? 'ring-2 ring-[#9f7539] animate-pulse' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        </>
        )}

        <div className="py-4 animate-fadeIn">
          {isOverview && (
            <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <p className="text-[#64748b] max-w-2xl">{property.description}</p>
                  <p className="text-sm text-[#64748b] mt-3">
                    Please review both <span className="font-semibold text-[#0e1f42]">Media</span> and <span className="font-semibold text-[#0e1f42]">Location</span> before booking inspection.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                {validationMessage && (
                  <div className="mb-4 rounded-xl border border-[#f59e0b]/40 bg-[#fff7ed] px-4 py-3 text-sm text-[#9a3412]">
                    {validationMessage}
                  </div>
                )}
                <ActionSection
                  property={property}
                  onBookInspection={handleProtectedBookInspection}
                />
              </div>
            </div>
          )}

          {!isOverview && <h3 className="mb-5 text-xl font-semibold text-[#0e1f42]">{activeSectionLabel}</h3>}

          {activeSection === 'media' && (
            <MediaTab property={property} listingType={listingType} onBookInspection={onBookInspection} />
          )}
          {activeSection === 'reviews' && (
            <ReviewsTab property={property} listingType={listingType} onBookInspection={onBookInspection} />
          )}
          {activeSection === 'location' && (
            <LocationTab property={property} listingType={listingType} onBookInspection={onBookInspection} />
          )}
        </div>

        {/* Grid only for ActionSection */}
        <div className={`mt-8 ${!isOverview ? 'hidden' : ''}`}>
          {/* <ActionSection 
            property={property} 
            listingType={listingType} 
          /> */}
        </div>

        {/* Floating Call Button */}
        {/* <FloatingCallButton phoneNumber="+2349010851071" /> */}
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
