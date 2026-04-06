import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapSection from '../property-details/components/Tabs/LocationTab/MapSection';
import NoShowOverlay from './NoShowOverlay';
import InspectionCompletedOverlay from './InspectionCompletedOverlay';
import { INSPECTION_BOOKING_STATUSES } from '../../../../shared/utils/inspectionBookings';

const STATUS_LABELS = {
  INSPECTION_SCHEDULED: 'Inspection Scheduled',
  INSPECTION_VERIFIED: 'Inspection Verified',
  APPLICATION_STARTED: 'Application Started',
  APPLICATION_SUBMITTED: 'Application Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Verdict',
  REJECTED: 'Verdict',
  CANCELLED: 'Cancelled'
};

const ACTION_LABELS = {
  INSPECTION_SCHEDULED: 'Confirm Inspection',
  INSPECTION_VERIFIED: 'Start Application',
  APPLICATION_STARTED: 'Continue Application',
  APPLICATION_SUBMITTED: 'Track Progress',
  UNDER_REVIEW: 'Track Progress',
  APPROVED: 'View Move-in',
  REJECTED: 'View Feedback',
  CANCELLED: 'View Details'
};

const badgeStyles = {
  INSPECTION_VERIFIED: 'bg-blue-100 text-[#0e1f42] border border-blue-200',
  APPLICATION_STARTED: 'bg-[#fefce8] text-[#9f7539] border border-[#fef08a]',
  APPLICATION_SUBMITTED: 'bg-[#ecfccb] text-[#15803d] border border-[#bbf7d0]',
  UNDER_REVIEW: 'bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd]',
  APPROVED: 'bg-[#dcfce7] text-[#047857] border border-[#86efac]',
  REJECTED: 'bg-[#ffe4e6] text-[#be123c] border border-[#fecdd3]',
  CANCELLED: 'bg-red-100 text-red-700 border border-red-300'
};

const inspectionStatusBadgeStyles = {
  [INSPECTION_BOOKING_STATUSES.PENDING_CONFIRMATION]:
    'bg-[var(--accent-color,#9f7539)] text-white border border-[var(--accent-color,#9f7539)]',
  [INSPECTION_BOOKING_STATUSES.SCHEDULED]: 'bg-green-600 text-white border border-green-500',
  [INSPECTION_BOOKING_STATUSES.NO_SHOW]: 'bg-red-100 text-red-700 border border-red-200',
  [INSPECTION_BOOKING_STATUSES.INSPECTION_COMPLETED]:
    'bg-emerald-600 text-white border border-emerald-500'
};

const getInspectionCountdown = (inspectionDateISO) => {
  if (!inspectionDateISO) return null;
  const diff = new Date(inspectionDateISO).getTime() - Date.now();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
};

const formatPrice = (price) => {
  const amount = Number(price) || 0;
  return `₦${amount.toLocaleString()}/year`;
};

