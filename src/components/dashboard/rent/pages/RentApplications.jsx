import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ApplicationCard from '../components/applications/ApplicationCard';
import { useApplications } from '../contexts/ApplicationsContext';

const RentApplications = () => {
  const navigate = useNavigate();
  const { applications, updateApplication, addNotification } = useApplications();

  const handleCardAction = (application, actionMeta = null) => {
    if (actionMeta?.type === 'inspection_completed_continue') {
      updateApplication(application.id, { status: 'APPLICATION_STARTED', updatedAt: 'Just now' });
      addNotification({
        type: 'application',
        title: 'Application Started',
        message: `${application.property.title} is ready. Complete your application form and payment.`,
        cta: { label: 'Continue Application', path: `/dashboard/rent/applications/${application.id}/start` }
      });
      navigate(`/dashboard/rent/applications/${application.id}/start`);
      return;
    }

    if (
      actionMeta?.type === 'reschedule_no_show' ||
      actionMeta?.type === 'inspection_completed_reschedule'
    ) {
      updateApplication(application.id, {
        status: 'INSPECTION_SCHEDULED',
        inspectionStatus: 'Pending Confirmation',
        updatedAt: 'Just now'
      });
      addNotification({
        type: 'inspection',
        title: 'Reschedule Requested',
        message: `Reschedule requested for ${application.property.title}. Pick a new slot to continue.`,
        cta: { label: 'Browse Properties', path: '/dashboard/rent/browse' }
      });
      navigate('/dashboard/rent/browse');
      return;
    }

    if (
      actionMeta?.type === 'not_interested_no_show' ||
      actionMeta?.type === 'inspection_completed_not_interested' ||
      actionMeta?.type === 'inspection_completed_missed_cancel'
    ) {
      updateApplication(application.id, { status: 'CANCELLED', updatedAt: 'Just now' });
      addNotification({
        type: 'application',
        title: 'Request Closed',
        message: `${application.property.title} inspection request has been closed.`,
        cta: { label: 'Browse Properties', path: '/dashboard/rent/browse' }
      });
      navigate('/dashboard/rent/browse');
      return;
    }

    switch (application.status) {
      case 'INSPECTION_VERIFIED':
      case 'APPLICATION_STARTED':
        navigate(`/dashboard/rent/applications/${application.id}/start`);
        break;
      case 'APPLICATION_SUBMITTED':
      case 'UNDER_REVIEW':
      case 'APPROVED':
      case 'REJECTED':
      case 'CANCELLED':
        navigate(`/dashboard/rent/applications/${application.id}/track`);
        break;
      default:
        break;
    }
  };

  const activeApplications = useMemo(
    () => applications.filter((app) => app.status !== 'CANCELLED'),
    [applications]
  );
  const archivedApplications = useMemo(
    () => applications.filter((app) => app.status === 'CANCELLED'),
    [applications]
  );

  const summaryStats = useMemo(
    () => ({
      total: activeApplications.length,
      pending: activeApplications.filter((app) =>
        ['INSPECTION_SCHEDULED', 'INSPECTION_VERIFIED', 'APPLICATION_STARTED'].includes(app.status)
      ).length,
      submitted: activeApplications.filter((app) => app.status === 'APPLICATION_SUBMITTED' || app.status === 'UNDER_REVIEW')
        .length
    }),
    [activeApplications]
  );

  return (
    <div className="rent-overview-container bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 md:p-6 applications-page">
      <div className="bg-white rounded-lg shadow-md border border-[#e2e8f0] p-6 space-y-6 applications-card">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0e1f42]">My Applications</h1>
            <p className="text-sm text-[#64748b]">Track inspection → application → payment → decision.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm rounded-full bg-gradient-to-r from-[#0e1f42] to-[#1a2d5f] text-white font-semibold">
              Refresh Status
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white rounded-2xl shadow-sm border p-4" style={{ borderColor: 'var(--accent-color, #9F7539)' }}>
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--accent-color, #9F7539)' }}>
              Applications
            </p>
            <p className="text-2xl font-bold" style={{ color: 'var(--primary-color, #0E1F42)' }}>
              {summaryStats.total}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border p-4" style={{ borderColor: 'var(--accent-color, #9F7539)' }}>
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--accent-color, #9F7539)' }}>
              Actionable
            </p>
            <p className="text-2xl font-bold" style={{ color: 'var(--primary-color, #0E1F42)' }}>
              {summaryStats.pending}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border p-4" style={{ borderColor: 'var(--accent-color, #9F7539)' }}>
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--accent-color, #9F7539)' }}>
              Submitted
            </p>
            <p className="text-2xl font-bold" style={{ color: 'var(--primary-color, #0E1F42)' }}>
              {summaryStats.submitted}
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {activeApplications.length === 0 ? (
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 text-center">
              <p className="text-base font-semibold text-[#0e1f42]">No applications yet</p>
              <p className="text-sm text-[#64748b] mt-1">Book an inspection from Browse Properties to start your first application.</p>
            </div>
          ) : (
            activeApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} onAction={handleCardAction} />
            ))
          )}
        </div>

        {archivedApplications.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[var(--text-color,#0e1f42)]">Archived Requests</h2>
              <span className="text-xs text-[var(--text-muted,#64748b)]">{archivedApplications.length} archived</span>
            </div>
            <div className="grid gap-3">
              {archivedApplications.map((application) => (
                <div
                  key={`archived-${application.id}`}
                  className="relative rounded-xl border px-4 py-3 bg-[var(--card-bg,#f8fafc)] border-[var(--border-color,#e2e8f0)]"
                >
                  <span
                    className="absolute top-3 right-3 inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.18)',
                      color: '#ef4444',
                      borderColor: 'rgba(239, 68, 68, 0.45)'
                    }}
                  >
                    Cancelled
                  </span>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-[var(--border-color,#e2e8f0)] bg-[var(--surface-2,#f1f5f9)] shrink-0">
                        {application.property?.image ? (
                          <img
                            src={application.property.image}
                            alt={application.property?.title || 'Archived property'}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="archived-price text-sm font-semibold">
                          ₦{Number(application.property?.price || 0).toLocaleString()}/year
                        </p>
                        <p className="text-xs text-[var(--text-muted,#64748b)] mt-0.5">
                          {(() => {
                            const amount = Number(application.property?.price || 0);
                            if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)} billion naira yearly`;
                            if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)} million naira yearly`;
                            if (amount >= 1000) return `${(amount / 1000).toFixed(1)} thousand naira yearly`;
                            return `${amount.toLocaleString('en-NG')} naira yearly`;
                          })()}
                        </p>
                        <p className="font-semibold text-[var(--text-color,#0e1f42)]">
                          {application.property?.title || 'Archived Property Request'}
                        </p>
                        <p className="text-sm text-[var(--text-muted,#64748b)] inline-flex items-center gap-1.5">
                          <i className="fas fa-map-marker-alt text-[var(--accent-color,#9f7539)] text-[11px]"></i>
                          {application.property?.location || 'Location not available'}
                        </p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted,#64748b)]">
                        <span className="inline-flex items-center gap-1">
                          <i className="fas fa-bed text-[var(--accent-color,#9f7539)] text-[10px]"></i>
                          {Number(application.property?.bedrooms || 0)} bed
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <i className="fas fa-bath text-[var(--accent-color,#9f7539)] text-[10px]"></i>
                          {Number(application.property?.bathrooms || 0)} bath
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <i className="fas fa-ruler-combined text-[var(--accent-color,#9f7539)] text-[10px]"></i>
                          {application.property?.size || '—'}
                        </span>
                      </div>
                      {application.property?.description ? (
                        <p className="text-xs text-[var(--text-muted,#64748b)] mt-1 line-clamp-2">
                          {application.property.description}
                        </p>
                      ) : null}
                      </div>
                    </div>
                  </div>
                  <p className="archived-note text-xs mt-2">
                    This request was closed and moved to archive.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentApplications;
