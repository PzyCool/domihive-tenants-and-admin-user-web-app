// src/dashboards/rent/components/property-details/components/ActionSection/ActionSection.jsx
import React, { useState } from 'react';

const ActionSection = ({ propertyId, property, onBookInspection }) => {
  const [isInterested, setIsInterested] = useState(false);
  const resolvedPropertyId = propertyId ?? property?.id;
  const normalized = String(property?.tenantStatus || property?.status || '').toLowerCase();
  const isBookable = property?.canBook !== false && !['reserved', 'occupied', 'rented'].includes(normalized);

  const handleCheckboxChange = () => {
    if (!isBookable) return;
    setIsInterested(!isInterested);
  };

  const handleBookInspection = () => {
    if (isBookable && isInterested && onBookInspection && resolvedPropertyId) {
      onBookInspection(resolvedPropertyId);
    }
  };

  return (
    <div className="action-section bg-white rounded-2xl border border-[#e2e8f0] p-6">
      <div className="space-y-4">
        {/* Checkbox Section */}
        <div className="flex items-start gap-3">
          <div className="flex items-center h-6">
            <input
              id="interest-checkbox"
              type="checkbox"
              checked={isInterested}
              onChange={handleCheckboxChange}
              disabled={!isBookable}
              className="w-5 h-5 text-[#9f7539] bg-[#f8fafc] border-[#e2e8f0] rounded focus:ring-[#9f7539]/20 focus:ring-2"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="interest-checkbox"
              className="text-[#0e1f42] font-medium cursor-pointer select-none"
            >
              I like this property and I'm interested in proceeding
            </label>
            <p className="text-sm text-[#64748b] mt-1">
              {isBookable
                ? 'Check this box to enable booking options for this property'
                : normalized === 'reserved'
                  ? 'This unit is currently reserved by another applicant.'
                  : 'This unit is currently occupied and unavailable for booking.'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#e2e8f0]"></div>

        {/* Book Inspection Button */}
        <div>
          <button
            onClick={handleBookInspection}
            disabled={!isInterested || !isBookable}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
              isInterested && isBookable
                ? 'bg-[#9f7539] text-white hover:bg-[#b58a4a] shadow-md hover:shadow-lg'
                : 'bg-[#f8fafc] text-[#64748b] cursor-not-allowed border border-[#e2e8f0]'
            }`}
          >
            {isBookable ? (isInterested ? 'Book Inspection' : 'Select checkbox to book inspection') : 'Not Available for Booking'}
          </button>
          
          {isInterested && isBookable && (
            <p className="text-sm text-[#64748b] mt-2 text-center">
              You'll be redirected to schedule your property inspection
            </p>
          )}
        </div>

        {/* Status Indicator */}
        <div className={`p-3 rounded-lg ${isInterested && isBookable ? 'bg-green-50 border border-green-200' : 'bg-[#f8fafc] border border-[#e2e8f0]'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isInterested && isBookable ? 'bg-green-500' : 'bg-[#64748b]'}`}></div>
            <span className={`text-sm font-medium ${isInterested && isBookable ? 'text-green-700' : 'text-[#64748b]'}`}>
              {isBookable
                ? (isInterested ? 'Ready to book inspection' : 'Select your interest to proceed')
                : normalized === 'reserved'
                  ? 'Reserved - Application in progress'
                  : 'Occupied - Not available'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionSection;
