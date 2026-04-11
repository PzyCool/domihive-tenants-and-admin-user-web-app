export const TENANCY_STATUS = {
  ACTIVE: 'ACTIVE',
  PENDING_MOVE_IN: 'PENDING_MOVE_IN',
  ENDED: 'ENDED'
};

export const TENANCY_STATUS_LABELS = {
  [TENANCY_STATUS.ACTIVE]: 'Active',
  [TENANCY_STATUS.PENDING_MOVE_IN]: 'Pending Move-in',
  [TENANCY_STATUS.ENDED]: 'Ended'
};

export const normalizeStatus = (status) => String(status || '').trim().toUpperCase();

export const isPendingMoveInStatus = (status) => {
  const normalized = normalizeStatus(status);
  return (
    normalized.includes('PENDING_MOVE_IN') ||
    normalized.includes('MOVE_IN_PENDING') ||
    normalized.includes('PENDING MOVE IN') ||
    normalized.includes('PENDING MOVE-IN')
  );
};

export const isActiveStatus = (status) => {
  const normalized = normalizeStatus(status);
  return normalized === TENANCY_STATUS.ACTIVE || normalized.includes(' ACTIVE');
};

export const isEndedStatus = (status) => normalizeStatus(status) === TENANCY_STATUS.ENDED;

export const getTenancyStatusLabel = (status, fallback = 'Unknown') =>
  TENANCY_STATUS_LABELS[normalizeStatus(status)] || fallback;

