import React from 'react';
import {
  formatNairaYear,
  formatPriceWordsYearly
} from '../../../../shared/utils/moneyFormat';

export const formatUnitPrice = (value) => formatNairaYear(value, { compact: true });

export const formatUnitPriceWords = (value) => formatPriceWordsYearly(value);

export const formatUnitSize = (size) => {
  const raw = String(size ?? '').trim();
  if (!raw) return '--';
  const normalized = raw.toLowerCase();
  if (normalized.includes('sqm') || normalized.includes('sq m') || normalized.includes('m2') || normalized.includes('m²')) {
    return raw;
  }
  return `${raw} sqm`;
};

const TenantUnitCard = ({
  className = '',
  contentClassName = '',
  image,
  imageAlt = 'Unit',
  price,
  topMeta = null,
  title,
  location,
  bedrooms = 0,
  bathrooms = 0,
  size,
  extraMetrics = null,
  description,
  badge = null,
  afterDescription = null,
  detailsRow = null,
  actions = null,
  overlay = null,
  footerPanel = null
}) => {
  return (
    <div
      className={`relative rounded-xl border p-3 md:p-4 ${className}`.trim()}
      style={{ borderColor: 'var(--border-color,#e2e8f0)', backgroundColor: 'var(--card-bg,#fff)' }}
    >
      <div className={`flex flex-col lg:flex-row gap-4 ${contentClassName}`.trim()}>
        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden border border-[var(--border-color,#e2e8f0)] bg-[var(--surface-2,#f1f5f9)]">
          <img
            src={image || 'https://via.placeholder.com/240x180?text=DomiHive'}
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xl font-bold text-[var(--accent-color,#9F7539)]">{formatUnitPrice(price)}</div>
              <div className="text-xs text-[var(--text-muted,#64748b)]">{formatUnitPriceWords(price)}</div>
              {topMeta ? <div className="text-sm text-[var(--text-muted,#64748b)] mt-0.5">{topMeta}</div> : null}
              <h3 className="mt-1 text-2xl font-semibold leading-tight text-[var(--text-color,#0e1f42)]">
                {title || 'Property'}
              </h3>
              {location ? (
                <div className="mt-1 inline-flex items-center gap-2 text-[var(--text-muted,#64748b)] text-sm">
                  <i className="fas fa-map-marker-alt text-[var(--accent-color,#9F7539)]"></i>
                  {location}
                </div>
              ) : null}
            </div>
            {badge}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[var(--text-color,#0e1f42)]">
            <span className="inline-flex items-center gap-2">
              <i className="fas fa-bed text-[var(--accent-color,#9F7539)]"></i>
              {Number(bedrooms || 0)} bed
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="fas fa-bath text-[var(--accent-color,#9F7539)]"></i>
              {Number(bathrooms || 0)} bath
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="fas fa-ruler-combined text-[var(--accent-color,#9F7539)]"></i>
              {formatUnitSize(size)}
            </span>
            {extraMetrics}
          </div>

          <div className="mt-2">
            <div className="flex items-center gap-2 mb-0.5">
              <i className="fas fa-align-left text-[var(--accent-color,#9F7539)]"></i>
              <span className="font-semibold text-[var(--text-color,#0e1f42)]">About this property:</span>
            </div>
            <p className="text-[var(--text-color,#334155)] leading-snug text-sm line-clamp-2">
              {description || 'No unit description available yet.'}
            </p>
          </div>

          {afterDescription ? <div className="mt-1">{afterDescription}</div> : null}
          {detailsRow ? <div className="mt-1">{detailsRow}</div> : null}
          {actions ? <div className="mt-3 flex justify-end">{actions}</div> : null}
        </div>
      </div>

      {overlay}
      {footerPanel}
    </div>
  );
};

export default TenantUnitCard;
