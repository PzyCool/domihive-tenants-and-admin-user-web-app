// src/dashboards/rent/components/property-details/PropertyDetailsModal.jsx
import React, { useEffect } from 'react';

// Import components
import PropertyHeader from './components/PropertyHeader/PropertyHeader';
import PropertyGallery from './components/PropertyGallery/PropertyGallery';
import MediaTab from './components/Tabs/MediaTab/MediaTab';
import ReviewsTab from './components/Tabs/ReviewTab/ReviewsTab';
import LocationTab from './components/Tabs/LocationTab/LocationTab';
import ActionSection from './components/ActionSection/ActionSection';

// import ActionSection from './components/ActionSection/ActionSection';
import FloatingCallButton from './components/FloatingCallButton';

// Import hooks
import { usePropertyDetails } from './hooks/usePropertyDetails';

const PropertyDetailsModal = ({ propertyId, isOpen, onClose, onBookInspection }) => {
  const { property, loading, error } = usePropertyDetails(propertyId);
  const containerRef = React.useRef(null);
  const [activeSection, setActiveSection] = React.useState(null);
  const [viewedSections, setViewedSections] = React.useState({ media: false, location: false });
  const [validationMessage, setValidationMessage] = React.useState('');
  const [attentionSection, setAttentionSection] = React.useState(null);
  const [floatingLeft, setFloatingLeft] = React.useState(24);
  const floatingOffsetFromMainRef = React.useRef(null);
  const sectionItems = [
    { id: 'media', label: 'Media', icon: 'fa-images' },
    { id: 'reviews', label: 'Reviews', icon: 'fa-star' },
    { id: 'location', label: 'Location', icon: 'fa-location-dot' }
  ];
  const isDrawerOpen = Boolean(activeSection);
  const activeSectionLabel = sectionItems.find((item) => item.id === activeSection)?.label || 'Section';
  const isDesktopViewport = typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  const drawerLeftInset = isDesktopViewport ? Math.max(0, floatingLeft + 72) : 0;
  
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setActiveSection(null);
      setViewedSections({ media: false, location: false });
      setValidationMessage('');
      setAttentionSection(null);
      floatingOffsetFromMainRef.current = null;
    }
  }, [isOpen, propertyId]);

  useEffect(() => {
    if (activeSection === 'media' || activeSection === 'location') {
      setViewedSections((prev) => ({ ...prev, [activeSection]: true }));
      if (attentionSection === activeSection) {
        setAttentionSection(null);
        setValidationMessage('');
      }
    }
  }, [activeSection, attentionSection]);

  useEffect(() => {
    let rafId = null;
    let animationTimeout = null;
    let transitionFrameId = null;

    const updateFloatingLeft = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const mainEl = document.querySelector('.dashboard-main');
      const mainRect = mainEl?.getBoundingClientRect();
      const containerBasedLeft = Math.max(12, containerRect.left - 22);

      if (!mainRect) {
        setFloatingLeft(containerBasedLeft);
        return;
      }

      if (floatingOffsetFromMainRef.current === null) {
        floatingOffsetFromMainRef.current = containerBasedLeft - mainRect.left;
      }

      const anchoredLeft = mainRect.left + floatingOffsetFromMainRef.current;
      setFloatingLeft(Math.max(12, anchoredLeft));
    };

    const trackDuringTransition = () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (animationTimeout) clearTimeout(animationTimeout);
      if (transitionFrameId) cancelAnimationFrame(transitionFrameId);

      const tick = () => {
        updateFloatingLeft();
        transitionFrameId = requestAnimationFrame(tick);
      };
      transitionFrameId = requestAnimationFrame(tick);

      // Sidebar/layout transition duration is 300ms; keep tracking a bit longer
      animationTimeout = setTimeout(() => {
        if (transitionFrameId) cancelAnimationFrame(transitionFrameId);
        transitionFrameId = null;
        updateFloatingLeft();
      }, 420);
    };

    if (isOpen) {
      rafId = requestAnimationFrame(updateFloatingLeft);
      window.addEventListener('resize', updateFloatingLeft);
      const contentScroller = document.querySelector('.dashboard-content');
      contentScroller?.addEventListener('scroll', updateFloatingLeft, { passive: true });

      const sidebarEl = document.querySelector('.dashboard-sidebar');
      const mainEl = document.querySelector('.dashboard-main');
      const observer = new MutationObserver(trackDuringTransition);

      if (sidebarEl) {
        observer.observe(sidebarEl, { attributes: true, attributeFilter: ['class'] });
      }
      if (mainEl) {
        observer.observe(mainEl, { attributes: true, attributeFilter: ['class'] });
        mainEl.addEventListener('transitionrun', trackDuringTransition);
        mainEl.addEventListener('transitionstart', trackDuringTransition);
        mainEl.addEventListener('transitionend', updateFloatingLeft);
      }

      return () => {
        window.removeEventListener('resize', updateFloatingLeft);
        contentScroller?.removeEventListener('scroll', updateFloatingLeft);
        observer.disconnect();
        if (rafId) cancelAnimationFrame(rafId);
        if (transitionFrameId) cancelAnimationFrame(transitionFrameId);
        if (animationTimeout) clearTimeout(animationTimeout);
        if (mainEl) {
          mainEl.removeEventListener('transitionrun', trackDuringTransition);
          mainEl.removeEventListener('transitionstart', trackDuringTransition);
          mainEl.removeEventListener('transitionend', updateFloatingLeft);
        }
      };
    }

    return undefined;
  }, [isOpen, loading, property, isDrawerOpen]);

  const handleProtectedBookInspection = (resolvedPropertyId) => {
    const normalized = String(property?.tenantStatus || property?.status || '').toLowerCase();
    const isBookable = property?.canBook !== false && !['reserved', 'occupied', 'rented'].includes(normalized);
    if (!isBookable) {
      setValidationMessage(
        normalized === 'reserved'
          ? 'This unit is currently reserved by another applicant.'
          : 'This unit is currently occupied and unavailable for booking.'
      );
      return;
    }
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
    if (resolvedPropertyId) {
      if (onBookInspection) {
        onBookInspection(resolvedPropertyId);
      } else {
        onClose();
      }
    }
  };
  
  if (!isOpen) return null;
  
  return (
    // CHANGED: Added background gradient like RentBrowse
    <div className="property-details-page min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <div className="property-details-content p-4 md:p-6">
        {/* CHANGED: Wrapped content in white container with shadow/border */}
        <div className="property-details-card bg-white rounded-lg shadow-md border border-[#e2e8f0] p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#9f7539]"></div>
                <p className="mt-4 text-gray-600">Loading property details...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <p className="text-gray-600">Failed to load property details</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-[#9f7539] text-white rounded-lg hover:bg-[#b58a4a]"
                >
                  Go Back
                </button>
              </div>
            </div>
          ) : property ? (
            <div ref={containerRef} className="container mx-auto px-4 lg:px-6 py-6 relative">
              <div className="mb-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="property-back-btn inline-flex items-center gap-2 text-[var(--text-color,#0e1f42)] hover:text-[#9f7539] transition-colors"
                >
                  <i className="fas fa-arrow-left"></i>
                  <span>Return to Browse</span>
                </button>
              </div>

              <div
                className="hidden lg:flex fixed top-1/2 -translate-y-1/2 z-[1400] w-fit flex-col gap-3"
                style={{ left: `${floatingLeft}px` }}
              >
                {sectionItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`w-11 h-11 rounded-full border flex items-center justify-center shadow-md transition-all ${
                      activeSection === item.id
                        ? 'bg-[#9f7539] text-white border-[#9f7539]'
                        : 'bg-white text-[#0e1f42] border-[#e2e8f0] hover:border-[#9f7539] hover:text-[#9f7539]'
                    } ${attentionSection === item.id ? 'ring-2 ring-[#9f7539] animate-pulse' : ''}`}
                    title={item.label}
                  >
                    <i className={`fas ${item.icon}`}></i>
                  </button>
                ))}
              </div>

              <div>
                    <>
                  <PropertyGallery images={property.images} />
                  <FloatingCallButton phoneNumber="+2349010851071" />
                  <PropertyHeader property={property} />

                  <div className="mt-6 mb-6 lg:hidden">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      <button
                        type="button"
                        onClick={() => setActiveSection(null)}
                        className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                          !isDrawerOpen
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
                          } ${attentionSection === item.id ? 'ring-2 ring-[#9f7539] animate-pulse' : ''}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="property-overview-shell rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-6 mt-6">
                    <p className="text-[#64748b] max-w-2xl">
                      Please review both <span className="font-semibold text-[#0e1f42]">Media</span> and <span className="font-semibold text-[#0e1f42]">Location</span> before booking inspection.
                    </p>
                    <div className="mt-6">
                      {validationMessage && (
                        <div className="mb-4 rounded-xl border border-[#f59e0b]/40 bg-[#fff7ed] px-4 py-3 text-sm text-[#9a3412]">
                          {validationMessage}
                        </div>
                      )}
                      <ActionSection
                        propertyId={property?.id}
                        property={property}
                        onBookInspection={handleProtectedBookInspection}
                      />
                    </div>
                  </div>
                    </>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <i className="fas fa-house-circle-xmark text-4xl text-[#9f7539] mb-4"></i>
                <p className="text-gray-600">Property not found</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-[#9f7539] text-white rounded-lg hover:bg-[#b58a4a]"
                >
                  Return
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-[1300] bg-black/40">
          <div
            className="absolute inset-y-0 right-0 bg-white border-l border-[#e2e8f0] shadow-xl overflow-y-auto"
            style={{
              left: `${drawerLeftInset}px`,
              width: `calc(100vw - ${drawerLeftInset}px)`
            }}
          >
            <div className="sticky top-0 z-10 px-6 py-4 min-h-[72px] border-b border-[#e2e8f0] bg-white flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0e1f42]">{activeSectionLabel}</h3>
              <button
                type="button"
                onClick={() => setActiveSection(null)}
                className="property-drawer-close-btn inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e2e8f0] text-[#0e1f42] hover:text-[#9f7539] hover:border-[#9f7539] transition-colors"
                title="Close drawer"
              >
                <i className="fas fa-times text-base"></i>
              </button>
            </div>

            <div className="p-5">
              {activeSection === 'media' && <MediaTab property={property} />}
              {activeSection === 'reviews' && <ReviewsTab property={property} />}
              {activeSection === 'location' && <LocationTab property={property} />}
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Call Button */}
      {/* <FloatingCallButton phoneNumber="+2349010851071" />  */}
    </div>
  );
};

export default PropertyDetailsModal;
