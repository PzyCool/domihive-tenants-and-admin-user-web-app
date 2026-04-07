import React from 'react';

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

const formatPrice = (price) => {
  const amount = Number(price) || 0;
  return `₦${amount.toLocaleString()}/year`;
};

const formatPriceWords = (price) => {
  const amount = Number(price) || 0;
  if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)} billion naira yearly`;
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)} million naira yearly`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)} thousand naira yearly`;
  return `${amount.toLocaleString('en-NG')} naira yearly`;
};

const formatSize = (size) => {
  const raw = String(size ?? '').trim();
  if (!raw) return '—';
  const normalized = raw.toLowerCase();
  if (normalized.includes('sqm') || normalized.includes('sq m') || normalized.includes('m²')) {
    return raw;
  }
  return `${raw} sqm`;
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

  return (
    <div className="application-card property-card relative w-full bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300">
      <div className="flex flex-col lg:flex-row">
        <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 m-2.5 md:m-3 rounded-lg overflow-hidden border border-[var(--border-color,#e2e8f0)] bg-[var(--surface-2,#f1f5f9)]">
          <img
            src={
              property.image ||
              property.property?.image ||
              'https://via.placeholder.com/140x100?text=DomiHive'
            }
            alt={property.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full min-w-0 p-2.5 md:pl-0 md:pr-3 md:py-3 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="property-price-main text-lg font-bold text-[#0e1f42] leading-tight">
                {formatPrice(displayPrice)}
              </div>
              <div className="text-[10px] mt-0.5 text-[var(--text-muted,#6c757d)]">
                {formatPriceWords(displayPrice)}
              </div>
              <h3 className="text-base font-semibold text-[var(--text-color,#0e1f42)] mt-1 leading-tight">
                {property.name}
              </h3>
              <div className="mt-0.5 text-[11px] text-[var(--text-muted,#6c757d)] inline-flex items-center gap-1.5">
                <i className="fas fa-map-marker-alt text-[var(--accent-color,#9f7539)] text-[11px]"></i>
                {property.location}
              </div>

              <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted,#6c757d)] mt-1">
                <span className="inline-flex items-center gap-1.5">
                  <i className="fas fa-bed text-[var(--accent-color,#9f7539)] text-[11px]"></i>
                  {bedrooms} bed
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="fas fa-bath text-[var(--accent-color,#9f7539)] text-[11px]"></i>
                  {bathrooms} bath
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="fas fa-ruler-combined text-[var(--accent-color,#9f7539)] text-[11px]"></i>
                  {formatSize(size)}
                </span>
              </div>

              <div className="mt-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <i className="fas fa-align-left text-[var(--accent-color,#9f7539)] text-[11px]"></i>
                  <span className="text-[11px] font-semibold text-[var(--text-color,#0e1f42)]">About this property:</span>
                </div>
                <p className="text-[10px] text-[var(--text-color,#334155)] leading-snug line-clamp-2">
                  {description}
                </p>
              </div>
            </div>

            <span
              className={`px-2.5 py-0.5 text-[10px] min-w-[130px] rounded-full font-semibold whitespace-nowrap text-center ${statusClass}${pendingStatusClass}${activeStatusClass}`}
            >
              {statusLabel[property.tenancyStatus] || property.tenancyStatus}
            </span>
          </div>

          <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
            <div>
              <p className="text-[var(--text-muted,#6c757d)]">Lease</p>
              <p className="font-semibold text-[var(--text-color,#0e1f42)]">
                {property.leaseStart} - {property.leaseEnd}
              </p>
            </div>
            <div>
              <p className="text-[var(--text-muted,#6c757d)]">Next Payment</p>
              <p className="font-semibold text-[var(--text-color,#0e1f42)]">{nextPaymentText}</p>
            </div>
          </div>

          <div className="mt-auto pt-1 flex flex-wrap gap-2">
            {actions.map((action) => (
              <button
                key={action.action}
                onClick={() => onAction(property, action.action)}
                className="rounded-full bg-[#102a62] px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#17377a]"
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
