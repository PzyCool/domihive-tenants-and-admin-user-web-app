// src/dashboards/rent/components/book-inspection/SuccessModal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessModal = ({ isOpen, onClose, bookingData }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow || '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const booking = bookingData || {
    propertyTitle: "Luxury 3-Bedroom Apartment in Ikoyi",
    inspectionDate: "2024-12-20",
    inspectionTime: "14:00",
    location: "Ikoyi, Lagos Island",
    numberOfPeople: 2
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(date + 'T' + time);
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + formatTimeDisplay(time);
  };

  const formatTimeDisplay = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const attendeesText = booking.numberOfPeople === 1 
    ? '1 person' 
    : `${booking.numberOfPeople} people`;

  const handleViewApplication = () => {
    onClose?.();
    navigate('/dashboard/rent/applications');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[1400]">
      <div className="bg-white rounded-xl overflow-hidden w-full max-w-lg border border-[#e2e8f0] shadow-[0_20px_25px_rgba(0,0,0,0.25)]">
        {/* Modal Header - Compact */}
        <div className="relative p-4 border-b border-[#e2e8f0] bg-gradient-to-r from-[#10b981] to-[#34d399] rounded-t-xl">
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <i className="fas fa-check-circle text-[#10b981] text-lg"></i>
            </div>
            <h2 className="text-lg font-bold text-white">Inspection Booked Successfully!</h2>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-white hover:text-gray-200 p-1"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Modal Body - Compact */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-[#334155] text-center mb-2">
            Your property inspection has been scheduled successfully.
          </p>

          {/* Booking Summary - Compact */}
          <div className="bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0]">
            <h4 className="font-semibold text-[#0e1f42] text-sm mb-2">Booking Details:</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <strong className="text-[#0e1f42]">Property:</strong>
                <span className="text-[#334155] text-right ml-2 truncate max-w-[180px]">{booking.propertyTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <strong className="text-[#0e1f42]">Date & Time:</strong>
                <span className="text-[#334155] text-right ml-2 max-w-[180px] text-xs">
                  {formatDateTime(booking.inspectionDate, booking.inspectionTime)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <strong className="text-[#0e1f42]">Location:</strong>
                <span className="text-[#334155] text-right ml-2 truncate max-w-[180px]">{booking.location}</span>
              </div>
              <div className="flex justify-between items-center">
                <strong className="text-[#0e1f42]">Attendees:</strong>
                <span className="text-[#334155] text-right ml-2">{attendeesText}</span>
              </div>
            </div>
          </div>

          {/* Document Reminder - Compact */}
          <div className="bg-gradient-to-r from-[rgba(59,130,246,0.08)] to-[rgba(99,102,241,0.08)] p-3 rounded border-l-3 border-[#3b82f6]">
            <div className="flex items-start gap-2">
              <i className="fas fa-file-alt text-[#3b82f6] text-sm mt-0.5 flex-shrink-0"></i>
              <div className="min-w-0">
                <strong className="text-[#1e40af] block text-xs mb-0.5">Document Verification Required</strong>
                <p className="text-[#334155] text-xs leading-tight">
                  Bring your Government ID and Proof of Income for on-site verification.
                </p>
              </div>
            </div>
          </div>

          {/* Reschedule Notice - Compact */}
          <div className="bg-[rgba(159,117,57,0.1)] p-3 rounded border-l-3 border-[#9f7539]">
            <div className="flex items-start gap-2">
              <i className="fas fa-phone text-[#9f7539] text-sm mt-0.5 flex-shrink-0"></i>
              <div className="min-w-0">
                <strong className="text-[#0e1f42] block text-xs mb-0.5">Can't make it?</strong>
                <p className="text-[#334155] text-xs leading-tight">
                  Call{' '}
                  <a href="tel:+2348123456789" className="text-[#9f7539] font-semibold hover:underline">
                    +234 812 345 6789
                  </a>{' '}
                  to reschedule
                </p>
              </div>
            </div>
          </div>

          <p className="text-[#64748b] text-xs italic text-center pt-1">
            Confirmation sent to your dashboard.
          </p>
        </div>

        {/* Modal Actions - Compact */}
        <div className="p-4 border-t border-[#e2e8f0] flex gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-[#9f7539] text-white font-semibold rounded-lg hover:bg-[#b58a4a] transition-colors flex-1 flex items-center justify-center gap-2 text-sm"
          >
            Back to Browse
            <i className="fas fa-arrow-right text-xs"></i>
          </button>
          <button
            onClick={handleViewApplication}
            className="px-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] text-[#0e1f42] font-semibold rounded-lg hover:bg-[#e2e8f0] transition-colors flex-1 flex items-center justify-center gap-2 text-sm"
          >
            View Application
            <i className="fas fa-file-alt text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
