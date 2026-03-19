import React, { useEffect, useMemo, useState } from 'react';

const STATUS_LABELS = {
  INSPECTION_SCHEDULED: 'Inspection Scheduled',
  INSPECTION_VERIFIED: 'Inspection Verified',
  APPLICATION_STARTED: 'Application Started',
  APPLICATION_SUBMITTED: 'Application Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Verdict',
  REJECTED: 'Verdict',
  CANCELLED: 'Verdict'
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
  INSPECTION_SCHEDULED: 'bg-amber-100 text-amber-800 border border-amber-200 app-status-badge',
  INSPECTION_VERIFIED: 'bg-blue-100 text-[#0e1f42] border border-blue-200 app-status-badge',
  APPLICATION_STARTED: 'bg-[#fefce8] text-[#9f7539] border border-[#fef08a] app-status-badge',
  APPLICATION_SUBMITTED: 'bg-[#ecfccb] text-[#15803d] border border-[#bbf7d0] app-status-badge',
  UNDER_REVIEW: 'bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd] app-status-badge',
  APPROVED: 'bg-[#dcfce7] text-[#047857] border border-[#86efac] app-status-badge',
  REJECTED: 'bg-[#ffe4e6] text-[#be123c] border border-[#fecdd3] app-status-badge',
  CANCELLED: 'bg-[#f3f4f6] text-[#475467] border border-[#e2e8f0] app-status-badge'
};

const getCountdown = (unlockAtISO) => {
  if (!unlockAtISO) return null;
  const diff = new Date(unlockAtISO).getTime() - Date.now();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { minutes, seconds };
};

const ApplicationCard = ({ application, onAction }) => {
  const [now, setNow] = useState(Date.now());
  const statusLabel = STATUS_LABELS[application.status] || 'In Progress';
  const actionLabel = ACTION_LABELS[application.status] || 'View Details';
  const badgeClass = badgeStyles[application.status] || badgeStyles.APPLICATION_STARTED;

  useEffect(() => {
    if (application.status !== 'INSPECTION_SCHEDULED') return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [application.status]);

  const lockUntilISO = useMemo(() => {
    if (application.inspectionUnlockAtISO) return application.inspectionUnlockAtISO;
    if (application.createdAtISO) return new Date(new Date(application.createdAtISO).getTime() + 10_000).toISOString();
    return null;
  }, [application.inspectionUnlockAtISO, application.createdAtISO]);

  const countdown = useMemo(() => getCountdown(lockUntilISO), [lockUntilISO, now]);
  const isInspectionLocked = application.status === 'INSPECTION_SCHEDULED' && Boolean(countdown);

  return (
    <div className="application-card bg-white rounded-2xl shadow-lg border border-[#e2e8f0] overflow-hidden flex flex-col h-full relative">
      {isInspectionLocked && (
        <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] pointer-events-none" />
      )}

      <div className={`flex gap-4 p-5 ${isInspectionLocked ? 'opacity-70' : ''}`}>
        <img
          src={application.property.image}
          alt={application.property.title}
          className="w-32 h-24 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#0e1f42] line-clamp-2">{application.property.title}</h3>
            <p className="text-sm text-[#64748b]">{application.property.location}</p>
            <p className="text-sm font-medium text-[#0e1f42] mt-2">{`NGN ${application.property.price.toLocaleString()}/year`}</p>
            <p className="text-xs text-[#64748b] mt-1">
              Inspection: {application.inspectionDate} • {application.attendees} attendee{application.attendees > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>{statusLabel}</span>
            <button
              onClick={() => onAction(application)}
              disabled={isInspectionLocked}
              className="bg-gradient-to-r from-[#0e1f42] to-[#1a2d5f] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-sm hover:from-[#1a2d5f] hover:to-[#0e1f42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInspectionLocked ? 'Inspection Pending' : actionLabel}
            </button>
          </div>
        </div>
      </div>

      <div className="application-card-footer border-t border-[#e2e8f0] px-5 py-3 text-xs text-[#475467] bg-[#fdfdfd] flex flex-wrap gap-4">
        {isInspectionLocked && countdown ? (
          <span className="flex items-center gap-1 text-[#9f7539] font-semibold">
            <i className="fas fa-hourglass-half"></i>
            Inspection in {String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <i className="fas fa-user-check text-[#0e1f42]"></i>
            {application.status === 'APPROVED' ? 'Tenant verified' : 'Application in pipeline'}
          </span>
        )}
        <span className="flex items-center gap-1">
          <i className="fas fa-calendar-alt text-[#0e1f42]"></i>
          {application.updatedAt}
        </span>
      </div>
    </div>
  );
};

export default ApplicationCard;
