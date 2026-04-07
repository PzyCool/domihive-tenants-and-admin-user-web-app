import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMaintenance } from '../contexts/MaintenanceContext';
import { useProperties } from '../contexts/PropertiesContext';

const MAINTENANCE_DRAFT_KEY = 'domihive_maintenance_request_draft';

const EMPTY_FORM = {
  propertyId: '',
  title: '',
  category: '',
  urgency: '',
  preferredDate: '',
  description: '',
  contactPhone: '',
  contactWindow: '',
  allowEntry: false,
  contactEmergency: false
};

const MaintenanceRequestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addTicket } = useMaintenance();
  const { properties } = useProperties();

  const [form, setForm] = useState(EMPTY_FORM);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MAINTENANCE_DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.form && typeof parsed.form === 'object') {
          setForm((prev) => ({ ...prev, ...parsed.form }));
        }
        if (typeof parsed?.policyAgreed === 'boolean') {
          setPolicyAgreed(parsed.policyAgreed);
        }
      }
    } catch (_error) {
      // ignore malformed draft
    } finally {
      setIsDraftHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (location.state?.propertyId) {
      setForm((prev) => ({ ...prev, propertyId: String(location.state.propertyId) }));
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (location.state?.policyAgreed) {
      setPolicyAgreed(true);
      if (location.state?.propertyId) {
        setForm((prev) => ({ ...prev, propertyId: String(location.state.propertyId) }));
      }
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!isDraftHydrated) return;
    localStorage.setItem(
      MAINTENANCE_DRAFT_KEY,
      JSON.stringify({
        form,
        policyAgreed
      })
    );
  }, [form, policyAgreed, isDraftHydrated]);

  const selectedProperty = useMemo(
    () => properties.find((property) => String(property.propertyId) === String(form.propertyId)) || null,
    [properties, form.propertyId]
  );

  const isFormValid =
    form.propertyId &&
    form.title &&
    form.category &&
    form.urgency &&
    form.description &&
    form.contactPhone &&
    policyAgreed;

  const handleSubmit = () => {
    if (!isFormValid) return;

    const now = new Date().toISOString();

    addTicket({
      propertyId: form.propertyId,
      propertyName: selectedProperty?.name || 'Property',
      category: form.category,
      title: form.title,
      description: form.description,
      urgency: form.urgency,
      priority: String(form.urgency).toLowerCase().includes('emergency') ? 'Emergency' : 'Normal',
      responsibility: 'Pending Assessment',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString().slice(0, 10),
      updates: [{ status: 'SUBMITTED', note: 'Request submitted', at: now }]
    });

    localStorage.removeItem(MAINTENANCE_DRAFT_KEY);
    setSuccessOpen(true);
  };

  return (
    <div className="rent-overview-container bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 md:p-6">
      <div className="rounded-xl shadow-sm border p-4 md:p-6" style={{ backgroundColor: 'var(--card-bg,#fff)', borderColor: 'var(--border-color,#e2e8f0)' }}>
        <div className="mb-5">
          <button
            onClick={() => navigate('/dashboard/rent/maintenance')}
            className="inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: 'var(--accent-color,#9F7539)' }}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Maintenance
          </button>
          <h1 className="text-2xl md:text-3xl font-bold mt-3 text-[var(--text-color,#0e1f42)]">Request Maintenance</h1>
          <p className="text-sm text-[var(--text-muted,#64748b)]">Submit a maintenance request for your unit.</p>
        </div>

        <div className="grid gap-3 text-sm text-[var(--text-color,#0e1f42)]">
          <label className="flex flex-col gap-1">
            Select Property *
            <select
              value={form.propertyId}
              onChange={(e) => setForm((prev) => ({ ...prev, propertyId: e.target.value }))}
              className="border rounded-lg px-3 py-2"
              style={{ borderColor: 'var(--border-color,#e2e8f0)', backgroundColor: 'var(--card-bg,#fff)' }}
            >
              <option value="">Select property</option>
              {properties.map((property) => (
                <option key={property.propertyId} value={property.propertyId}>
                  {property.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              Issue Title *
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="border rounded-lg px-3 py-2"
                style={{ borderColor: 'var(--border-color,#e2e8f0)', backgroundColor: 'var(--card-bg,#fff)' }}
                placeholder="Short title"
              />
            </label>
            <label className="flex flex-col gap-1">
              Category *
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="border rounded-lg px-3 py-2"
                style={{ borderColor: 'var(--border-color,#e2e8f0)', backgroundColor: 'var(--card-bg,#fff)' }}
              >
                <option value="">Select category</option>
                {['Plumbing', 'Electrical', 'AC', 'Appliance', 'Structural', 'Cleaning', 'Other'].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              Urgency Level *
              <select
                value={form.urgency}
                onChange={(e) => setForm((prev) => ({ ...prev, urgency: e.target.value }))}
                className="border rounded-lg px-3 py-2"
                style={{ borderColor: 'var(--border-color,#e2e8f0)', backgroundColor: 'var(--card-bg,#fff)' }}
              >
                <option value="">Select urgency</option>
                <option>Low - can wait a few days</option>
                <option>Medium - within 48 hours</option>
                <option>High - within 24 hours</option>
                <option>Emergency - immediate action</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Preferred Repair Date (optional)
              <input
                type="date"
                lang="en-GB"
                value={form.preferredDate}
                onChange={(e) => setForm((prev) => ({ ...prev, preferredDate: e.target.value }))}
                className="border rounded-lg px-3 py-2"
                style={{ borderColor: 'var(--border-color,#e2e8f0)', backgroundColor: 'var(--card-bg,#fff)' }}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            Detailed Description *
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="border rounded-lg px-3 py-2"
              style={{ borderColor: 'var(--border-color,#e2e8f0)', backgroundColor: 'var(--card-bg,#fff)' }}
              rows={4}
              placeholder="Describe the issue in detail"
            />
          </label>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-dashed rounded-xl p-3 text-center text-sm" style={{ borderColor: 'var(--border-color,#e2e8f0)', color: 'var(--text-muted,#64748b)' }}>
              Upload Photos (optional)
              <div className="mt-2">
                <button className="px-3 py-2 rounded-lg border font-semibold" style={{ borderColor: 'var(--border-color,#e2e8f0)', color: 'var(--text-color,#0e1f42)' }}>
                  Add Photo
                </button>
              </div>
            </div>
            <div className="border border-dashed rounded-xl p-3 text-center text-sm" style={{ borderColor: 'var(--border-color,#e2e8f0)', color: 'var(--text-muted,#64748b)' }}>
              Upload Videos (optional)
              <div className="mt-2">
                <button className="px-3 py-2 rounded-lg border font-semibold" style={{ borderColor: 'var(--border-color,#e2e8f0)', color: 'var(--text-color,#0e1f42)' }}>
                  Add Video
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              Contact Phone *
              <input
                value={form.contactPhone}
                onChange={(e) => setForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                className="border rounded-lg px-3 py-2"
                style={{ borderColor: 'var(--border-color,#e2e8f0)', backgroundColor: 'var(--card-bg,#fff)' }}
                placeholder="+234 ..."
              />
            </label>
            <label className="flex flex-col gap-1">
              Best Time to Contact (optional)
              <select
                value={form.contactWindow}
                onChange={(e) => setForm((prev) => ({ ...prev, contactWindow: e.target.value }))}
                className="border rounded-lg px-3 py-2"
                style={{ borderColor: 'var(--border-color,#e2e8f0)', backgroundColor: 'var(--card-bg,#fff)' }}
              >
                <option value="">Any time</option>
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Evening</option>
              </select>
            </label>
          </div>

          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.allowEntry}
                onChange={() => setForm((prev) => ({ ...prev, allowEntry: !prev.allowEntry }))}
              />
              I grant permission for maintenance staff to enter the property when I'm not home
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.contactEmergency}
                onChange={() => setForm((prev) => ({ ...prev, contactEmergency: !prev.contactEmergency }))}
              />
              Contact me immediately for emergency repairs
            </label>
          </div>

          <div className="space-y-2 border rounded-lg p-3" style={{ borderColor: 'var(--border-color,#e2e8f0)' }}>
            <p className="font-semibold text-[var(--text-color,#0e1f42)]">Please read and agree to the maintenance policy before submitting.</p>
            <button
              onClick={() =>
                navigate('/dashboard/rent/maintenance/policy', {
                  state: {
                    propertyId: form.propertyId,
                    returnTo: '/dashboard/rent/maintenance/request'
                  }
                })
              }
              className="font-semibold text-[var(--accent-color,#9F7539)]"
            >
              Read Maintenance Policy
            </button>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={policyAgreed}
                onChange={() => setPolicyAgreed((prev) => !prev)}
              />
              I have read and agree to the maintenance policy
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => navigate('/dashboard/rent/maintenance')}
              className="px-4 py-2 rounded-full text-sm font-semibold border"
              style={{ borderColor: 'var(--border-color,#e2e8f0)', color: 'var(--text-color,#0e1f42)' }}
            >
              Cancel
            </button>
            <button
              disabled={!isFormValid}
              onClick={handleSubmit}
              className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${!isFormValid ? 'opacity-60 cursor-not-allowed' : ''}`}
              style={{ backgroundColor: 'var(--accent-color,#9F7539)' }}
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>

      {successOpen && (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/40 px-4">
          <div className="rounded-2xl shadow-2xl w-full max-w-md p-6 text-center relative" style={{ backgroundColor: 'var(--card-bg,#fff)', border: '1px solid var(--border-color,#e2e8f0)' }}>
            <h3 className="text-xl font-semibold text-[var(--text-color,#0e1f42)]">Request submitted</h3>
            <p className="text-sm text-[var(--text-muted,#64748b)] mt-2">Your maintenance request was submitted successfully.</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => {
                  setSuccessOpen(false);
                  navigate('/dashboard/rent/maintenance');
                }}
                className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: 'var(--accent-color,#9F7539)' }}
              >
                Back to Maintenance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceRequestPage;
