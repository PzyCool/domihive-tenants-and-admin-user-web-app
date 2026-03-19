import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useProperties } from '../contexts/PropertiesContext';

const formatNaira = (amt) => (amt || amt === 0 ? `₦${amt.toLocaleString()}` : '—');

const PropertyDashboard = () => {
  const { propertyId } = useParams();
  const location = useLocation();
  const focus = location.state?.focus;
  const navigate = useNavigate();
  const { properties, completeMoveInChecklist, updateRefundStatus } = useProperties();
  const property = useMemo(
    () => properties.find((p) => p.propertyId === propertyId),
    [properties, propertyId]
  );

  const [moveInForm, setMoveInForm] = useState(
    property?.moveInChecklist || {
      keysReceived: false,
      inventoryConfirmed: false,
      meterReading: '',
      moveInDateConfirmed: false,
      keyNumber: '',
      moveInDate: ''
    }
  );
  const [activeTab, setActiveTab] = useState('updates'); // updates | lease | reviews
  const [showAgreement, setShowAgreement] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', body: '', recommend: '', anonymous: false });
  const showMoveInOnly = focus === 'movein' && property.tenancyStatus === 'PENDING_MOVE_IN';

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[#64748b]">Property not found.</p>
      </div>
    );
  }

  const handleCompleteMoveIn = () => {
    completeMoveInChecklist(property.propertyId, {
      keysReceived: !!moveInForm.keysReceived,
      meterReading: moveInForm.keyNumber || moveInForm.meterReading || '000000',
      keyNumber: moveInForm.keyNumber || '',
      moveInDate: moveInForm.moveInDate || '',
      inventoryConfirmed: !!moveInForm.keyNumber,
      moveInDateConfirmed: !!moveInForm.moveInDate
    });
  };

  const statusLabel = property.tenancyStatus === 'PENDING_MOVE_IN'
    ? 'Pending Move-in'
    : property.tenancyStatus === 'ACTIVE'
    ? 'Active'
    : 'Ended';

  // If user came from "Complete Move-in Checklist", focus on the move-in section and scroll
  React.useEffect(() => {
    if (showMoveInOnly) {
      const el = document.getElementById('movein');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setActiveTab('updates');
    }
  }, [showMoveInOnly]);

  // Render only Move-in checklist when focused
  if (showMoveInOnly) {
    return (
      <div className="rent-overview-container bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 md:p-6">
        <div className="bg-white rounded-lg border border-[#e2e8f0] p-6 space-y-6 max-w-4xl mx-auto">
          <div className="space-y-4">
            <button
              onClick={() => navigate('/dashboard/rent/my-properties')}
              className="text-2xl font-medium leading-none"
              style={{ color: 'var(--accent-color, #9F7539)' }}
              aria-label="Back to My Properties"
            >
              <i className="fas fa-arrow-left-long text-xl"></i>
            </button>
            <div className="flex flex-wrap justify-between gap-3 items-start">
              <div>
                <h1 className="text-2xl font-semibold text-[#0e1f42]">{property.name}</h1>
                <p className="text-sm text-[#475467]">{property.location}</p>
                <p className="text-xs text-[#6c757d]">{property.unitType}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold property-status bg-[#e0f2fe] text-[#0e1f42] border border-[#cbd5e1]">
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-sm" id="movein">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#0e1f42]">Move-in Checklist</h3>
              <button
                onClick={handleCompleteMoveIn}
                className="px-4 py-2 rounded-lg text-white font-semibold"
                style={{ backgroundColor: 'var(--accent-color, #9F7539)' }}
              >
                Confirm Move-in
              </button>
            </div>
            <div className="space-y-3 text-sm text-[#475467]">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!moveInForm.keysReceived}
                  onChange={() => setMoveInForm((p) => ({ ...p, keysReceived: !p.keysReceived }))}
                />
                Have you collected the keys?
              </label>
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#0e1f42]">Please confirm your key number</p>
                <input
                  type="text"
                  value={moveInForm.keyNumber || ''}
                  onChange={(e) => setMoveInForm((p) => ({ ...p, keyNumber: e.target.value }))}
                  className="border border-[#e2e8f0] rounded-lg px-3 py-2 flex-1"
                  placeholder="Enter key number"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#0e1f42]">Move in date</p>
                <input
                  type="date"
                  value={moveInForm.moveInDate || ''}
                  onChange={(e) => setMoveInForm((p) => ({ ...p, moveInDate: e.target.value }))}
                  className="border border-[#e2e8f0] rounded-lg px-3 py-2 w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rent-overview-container bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 md:p-6">
      <div className="bg-white rounded-lg border border-[#e2e8f0] p-6 space-y-6 max-w-6xl mx-auto">
        <div className="space-y-4">
          <button
            onClick={() => navigate('/dashboard/rent/my-properties')}
            className="text-2xl font-medium leading-none"
            style={{ color: 'var(--accent-color, #9F7539)' }}
          >
            ←
          </button>
          <div className="flex flex-wrap justify-between gap-3 items-start">
            <div>
              <h1 className="text-2xl font-semibold text-[#0e1f42]">{property.name}</h1>
              <p className="text-sm text-[#475467]">{property.location}</p>
              <p className="text-xs text-[#6c757d]">{property.unitType}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold property-status bg-[#e0f2fe] text-[#0e1f42] border border-[#cbd5e1]">
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-semibold text-[#0e1f42] mb-3">Tenancy Details</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-[#475467]">
              <div>
                <p className="text-xs text-[#6c757d]">Lease Start</p>
                <p className="font-semibold text-[#0e1f42]">{property.leaseStart}</p>
              </div>
              <div>
                <p className="text-xs text-[#6c757d]">Lease End</p>
                <p className="font-semibold text-[#0e1f42]">{property.leaseEnd}</p>
              </div>
              <div>
                <p className="text-xs text-[#6c757d]">Rent Amount</p>
                <p className="font-semibold text-[#0e1f42]">{formatNaira(property.rentAmount)} • {property.paymentPlan}</p>
              </div>
              <div>
                <p className="text-xs text-[#6c757d]">Caution Deposit</p>
                <p className="font-semibold text-[#0e1f42]">{property.cautionDepositStatus}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-[#6c757d]">Included Bills</p>
                <p className="font-semibold text-[#0e1f42]">{property.includedBillsSummary || 'Not specified'}</p>
              </div>
            </div>
            {property.houseRules?.length ? (
              <div className="mt-4">
                <p className="text-xs text-[#6c757d]">House Rules</p>
                <ul className="list-disc list-inside text-sm text-[#475467] space-y-1 mt-1">
                  {property.houseRules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-[#0e1f42] mb-3">Upcoming Payment</h3>
            {property.nextPayment ? (
              <div className="space-y-2 text-sm text-[#475467]">
                <p className="font-semibold text-[#0e1f42]">{formatNaira(property.nextPayment.amount)}</p>
                <p>Due: {property.nextPayment.dueDate}</p>
                <p className="text-[#9f7539] font-semibold">{property.nextPayment.status}</p>
              </div>
            ) : (
              <p className="text-sm text-[#6c757d]">No upcoming payment.</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-sm">
          <div className="flex gap-2 flex-wrap mb-4">
            {[
              { id: 'updates', label: 'Updates' },
              { id: 'lease', label: 'Lease & Documents' },
              { id: 'reviews', label: 'Reviews' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors property-overview-tab ${
                  activeTab === tab.id ? 'active' : ''
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'updates' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] property-overview-updates">
                <p className="text-sm font-semibold text-[#0e1f42]">No new updates</p>
                <p className="text-xs text-[#6c757d]">We’ll post property announcements and service updates here.</p>
              </div>
            </div>
          )}

          {activeTab === 'lease' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#0e1f42]">Lease Documents</h3>
                <div className="flex items-center justify-between gap-3 border border-[#e2e8f0] rounded-2xl p-4 bg-[#f8fafc] property-overview-updates">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-[#9F7539] flex items-center justify-center text-white">
                      <i className="fas fa-file-signature"></i>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#0e1f42]">Tenant Agreement</p>
                      <p className="text-sm text-[#64748b]">Professional rental agreement with DomiHive</p>
                    </div>
                  </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAgreement(true)}
                        className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-white font-semibold"
                        style={{ backgroundColor: 'var(--primary-color,#0e1f42)' }}
                      >
                        View
                      </button>
                    <button
                      className="px-4 py-2 rounded-lg text-white font-semibold"
                      style={{ backgroundColor: 'var(--accent-color, #9F7539)' }}
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#0e1f42]">Lease Management</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/dashboard/rent/my-properties/${property.propertyId}/payments`)}
                    className="px-4 py-3 rounded-lg text-white font-semibold bg-emerald-600 hover:bg-emerald-700 transition-colors"
                  >
                    <i className="fas fa-sync-alt mr-2"></i> Renew Lease
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/rent/my-properties/${property.propertyId}/vacate`)}
                    className="px-4 py-3 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    <i className="fas fa-times-circle mr-2"></i> End Lease
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#0e1f42]">Rate & Review Property</h3>
              <p className="text-xs text-[#6c757d]">Share your experience to help future tenants.</p>
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 space-y-4 property-overview-updates">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#0e1f42]">Overall Rating *</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewForm((p) => ({ ...p, rating: star }))}
                        className={`text-xl ${reviewForm.rating >= star ? 'text-[#f59e0b]' : 'text-[#cbd5e1]'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex flex-col gap-1 text-sm text-[#475467]">
                  Review Title *
                  <input
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value }))}
                    className="border border-[#e2e8f0] rounded-lg px-3 py-2"
                    placeholder="Summarize your experience"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-[#475467]">
                  Your Review *
                  <textarea
                    value={reviewForm.body}
                    onChange={(e) => setReviewForm((p) => ({ ...p, body: e.target.value }))}
                    className="border border-[#e2e8f0] rounded-lg px-3 py-2"
                    rows={4}
                    placeholder="What did you like? What could be improved?"
                  />
                </label>
                <div className="text-sm text-[#475467] space-y-2">
                  <p className="font-semibold text-[#0e1f42]">Would you recommend this property?</p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="recommend"
                        checked={reviewForm.recommend === 'yes'}
                        onChange={() => setReviewForm((p) => ({ ...p, recommend: 'yes' }))}
                      />
                      Yes, I would recommend
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="recommend"
                        checked={reviewForm.recommend === 'no'}
                        onChange={() => setReviewForm((p) => ({ ...p, recommend: 'no' }))}
                      />
                      No, I would not recommend
                    </label>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-[#475467]">
                  <input
                    type="checkbox"
                    checked={reviewForm.anonymous}
                    onChange={() => setReviewForm((p) => ({ ...p, anonymous: !p.anonymous }))}
                  />
                  Post anonymously (your name will not be shown)
                </label>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setReviewForm({ rating: 0, title: '', body: '', recommend: '', anonymous: false })}
                    className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-[#475467] font-semibold"
                  >
                    Clear Form
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-white font-semibold"
                    style={{ backgroundColor: 'var(--accent-color, #9F7539)' }}
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {property.tenancyStatus === 'PENDING_MOVE_IN' && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-sm" id="movein">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#0e1f42]">Move-in Checklist</h3>
              <button
                onClick={handleCompleteMoveIn}
                className="px-4 py-2 rounded-lg text-white font-semibold"
                style={{ backgroundColor: 'var(--accent-color, #9F7539)' }}
              >
                Confirm Move-in
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-[#475467]">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!moveInForm.keysReceived}
                  onChange={() => setMoveInForm((p) => ({ ...p, keysReceived: !p.keysReceived }))}
                />
                Have you collected the keys?
              </label>
              <label className="flex items-center gap-2 sm:col-span-2">
                Please confirm your key number
                <input
                  value={moveInForm.keyNumber || ''}
                  onChange={(e) => setMoveInForm((p) => ({ ...p, keyNumber: e.target.value }))}
                  className="border border-[#e2e8f0] rounded-lg px-3 py-2 flex-1"
                  placeholder="Enter key number"
                />
              </label>
              <label className="flex items-center gap-2 sm:col-span-2">
                Move in date
                <input
                  type="date"
                  value={moveInForm.moveInDate || ''}
                  onChange={(e) => setMoveInForm((p) => ({ ...p, moveInDate: e.target.value }))}
                  className="border border-[#e2e8f0] rounded-lg px-3 py-2 flex-1"
                />
              </label>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PropertyDashboard;
