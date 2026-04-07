import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapSection from '../property-details/components/Tabs/LocationTab/MapSection';
import NoShowOverlay from './NoShowOverlay';
import InspectionCompletedOverlay from './InspectionCompletedOverlay';
import { INSPECTION_BOOKING_STATUSES } from '../../../../shared/utils/inspectionBookings';
import TenantUnitCard, {
  formatUnitSize
} from '../common/TenantUnitCard';

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

  useEffect(() => {
    if (!isScheduled) return undefined;
    const timer = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isScheduled]);

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

  const contentStateClass = `${
    isNoShow && !isCancelled ? 'opacity-75 blur-[0.8px] pointer-events-none select-none' : ''
  } ${isInspectionCompleted ? 'pointer-events-none select-none' : ''} ${
    isCancelled ? 'opacity-75 blur-[0.8px] pointer-events-none select-none' : ''
  }`;

  const actionNode = !isNoShow && !isInspectionCompleted ? (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {isScheduled && countdown ? (
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-[var(--accent-color,#9f7539)] text-white">
            <i className="fas fa-hourglass-half"></i>
            {`${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s left`}
          </div>
        ) : null}
        <button
          onClick={() => onAction(application)}
          disabled={
            isNoShow ||
            isCancelled ||
            inspectionStatus === INSPECTION_BOOKING_STATUSES.PENDING_CONFIRMATION ||
            isScheduled
          }
          className="px-4 py-2 text-sm rounded-lg font-semibold text-white border border-transparent bg-[var(--accent-color,#9f7539)] hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {inspectionStatus === INSPECTION_BOOKING_STATUSES.PENDING_CONFIRMATION
            ? 'Awaiting Confirmation'
            : isScheduled
              ? 'Inspection Scheduled'
              : isInspectionCompleted
                ? 'Proceed to Application'
                : actionLabel}
        </button>
      </div>
      {inspectionStatus === INSPECTION_BOOKING_STATUSES.PENDING_CONFIRMATION ? (
        <p className="text-sm text-[var(--text-muted,#64748b)]">Waiting for admin scheduling.</p>
      ) : null}
    </div>
  ) : null;

  const overlayNode = (
    <>
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
    </>
  );

  const footerPanel = isScheduled ? (
    <div className="border-t border-[var(--border-color,#e2e8f0)] bg-[var(--card-bg,#f8fafc)] px-5 py-4 mt-4">
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
  ) : null;

  return (
    <TenantUnitCard
      className={`application-card property-card ${compact ? 'w-full' : 'w-full'} shadow-md overflow-hidden transition-all duration-300`}
      contentClassName={contentStateClass}
      image={application.property?.image}
      imageAlt={application.property?.title || 'Property'}
      price={application.property?.price}
      topMeta={`Inspection: ${application.inspectionDate || 'Not set'}`}
      title={application.property?.title}
      location={application.property?.location}
      bedrooms={Number(application.property?.bedrooms || 0)}
      bathrooms={Number(application.property?.bathrooms || 0)}
      size={formatUnitSize(application.property?.size)}
      description={application.property?.description || 'No unit description available yet.'}
      badge={
        <span
          className={`px-4 py-1 text-sm rounded-full font-semibold whitespace-nowrap text-center ${badgeStyleOverride ? '' : badgeClass}`}
          style={badgeStyleOverride}
        >
          {isInspectionStage ? inspectionStatus : (STATUS_LABELS[application.status] || 'In Progress')}
        </span>
      }
      afterDescription={
        <div className="text-sm text-[var(--text-color,#0e1f42)]">
          Applicant: <span className="font-semibold">{application.applicantName || 'Applicant'}</span> • Attendees: {application.attendees} attendee{application.attendees > 1 ? 's' : ''}
        </div>
      }
      actions={actionNode}
      overlay={overlayNode}
      footerPanel={footerPanel}
    />
  );
};

export default ApplicationCard;
