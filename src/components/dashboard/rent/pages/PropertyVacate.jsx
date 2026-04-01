import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock } from 'lucide-react';
import { useProperties } from '../contexts/PropertiesContext';

const asDDMMYY = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

const PropertyVacate = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { properties, submitMoveOutNotice, scheduleMoveOutInspection } = useProperties();
  const property = useMemo(
    () => properties.find((p) => p.propertyId === propertyId),
    [properties, propertyId]
  );

  const [vacateForm, setVacateForm] = useState({ preferredDate: '', reason: '', notes: '' });
  const [inspectionForm, setInspectionForm] = useState({ date: '', time: '' });

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[#64748b]">Property not found.</p>
      </div>
    );
  }

  const handleSubmitVacate = () => {
    if (!vacateForm.preferredDate) return;
    submitMoveOutNotice(property.propertyId, {
      ...vacateForm,
      submittedOn: new Date().toISOString().slice(0, 10)
    });
  };

  const handleScheduleInspection = () => {
    if (!inspectionForm.date || !inspectionForm.time) return;
    scheduleMoveOutInspection(property.propertyId, {
      scheduled: `${inspectionForm.date} ${inspectionForm.time}`,
      status: 'scheduled'
    });
  };

  return (
    <div className="rent-overview-container min-h-screen p-4 md:p-6 property-payments-page">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <button
                onClick={() => navigate(`/dashboard/rent/my-properties/${property.propertyId}/lease-management`)}
                className="p-2 rounded-xl status-accent hover:bg-gray-100 transition-colors"
                aria-label="Back to Lease Management"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-[#0e1f42]">End Lease</h1>
                <p className="text-sm text-gray-500">{property.name} • {property.location}</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-[#e2e8f0] rounded-xl px-4 py-3 min-w-[260px]">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Lease End Date</p>
              <p className="text-base font-bold status-accent">{asDDMMYY(property.leaseEnd)}</p>
              <p className="text-xs text-gray-500">Unit: {property.unitCode || property.unitNumber || '—'}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#0e1f42]">Notice to Vacate</h3>

            <label className="flex flex-col gap-1 text-sm text-[#475467]">
              Preferred move-out date
              <input
                type="text"
                value={vacateForm.preferredDate}
                onChange={(e) => setVacateForm((p) => ({ ...p, preferredDate: e.target.value }))}
                className="border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white"
                placeholder="dd/mm/yy"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-[#475467]">
              Reason (optional)
              <input
                value={vacateForm.reason}
                onChange={(e) => setVacateForm((p) => ({ ...p, reason: e.target.value }))}
                className="border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white"
                placeholder="Relocation, rent, etc."
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-[#475467]">
              Notes (optional)
              <textarea
                value={vacateForm.notes}
                onChange={(e) => setVacateForm((p) => ({ ...p, notes: e.target.value }))}
                className="border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white"
                rows={3}
                placeholder="Additional details"
              />
            </label>

            <button
              onClick={handleSubmitVacate}
              className="px-4 py-3 rounded-xl text-white font-semibold status-danger-bg"
            >
              Submit End-Lease Notice
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0e1f42]">Schedule Move-out Inspection</h3>
              <CalendarClock className="status-accent" size={16} />
            </div>

            {property.moveOutInspection?.scheduled && (
              <p className="text-xs text-gray-500">Scheduled: {property.moveOutInspection.scheduled}</p>
            )}

            <label className="flex flex-col gap-1 text-sm text-[#475467]">
              Date
              <input
                type="text"
                value={inspectionForm.date}
                onChange={(e) => setInspectionForm((p) => ({ ...p, date: e.target.value }))}
                className="border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white"
                placeholder="dd/mm/yy"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-[#475467]">
              Time
              <input
                type="time"
                value={inspectionForm.time}
                onChange={(e) => setInspectionForm((p) => ({ ...p, time: e.target.value }))}
                className="border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white"
              />
            </label>

            <button
              onClick={handleScheduleInspection}
              className="px-4 py-3 rounded-xl text-white font-semibold status-accent-bg"
            >
              Schedule Inspection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyVacate;
