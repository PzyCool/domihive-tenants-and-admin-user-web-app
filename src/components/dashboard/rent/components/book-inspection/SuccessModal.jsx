// src/dashboards/rent/components/book-inspection/SuccessModal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { lockBodyScroll, unlockBodyScroll } from '../../../../../utils/scrollLock';

const SuccessModal = ({ isOpen, onClose, bookingData }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isOpen) return undefined;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
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
    const dateObj = new Date(`${date}T00:00:00`);
    const dateLabel = Number.isNaN(dateObj.getTime())
      ? date
      : dateObj.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
    return `${dateLabel} at ${formatTimeDisplay(time)}`;
  };

  const formatTimeDisplay = (time) => {
    if (String(time).includes(' - ')) return time;
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
    <div className="inspection-success-modal fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[1400]">
      <div className="inspection-success-modal-card bg-white rounded-xl overflow-hidden w-full max-w-lg border border-[#e2e8f0] shadow-[0_20px_25px_rgba(0,0,0,0.25)]">
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
            className="inspection-success-close absolute top-3 right-3 text-white hover:text-gray-200 p-1"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Modal Body - Compact */}
        <div className="inspection-success-body p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <p className="inspection-success-intro text-sm text-[#334155] text-center mb-2">
            Your property inspection has been scheduled successfully.
          </p>

          {/* Booking Summary - Compact */}
          <div className="inspection-success-summary bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0]">
            <h4 className="inspection-success-summary-title font-semibold text-[#0e1f42] text-sm mb-2">Booking Details:</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <strong className="inspection-success-label text-[#0e1f42]">Property:</strong>
                <span className="inspection-success-value text-[#334155] text-right ml-2 truncate max-w-[180px]">{booking.propertyTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <strong className="inspection-success-label text-[#0e1f42]">Date & Time:</strong>
                <span className="inspection-success-value text-[#334155] text-right ml-2 max-w-[180px] text-xs">
                  {formatDateTime(booking.inspectionDate, booking.inspectionTime)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <strong className="inspection-success-label text-[#0e1f42]">Location:</strong>
                <span className="inspection-success-value text-[#334155] text-right ml-2 truncate max-w-[180px]">{booking.location}</span>
              </div>
              {booking.unitCode ? (
                <div className="flex justify-between items-center">
                  <strong className="inspection-success-label text-[#0e1f42]">Unit:</strong>
                  <span className="inspection-success-value text-[#334155] text-right ml-2">{booking.unitCode}</span>
                </div>
              ) : null}
              <div className="flex justify-between items-center">
                <strong className="inspection-success-label text-[#0e1f42]">Attendees:</strong>
                <span className="inspection-success-value text-[#334155] text-right ml-2">{attendeesText}</span>
              </div>
            </div>
          </div>

          <p className="inspection-success-footnote text-[#64748b] text-xs italic text-center pt-1">
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
            className="inspection-success-secondary-btn px-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] text-[#0e1f42] font-semibold rounded-lg hover:bg-[#e2e8f0] transition-colors flex-1 flex items-center justify-center gap-2 text-sm"
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
