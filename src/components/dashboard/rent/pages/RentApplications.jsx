import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApplicationCard from '../components/applications/ApplicationCard';
import { useApplications } from '../contexts/ApplicationsContext';
import UnifiedPanelPage, { UnifiedPanelSection } from '../../../shared/layout/UnifiedPanelPage';
import { FilePlus2, FileClock, CheckCircle2 } from 'lucide-react';

const RentApplications = () => {
  const navigate = useNavigate();
  const { applications, updateApplication, addNotification } = useApplications();
  const [decisionOverlay, setDecisionOverlay] = useState(null);
  const [isDecisionLoading, setIsDecisionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const previousStatusesRef = useRef(new Map());

  const wasDecisionAlreadyShown = (applicationId, status) => {
    try {
      const key = `domihive_decision_seen_${applicationId}_${status}`;
      return localStorage.getItem(key) === '1';
    } catch (_error) {
      return false;
    }
  };

  const markDecisionShown = (applicationId, status) => {
    try {
      const key = `domihive_decision_seen_${applicationId}_${status}`;
      localStorage.setItem(key, '1');
    } catch (_error) {
      // ignore
    }
  };

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

  const filteredApplications = useMemo(() => {
    let list = [...applications];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((app) =>
        `${app.applicantName || ''} ${app.property?.title || ''} ${app.id || ''}`.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((app) => app.status === statusFilter);
    }

    list.sort((a, b) => {
      const da = new Date(a.submittedAt || a.createdAt || 0).getTime();
      const db = new Date(b.submittedAt || b.createdAt || 0).getTime();
      return sortBy === 'oldest' ? da - db : db - da;
    });

    return list;
  }, [applications, search, statusFilter, sortBy]);

  const activeApplications = useMemo(
    () =>
      filteredApplications.filter((app) =>
        ['INSPECTION_SCHEDULED', 'INSPECTION_VERIFIED', 'APPLICATION_STARTED', 'APPLICATION_SUBMITTED', 'UNDER_REVIEW'].includes(app.status)
      ),
    [filteredApplications]
  );

  const archivedApplications = useMemo(
    () => filteredApplications.filter((app) => ['CANCELLED', 'REJECTED', 'APPROVED'].includes(app.status)),
    [filteredApplications]
  );

  const summaryStats = useMemo(
    () => ({
      total: activeApplications.length,
      pending: activeApplications.filter((app) =>
        ['INSPECTION_SCHEDULED', 'INSPECTION_VERIFIED', 'APPLICATION_STARTED'].includes(app.status)
      ).length,
      submitted: activeApplications.filter((app) => app.status === 'APPLICATION_SUBMITTED' || app.status === 'UNDER_REVIEW').length
    }),
    [activeApplications]
  );

  useEffect(() => {
    const previousStatuses = previousStatusesRef.current;
    const newlyDecided = applications.find((app) => {
      if (!['APPROVED', 'REJECTED'].includes(app.status)) return false;
      const prev = previousStatuses.get(app.id);
      const changedToDecision = prev && prev !== app.status;
      const firstSeenDecision = !prev;
      if (!(changedToDecision || firstSeenDecision)) return false;
      return !wasDecisionAlreadyShown(app.id, app.status);
    });

    previousStatusesRef.current = new Map(applications.map((app) => [app.id, app.status]));

    if (!newlyDecided) return;
    setIsDecisionLoading(true);
    const timer = window.setTimeout(() => {
      setIsDecisionLoading(false);
      setDecisionOverlay(newlyDecided);
      markDecisionShown(newlyDecided.id, newlyDecided.status);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [applications]);

  return (
    <>
      <UnifiedPanelPage
        title="My Applications"
        subtitle="Track inspection → application → payment → decision."
        actions={
          <button className="h-11 px-6 rounded-lg border border-[var(--accent-color,#9F7539)] bg-[var(--accent-color,#9F7539)] text-white text-sm font-semibold hover:opacity-90">
            Refresh Status
          </button>
        }
        stats={[
          {
            label: 'Total Applications',
            value: summaryStats.total,
            meta: `${summaryStats.total} applications`,
            icon: <FilePlus2 size={20} />,
            iconClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          },
          {
            label: 'Actionable',
            value: summaryStats.pending,
            meta: `${summaryStats.pending} in progress`,
            icon: <FileClock size={20} />,
            iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
          },
          {
            label: 'Submitted',
            value: summaryStats.submitted,
            meta: `${summaryStats.submitted} submitted`,
            icon: <CheckCircle2 size={20} />,
            iconClass: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
          }
        ]}
        className="applications-page"
        filterBar={
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted,#64748b)] text-sm"></i>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applicant, property..."
                className="w-full pl-9 pr-3 py-2.5 rounded-md border border-[var(--border-color,#e2e8f0)] bg-transparent text-sm text-[var(--text-color,#0e1f42)]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-md border border-[var(--border-color,#e2e8f0)] bg-transparent text-sm text-[var(--text-color,#0e1f42)] min-w-[155px]"
              >
                <option value="all">All Status</option>
                <option value="INSPECTION_SCHEDULED">Inspection Scheduled</option>
                <option value="INSPECTION_VERIFIED">Inspection Verified</option>
                <option value="APPLICATION_STARTED">Application Started</option>
                <option value="APPLICATION_SUBMITTED">Application Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 rounded-md border border-[var(--border-color,#e2e8f0)] bg-transparent text-sm text-[var(--text-color,#0e1f42)] min-w-[155px]"
              >
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
              </select>
              <div className="text-sm text-[var(--text-muted,#64748b)]">
                Showing <span className="font-semibold text-[var(--text-color,#0e1f42)]">{filteredApplications.length}</span> applications
              </div>
            </div>
          </div>
        }
      >
        <UnifiedPanelSection unstyled className="pt-1">
          <div className="grid gap-4">
            {activeApplications.length === 0 ? (
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 text-center">
                <p className="text-base font-semibold text-[#0e1f42]">No applications yet</p>
                <p className="text-sm text-[#64748b] mt-1">Book an inspection from Browse Properties to start your first application.</p>
              </div>
            ) : (
              activeApplications.map((application) => (
                <div key={application.id} className="w-full max-w-[900px] mx-auto">
                  <ApplicationCard
                    application={application}
                    onAction={handleCardAction}
                    compact
                  />
                </div>
              ))
            )}
          </div>
        </UnifiedPanelSection>

        {archivedApplications.length > 0 && (
          <UnifiedPanelSection>
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
                      style={
                        application.status === 'APPROVED'
                          ? {
                              backgroundColor: 'rgba(16, 185, 129, 0.18)',
                              color: '#10b981',
                              borderColor: 'rgba(16, 185, 129, 0.45)'
                            }
                          : application.status === 'REJECTED'
                            ? {
                                backgroundColor: 'rgba(239, 68, 68, 0.18)',
                                color: '#ef4444',
                                borderColor: 'rgba(239, 68, 68, 0.45)'
                              }
                            : {
                                backgroundColor: 'rgba(107, 114, 128, 0.18)',
                                color: '#6b7280',
                                borderColor: 'rgba(107, 114, 128, 0.45)'
                              }
                      }
                    >
                      {application.status === 'APPROVED'
                        ? 'Approved'
                        : application.status === 'REJECTED'
                          ? 'Rejected'
                          : 'Cancelled'}
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
                      {application.status === 'APPROVED'
                        ? 'This application was approved and your tenancy is now active under My Properties.'
                        : application.status === 'REJECTED'
                          ? `This application was rejected.${application.rejectionReason ? ` Reason: ${application.rejectionReason}` : ''}`
                          : 'This request was closed and moved to archive.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </UnifiedPanelSection>
        )}
      </UnifiedPanelPage>

      {isDecisionLoading && (
        <div className="fixed inset-0 z-[1300] bg-black/45 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border-color,#e2e8f0)] bg-[var(--card-bg,#ffffff)] p-6 text-center shadow-2xl">
            <div className="h-11 w-11 rounded-full border-4 border-[var(--accent-color,#9F7539)] border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-semibold text-[var(--text-color,#0e1f42)]">Updating your application status...</p>
          </div>
        </div>
      )}

      {decisionOverlay && (
        <div className="fixed inset-0 z-[1310] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[var(--border-color,#e2e8f0)] bg-[var(--card-bg,#ffffff)] shadow-2xl overflow-hidden">
            <div
              className={`px-6 py-4 ${
                decisionOverlay.status === 'APPROVED'
                  ? 'bg-emerald-500/15 border-b border-emerald-500/20'
                  : 'bg-red-500/15 border-b border-red-500/20'
              }`}
            >
              <h3 className="text-xl font-bold text-[var(--text-color,#0e1f42)]">
                {decisionOverlay.status === 'APPROVED'
                  ? 'Congratulations! Application Approved'
                  : 'Application Update'}
              </h3>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm text-[var(--text-muted,#475467)]">
              {decisionOverlay.status === 'APPROVED' ? (
                <>
                  <p>
                    Congratulations, <span className="font-semibold text-[var(--text-color,#0e1f42)]">{decisionOverlay.applicantName || 'Tenant'}</span>. You are now a tenant of DomiHive Elite Property Solutions Limited.
                  </p>
                  <p>
                    Your Management section is now unlocked. You can manage and track your tenancy from My Properties, Maintenance, Payments, and Messages.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Your application for <span className="font-semibold text-[var(--text-color,#0e1f42)]">{decisionOverlay?.property?.title || 'this unit'}</span> was not approved.
                  </p>
                  <p>
                    Reason: <span className="font-semibold text-[var(--text-color,#0e1f42)]">{decisionOverlay?.rejectionReason || 'Applicant does not meet requirements for this unit'}</span>
                  </p>
                  <p>
                    Refund status: <span className="font-semibold text-[var(--text-color,#0e1f42)]">{decisionOverlay?.refundStatus || 'Pending Refund'}</span> • ETA: <span className="font-semibold text-[var(--text-color,#0e1f42)]">{decisionOverlay?.refundETA || '5-10 business days'}</span>
                  </p>
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t border-[var(--border-color,#e2e8f0)] flex items-center justify-end gap-2">
              <button
                onClick={() => setDecisionOverlay(null)}
                className="px-4 py-2 rounded-lg border border-[var(--border-color,#e2e8f0)] text-sm font-semibold text-[var(--text-color,#0e1f42)]"
              >
                Close
              </button>
              {decisionOverlay.status === 'APPROVED' ? (
                <button
                  onClick={() => {
                    setDecisionOverlay(null);
                    navigate('/dashboard/rent/my-properties');
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--accent-color,#9F7539)]"
                >
                  Open My Properties
                </button>
              ) : (
                <button
                  onClick={() => {
                    setDecisionOverlay(null);
                    navigate('/dashboard/rent/browse');
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--accent-color,#9F7539)]"
                >
                  Continue Browsing
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RentApplications;
