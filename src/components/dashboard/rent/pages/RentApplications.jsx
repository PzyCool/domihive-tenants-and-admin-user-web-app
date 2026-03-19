import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApplicationCard from '../components/applications/ApplicationCard';
import InspectionGateModal from '../components/applications/InspectionGateModal';
import InspectionMissedModal from '../components/applications/InspectionMissedModal';
import ContinueApplicationModal from '../components/applications/ContinueApplicationModal';
import FeedbackModal from '../components/applications/FeedbackModal';
import { useApplications } from '../contexts/ApplicationsContext';

const RentApplications = () => {
  const navigate = useNavigate();
  const { applications, updateApplication, addNotification } = useApplications();
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [modalType, setModalType] = useState(null);

  const handleCardAction = (application) => {
    setSelectedApplication(application);
    switch (application.status) {
      case 'INSPECTION_SCHEDULED':
        setModalType('inspection');
        break;
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
        setModalType(null);
        break;
    }
  };

  const handleInspectionAttended = () => {
    if (!selectedApplication) return;
    updateApplication(selectedApplication.id, { status: 'INSPECTION_VERIFIED', updatedAt: 'Just now' });
    addNotification({
      type: 'inspection',
      title: 'Inspection Verified',
      message: `Inspection for ${selectedApplication.property.title} has been marked as completed.`,
      cta: { label: 'Start Application', path: `/dashboard/rent/applications/${selectedApplication.id}/start` }
    });
    setModalType('continue');
  };

  const handleInspectionMissed = () => {
    setModalType('missed');
  };

  const handleContinueWithProperty = () => {
    if (selectedApplication) {
      navigate(`/dashboard/rent/applications/${selectedApplication.id}/start`);
    }
    setModalType(null);
  };

  const handleDeclineProperty = () => {
    setModalType('feedback');
  };

  const handleFeedbackSubmit = () => {
    if (!selectedApplication) return;
    updateApplication(selectedApplication.id, { status: 'CANCELLED', updatedAt: 'Just now' });
    addNotification({
      type: 'application',
      title: 'Application Cancelled',
      message: `${selectedApplication.property.title} request has been cancelled.`,
      cta: { label: 'Browse Properties', path: '/dashboard/rent/browse' }
    });
    setModalType(null);
  };

  const summaryStats = useMemo(
    () => ({
      total: applications.length,
      pending: applications.filter((app) =>
        ['INSPECTION_SCHEDULED', 'INSPECTION_VERIFIED', 'APPLICATION_STARTED'].includes(app.status)
      ).length,
      submitted: applications.filter((app) => app.status === 'APPLICATION_SUBMITTED' || app.status === 'UNDER_REVIEW')
        .length
    }),
    [applications]
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
          {applications.length === 0 ? (
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 text-center">
              <p className="text-base font-semibold text-[#0e1f42]">No applications yet</p>
              <p className="text-sm text-[#64748b] mt-1">Book an inspection from Browse Properties to start your first application.</p>
            </div>
          ) : (
            applications.map((application) => (
              <ApplicationCard key={application.id} application={application} onAction={handleCardAction} />
            ))
          )}
        </div>
      </div>

      {modalType === 'inspection' && selectedApplication && (
        <InspectionGateModal
          application={selectedApplication}
          onAttended={handleInspectionAttended}
          onMissed={handleInspectionMissed}
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === 'missed' && selectedApplication && (
        <InspectionMissedModal
          application={selectedApplication}
          onReschedule={() => {
            addNotification({
              type: 'inspection',
              title: 'Reschedule Inspection',
              message: 'Pick a new date and time for your inspection booking.',
              cta: { label: 'Reschedule', path: '/dashboard/rent/browse' }
            });
            navigate('/dashboard/rent/browse');
          }}
          onCancel={() => {
            updateApplication(selectedApplication.id, { status: 'CANCELLED' });
            addNotification({
              type: 'application',
              title: 'Request Cancelled',
              message: `${selectedApplication.property.title} request has been cancelled.`,
              cta: { label: 'Browse Properties', path: '/dashboard/rent/browse' }
            });
          }}
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === 'continue' && selectedApplication && (
        <ContinueApplicationModal
          application={selectedApplication}
          onContinue={handleContinueWithProperty}
          onNotInterested={handleDeclineProperty}
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === 'feedback' && selectedApplication && (
        <FeedbackModal application={selectedApplication} onSubmit={handleFeedbackSubmit} onClose={() => setModalType(null)} />
      )}
    </div>
  );
};

export default RentApplications;
