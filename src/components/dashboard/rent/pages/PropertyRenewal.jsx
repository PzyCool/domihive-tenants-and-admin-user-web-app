import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { useProperties } from '../contexts/PropertiesContext';

const formatNaira = (amt) => (amt || amt === 0 ? `₦${Number(amt).toLocaleString()}` : '—');
const asDDMMYY = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

const PropertyRenewal = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { properties } = useProperties();
  const property = useMemo(
    () => properties.find((p) => p.propertyId === propertyId),
    [properties, propertyId]
  );

  const [form, setForm] = useState({
    duration: '1 year',
    preferredStartDate: '',
    note: ''
  });

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[#64748b]">Property not found.</p>
      </div>
    );
  }

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
                <h1 className="text-2xl font-semibold text-[#0e1f42]">Lease Renewal</h1>
                <p className="text-sm text-gray-500">{property.name} • {property.location}</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-[#e2e8f0] rounded-xl px-4 py-3 min-w-[260px]">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Current Lease</p>
              <p className="text-base font-bold status-accent">{formatNaira(property.rentAmount)} / {property.paymentPlan || 'Yearly'}</p>
              <p className="text-xs text-gray-500">{asDDMMYY(property.leaseStart)} - {asDDMMYY(property.leaseEnd)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-[#0e1f42]">Renewal Request</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm text-[#475467]">
              Renewal Duration
              <select
                value={form.duration}
                onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                className="border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white"
              >
                <option>1 year</option>
                <option>2 years</option>
                <option>3 years</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-[#475467]">
              Preferred Start Date
              <input
                type="text"
                value={form.preferredStartDate}
                onChange={(e) => setForm((p) => ({ ...p, preferredStartDate: e.target.value }))}
                placeholder="dd/mm/yy"
                className="border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white"
              />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl border border-[#e2e8f0] p-4 flex items-center gap-2 text-sm text-[#475467]">
              <Calendar className="status-accent" size={14} />
              Current lease end: <span className="font-semibold text-[#0e1f42]">{asDDMMYY(property.leaseEnd)}</span>
            </div>
            <div className="bg-gray-50 rounded-xl border border-[#e2e8f0] p-4 flex items-center gap-2 text-sm text-[#475467]">
              <Clock className="status-accent" size={14} />
              Unit code: <span className="font-semibold text-[#0e1f42]">{property.unitCode || property.unitNumber || '—'}</span>
            </div>
          </div>

          <label className="flex flex-col gap-1 text-sm text-[#475467]">
            Additional Note
            <textarea
              rows={4}
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              placeholder="Optional note for lease officer"
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button className="px-4 py-3 rounded-xl text-white font-semibold status-accent-bg">
              Submit Renewal Request
            </button>
            <button
              onClick={() => navigate(`/dashboard/rent/my-properties/${property.propertyId}/lease-management`)}
              className="px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm font-semibold text-[#475467] hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyRenewal;
