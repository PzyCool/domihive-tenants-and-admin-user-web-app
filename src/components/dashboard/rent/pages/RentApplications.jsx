import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApplicationCard from '../components/applications/ApplicationCard';
import { useApplications } from '../contexts/ApplicationsContext';
import UnifiedPanelPage, { UnifiedPanelSection } from '../../../shared/layout/UnifiedPanelPage';
import { FilePlus2, FileClock, CheckCircle2 } from 'lucide-react';
import { useUnitCardView } from '../contexts/UnitCardViewContext';

const ACTIVE_APPLICATION_STATUSES = [
  'INSPECTION_SCHEDULED',
  'INSPECTION_VERIFIED',
  'APPLICATION_STARTED',
  'APPLICATION_SUBMITTED',
  'UNDER_REVIEW'
];

const RentApplications = () => {
  const navigate = useNavigate();
  const { applications, updateApplication, addNotification } = useApplications();
  const { viewType, isGrid } = useUnitCardView();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [sortBy, setSortBy] = useState('newest');

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
      setStatusFilter('cancelled');
      addNotification({
        type: 'application',
        title: 'Request Closed',
        message: `${application.property.title} inspection request has been closed.`,
        cta: { label: 'View Cancelled Requests', path: '/dashboard/rent/applications' }
      });
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

    if (statusFilter === 'active') {
      list = list.filter((app) => ACTIVE_APPLICATION_STATUSES.includes(app.status));
    } else if (statusFilter === 'approved') {
      list = list.filter((app) => app.status === 'APPROVED');
    } else if (statusFilter === 'rejected') {
      list = list.filter((app) => app.status === 'REJECTED');
    } else if (statusFilter === 'cancelled') {
      list = list.filter((app) => app.status === 'CANCELLED');
    } else {
      list = list.filter((app) => app.status === statusFilter);
    }

    list.sort((a, b) => {
      const da = new Date(a.submittedAt || a.createdAt || 0).getTime();
      const db = new Date(b.submittedAt || b.createdAt || 0).getTime();
      return sortBy === 'oldest' ? da - db : db - da;
    });

    return list;
  }, [applications, search, statusFilter, sortBy]);

  const summaryStats = useMemo(
    () => ({
      total: applications.length,
      pending: applications.filter((app) =>
        ['INSPECTION_SCHEDULED', 'INSPECTION_VERIFIED', 'APPLICATION_STARTED'].includes(app.status)
      ).length,
      submitted: applications.filter((app) => app.status === 'APPLICATION_SUBMITTED' || app.status === 'UNDER_REVIEW').length
    }),
    [applications]
  );

  return (
    <UnifiedPanelPage
      title="My Applications"
      subtitle="Track inspection → application → payment → decision."
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
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 px-3 rounded-md border border-[var(--border-color,#e2e8f0)] bg-transparent text-sm text-[var(--text-color,#0e1f42)] min-w-[155px]"
            >
              <option value="active">Active</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 px-3 rounded-md border border-[var(--border-color,#e2e8f0)] bg-transparent text-sm text-[var(--text-color,#0e1f42)] min-w-[155px]"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
            </select>
            <div className="h-11 inline-flex items-center text-sm text-[var(--text-muted,#64748b)] whitespace-nowrap">
              Showing <span className="font-semibold text-[var(--text-color,#0e1f42)]">{filteredApplications.length}</span> applications
            </div>
          </div>
        </div>
      }
    >
      <UnifiedPanelSection unstyled className="pt-1">
        <div className={isGrid ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'grid gap-4'}>
          {filteredApplications.length === 0 ? (
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 text-center">
              <p className="text-base font-semibold text-[#0e1f42]">No applications found</p>
              <p className="text-sm text-[#64748b] mt-1">Try another status filter or book an inspection from Browse Properties.</p>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application.id} className="w-full">
                <ApplicationCard
                  application={application}
                  onAction={handleCardAction}
                  compact
                  viewType={viewType}
                />
              </div>
            ))
          )}
        </div>
      </UnifiedPanelSection>
    </UnifiedPanelPage>
  );
};

export default RentApplications;
