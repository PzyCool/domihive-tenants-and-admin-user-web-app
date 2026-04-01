import React from 'react';

const statusStyles = {
  PENDING_MOVE_IN: 'bg-amber-100 text-amber-800 border border-amber-200 property-status',
  ACTIVE: 'bg-emerald-100 text-emerald-800 border border-emerald-200 property-status',
  ENDED: 'bg-gray-100 text-gray-700 border border-gray-200 property-status'
};

const statusLabel = {
  PENDING_MOVE_IN: 'Pending Move-in',
  ACTIVE: 'Active',
  ENDED: 'Ended'
};

const quickActionsForStatus = (status) => {
  if (status === 'PENDING_MOVE_IN') {
    return [{ label: 'Complete Move-in Checklist', action: 'movein' }];
  }
  if (status === 'ACTIVE') {
    return [
      { label: 'Property Overview', action: 'details' },
      { label: 'Payment History', action: 'payments' },
      { label: 'Lease Management', action: 'lease-management' }
    ];
  }
  return [];
};

const PropertyCard = ({ property, onAction }) => {
  const actions = quickActionsForStatus(property.tenancyStatus);

  return (
    <div className="rounded-2xl border border-[#223255] bg-[#081736] p-4 md:p-6 shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
      <div className="rounded-2xl border border-[#223255] bg-[#0b1b3f] p-4 md:p-5">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <img
                src={property.image || property.property?.image || 'https://via.placeholder.com/140x100?text=DomiHive'}
                alt={property.name}
                className="h-28 w-52 rounded-2xl object-cover border border-[#2a3a60] flex-shrink-0"
              />
              <div>
                <h3 className="text-[2rem] font-semibold leading-tight text-[#f8fafc]">{property.name}</h3>
                <p className="mt-1 text-3xl font-bold leading-tight text-[#f8fafc]">{property.location}</p>
                <p className="mt-1 text-3xl font-semibold text-[#dbe4f7]">{property.unitType}</p>
              </div>
            </div>

            <span
              className={`inline-flex items-center rounded-full px-5 py-2 text-2xl font-semibold ${
                statusStyles[property.tenancyStatus] || statusStyles.PENDING_MOVE_IN
              }`}
            >
              {statusLabel[property.tenancyStatus] || property.tenancyStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <p className="text-xl text-[#dbe4f7]">Lease</p>
              <p className="text-2xl font-semibold text-[#f8fafc]">
                {property.leaseStart} - {property.leaseEnd}
              </p>
            </div>
            <div>
              <p className="text-xl text-[#dbe4f7]">Next Payment</p>
              <p className="text-2xl font-semibold text-[#f8fafc]">
                {property.nextPayment?.dueDate || 'N/A'}
                {property.nextPayment?.status ? ` • ${property.nextPayment.status}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {actions.map((action) => (
              <button
                key={action.action}
                onClick={() => onAction(property, action.action)}
                className="rounded-full bg-[#102a62] px-6 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#17377a]"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;

