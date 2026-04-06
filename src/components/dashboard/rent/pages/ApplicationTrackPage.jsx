import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApplications } from '../contexts/ApplicationsContext';

const STATUS_FLOW = [
  'INSPECTION_SCHEDULED',
  'INSPECTION_VERIFIED',
  'APPLICATION_STARTED',
  'APPLICATION_SUBMITTED',
  'UNDER_REVIEW',
  'VERDICT'
];

const STATUS_LABELS = {
  INSPECTION_SCHEDULED: 'Inspection Scheduled',
  INSPECTION_VERIFIED: 'Inspection Verified',
  APPLICATION_STARTED: 'Application Started',
  APPLICATION_SUBMITTED: 'Application Submitted',
  UNDER_REVIEW: 'Under Review (72 hours)',
  VERDICT: 'Verdict'
};

const statusColor = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'REJECTED':
    case 'CANCELLED':
      return 'bg-red-100 text-red-700 border border-red-200';
    case 'APPLICATION_SUBMITTED':
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'UNDER_REVIEW':
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    default:
      return 'bg-blue-100 text-blue-800 border border-blue-200';
  }
};

const formatNaira = (value) => `₦${Number(value || 0).toLocaleString()}`;

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

const ApplicationTrackPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { applications } = useApplications();
  const [animatedIndex, setAnimatedIndex] = useState(0);

  const application = useMemo(
    () => applications.find((app) => app.id === applicationId),
    [applications, applicationId]
  );

  const isVerdictStatus = useMemo(
    () => ['APPROVED', 'REJECTED', 'CANCELLED'].includes(application?.status),
    [application?.status]
  );

  const flowStatus = isVerdictStatus ? 'VERDICT' : application?.status;
  const currentIndex = STATUS_FLOW.indexOf(flowStatus);
  const verdictLabel = application?.status === 'APPROVED'
    ? 'Approved'
    : application?.status === 'REJECTED'
      ? 'Rejected'
      : 'Cancelled';

  useEffect(() => {
    if (currentIndex < 0) return undefined;
    setAnimatedIndex(0);
    const interval = window.setInterval(() => {
      setAnimatedIndex((prev) => {
        if (prev >= currentIndex) {
          window.clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 450);
    return () => window.clearInterval(interval);
  }, [currentIndex, applicationId]);

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[#64748b]">Application not found.</p>
      </div>
    );
  }

  const dueText = (() => {
    const submittedAt = application.submittedAtISO
      ? new Date(application.submittedAtISO).getTime()
      : Date.now();
    const dueAt = submittedAt + 72 * 60 * 60 * 1000;
    const hours = Math.max(0, Math.ceil((dueAt - Date.now()) / (60 * 60 * 1000)));
    return `Due in ${hours} hour${hours === 1 ? '' : 's'}`;
  })();

  const verdictText = (() => {
    if (application.status === 'APPROVED') {
      return 'Verdict: Approved. Move-in details will be shared in notifications.';
    }
    if (application.status === 'REJECTED' || application.status === 'CANCELLED') {
      return 'Verdict shared. See notifications for next steps.';
    }
    return 'Awaiting verdict.';
  })();

  return (
    <div className="rent-overview-container bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 md:p-6">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="space-y-6">
          <button
            onClick={() => navigate('/dashboard/rent/applications')}
            aria-label="Back to Applications"
            className="text-2xl font-medium leading-none"
            style={{ color: 'var(--accent-color, #9F7539)' }}
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-[#0e1f42]">Track Application</h1>
            <p className="text-sm text-[#64748b]">Follow the steps from inspection through review.</p>
          </div>
        </div>

        <div className="relative bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-4 shadow-sm overflow-hidden">
          <div className="flex flex-wrap justify-between gap-3 items-start">
            <div className="space-y-1">
              <p className="text-xs text-[#6c757d]">Application ID</p>
              <p className="text-sm font-semibold text-[#0e1f42]">{application.id}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold app-track-badge ${statusColor(application.status)}`}
            >
              {isVerdictStatus ? `Verdict: ${verdictLabel}` : (STATUS_LABELS[flowStatus] || application.status)}
            </span>
          </div>
          <div className="flex flex-wrap gap-4">
            <img
              src={application.property?.image}
              alt={application.property?.title}
              className="w-32 h-24 rounded-xl object-cover border border-[#e2e8f0]"
            />
            <div className="space-y-1 min-w-0 flex-1">
              <p className="track-price-main text-lg font-bold leading-tight">
                {formatNaira(application.property?.price)} / year
              </p>
              <p className="text-xs text-[#6c757d]">{formatPriceWords(application.property?.price)}</p>
              <h3 className="text-lg font-semibold text-[#0e1f42]">{application.property?.title}</h3>
              <p className="text-sm text-[#475467] inline-flex items-center gap-1.5">
                <i className="fas fa-map-marker-alt text-[var(--accent-color,#9f7539)] text-[11px]"></i>
                {application.property?.location}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-[#475467]">
                <span className="inline-flex items-center gap-1.5">
                  <i className="fas fa-bed text-[var(--accent-color,#9f7539)] text-[11px]"></i>
                  {Number(application.property?.bedrooms || 0)} bed
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="fas fa-bath text-[var(--accent-color,#9f7539)] text-[11px]"></i>
                  {Number(application.property?.bathrooms || 0)} bath
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="fas fa-ruler-combined text-[var(--accent-color,#9f7539)] text-[11px]"></i>
                  {formatSize(application.property?.size)}
                </span>
              </div>
              {application.property?.description ? (
                <div className="mt-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <i className="fas fa-align-left text-[var(--accent-color,#9f7539)] text-[11px]"></i>
                    <span className="text-xs font-semibold text-[#0e1f42]">About this property:</span>
                  </div>
                  <p className="text-xs text-[#475467] leading-relaxed line-clamp-2">
                    {application.property.description}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
          <p className="text-xs text-[#6c757d]">Last updated: {application.updatedAt}</p>

          {isVerdictStatus && (
            <div className="absolute inset-0 z-20 flex items-end p-4 md:p-5">
              <div className={`w-full rounded-xl border p-4 md:p-5 backdrop-blur-[1px] ${
                application.status === 'APPROVED'
                  ? 'bg-green-500/15 border-green-300/40'
                  : 'bg-red-500/15 border-red-300/40'
              }`}>
                <h3 className="text-lg font-bold text-[var(--text-color,#0e1f42)]">
                  {application.status === 'APPROVED' ? 'Congratulations! Application Approved' : 'Application Result'}
                </h3>
                <div className="mt-2 space-y-2 text-sm text-[var(--text-color,#0e1f42)]">
                  {application.status === 'APPROVED' ? (
                    <>
                      <p>
                        Your application for <span className="font-semibold">{application.property?.title}</span> was approved.
                      </p>
                      <p>
                        You now have access to DomiHive management tools (My Properties, Maintenance, Payments, and Messages).
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        Your application for <span className="font-semibold">{application.property?.title}</span> was not approved.
                      </p>
                      {application?.rejectionReason ? (
                        <p>
                          Reason: <span className="font-semibold">{application.rejectionReason}</span>
                        </p>
                      ) : null}
                      <p>
                        Refund status: <span className="font-semibold">{application?.refundStatus || 'Pending Refund'}</span>
                        {application?.refundETA ? (
                          <>
                            {' '}• ETA: <span className="font-semibold">{application.refundETA}</span>
                          </>
                        ) : null}
                      </p>
                    </>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  {application.status === 'APPROVED' ? (
                    <button
                      onClick={() => navigate('/dashboard/rent/my-properties')}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--accent-color,#9F7539)]"
                    >
                      Open My Properties
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/dashboard/rent/browse')}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--accent-color,#9F7539)]"
                    >
                      Continue Browsing
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {application.status === 'UNDER_REVIEW' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-800">
              Your application has been submitted and is under review.
            </p>
            <p className="text-xs text-amber-700 mt-1">Check back on this page for your final verdict.</p>
          </div>
        )}

        {!isVerdictStatus && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#0e1f42] mb-4">Status Progress</h2>
            <div className="space-y-3">
              {STATUS_FLOW.map((status, idx) => {
                const active = idx <= animatedIndex;
                return (
                  <div key={status} className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-3 w-3 rounded-full border-2 ${
                        active
                          ? 'bg-[var(--accent-color,#9F7539)] border-[var(--accent-color,#9F7539)]'
                          : 'border-[#e2e8f0] bg-white'
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${active ? 'text-[#0e1f42]' : 'text-[#94a3b8]'}`}>
                        {STATUS_LABELS[status]}
                      </p>
                      <p className="text-xs text-[#6c757d]">
                        {status === 'INSPECTION_SCHEDULED' && application.inspectionDate
                          ? `Scheduled for ${application.inspectionDate}`
                          : status === 'UNDER_REVIEW' && active
                          ? dueText
                          : status === 'VERDICT'
                          ? verdictText
                          : 'Status in progress'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationTrackPage;
