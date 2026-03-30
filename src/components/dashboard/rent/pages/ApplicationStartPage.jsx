import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StartApplicationFlow from '../components/applications/StartApplicationFlow';
import { useApplications } from '../contexts/ApplicationsContext';

const ApplicationStartPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { applications, updateApplication } = useApplications();

  const application = useMemo(
    () => applications.find((app) => app.id === applicationId),
    [applications, applicationId]
  );

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[#64748b]">Application not found.</p>
      </div>
    );
  }

  const handleSaveDraft = (id, payload) => {
    updateApplication(id, {
      status: 'APPLICATION_STARTED',
      applicantProfile: payload?.formData || {},
      applicantDocs: payload?.documents || {},
      applicationStep: payload?.step || 1,
      updatedAt: 'Just now'
    });
  };

  const handleProceed = () => {
    navigate(`/dashboard/rent/applications/${applicationId}/payment`);
  };

  const handleClose = () => {
    navigate('/dashboard/rent/applications');
  };

  return (
    <div className="rent-overview-container bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 md:p-6">
      <div className="bg-white rounded-lg border border-[#e2e8f0] p-6 space-y-6 max-w-5xl mx-auto">
        <div className="space-y-9">
          <button
            onClick={handleClose}
            aria-label="Back to Applications"
            className="text-2xl font-medium leading-none"
            style={{ color: 'var(--accent-color, #9F7539)' }}
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-[#0e1f42]">Complete Application</h1>
            <p className="text-sm text-[#64748b]">Tell us a bit more about yourself before payment.</p>
          </div>
        </div>
        <div className="mt-4">
          <StartApplicationFlow
            application={application}
            onSaveDraft={handleSaveDraft}
            onProceed={handleProceed}
            onClose={handleClose}
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicationStartPage;
