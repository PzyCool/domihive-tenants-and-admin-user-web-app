// src/dashboards/rent/components/book-inspection/BookInspectionPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { useApplications } from '../../contexts/ApplicationsContext';
import PropertySummary from './PropertySummary';
import InspectionForm from './InspectionForm';
import TermsAndConditions from './TermsAndConditions';
import DocumentVerification from './DocumentVerification';
import UserContextBanner from './UserContextBanner';
import SuccessModal from './SuccessModal';
import FloatingCallButton from '../property-details/components/FloatingCallButton';

const BookInspectionPage = ({ propertyId, propertyData, onBack }) => {
  const { user } = useAuth();
  const { createApplicationFromBooking } = useApplications();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Form state managed in parent
  const [formValues, setFormValues] = useState({
    inspectionDate: '',
    inspectionTime: '',
    numberOfPeople: '',
    inspectionNotes: ''
  });

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleFormChange = (field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInspectionFormSubmit = () => {
    // Validate all required fields
    if (!formValues.inspectionDate || !formValues.inspectionTime || !formValues.numberOfPeople) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!agreeTerms) {
      alert('Please agree to the Terms and Conditions');
      return;
    }
    
    const completeFormData = {
      ...formValues,
      agreeTerms,
      propertyId,
      bookingId: 'DOMI-INSP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      bookingDate: new Date().toISOString(),
      status: 'pending'
    };
    
    setShowSuccessModal(true);
    
    // Save to localStorage
    try {
      const bookings = JSON.parse(localStorage.getItem('domihive_inspection_bookings')) || [];
      bookings.unshift(completeFormData);
      localStorage.setItem('domihive_inspection_bookings', JSON.stringify(bookings));
      sessionStorage.setItem('domihive_current_booking', JSON.stringify(completeFormData));
    } catch (error) {
      console.error('Error saving booking:', error);
    }

    const fallbackProperty = {
      id: propertyId || 'PROP-UNKNOWN',
      title: 'Luxury 3-Bedroom Apartment in Ikoyi',
      location: 'Ikoyi, Lagos Island',
      price: 4500000,
      image: '/ASSECT/3d-rendering-modern-dining-room-living-room-with-luxury-decor (1).jpg'
    };

    createApplicationFromBooking({
      booking: completeFormData,
      property: propertyData || fallbackProperty,
      applicantName: user?.name
    });
  };

  const handleTermsChange = (e) => {
    setAgreeTerms(e.target.checked);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  // Demo property data for SuccessModal (should come from PropertySummary)
  const demoProperty = {
    title: propertyData?.title || "Luxury 3-Bedroom Apartment in Ikoyi",
    location: propertyData?.location || "Ikoyi, Lagos Island"
  };

  return (
    <div className="book-inspection-page min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <div className="property-details-content p-4 md:p-6">
        <div className="book-inspection-card bg-white rounded-lg shadow-md border border-[#e2e8f0] p-4 md:p-6">
          {/* Back to Browse Navigation - Top */}
          <div className="mb-6">
            <button
              onClick={handleBackClick}
              className="property-back-btn flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
            >
              <i className="fas fa-arrow-left"></i>
              <span className="font-medium">Back to Browse</span>
            </button>
          </div>

          {/* Property Summary Section */}
          <PropertySummary propertyData={propertyData} />

          {/* Inspection Form Section */}
          <section className="mt-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0e1f42] mb-2">
                Schedule Your Inspection
              </h2>
              <p className="text-[#64748b] mb-8">
                Choose a convenient date and time for your property viewing
              </p>

              {/* User Context Banner */}
              <UserContextBanner />

              <form 
                id="inspectionBookingForm" 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleInspectionFormSubmit();
                }}
                className="space-y-8"
              >
                {/* Inspection Details */}
                <InspectionForm 
                  propertyId={propertyId}
                  formValues={formValues}
                  onFormChange={handleFormChange}
                />

                {/* Document Verification Section */}
                <DocumentVerification />

                {/* Terms and Conditions Section */}
                {/* We need to pass the checked state to TermsAndConditions */}
                <div className="terms-section">
                  <TermsAndConditions 
                    checked={agreeTerms}
                    onChange={handleTermsChange}
                  />
                </div>

                {/* Form Actions */}
                <div className="pt-8 border-t border-[#e2e8f0] flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <button
                    type="button"
                    onClick={handleBackClick}
                    className="px-6 py-3 bg-[#f8fafc] border border-[#e2e8f0] text-[#0e1f42] font-semibold rounded-lg hover:bg-[#e2e8f0] transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <i className="fas fa-arrow-left"></i>
                    Back to Browse
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-[#9f7539] to-[#b58a4a] text-white font-semibold rounded-lg hover:from-[#b58a4a] hover:to-[#9f7539] transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center hover:shadow-[0_8px_25px_rgba(159,117,57,0.3)] hover:-translate-y-0.5"
                  >
                    <i className="fas fa-calendar-check"></i>
                    Book Inspection
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>

      {/* Floating Call Button */}
      <FloatingCallButton phoneNumber="+2349010851071" />

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        bookingData={{
          ...formValues,
          propertyTitle: demoProperty.title,
          location: demoProperty.location,
          numberOfPeople: formValues.numberOfPeople || '2'
        }}
      />
    </div>
  );
};

export default BookInspectionPage;
