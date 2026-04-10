import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headset, LifeBuoy, MessageCircle, Search } from 'lucide-react';
import UnifiedPanelPage, { UnifiedPanelSection } from '../../../shared/layout/UnifiedPanelPage';
import TenantUnitCard from '../components/common/TenantUnitCard';
import { useProperties } from '../contexts/PropertiesContext';
import { useMessages } from '../contexts/MessagesContext';

const tenancyBadge = (status) => {
  if (status === 'ACTIVE') {
    return 'bg-emerald-100 text-emerald-800 border border-emerald-200 property-status property-status--active';
  }
  if (status === 'PENDING_MOVE_IN') {
    return 'bg-red-100 text-red-700 border border-red-200 property-status property-status--pending-move-in';
  }
  return 'bg-gray-100 text-gray-700 border border-gray-200 property-status';
};

const MessagesPage = () => {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const { threads } = useMessages();

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
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted,#64748b)]" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search property, location, unit..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              Showing <span className="ml-1 font-semibold text-[var(--text-color,#0e1f42)]">{visibleProperties.length}</span>
            </div>
          </div>
        </div>
      )}
    >
      <UnifiedPanelSection unstyled className="pt-1">
        <div className="space-y-4">
          {visibleProperties.length === 0 ? (
            <div className="rounded-xl border px-4 py-5 text-sm" style={{ borderColor: 'var(--border-color,#e2e8f0)' }}>
              <p className="font-semibold text-[var(--text-color,#0e1f42)]">No unit matched your filter.</p>
            </div>
          ) : (
            visibleProperties.map((property) => {
              const price = Number(property.rentAmount || property.price || property.nextPayment?.amount || 0);
              return (
                <TenantUnitCard
                  key={property.propertyId}
                  image={property.image}
                  imageAlt={property.name || 'Property'}
                  price={price}
                  title={property.name || 'Property'}
                  location={property.location || 'Location not available'}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  size={property.size}
                  description={property.description}
                  badge={(
                    <span className={`px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${tenancyBadge(property.tenancyStatus)}`}>
                      {property.tenancyStatus === 'ACTIVE'
                        ? 'Active'
                        : property.tenancyStatus === 'PENDING_MOVE_IN'
                          ? 'Pending Move-in'
                          : 'Ended'}
                    </span>
                  )}
                  actions={(
                    <div className="flex gap-2 flex-wrap justify-end">
                      <button
                        onClick={() => navigate(`/dashboard/rent/messages/new?propertyId=${property.propertyId}&team=customer-service`)}
                        className="rounded-full bg-[#102a62] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#17377a]"
                      >
                        Chat with Customer Service
                      </button>
                    </div>
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
