import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../contexts/PropertiesContext';
import PropertyCard from '../components/properties/PropertyCard';
import UnifiedPanelPage, { UnifiedPanelSection } from '../../../shared/layout/UnifiedPanelPage';
import { Building2, Clock3, Wallet } from 'lucide-react';
import { useUnitCardView } from '../contexts/UnitCardViewContext';
import {
  TenantPageEmptyState,
  TenantPageFilterBar,
  TenantPageResultsCount,
  TenantPageSearchInput,
  TenantPageSelect
} from '../components/common/TenantPageControls';

const MyProperties = () => {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const { viewType, isGrid } = useUnitCardView();
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [leaseFilter, setLeaseFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');

  const visibleProperties = React.useMemo(() => {
    let list = [...properties];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        `${p.name || ''} ${p.location || ''} ${p.unitCode || ''} ${p.unitType || ''}`.toLowerCase().includes(q)
      );
    }

    list = list.filter((p) => {
      if (statusFilter === 'active') return p.tenancyStatus === 'ACTIVE';
      if (statusFilter === 'ended') return p.tenancyStatus === 'ENDED';
      if (statusFilter === 'pending') return p.tenancyStatus === 'PENDING_MOVE_IN';
      return true;
    });

    if (leaseFilter === 'endingSoon') {
      const now = new Date();
      list = list.filter((p) => {
        if (!p.leaseEnd) return false;
        const end = new Date(p.leaseEnd);
        if (Number.isNaN(end.getTime())) return false;
        const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return days >= 0 && days <= 60;
      });
    }

    return list;
  }, [properties, search, statusFilter, leaseFilter]);

  const stats = React.useMemo(() => {
    const visible = visibleProperties;
    const active = visible.filter((p) => p.tenancyStatus === 'ACTIVE').length;
    const pending = visible.filter((p) => p.tenancyStatus === 'PENDING_MOVE_IN').length;
    const upcomingPayments = visible.filter((p) => p.nextPayment).length;
    return { active, pending, upcomingPayments };
  }, [visibleProperties]);

  const handleAction = (property, action) => {
    const base = `/dashboard/rent/my-properties/${property.propertyId}`;
    switch (action) {
      case 'movein':
        navigate(base, { state: { focus: 'movein' } });
        break;
      case 'payments':
        navigate(`${base}/payments`);
        break;
      case 'lease-management':
        navigate(`${base}/lease-management`);
        break;
      case 'refund':
        navigate(base, { state: { focus: 'refund' } });
        break;
      default:
        navigate(base);
    }
  };

  return (
    <UnifiedPanelPage
      title="My Properties"
      subtitle="Manage active tenancies, payments, and move-in/out steps."
      stats={[
        {
          label: 'Active Properties',
          value: stats.active,
          meta: `${stats.active} active`,
          icon: <Building2 size={20} />,
          iconClass: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
        },
        {
          label: 'Pending Move-in',
          value: stats.pending,
          meta: `${stats.pending} pending`,
          icon: <Clock3 size={20} />,
          iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
        },
        {
          label: 'Upcoming Payments',
          value: stats.upcomingPayments,
          meta: `${stats.upcomingPayments} upcoming`,
          icon: <Wallet size={20} />,
          iconClass: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
        }
      ]}
      filterBar={
        <TenantPageFilterBar
          left={(
            <TenantPageSearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search property, unit, location..."
            />
          )}
          right={(
            <>
              <TenantPageSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                minWidth={155}
              >
              <option value="all">All Status</option>
              <option value="active">Currently Active</option>
              <option value="pending">Pending Move-in</option>
              <option value="ended">Ended</option>
              </TenantPageSelect>
              <TenantPageSelect
                value={leaseFilter}
                onChange={(e) => setLeaseFilter(e.target.value)}
                minWidth={185}
              >
              <option value="all">All Lease Window</option>
              <option value="endingSoon">Ending Soon (60 days)</option>
              </TenantPageSelect>
              <TenantPageResultsCount value={visibleProperties.length} label="properties" />
            </>
          )}
        />
      }
    >
      <UnifiedPanelSection unstyled className="pt-1">
        <div className={isGrid ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'grid gap-4'}>
          {visibleProperties.length === 0 ? (
            <TenantPageEmptyState
              className="rounded-2xl p-6 text-center"
              title="No active tenancy yet"
              description="Complete inspection, submit application, and wait for approval to see your property here."
            />
          ) : (
            visibleProperties.map((property) => (
              <PropertyCard
                key={property.propertyId}
                property={property}
                onAction={handleAction}
                viewType={viewType}
              />
            ))
          )}
        </div>
      </UnifiedPanelSection>
    </UnifiedPanelPage>
  );
};

export default MyProperties;
