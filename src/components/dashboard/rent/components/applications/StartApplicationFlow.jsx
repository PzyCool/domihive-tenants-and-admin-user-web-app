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

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || user.name || '',
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || ''
    }));
  }, [user]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProceed = () => {
    onSaveDraft?.(application.id, formData);
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

      <div className="space-y-7">
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
      </div>

      <div className="space-y-4 pt-4 border-t border-[#e2e8f0]">
        <div className="flex justify-end">
          <button
            onClick={handleProceed}
            className="px-6 py-3 rounded-2xl text-white font-semibold"
            style={{ backgroundColor: 'var(--accent-color, #0e1f42)' }}
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartApplicationFlow;
