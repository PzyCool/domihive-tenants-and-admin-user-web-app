import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../../context/AuthContext';

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  sex: '',
  occupants: '1',
  occupation: '',
  employed: 'yes',
  notes: '',
  emergencyName: '',
  emergencyPhone: '',
  emergencyRelationship: '',
  emergencyEmail: ''
};

const StartApplicationFlow = ({ application, onSaveDraft, onProceed, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [docs, setDocs] = useState({
    governmentIdFileName: '',
    proofOfIncomeFileName: '',
    additionalDocsFileName: ''
  });
  const [step, setStep] = useState(Number(application?.applicationStep || 1));

  useEffect(() => {
    const profile = application?.applicantProfile || {};
    setFormData({
      ...INITIAL_FORM,
      ...profile,
      fullName: profile.fullName || user?.name || '',
      email: profile.email || user?.email || '',
      phone: profile.phone || user?.phone || ''
    });
    setDocs({
      governmentIdFileName: application?.applicantDocs?.governmentIdFileName || '',
      proofOfIncomeFileName: application?.applicantDocs?.proofOfIncomeFileName || '',
      additionalDocsFileName: application?.applicantDocs?.additionalDocsFileName || ''
    });
    setStep(Number(application?.applicationStep || 1));
  }, [application?.id, user?.name, user?.email, user?.phone]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDocPick = (field, file) => {
    setDocs((prev) => ({ ...prev, [field]: file?.name || '' }));
  };

  const persistDraft = (nextStep = step) => {
    onSaveDraft?.(application.id, {
      formData,
      documents: docs,
      step: nextStep
    });
  };

  const canContinueFromStep1 =
    Boolean(formData.fullName?.trim()) &&
    Boolean(formData.email?.trim()) &&
    Boolean(formData.phone?.trim());

  const canContinueFromStep2 =
    Boolean(docs.governmentIdFileName) && Boolean(docs.proofOfIncomeFileName);

  const handleProceed = () => {
    persistDraft(3);
    setStep(3);
    onProceed?.(formData);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <i className="fas fa-times"></i>
        </button>
      )}

      <div className="mb-6 grid grid-cols-3 gap-2 text-xs">
        {[
          { id: 1, label: 'Form' },
          { id: 2, label: 'Documents' },
          { id: 3, label: 'Payment' }
        ].map((item) => (
          <div
            key={item.id}
            className={`rounded-xl border px-3 py-2 text-center font-semibold ${
              step >= item.id
                ? 'border-[var(--accent-color,#9f7539)] text-[var(--accent-color,#9f7539)] bg-[#fffaf0]'
                : 'border-[#e2e8f0] text-[#98a2b3]'
            }`}
          >
            Step {item.id}: {item.label}
          </div>
        ))}
      </div>

      <div className="space-y-7">
        {step === 1 && (
          <>
            <section className="space-y-4">
              <p className="text-sm font-semibold text-[#0e1f42] border-b border-[#f1f5f9] pb-3">Personal Information</p>
              <div className="grid md:grid-cols-3 gap-4">
                <label className="flex flex-col text-sm text-[#475467]">
                  Full Name
                  <input
                    value={formData.fullName}
                    onChange={(e) => handleFieldChange('fullName', e.target.value)}
                    className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0e1f42]/40"
                  />
                </label>
                <label className="flex flex-col text-sm text-[#475467]">
                  Email Address
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0e1f42]/40"
                  />
                </label>
                <label className="flex flex-col text-sm text-[#475467]">
                  Phone Number
                  <input
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="+234 000 000 0000"
                    className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0e1f42]/40"
                  />
                </label>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <label className="flex flex-col text-sm text-[#475467]">
                  Date of Birth
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                    className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0e1f42]/40"
                  />
                </label>
                <label className="flex flex-col text-sm text-[#475467]">
                  Sex
                  <select
                    value={formData.sex}
                    onChange={(e) => handleFieldChange('sex', e.target.value)}
                    className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0e1f42]/40"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label className="flex flex-col text-sm text-[#475467]">
                  Occupation
                  <input
                    value={formData.occupation}
                    onChange={(e) => handleFieldChange('occupation', e.target.value)}
                    className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0e1f42]/40"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex flex-col text-sm text-[#475467]">
                  Number of Occupants
                  <select
                    value={formData.occupants}
                    onChange={(e) => handleFieldChange('occupants', e.target.value)}
                    className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0e1f42]/40"
                  >
                    {[1, 2, 3, 4, 5, 6].map((count) => (
                      <option key={count} value={count}>
                        {count} occupant{count > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <p className="text-sm font-semibold text-[#0e1f42] border-b border-[#f1f5f9] pb-3">Emergency Contact</p>
              <div className="grid md:grid-cols-3 gap-4">
                <label className="flex flex-col text-sm text-[#475467]">
                  Full Name
                  <input
                    value={formData.emergencyName}
                    onChange={(e) => handleFieldChange('emergencyName', e.target.value)}
                    className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0e1f42]/40"
                  />
                </label>
                <label className="flex flex-col text-sm text-[#475467]">
                  Phone Number
                  <input
                    value={formData.emergencyPhone}
                    onChange={(e) => handleFieldChange('emergencyPhone', e.target.value)}
                    className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0e1f42]/40"
                  />
                </label>
                <label className="flex flex-col text-sm text-[#475467]">
                  Relationship
                  <input
                    value={formData.emergencyRelationship}
                    onChange={(e) => handleFieldChange('emergencyRelationship', e.target.value)}
                    className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0e1f42]/40"
                  />
                </label>
              </div>
              <label className="flex flex-col text-sm text-[#475467]">
                Email Address (Optional)
                <input
                  type="email"
                  value={formData.emergencyEmail}
                  onChange={(e) => handleFieldChange('emergencyEmail', e.target.value)}
                  className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0e1f42]/40"
                />
              </label>
              <label className="flex flex-col text-sm text-[#475467]">
                Additional notes
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  rows={4}
                  className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0e1f42]/40 min-h-[140px]"
                ></textarea>
              </label>
            </section>
          </>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <p className="text-sm font-semibold text-[#0e1f42] border-b border-[#f1f5f9] pb-3">
              Upload Required Documents
            </p>

            <div className="space-y-3">
              <label className="flex flex-col text-sm text-[#475467]">
                Government Issued ID *
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0e1f42]/40"
                  onChange={(event) =>
                    handleDocPick('governmentIdFileName', event.target.files?.[0] || null)
                  }
                />
                <span className="mt-1 text-xs text-[#667085]">
                  {docs.governmentIdFileName || 'No file selected'}
                </span>
              </label>

              <label className="flex flex-col text-sm text-[#475467]">
                Proof of Income *
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0e1f42]/40"
                  onChange={(event) =>
                    handleDocPick('proofOfIncomeFileName', event.target.files?.[0] || null)
                  }
                />
                <span className="mt-1 text-xs text-[#667085]">
                  {docs.proofOfIncomeFileName || 'No file selected'}
                </span>
              </label>

              <label className="flex flex-col text-sm text-[#475467]">
                Additional Documents (Optional)
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0e1f42]/40"
                  onChange={(event) =>
                    handleDocPick('additionalDocsFileName', event.target.files?.[0] || null)
                  }
                />
                <span className="mt-1 text-xs text-[#667085]">
                  {docs.additionalDocsFileName || 'No file selected'}
                </span>
              </label>
            </div>
          </section>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-[#e2e8f0]">
        {step === 1 && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                persistDraft(2);
                setStep(2);
              }}
              disabled={!canContinueFromStep1}
              className="px-6 py-3 rounded-2xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--accent-color, #0e1f42)' }}
            >
              Continue to Documents
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex justify-between">
            <button
              onClick={() => {
                persistDraft(1);
                setStep(1);
              }}
              className="px-6 py-3 rounded-2xl border border-[#d0d7df] text-[#344054] font-semibold"
            >
              Back to Form
            </button>
            <button
              onClick={handleProceed}
              disabled={!canContinueFromStep2}
              className="px-6 py-3 rounded-2xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--accent-color, #0e1f42)' }}
            >
              Continue to Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartApplicationFlow;
