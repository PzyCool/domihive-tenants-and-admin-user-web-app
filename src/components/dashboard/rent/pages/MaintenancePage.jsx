import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaintenance } from '../contexts/MaintenanceContext';
import { useProperties } from '../contexts/PropertiesContext';
import TicketCard from '../components/maintenance/TicketCard';

const MaintenancePage = () => {
  const { tickets, addTicket } = useMaintenance();
  const { properties } = useProperties();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('new'); // new | active | tracking | history
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const [form, setForm] = useState({
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
  });

  const activeTickets = useMemo(
    () => tickets.filter((t) => !['COMPLETED', 'CANCELLED'].includes(t.status)),
    [tickets]
  );
  const historyTickets = useMemo(
    () => tickets.filter((t) => ['COMPLETED', 'CANCELLED'].includes(t.status)),
    [tickets]
  );
  const trackingTicket = activeTickets[0] || tickets[0] || null;

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
    const property = properties.find((p) => p.propertyId === form.propertyId);
    const newTicket = {
      ticketId: `MT-${Date.now()}`,
      propertyId: form.propertyId,
      propertyName: property?.name || 'Property',
      category: form.category,
      title: form.title,
      description: form.description,
      urgency: form.urgency,
      priority: form.urgency.includes('Emergency') ? 'Emergency' : 'Normal',
      responsibility: 'Pending Assessment',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString().slice(0, 10),
      updates: [{ status: 'SUBMITTED', note: 'Request submitted', at: new Date().toISOString() }]
    };
    addTicket(newTicket);
    setForm({
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
    });
    setPolicyAgreed(false);
    setSuccessOpen(true);
    setActiveTab('active');
  };

  const renderTabs = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {[
        { id: 'new', label: 'New Request' },
        { id: 'active', label: 'Active Requests' },
        { id: 'tracking', label: 'Tracking' },
        { id: 'history', label: 'History' }
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 text-sm font-semibold border rounded-lg transition-colors maintenance-tab-btn ${
            activeTab === tab.id ? '' : 'hover:bg-[var(--card-bg,#ffffff)] hover:text-[var(--accent-color,#9F7539)]'
          }`}
          style={{
            borderColor: activeTab === tab.id ? 'var(--accent-color, #9F7539)' : 'var(--text-color, #0e1f42)',
            color: activeTab === tab.id ? '#fff' : 'var(--text-color, #0e1f42)',
            backgroundColor: activeTab === tab.id ? 'var(--accent-color, #9F7539)' : 'transparent'
          }}
          data-active={activeTab === tab.id}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const renderNewRequest = () => (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-6 shadow-sm">
      {properties.length === 0 && (
        <div className="border border-[#e2e8f0] rounded-xl p-4 bg-[#f8fafc]">
          <p className="text-sm font-semibold text-[#0e1f42]">No property available for maintenance yet</p>
          <p className="text-xs text-[#64748b] mt-1">
            Your maintenance form will unlock once you have an active tenancy in My Properties.
          </p>
        </div>
      )}
      <div className="grid gap-3 text-sm text-[#475467]">
        <label className="flex flex-col gap-1">
          Select Property *
          <select
            value={form.propertyId}
            onChange={(e) => setForm((p) => ({ ...p, propertyId: e.target.value }))}
            className="border border-[#e2e8f0] rounded-lg px-3 py-2"
            disabled={properties.length === 0}
          >
            <option value="">Select property</option>
            {properties.map((p) => (
              <option key={p.propertyId} value={p.propertyId}>{p.name}</option>
            ))}
          </select>
        </label>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            Issue Title *
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2"
              placeholder="Short title"
            />
          </label>
          <label className="flex flex-col gap-1">
            Category *
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2"
            >
              <option value="">Select category</option>
              {['Plumbing','Electrical','AC','Appliance','Structural','Cleaning','Other'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            Urgency Level *
            <select
              value={form.urgency}
              onChange={(e) => setForm((p) => ({ ...p, urgency: e.target.value }))}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2"
            >
              <option value="">Select urgency</option>
              <option>Low — can wait a few days</option>
              <option>Medium — within 48 hours</option>
              <option>High — within 24 hours</option>
              <option>Emergency — immediate action</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Preferred Repair Date (optional)
            <input
              type="date"
              value={form.preferredDate}
              onChange={(e) => setForm((p) => ({ ...p, preferredDate: e.target.value }))}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          Detailed Description *
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className="border border-[#e2e8f0] rounded-lg px-3 py-2"
            rows={4}
            placeholder="Describe the issue in detail"
          />
        </label>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-dashed border-[#e2e8f0] rounded-xl p-3 text-center text-sm text-[#6c757d]">
            Upload Photos (optional)
            <div className="mt-2">
              <button className="px-3 py-2 rounded-lg border border-[#e2e8f0] text-[#475467] font-semibold">Add Photo</button>
            </div>
          </div>
          <div className="border border-dashed border-[#e2e8f0] rounded-xl p-3 text-center text-sm text-[#6c757d]">
            Upload Videos (optional)
            <div className="mt-2">
              <button className="px-3 py-2 rounded-lg border border-[#e2e8f0] text-[#475467] font-semibold">Add Video</button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            Contact Phone *
            <input
              value={form.contactPhone}
              onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2"
              placeholder="+234 ..."
            />
          </label>
          <label className="flex flex-col gap-1">
            Best Time to Contact (optional)
            <select
              value={form.contactWindow}
              onChange={(e) => setForm((p) => ({ ...p, contactWindow: e.target.value }))}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2"
            >
              <option value="">Any time</option>
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Evening</option>
            </select>
          </label>
        </div>

        <div className="space-y-2 text-sm text-[#475467]">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.allowEntry}
              onChange={() => setForm((p) => ({ ...p, allowEntry: !p.allowEntry }))}
            />
            I grant permission for maintenance staff to enter the property when I’m not home
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.contactEmergency}
              onChange={() => setForm((p) => ({ ...p, contactEmergency: !p.contactEmergency }))}
            />
            Contact me immediately for emergency repairs
          </label>
        </div>

        <div className="space-y-2 text-sm text-[#475467] border border-[#e2e8f0] rounded-lg p-3 bg-[#f8fafc] maintenance-policy-box">
          <p className="font-semibold text-[#0e1f42]">Please read and agree to the maintenance policy before submitting.</p>
          <button
            onClick={() => navigate('/dashboard/rent/maintenance/policy')}
            className="text-[var(--accent-color,#9F7539)] font-semibold maintenance-policy-link"
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

        <div className="flex justify-end">
          <button
            disabled={!isFormValid}
            onClick={handleSubmit}
            className={`px-4 py-2 rounded-full text-sm font-semibold text-white shadow-sm bg-gradient-to-r from-[var(--primary-color,#0e1f42)] to-[#1a2d5f] hover:from-[#1a2d5f] hover:to-[var(--primary-color,#0e1f42)] transition-colors ${!isFormValid ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );

  const renderActive = () => (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-4 shadow-sm">
      {activeTickets.length === 0 ? (
        <p className="text-sm text-[#6c757d]">No active requests.</p>
      ) : (
        activeTickets.map((t) => <TicketCard key={t.ticketId} ticket={t} onView={(tk) => navigate(`/dashboard/rent/maintenance/${tk.ticketId}`)} />)
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-4 shadow-sm">
      {historyTickets.length === 0 ? (
        <p className="text-sm text-[#6c757d]">No history yet.</p>
      ) : (
        historyTickets.map((t) => <TicketCard key={t.ticketId} ticket={t} onView={(tk) => navigate(`/dashboard/rent/maintenance/${tk.ticketId}`)} />)
      )}
    </div>
  );

  const renderTracking = () => (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-4 shadow-sm">
      {!trackingTicket ? (
        <p className="text-sm text-[#6c757d]">Select a request to track.</p>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#6c757d]">{trackingTicket.propertyName}</p>
              <h3 className="text-lg font-semibold text-[#0e1f42]">{trackingTicket.title}</h3>
              <p className="text-sm text-[#475467]">{trackingTicket.description}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold maintenance-status bg-[#fff7ed] text-[var(--accent-color,#9F7539)] border border-[var(--accent-color,#9F7539)]">
              {trackingTicket.status.replace('_', ' ')}
            </span>
          </div>
          <div className="space-y-2 text-sm text-[#475467]">
            {(trackingTicket.updates || []).map((u, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--accent-color,#9F7539)] mt-1"></div>
                <div>
                  <p className="font-semibold text-[#0e1f42]">{u.status.replace('_', ' ')}</p>
                  <p>{u.note}</p>
                  <p className="text-xs text-[#6c757d]">{u.at}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="rent-overview-container bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-md border border-[#e2e8f0] p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0e1f42]">Maintenance</h1>
          <p className="text-sm text-[#64748b]">Submit and track maintenance requests for your properties.</p>
        </div>

        {renderTabs()}

        {activeTab === 'new' && renderNewRequest()}
        {activeTab === 'active' && renderActive()}
        {activeTab === 'tracking' && renderTracking()}
        {activeTab === 'history' && renderHistory()}
      </div>

      {successOpen && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center relative">
            <button onClick={() => setSuccessOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
              <i className="fas fa-times"></i>
            </button>
            <i className="fas fa-check-circle text-4xl text-[#0e1f42]"></i>
            <h3 className="text-xl font-semibold text-[#0e1f42] mt-2">Request submitted</h3>
            <p className="text-sm text-[#475467] mt-1">We’ll review and update you shortly.</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setSuccessOpen(false)}
                className="px-4 py-2 rounded-full text-sm font-semibold text-white shadow-sm bg-gradient-to-r from-[var(--primary-color,#0e1f42)] to-[#1a2d5f] hover:from-[#1a2d5f] hover:to-[var(--primary-color,#0e1f42)] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
