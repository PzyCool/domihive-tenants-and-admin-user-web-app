import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headset, LifeBuoy, MessageCircle } from 'lucide-react';
import UnifiedPanelPage, { UnifiedPanelSection } from '../../../shared/layout/UnifiedPanelPage';
import TenantUnitCard from '../components/common/TenantUnitCard';
import { useProperties } from '../contexts/PropertiesContext';
import { useMessages } from '../contexts/MessagesContext';
import { useUnitCardView } from '../contexts/UnitCardViewContext';
import StatusBadge from '../components/common/StatusBadge';
import {
  TenantPageEmptyState,
  TenantPageFilterBar,
  TenantPageResultsCount,
  TenantPageSearchInput,
  TenantPageSelect
} from '../components/common/TenantPageControls';
import TenantCardActionButton from '../components/common/TenantCardActionButton';
import { getTenancyStatusLabel } from '../components/common/tenancyStatus';

const MessagesPage = () => {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const { threads } = useMessages();
  const { viewType, isGrid } = useUnitCardView();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const visibleProperties = useMemo(() => {
    let list = [...properties];

    if (statusFilter === 'active') list = list.filter((p) => p.tenancyStatus === 'ACTIVE');
    if (statusFilter === 'pending') list = list.filter((p) => p.tenancyStatus === 'PENDING_MOVE_IN');
    if (statusFilter === 'ended') list = list.filter((p) => p.tenancyStatus === 'ENDED');

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        `${p.name || ''} ${p.location || ''} ${p.description || ''} ${p.unitCode || ''}`
          .toLowerCase()
          .includes(q)
      );
    }

    return list;
  }, [properties, search, statusFilter]);

  const stats = useMemo(() => {
    const open = threads.filter((t) => String(t.status || '').toUpperCase() === 'OPEN').length;
    const resolved = threads.filter((t) => String(t.status || '').toUpperCase() === 'RESOLVED').length;
    return {
      totalThreads: threads.length,
      open,
      resolved
    };
  }, [threads]);

  return (
    <UnifiedPanelPage
      title="Messages"
      subtitle="Simple support inbox."
      stats={[
        {
          label: 'Total Messages',
          value: stats.totalThreads,
          meta: `${stats.totalThreads} threads`,
          icon: <MessageCircle size={20} />,
          iconClass: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
        },
        {
          label: 'Open',
          value: stats.open,
          meta: `${stats.open} open`,
          icon: <LifeBuoy size={20} />,
          iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
        },
        {
          label: 'Resolved',
          value: stats.resolved,
          meta: `${stats.resolved} resolved`,
          icon: <Headset size={20} />,
          iconClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
        }
      ]}
      filterBar={(
        <TenantPageFilterBar
          left={(
            <TenantPageSearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search property, location, unit..."
            />
          )}
          right={(
            <>
              <TenantPageSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                minWidth={165}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending Move-in</option>
                <option value="ended">Ended</option>
              </TenantPageSelect>
              <TenantPageResultsCount value={visibleProperties.length} />
            </>
          )}
        />
      )}
    >
      <UnifiedPanelSection unstyled className="pt-1">
        <div className={isGrid ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-4'}>
          {visibleProperties.length === 0 ? (
            <TenantPageEmptyState title="No unit matched your filter." />
          ) : (
            visibleProperties.map((property) => {
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
                  badge={<StatusBadge status={property.tenancyStatus} label={getTenancyStatusLabel(property.tenancyStatus, 'Ended')} />}
                  actions={(
                    <TenantCardActionButton
                      label="Chat with Customer Service"
                      onClick={() => navigate(`/dashboard/rent/messages/new?propertyId=${property.propertyId}&team=customer-service`)}
                      disabled={isMoveInPending}
                      helperText="Complete move-in checklist first"
                    />
                  )}
                />
              );
            })
          )}
        </div>
      </UnifiedPanelSection>
    </UnifiedPanelPage>
  );
};

export default MessagesPage;

