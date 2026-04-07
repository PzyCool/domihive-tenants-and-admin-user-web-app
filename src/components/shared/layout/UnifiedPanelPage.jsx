import React from 'react';

export const UnifiedPanelSection = ({ children, className = '', unstyled = false }) => {
  if (unstyled) {
    return <div className={className}>{children}</div>;
  }
  return (
    <div
      className={`rounded-xl shadow-sm border p-4 md:p-6 ${className}`.trim()}
      style={{
        backgroundColor: 'var(--card-bg,#ffffff)',
        borderColor: 'var(--border-color,#e2e8f0)'
      }}
    >
      {children}
    </div>
  );
};

const UnifiedPanelPage = ({
  title,
  subtitle,
  actions = null,
  stats = [],
  filterBar = null,
  children,
  className = ''
}) => {
  return (
    <div
      className={`rent-overview-container bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 md:p-6 ${className}`.trim()}
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mt-1 leading-tight text-[var(--text-color,#0e1f42)]">{title}</h1>
            {subtitle ? <p className="text-sm text-[var(--text-muted,#64748b)]">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-3 text-sm">{actions}</div> : null}
        </div>

        {stats.length > 0 ? (
          <div className={`grid gap-3 md:gap-4 ${stats.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg p-4 shadow border flex items-center justify-between"
                  style={{
                    backgroundColor: 'var(--card-bg,#ffffff)',
                    borderColor: 'var(--border-color,#e2e8f0)'
                  }}
                >
                  <div>
                    <div className="text-base md:text-[1.05rem] leading-tight font-medium text-[var(--text-muted,#64748b)]">{stat.label}</div>
                    <div className="text-2xl font-bold text-[var(--text-color,#0e1f42)]">{stat.value}</div>
                    {stat.meta ? <div className="text-xs text-[var(--text-muted,#64748b)]">{stat.meta}</div> : null}
                  </div>
                  {stat.icon ? (
                    <div
                      className={`rounded-lg p-2 ${stat.iconClass || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
                    >
                      {stat.icon}
                    </div>
                  ) : null}
                </div>
              ))}
          </div>
        ) : null}

        {filterBar ? <UnifiedPanelSection>{filterBar}</UnifiedPanelSection> : null}

        {children}
      </div>
    </div>
  );
};

export default UnifiedPanelPage;
