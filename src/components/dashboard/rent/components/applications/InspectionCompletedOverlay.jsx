import React, { useState } from 'react';

const InspectionCompletedOverlay = ({
  application,
  onContinueWithProperty,
  onNotInterested,
  onReschedule,
  onMissedCancel
}) => {
  const [step, setStep] = useState('attended');

  return (
    <div className="absolute inset-0 z-20 flex items-end p-4 md:p-5">
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />
      <div className="relative w-full rounded-xl border border-[var(--accent-color,#9f7539)]/35 bg-[var(--card-bg,#ffffff)] shadow-xl p-4 md:p-5 transition-all duration-300">
        {step === 'attended' && (
          <>
            <p className="text-sm font-semibold text-[var(--accent-color,#9f7539)]">Did you attend your inspection?</p>
            <p className="text-sm mt-1 text-[var(--text-color,#334155)]">
              Inspection for {application?.property?.title || 'this property'} was scheduled on{' '}
              {application?.inspectionDate || 'the selected date'}.
            </p>
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => setStep('continue')}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--accent-color,#9f7539)] hover:brightness-110"
              >
                Yes, I inspected
              </button>
              <button
                onClick={() => setStep('missed')}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-[var(--border-color,#d0d7df)] text-[var(--text-color,#334155)] hover:bg-[var(--surface-2,#f8fafc)]"
              >
                No, I missed it
              </button>
            </div>
          </>
        )}

        {step === 'continue' && (
          <>
            <p className="text-sm font-semibold text-[var(--accent-color,#9f7539)]">Would you like to continue?</p>
            <p className="text-sm mt-1 text-[var(--text-color,#334155)]">
              Your inspection for {application?.property?.title || 'this property'} was successful. Choose what&apos;s
              next.
            </p>
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button
                onClick={onContinueWithProperty}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--accent-color,#9f7539)] hover:brightness-110"
              >
                Continue with this property
              </button>
              <button
                onClick={onNotInterested}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50"
              >
                Not interested anymore
              </button>
            </div>
          </>
        )}

        {step === 'missed' && (
          <>
            <p className="text-sm font-semibold text-[var(--accent-color,#9f7539)]">Inspection Required</p>
            <p className="text-sm mt-1 text-[var(--text-color,#334155)]">
              Please complete your physical inspection before proceeding. Current schedule: {application?.inspectionDate || 'not set'}.
            </p>
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button
                onClick={onReschedule}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--accent-color,#9f7539)] hover:brightness-110"
              >
                Reschedule Inspection
              </button>
              <button
                onClick={onMissedCancel}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50"
              >
                Cancel Request
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InspectionCompletedOverlay;