const formatPriceWords = (price) => {
  const amount = Number(price) || 0;
  if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)} billion naira yearly`;
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)} million naira yearly`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)} thousand naira yearly`;
  return `${amount.toLocaleString('en-NG')} naira yearly`;
};

const formatSize = (size) => {
  const raw = String(size ?? '').trim();
  if (!raw) return '—';
  const normalized = raw.toLowerCase();
  if (normalized.includes('sqm') || normalized.includes('sq m') || normalized.includes('m²')) {
    return raw;
  }
  return `${raw} sqm`;
};

const CancelledOverlay = ({ application }) => (
  <div className="absolute inset-0 z-20 flex items-end p-3 md:p-4">
    <div className="w-full rounded-xl border border-red-400/30 bg-red-500/15 backdrop-blur-[1px] p-4">
      <h4 className="text-base md:text-lg font-semibold text-red-100">Request Closed</h4>
      <p className="text-sm text-red-100/95 mt-1">
        Hey {application.applicantName || 'there'}, this request was cancelled and moved to archived
        records.
      </p>
      <p className="text-xs text-red-100/85 mt-2">
        Use the status filter to switch between active and cancelled requests.
      </p>
    </div>
  </div>
);

const ApplicationCard = ({ application, onAction, compact = false }) => {
  const navigate = useNavigate();
  const [nowTick, setNowTick] = useState(Date.now());

  const actionLabel = ACTION_LABELS[application.status] || 'View Details';
  const fallbackBadgeClass = badgeStyles[application.status] || badgeStyles.APPLICATION_STARTED;
  const inspectionStatus =
    application.inspectionStatus || INSPECTION_BOOKING_STATUSES.PENDING_CONFIRMATION;
  const isInspectionStage = application.status === 'INSPECTION_SCHEDULED';
  const isScheduled = inspectionStatus === INSPECTION_BOOKING_STATUSES.SCHEDULED;
  const isNoShow = inspectionStatus === INSPECTION_BOOKING_STATUSES.NO_SHOW;
  const isInspectionCompleted =
    inspectionStatus === INSPECTION_BOOKING_STATUSES.INSPECTION_COMPLETED &&
    application.status === 'INSPECTION_SCHEDULED';
  const isCancelled = application.status === 'CANCELLED';
  const countdown = useMemo(
    () => (isScheduled ? getInspectionCountdown(application.inspectionDateISO) : null),
    [isScheduled, application.inspectionDateISO, nowTick]
  );
  const badgeClass = isInspectionStage
    ? (inspectionStatusBadgeStyles[inspectionStatus] ||
      inspectionStatusBadgeStyles[INSPECTION_BOOKING_STATUSES.PENDING_CONFIRMATION])
    : fallbackBadgeClass;
  const badgeStyleOverride = (() => {
    if (isCancelled) {
      return {
        backgroundColor: 'rgba(239, 68, 68, 0.18)',
        color: '#ef4444',
        borderColor: 'rgba(239, 68, 68, 0.45)'
      };
    }
    if (!isInspectionStage && application.status === 'APPLICATION_SUBMITTED') {
      return {
        backgroundColor: 'rgba(16, 185, 129, 0.18)',
        color: '#10b981',
        borderColor: 'rgba(16, 185, 129, 0.45)'
      };
    }
    return undefined;
  })();
  useEffect(() => {
    if (!isScheduled) return undefined;
    const timer = window.setInterval(() => setNowTick(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [isScheduled]);

  return (
    <div
      className={`application-card property-card relative ${compact ? 'w-full mx-auto' : 'w-full'} bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300`}
    >
      <div
        className={`flex flex-col lg:flex-row ${
          isNoShow && !isCancelled ? 'opacity-75 blur-[0.8px] pointer-events-none select-none' : ''
        } ${isInspectionCompleted ? 'pointer-events-none select-none' : ''} ${
          isCancelled ? 'opacity-75 blur-[0.8px] pointer-events-none select-none' : ''
        }`}
      >
        <div
          className={`relative ${
            compact
              ? 'w-20 h-20 md:w-24 md:h-24 shrink-0 m-2.5 md:m-3 rounded-lg overflow-hidden border border-[var(--border-color,#e2e8f0)] bg-[var(--surface-2,#f1f5f9)]'
              : `lg:w-[42%] ${
                  isNoShow ? 'h-44 lg:h-[220px] min-h-[180px]' : 'h-56 lg:h-[320px] min-h-[220px]'
                }`
          }`}
        >
          <img
            src={application.property?.image}
            alt={application.property?.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className={`${compact ? 'w-full min-w-0 p-2.5 md:pl-0 md:pr-3 md:py-3' : 'lg:w-[58%] p-4 md:p-5'} flex flex-col`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className={`property-price-main ${compact ? 'text-lg' : 'text-2xl'} font-bold text-[#0e1f42] leading-tight`}>
                {formatPrice(application.property?.price)}
              </div>
              <div className={`${compact ? 'text-[10px]' : 'text-xs'} mt-0.5 text-[var(--text-muted,#6c757d)]`}>
                {formatPriceWords(application.property?.price)}
              </div>
              <div className={`${compact ? 'text-[11px]' : ''} text-gray-700 font-medium mt-0.5`}>
                Inspection: {application.inspectionDate || 'Not set'}
              </div>
              <h3 className={`${compact ? 'text-base' : 'text-2xl'} font-semibold text-[#0e1f42] mt-1`}>{application.property?.title}</h3>
              <div className={`${compact ? 'text-[11px]' : 'text-sm'} text-gray-600 mt-0.5 inline-flex items-center gap-1.5`}>
                <i className="fas fa-map-marker-alt text-[#9f7539] text-[11px]"></i>
                {application.property?.location}
              </div>

              <div className={`flex items-center ${compact ? 'gap-2 text-[10px]' : 'gap-4 text-sm'} text-gray-600 mt-1`}>
                <span className="inline-flex items-center gap-1.5">
                  <i className="fas fa-bed text-[#9f7539] text-[11px]"></i>
                  {Number(application.property?.bedrooms || 0)} bed
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="fas fa-bath text-[#9f7539] text-[11px]"></i>
                  {Number(application.property?.bathrooms || 0)} bath
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="fas fa-ruler-combined text-[#9f7539] text-[11px]"></i>
                  {formatSize(application.property?.size)}
                </span>
              </div>

              <div className={`${compact ? 'mt-1' : 'mt-2'}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <i className="fas fa-align-left text-[#9f7539] text-[11px]"></i>
                  <span className="text-[11px] font-semibold text-gray-800">About this property:</span>
                </div>
                {application.property?.description ? (
                  <p className={`${compact ? 'text-[10px]' : 'text-sm'} text-[var(--text-color,#334155)] leading-snug ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
                    {application.property.description}
                  </p>
                ) : null}
              </div>

              <div className={`${compact ? 'text-[11px]' : 'text-sm'} mt-0.5 text-[var(--text-color,#0e1f42)]`}>
                Applicant: <span className="font-semibold">{application.applicantName || 'Applicant'}</span> • Attendees: {application.attendees} attendee{application.attendees > 1 ? 's' : ''}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span
                className={`${compact ? 'px-2.5 py-0.5 text-[10px] min-w-[130px]' : 'px-3 py-1 text-xs'} rounded-full font-semibold whitespace-nowrap text-center ${badgeClass}`}
                style={badgeStyleOverride}
              >
                {isInspectionStage ? inspectionStatus : (STATUS_LABELS[application.status] || 'In Progress')}
              </span>
            </div>
          </div>

          <div className={`mt-auto ${compact ? 'pt-0.5' : 'pt-4'} flex items-center justify-end gap-2`}>
            {isScheduled && countdown ? (
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-[var(--accent-color,#9f7539)] text-white">
                <i className="fas fa-hourglass-half"></i>
                {`${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s left`}
              </div>
            ) : null}
            {!isNoShow && !isInspectionCompleted ? (
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={() => onAction(application)}
                  disabled={
                    isNoShow ||
                    isCancelled ||
                    inspectionStatus === INSPECTION_BOOKING_STATUSES.PENDING_CONFIRMATION ||
                    isScheduled
                  }
                  className={`${
                    compact ? 'px-2 py-0.5 text-[10px]' : 'px-4 py-2 text-sm'
                  } rounded-lg font-semibold text-white border border-transparent bg-[var(--accent-color,#9f7539)] hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {inspectionStatus === INSPECTION_BOOKING_STATUSES.PENDING_CONFIRMATION
                    ? 'Awaiting Confirmation'
                    : isScheduled
                      ? 'Inspection Scheduled'
                      : isInspectionCompleted
                        ? 'Proceed to Application'
                        : actionLabel}
                </button>
                {inspectionStatus === INSPECTION_BOOKING_STATUSES.PENDING_CONFIRMATION ? (
                  <p className="text-[11px] text-[var(--text-muted,#64748b)]">
                    Waiting for admin scheduling.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {isNoShow && !isCancelled && (
        <NoShowOverlay
          application={application}
          onReschedule={() => onAction(application, { type: 'reschedule_no_show' })}
          onNotInterested={() => onAction(application, { type: 'not_interested_no_show' })}
        />
      )}

      {isInspectionCompleted && (
        <InspectionCompletedOverlay
          application={application}
          onContinueWithProperty={() =>
            onAction(application, { type: 'inspection_completed_continue' })
          }
          onNotInterested={() =>
            onAction(application, { type: 'inspection_completed_not_interested' })
          }
          onReschedule={() => onAction(application, { type: 'inspection_completed_reschedule' })}
          onMissedCancel={() =>
            onAction(application, { type: 'inspection_completed_missed_cancel' })
          }
        />
      )}

      {isCancelled && <CancelledOverlay application={application} />}

      {isScheduled && (
        <div className="border-t border-[var(--border-color,#e2e8f0)] bg-[var(--card-bg,#f8fafc)] px-5 py-4 transition-all duration-300">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[#9f7539]">
              {countdown
                ? `Inspection countdown: ${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`
                : 'Inspection time reached'}
            </p>
            <button
              onClick={() => navigate('/dashboard/rent/browse')}
              className="text-xs px-3 py-1.5 rounded-full border border-[#9f7539]/30 text-[#9f7539] hover:bg-[#9f7539]/10"
            >
              Need to reschedule
            </button>
          </div>
          <p className="text-xs text-[var(--text-muted,#475467)] mt-2">
            Please arrive at this address early and come with your verification documents.
          </p>
          <div className="mt-4 rounded-lg border border-[var(--border-color,#e2e8f0)] bg-[var(--card-bg,#ffffff)] p-4">
            <MapSection property={application.property} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationCard;

