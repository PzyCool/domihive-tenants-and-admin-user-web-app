import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../contexts/PropertiesContext';
import PropertyCard from '../components/properties/PropertyCard';
import UnifiedPanelPage, { UnifiedPanelSection } from '../../../shared/layout/UnifiedPanelPage';
import { Building2, Clock3, Wallet } from 'lucide-react';

const MyProperties = () => {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const [statusFilter, setStatusFilter] = React.useState('active');
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
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted,#64748b)] text-sm"></i>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search property, unit, location..."
              className="w-full pl-9 pr-3 py-2.5 rounded-md border border-[var(--border-color,#e2e8f0)] bg-transparent text-sm text-[var(--text-color,#0e1f42)]"
            />
          </div>
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 px-3 rounded-md border border-[var(--border-color,#e2e8f0)] bg-transparent text-sm text-[var(--text-color,#0e1f42)] min-w-[155px]"
            >
              <option value="active">Currently Active</option>
              <option value="pending">Pending Move-in</option>
              <option value="ended">Ended</option>
            </select>
            <select
              value={leaseFilter}
              onChange={(e) => setLeaseFilter(e.target.value)}
              className="h-11 px-3 rounded-md border border-[var(--border-color,#e2e8f0)] bg-transparent text-sm text-[var(--text-color,#0e1f42)] min-w-[185px]"
            >
              <option value="all">All Lease Window</option>
              <option value="endingSoon">Ending Soon (60 days)</option>
            </select>
            <div className="h-11 inline-flex items-center text-sm text-[var(--text-muted,#64748b)] whitespace-nowrap">
              Showing <span className="font-semibold text-[var(--text-color,#0e1f42)]">{visibleProperties.length}</span> properties
            </div>
          </div>
        </div>
      }
    >
      <UnifiedPanelSection>
        <div className="grid gap-4">
          {visibleProperties.length === 0 ? (
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 text-center">
              <p className="text-base font-semibold text-[#0e1f42]">No active tenancy yet</p>
              <p className="text-sm text-[#64748b] mt-1">
                Complete inspection, submit application, and wait for approval to see your property here.
              </p>
            </div>
          ) : (
            visibleProperties.map((property) => (
              <PropertyCard key={property.propertyId} property={property} onAction={handleAction} />
            ))
          )}
        </div>
      </UnifiedPanelSection>
    </UnifiedPanelPage>
  );
};

export default MyProperties;
