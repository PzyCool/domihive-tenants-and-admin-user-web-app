import React from "react";

const NoShowOverlay = ({ application, onReschedule, onNotInterested }) => {
  return (
    <div className="absolute inset-0 z-20 flex items-end p-4 md:p-5">
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />
      <div className="relative w-full rounded-xl border border-red-200 dark:border-red-400/20 bg-white dark:bg-[#0b1220] shadow-xl p-4 md:p-5 transition-all duration-300">
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
          Hey {application?.applicantName || "there"},
        </p>
        <p className="text-sm mt-1 text-[var(--text-color,#334155)]">
          It was recorded that you did not show up for your inspection at {application?.property?.location} on{" "}
          {application?.inspectionDate}.
        </p>
        <p className="text-xs mt-2 text-[var(--text-muted,#64748b)]">
          Would you like to reschedule for this unit or end this request?
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={onReschedule}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--accent-color,#9f7539)] hover:brightness-110"
          >
            Reschedule Inspection
          </button>
          <button
            onClick={onNotInterested}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 dark:border-white/20 text-[var(--text-color,#0e1f42)] hover:bg-gray-100 dark:hover:bg-white/10"
          >
            Not Interested Anymore
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoShowOverlay;

