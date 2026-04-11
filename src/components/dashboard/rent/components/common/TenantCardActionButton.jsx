import React from 'react';

const TenantCardActionButton = ({
  label,
  onClick,
  disabled = false,
  helperText = '',
  className = '',
  align = 'end'
}) => (
  <div className={`flex flex-col ${align === 'start' ? 'items-start' : 'items-end'} gap-1 ${className}`.trim()}>
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-full bg-[#102a62] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#17377a] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#102a62]"
    >
      {label}
    </button>
    {disabled && helperText ? (
      <p className="text-xs text-[var(--text-muted,#64748b)]">{helperText}</p>
    ) : null}
  </div>
);

export default TenantCardActionButton;

