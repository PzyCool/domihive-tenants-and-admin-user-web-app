import React from 'react';

const RED_TOKENS = [
  'REJECTED',
  'CANCELLED',
  'NO_SHOW',
  'FAILED',
  'DENIED',
  'ENDED',
  'PENDING_MOVE_IN',
  'MOVE_IN_PENDING',
  'PENDING MOVE IN',
  'PENDING MOVE-IN'
];
const YELLOW_TOKENS = [
  'PENDING',
  'UNDER_REVIEW',
  'AWAITING',
  'SCHEDULED',
  'IN_PROGRESS'
];
const GREEN_TOKENS = [
  'ACTIVE',
  'APPROVED',
  'SUBMITTED',
  'OPEN',
  'COMPLETED',
  'VERIFIED',
  'PAID',
  'RESOLVED'
];

const normalizeStatus = (status) => String(status || '').toUpperCase();
const isPendingMoveInStatus = (status) => {
  const normalized = normalizeStatus(status);
  return (
    normalized.includes('PENDING_MOVE_IN') ||
    normalized.includes('MOVE_IN_PENDING') ||
    normalized.includes('PENDING MOVE IN') ||
    normalized.includes('PENDING MOVE-IN')
  );
};

const isActiveStatus = (status) => {
  const normalized = normalizeStatus(status);
  return normalized === 'ACTIVE' || normalized.includes(' ACTIVE');
};

const resolveTone = (status, tone) => {
  if (tone) return tone;
  const normalized = normalizeStatus(status);
  if (RED_TOKENS.some((token) => normalized.includes(token))) return 'danger';
  if (YELLOW_TOKENS.some((token) => normalized.includes(token))) return 'warning';
  if (GREEN_TOKENS.some((token) => normalized.includes(token))) return 'success';
  return 'warning';
};

const formatLabel = (label, status) => {
  if (label) return label;
  const normalized = normalizeStatus(status);
  if (!normalized) return 'Pending';
  return normalized
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const StatusBadge = ({ status, label, tone, className = '' }) => {
  if (isPendingMoveInStatus(status)) {
    return (
      <span
        className={`bg-red-100 text-red-700 border border-red-200 property-status property-status--pending-move-in inline-flex items-center justify-center rounded-full whitespace-nowrap font-semibold px-4 py-1 text-sm ${className}`.trim()}
        title={formatLabel(label, status)}
      >
        {formatLabel(label, status)}
      </span>
    );
  }

  if (isActiveStatus(status)) {
    return (
      <span
        className={`bg-emerald-100 text-emerald-800 border border-emerald-200 property-status property-status--active inline-flex items-center justify-center rounded-full whitespace-nowrap font-semibold px-4 py-1 text-sm ${className}`.trim()}
        title={formatLabel(label, status)}
      >
        {formatLabel(label, status)}
      </span>
    );
  }

  const resolvedTone = resolveTone(status, tone);
  const toneClass =
    resolvedTone === 'success'
      ? 'tenant-status-badge--success'
      : resolvedTone === 'danger'
        ? 'tenant-status-badge--danger'
        : 'tenant-status-badge--warning';

  return (
    <span
      className={`tenant-status-badge ${toneClass} ${className}`.trim()}
      title={formatLabel(label, status)}
    >
      {formatLabel(label, status)}
    </span>
  );
};

export default StatusBadge;
