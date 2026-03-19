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
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
    case 'CANCELLED':
      return 'bg-red-100 text-red-700';
    case 'APPLICATION_SUBMITTED':
    case 'UNDER_REVIEW':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
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
    const submittedAt = application.submittedAtISO ? new Date(application.submittedAtISO).getTime() : Date.now();
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
      <div className="bg-white rounded-lg border border-[#e2e8f0] p-6 space-y-6 max-w-5xl mx-auto">
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

        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-wrap justify-between gap-3 items-start">
            <div className="space-y-1">
              <p className="text-xs text-[#6c757d]">Application ID</p>
              <p className="text-sm font-semibold text-[#0e1f42]">{application.id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold app-track-badge ${statusColor(application.status)}`}>
              {STATUS_LABELS[flowStatus] || application.status}
            </span>
          </div>
          <div className="flex flex-wrap gap-4">
            <img
              src={application.property?.image}
              alt={application.property?.title}
              className="w-32 h-24 rounded-xl object-cover border border-[#e2e8f0]"
            />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-[#0e1f42]">{application.property?.title}</h3>
              <p className="text-sm text-[#475467]">{application.property?.location}</p>
              <p className="text-sm font-semibold text-[#0e1f42]">NGN {application.property?.price?.toLocaleString()} / year</p>
            </div>
          </div>
          <p className="text-xs text-[#6c757d]">Last updated: {application.updatedAt}</p>
        </div>

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
      </div>
    </div>
  );
};

export default ApplicationTrackPage;
