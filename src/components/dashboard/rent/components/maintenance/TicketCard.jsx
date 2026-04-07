import React from 'react';

const statusClasses = {
  SUBMITTED: 'bg-gray-100 text-gray-800 border border-gray-200',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800 border border-blue-200',
  QUOTE_SHARED: 'bg-amber-100 text-amber-800 border border-amber-200',
  AWAITING_APPROVAL: 'bg-amber-100 text-amber-800 border border-amber-200',
  SCHEDULED: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  IN_PROGRESS: 'bg-sky-100 text-sky-800 border border-sky-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  CANCELLED: 'bg-gray-200 text-gray-600 border border-gray-300'
};

const TicketCard = ({ ticket, onView }) => {
  const statusClass = statusClasses[ticket.status] || statusClasses.SUBMITTED;
  const isEmergency = ticket.priority === 'Emergency';

  return (
    <div
      className="rounded-2xl shadow-sm border p-5 flex flex-col gap-3 maintenance-card"
      style={{ backgroundColor: 'var(--card-bg,#fff)', borderColor: 'var(--border-color,#e2e8f0)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--text-color,#0e1f42)]">{ticket.title}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold maintenance-status ${statusClass}`}>
              {ticket.status.replace('_', ' ')}
            </span>
            {isEmergency && (
              <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-red-100 text-red-700 border border-red-200 maintenance-emergency">
                Emergency
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted,#64748b)] line-clamp-2">{ticket.description}</p>
          <p className="text-xs text-[var(--text-muted,#64748b)]">{ticket.propertyName}</p>
        </div>
        <div className="text-right space-y-20">
          <span
            className="px-2 py-1 rounded-full text-[11px] font-semibold maintenance-responsibility border"
            style={{
              backgroundColor: 'var(--surface-2,#f8fafc)',
              borderColor: 'var(--border-color,#e2e8f0)',
              color: 'var(--text-color,#0e1f42)'
            }}
          >
            {ticket.responsibility === 'Landlord Wallet' ? 'Pending Assessment' : ticket.responsibility || 'Pending Assessment'}
          </span>
          <p className="text-[11px] text-[var(--text-muted,#64748b)] mt-8">Created: {ticket.createdAt}</p>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => onView(ticket)}
          className="px-4 py-2 rounded-full text-xs font-semibold text-white shadow-sm bg-gradient-to-r from-[var(--primary-color,#0e1f42)] to-[#1a2d5f] hover:from-[#1a2d5f] hover:to-[var(--primary-color,#0e1f42)] transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default TicketCard;
