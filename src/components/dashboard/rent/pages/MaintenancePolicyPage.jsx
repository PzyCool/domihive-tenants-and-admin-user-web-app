import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const MaintenancePolicyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || '/dashboard/rent/maintenance';
  const propertyId = location.state?.propertyId || '';

  return (
    <div className="rent-overview-container bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 md:p-6">
      <div className="bg-white rounded-lg border border-[#e2e8f0] p-6 space-y-6 max-w-5xl mx-auto shadow-md">
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="text-2xl font-medium leading-none"
            style={{ color: 'var(--accent-color, #9F7539)' }}
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-[#0e1f42]">Maintenance Policy</h1>
            <p className="text-sm text-[#64748b]">Please review before submitting a maintenance request.</p>
          </div>
        </div>

        <div className="text-sm text-[#475467] space-y-3">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi.</p>
          <p>Response times: emergencies immediate; high within 24h; medium within 48h; low within a few days.</p>
          <p>Access: allow entry or ensure someone is available at scheduled time.</p>
          <p>Responsibilities: tenant-caused damage may be billable; wear and tear handled appropriately.</p>
          <p>By submitting, you agree to cooperate with scheduling and provide accurate information.</p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() =>
              navigate(returnTo, {
                state: { policyAgreed: true, propertyId }
              })
            }
            className="px-4 py-2 rounded-lg text-white font-semibold"
            style={{ backgroundColor: 'var(--accent-color, #9F7539)' }}
          >
            I have read and agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePolicyPage;
