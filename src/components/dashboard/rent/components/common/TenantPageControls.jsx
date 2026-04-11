import React from 'react';
import { Search } from 'lucide-react';

export const TenantPageFilterBar = ({ left, right, className = '' }) => (
  <div className={`flex flex-col gap-3 md:flex-row md:items-center md:justify-between ${className}`.trim()}>
    {left}
    <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">{right}</div>
  </div>
);

export const TenantPageSearchInput = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  containerClassName = ''
}) => (
  <div className={`relative w-full md:max-w-md ${containerClassName}`.trim()}>
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted,#64748b)]" size={16} />
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full pl-9 pr-3 py-2.5 rounded-md border text-sm ${className}`.trim()}
      style={{
        borderColor: 'var(--border-color,#e2e8f0)',
        color: 'var(--text-color,#0e1f42)',
        backgroundColor: 'transparent'
      }}
    />
  </div>
);

export const TenantPageSelect = ({ value, onChange, children, className = '', minWidth = 165 }) => (
  <select
    value={value}
    onChange={onChange}
    className={`h-11 px-3 rounded-md border text-sm ${className}`.trim()}
    style={{
      minWidth,
      borderColor: 'var(--border-color,#e2e8f0)',
      color: 'var(--text-color,#0e1f42)',
      backgroundColor: 'transparent'
    }}
  >
    {children}
  </select>
);

export const TenantPageResultsCount = ({ value, label = 'items', className = '' }) => (
  <div className={`h-11 inline-flex items-center text-sm text-[var(--text-muted,#64748b)] ${className}`.trim()}>
    Showing <span className="ml-1 font-semibold text-[var(--text-color,#0e1f42)]">{value}</span> {label}
  </div>
);

export const TenantPageEmptyState = ({
  title = 'No result found',
  description = '',
  className = ''
}) => (
  <div
    className={`rounded-xl border px-4 py-5 text-sm ${className}`.trim()}
    style={{ borderColor: 'var(--border-color,#e2e8f0)' }}
  >
    <p className="font-semibold text-[var(--text-color,#0e1f42)]">{title}</p>
    {description ? <p className="mt-1 text-[var(--text-muted,#64748b)]">{description}</p> : null}
  </div>
);

