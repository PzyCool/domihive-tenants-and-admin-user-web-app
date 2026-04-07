import React from 'react';
import TenantUnitCard from '../common/TenantUnitCard';

const statusStyles = {
  PENDING_MOVE_IN: 'bg-red-100 text-red-700 border border-red-200 property-status',
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
  const statusClass = statusStyles[property.tenancyStatus] || statusStyles.PENDING_MOVE_IN;
  const pendingStatusClass =
    property.tenancyStatus === 'PENDING_MOVE_IN' ? ' property-status--pending-move-in' : '';
  const activeStatusClass = property.tenancyStatus === 'ACTIVE' ? ' property-status--active' : '';

  const displayPrice = Number(property.rentAmount || property.price || property.nextPayment?.amount || 0);
  const bedrooms = Number(property.bedrooms || property.property?.bedrooms || 0);
  const bathrooms = Number(property.bathrooms || property.property?.bathrooms || 0);
  const size = property.size || property.property?.size || '';
  const description =
    property.description ||
    property.property?.description ||
    'No unit description available yet.';
  const nextPaymentText = property.nextPayment?.status
    ? `${property.nextPayment?.dueDate || 'N/A'} • ${property.nextPayment.status}`
    : property.nextPayment?.dueDate || 'N/A';
  const leaseText = `${property.leaseStart || 'N/A'} - ${property.leaseEnd || 'N/A'}`;

  return (
    <TenantUnitCard
      className="application-card property-card w-full shadow-md overflow-hidden transition-all duration-300"
      image={property.image || property.property?.image}
      imageAlt={property.name}
      price={displayPrice}
      title={property.name}
      location={property.location}
      bedrooms={bedrooms}
      bathrooms={bathrooms}
      size={size}
      extraMetrics={
        <>
          <span className="inline-flex items-center gap-2">
            <i className="fas fa-calendar-alt text-[var(--accent-color,#9F7539)]"></i>
            Lease: {leaseText}
          </span>
          <span className="inline-flex items-center gap-2">
            <i className="fas fa-wallet text-[var(--accent-color,#9F7539)]"></i>
            Next Payment: {nextPaymentText}
          </span>
        </>
      }
      description={description}
      badge={
        <span
          className={`px-4 py-1 text-sm rounded-full font-semibold whitespace-nowrap text-center ${statusClass}${pendingStatusClass}${activeStatusClass}`}
        >
          {statusLabel[property.tenancyStatus] || property.tenancyStatus}
        </span>
      }
      actions={
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.action}
              onClick={() => onAction(property, action.action)}
              className="rounded-full bg-[#102a62] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#17377a]"
            >
              {action.label}
            </button>
          ))}
        </div>
      }
    />
  );
};

export default PropertyCard;
