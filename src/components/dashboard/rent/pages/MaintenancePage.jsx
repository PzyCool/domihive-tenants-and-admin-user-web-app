import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ClipboardList, Search, Wrench } from 'lucide-react';
import UnifiedPanelPage, { UnifiedPanelSection } from '../../../shared/layout/UnifiedPanelPage';
import { useMaintenance } from '../contexts/MaintenanceContext';
import { useProperties } from '../contexts/PropertiesContext';
import TenantUnitCard from '../components/common/TenantUnitCard';
import StatusBadge from '../components/common/StatusBadge';
import { useUnitCardView } from '../contexts/UnitCardViewContext';
import {
  TenantPageEmptyState,
  TenantPageFilterBar,
  TenantPageResultsCount,
  TenantPageSearchInput,
  TenantPageSelect
} from '../components/common/TenantPageControls';
import TenantCardActionButton from '../components/common/TenantCardActionButton';
import { getTenancyStatusLabel } from '../components/common/tenancyStatus';

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
        <TenantPageFilterBar
          left={(
            <TenantPageSearchInput
              value={propertySearch}
              onChange={(e) => setPropertySearch(e.target.value)}
              placeholder="Search property, location, description..."
            />
          )}
          right={(
            <>
              <TenantPageSelect
                value={tenancyFilter}
                onChange={(e) => setTenancyFilter(e.target.value)}
                minWidth={165}
              >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending Move-in</option>
              <option value="ended">Ended</option>
              </TenantPageSelect>
              <TenantPageResultsCount value={filteredProperties.length} />
            </>
          )}
        />
      }
    >
      <UnifiedPanelSection unstyled className="pt-1">
        <div className={isGrid ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-4'}>
          {filteredProperties.length === 0 ? (
            <TenantPageEmptyState title="No unit matched your filter." />
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
                      label={getTenancyStatusLabel(property.tenancyStatus, 'Ended')}
                    />
                  }
                  actions={
                    <TenantCardActionButton
                      label="Request Maintenance"
                      onClick={() =>
                        navigate('/dashboard/rent/maintenance/request', {
                          state: { propertyId: property.propertyId }
                        })
                      }
                      disabled={isMoveInPending}
                      helperText="Complete move-in checklist first"
                    />
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
