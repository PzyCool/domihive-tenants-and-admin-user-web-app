import React from 'react';

const ContinueApplicationModal = ({ application, onContinue, onNotInterested, onClose }) => {
  if (!application) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <i className="fas fa-times"></i>
        </button>
        <h3 className="text-xl font-bold text-[#0e1f42] mb-3">Would you like to continue?</h3>
        <p className="text-[#475467] mb-5">
          Your inspection for {application.property.title} was successful. Choose what&apos;s next.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onContinue();
              onClose();
            }}
            className="w-full bg-gradient-to-r from-[#0e1f42] to-[#1a2d5f] text-white rounded-2xl py-3 font-semibold hover:from-[#1a2d5f] hover:to-[#0e1f42] transition-colors"
          >
            Continue with this property
          </button>
          <button
            onClick={onNotInterested}
            className="w-full border border-gray-200 text-[#0e1f42] rounded-2xl py-3 font-semibold hover:bg-gray-50 transition-colors"
          >
            Not interested anymore
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContinueApplicationModal;
