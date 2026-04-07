import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react';
import { useProperties } from '../contexts/PropertiesContext';

const docsForTenant = (propertyId) => [
  { id: 'tenant-agreement', title: 'Tenant Agreement', file: `tenant_agreement_${propertyId}.pdf` },
  { id: 'house-rules', title: 'Tenant House Rules', file: `tenant_house_rules_${propertyId}.pdf` },
  { id: 'maintenance-agreement', title: 'Maintenance Agreement', file: `maintenance_agreement_${propertyId}.pdf` }
];

const formatNaira = (amt) => (amt || amt === 0 ? `₦${Number(amt).toLocaleString()}` : '—');

const PropertyLeaseManagement = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { properties } = useProperties();

  const property = useMemo(
    () => properties.find((p) => p.propertyId === propertyId),
    [properties, propertyId]
  );

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[#64748b]">Property not found.</p>
      </div>
    );
  }

  const docs = docsForTenant(property.propertyId);

  return (
    <div className="rent-overview-container min-h-screen p-4 md:p-6 property-payments-page">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <button
                onClick={() => navigate('/dashboard/rent/my-properties')}
                className="p-2 rounded-xl status-accent hover:bg-gray-100 transition-colors"
                aria-label="Back to My Properties"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-[#0e1f42]">Lease Management</h1>
                <p className="text-sm text-gray-500">{property.name} • {property.location}</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-[#e2e8f0] rounded-xl px-4 py-3 min-w-[260px]">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Current Lease</p>
              <p className="text-base font-bold status-accent">{formatNaira(property.rentAmount)} / {property.paymentPlan || 'Yearly'}</p>
              <p className="text-xs text-gray-500">Unit: {property.unitCode || property.unitNumber || '—'}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0e1f42]">Lease Actions</h3>
              <p className="text-sm text-gray-500">Start a renewal request or submit end-lease notice.</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/dashboard/rent/my-properties/${property.propertyId}/renewal`)}
                  className="w-full px-4 py-3 rounded-xl text-white font-semibold bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  Renew Lease
                </button>
                <button
                  onClick={() => navigate(`/dashboard/rent/my-properties/${property.propertyId}/vacate`)}
                  className="w-full px-4 py-3 rounded-xl text-white font-semibold bg-red-600 hover:bg-red-700 transition-colors"
                >
                  End Lease
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0e1f42]">Lease Documents</h3>
                <FileText className="status-accent" size={16} />
              </div>
              <div className="space-y-3">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-gray-50 rounded-xl border border-[#e2e8f0] p-4 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0e1f42]">{doc.title}</p>
                      <p className="text-xs text-gray-500 truncate">{doc.file}</p>
                    </div>
                    <button className="inline-flex items-center gap-1 text-sm font-semibold status-accent hover:opacity-80">
                      <ExternalLink size={14} />
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyLeaseManagement;
