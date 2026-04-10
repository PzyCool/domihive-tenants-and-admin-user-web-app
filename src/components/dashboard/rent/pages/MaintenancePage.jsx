import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ClipboardList, Search, Wrench } from 'lucide-react';
import UnifiedPanelPage, { UnifiedPanelSection } from '../../../shared/layout/UnifiedPanelPage';
import { useMaintenance } from '../contexts/MaintenanceContext';
import { useProperties } from '../contexts/PropertiesContext';
import TenantUnitCard from '../components/common/TenantUnitCard';
import StatusBadge from '../components/common/StatusBadge';
import { useUnitCardView } from '../contexts/UnitCardViewContext';

const MaintenancePage = () => {
  const navigate = useNavigate();
  const { tickets } = useMaintenance();
  const { properties } = useProperties();
  const { viewType, isGrid } = useUnitCardView();

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
      <UnifiedPanelSection unstyled className="pt-1">
        <div className={isGrid ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-4'}>
          {filteredProperties.length === 0 ? (
            <div className="rounded-xl border px-4 py-5 text-sm" style={{ borderColor: 'var(--border-color,#e2e8f0)' }}>
              <p className="font-semibold text-[var(--text-color,#0e1f42)]">No unit matched your filter.</p>
            </div>
          ) : (
            filteredProperties.map((property) => {
              const price = Number(property.rentAmount || property.price || property.nextPayment?.amount || 0);
              const isMoveInPending = property.tenancyStatus === 'PENDING_MOVE_IN';
              return (
                <TenantUnitCard
                  key={property.propertyId}
                  viewType={viewType}
                  image={property.image}
                  imageAlt={property.name || 'Property'}
                  price={price}
                  title={property.name || 'Property'}
                  location={property.location || 'Location not available'}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  size={property.size}
                  description={property.description}
                  badge={
                    <StatusBadge
                      status={property.tenancyStatus}
                      label={
                        property.tenancyStatus === 'ACTIVE'
                          ? 'Active'
                          : property.tenancyStatus === 'PENDING_MOVE_IN'
                            ? 'Pending Move-in'
                            : 'Ended'
                      }
                    />
                  }
                  actions={
                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={() =>
                          navigate('/dashboard/rent/maintenance/request', {
                            state: { propertyId: property.propertyId }
                          })
                        }
                        disabled={isMoveInPending}
                        className="rounded-full bg-[#102a62] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#17377a] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#102a62]"
                      >
                        Request Maintenance
                      </button>
                      {isMoveInPending ? (
                        <p className="text-xs text-[var(--text-muted,#64748b)]">Complete move-in checklist first</p>
                      ) : null}
                    </div>
                  }
                />
              );
            })
          )}
        </div>
      </UnifiedPanelSection>
    </UnifiedPanelPage>
  );
};

export default MaintenancePage;
