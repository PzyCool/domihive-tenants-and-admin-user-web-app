import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ClipboardList, Search, Wrench } from 'lucide-react';
import UnifiedPanelPage, { UnifiedPanelSection } from '../../../shared/layout/UnifiedPanelPage';
import { useMaintenance } from '../contexts/MaintenanceContext';
import { useProperties } from '../contexts/PropertiesContext';

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return `₦${amount.toLocaleString()}/year`;
};

const formatMoneyWords = (value) => {
  const amount = Number(value || 0);
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)} million naira yearly`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)} thousand naira yearly`;
  return `${amount.toLocaleString('en-NG')} naira yearly`;
};

const formatSize = (size) => {
  const raw = String(size ?? '').trim();
  if (!raw) return '--';
  const normalized = raw.toLowerCase();
  if (normalized.includes('sqm') || normalized.includes('sq m') || normalized.includes('m2')) return raw;
  return `${raw} sqm`;
};

const tenancyBadge = (status) => {
  if (status === 'ACTIVE') return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  if (status === 'PENDING_MOVE_IN') return 'bg-red-100 text-red-700 border border-red-200';
  return 'bg-gray-100 text-gray-700 border border-gray-200';
};

const MaintenancePage = () => {
  const navigate = useNavigate();
  const { tickets } = useMaintenance();
  const { properties } = useProperties();

  const [propertySearch, setPropertySearch] = useState('');
  const [tenancyFilter, setTenancyFilter] = useState('all');

  const filteredProperties = useMemo(() => {
    let list = [...properties];
    if (tenancyFilter === 'active') list = list.filter((p) => p.tenancyStatus === 'ACTIVE');
    if (tenancyFilter === 'pending') list = list.filter((p) => p.tenancyStatus === 'PENDING_MOVE_IN');
    if (tenancyFilter === 'ended') list = list.filter((p) => p.tenancyStatus === 'ENDED');
    if (propertySearch.trim()) {
      const q = propertySearch.toLowerCase();
      list = list.filter((p) =>
        `${p.name || ''} ${p.location || ''} ${p.description || ''} ${p.unitCode || ''}`
          .toLowerCase()
          .includes(q)
      );
    }
    return list;
  }, [properties, tenancyFilter, propertySearch]);

  const stats = useMemo(() => {
    const activeTickets = tickets.filter(
      (t) => !['COMPLETED', 'CANCELLED'].includes(String(t.status || '').toUpperCase())
    );
    const emergencies = activeTickets.filter((t) =>
      String(t.urgency || '').toLowerCase().includes('emergency')
    ).length;

    return {
      propertiesCount: properties.length,
      openRequests: activeTickets.length,
      emergencyCount: emergencies
    };
  }, [properties.length, tickets]);

  return (
    <UnifiedPanelPage
      title="Maintenance"
      subtitle="Raise and track maintenance requests for your units."
      stats={[
        {
          label: 'Managed Units',
          value: stats.propertiesCount,
          meta: `${stats.propertiesCount} available`,
          icon: <ClipboardList size={20} />,
          iconClass: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
        },
        {
          label: 'Open Requests',
          value: stats.openRequests,
          meta: `${stats.openRequests} ongoing`,
          icon: <Wrench size={20} />,
          iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
        },
        {
          label: 'Emergency',
          value: stats.emergencyCount,
          meta: `${stats.emergencyCount} urgent`,
          icon: <AlertTriangle size={20} />,
          iconClass: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
        }
      ]}
      filterBar={
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted,#64748b)]" size={16} />
            <input
              value={propertySearch}
              onChange={(e) => setPropertySearch(e.target.value)}
              placeholder="Search property, location, description..."
              className="w-full pl-9 pr-3 py-2.5 rounded-md border text-sm"
              style={{
                borderColor: 'var(--border-color,#e2e8f0)',
                color: 'var(--text-color,#0e1f42)',
                backgroundColor: 'transparent'
              }}
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
            <select
              value={tenancyFilter}
              onChange={(e) => setTenancyFilter(e.target.value)}
              className="h-11 px-3 rounded-md border text-sm min-w-[165px]"
              style={{
                borderColor: 'var(--border-color,#e2e8f0)',
                color: 'var(--text-color,#0e1f42)',
                backgroundColor: 'transparent'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending Move-in</option>
              <option value="ended">Ended</option>
            </select>
            <div className="h-11 inline-flex items-center text-sm text-[var(--text-muted,#64748b)]">
              Showing <span className="ml-1 font-semibold text-[var(--text-color,#0e1f42)]">{filteredProperties.length}</span>
            </div>
          </div>
        </div>
      }
    >
      <UnifiedPanelSection className="space-y-4">
        {filteredProperties.length === 0 ? (
          <div className="rounded-xl border px-4 py-5 text-sm" style={{ borderColor: 'var(--border-color,#e2e8f0)' }}>
            <p className="font-semibold text-[var(--text-color,#0e1f42)]">No unit matched your filter.</p>
          </div>
        ) : (
          filteredProperties.map((property) => {
            const price = Number(property.rentAmount || property.price || property.nextPayment?.amount || 0);
            return (
              <div
                key={property.propertyId}
                className="rounded-xl border p-3 md:p-4"
                style={{ borderColor: 'var(--border-color,#e2e8f0)', backgroundColor: 'var(--card-bg,#fff)' }}
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden border border-[var(--border-color,#e2e8f0)]">
                    <img
                      src={property.image || 'https://via.placeholder.com/240x180?text=DomiHive'}
                      alt={property.name || 'Property'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xl font-bold text-[var(--accent-color,#9F7539)]">{formatMoney(price)}</div>
                        <div className="text-xs text-[var(--text-muted,#64748b)]">{formatMoneyWords(price)}</div>
                        <h3 className="mt-1 text-2xl font-semibold leading-tight text-[var(--text-color,#0e1f42)]">
                          {property.name || 'Property'}
                        </h3>
                        <div className="mt-1 inline-flex items-center gap-2 text-[var(--text-muted,#64748b)] text-sm">
                          <i className="fas fa-map-marker-alt text-[var(--accent-color,#9F7539)]"></i>
                          {property.location || 'Location not available'}
                        </div>
                      </div>
                      <span className={`px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${tenancyBadge(property.tenancyStatus)}`}>
                        {property.tenancyStatus === 'ACTIVE'
                          ? 'Active'
                          : property.tenancyStatus === 'PENDING_MOVE_IN'
                            ? 'Pending Move-in'
                            : 'Ended'}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[var(--text-color,#0e1f42)]">
                      <span className="inline-flex items-center gap-2">
                        <i className="fas fa-bed text-[var(--accent-color,#9F7539)]"></i>
                        {Number(property.bedrooms || 0)} bed
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <i className="fas fa-bath text-[var(--accent-color,#9F7539)]"></i>
                        {Number(property.bathrooms || 0)} bath
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <i className="fas fa-ruler-combined text-[var(--accent-color,#9F7539)]"></i>
                        {formatSize(property.size)}
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <i className="fas fa-align-left text-[var(--accent-color,#9F7539)]"></i>
                        <span className="font-semibold text-[var(--text-color,#0e1f42)]">About this property:</span>
                      </div>
                      <p className="text-[var(--text-color,#334155)] leading-snug text-sm line-clamp-2">
                        {property.description || 'No unit description available yet.'}
                      </p>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() =>
                          navigate('/dashboard/rent/maintenance/request', {
                            state: { propertyId: property.propertyId }
                          })
                        }
                        className="rounded-full bg-[#102a62] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#17377a]"
                      >
                        Request Maintenance
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </UnifiedPanelSection>
    </UnifiedPanelPage>
  );
};

export default MaintenancePage;
