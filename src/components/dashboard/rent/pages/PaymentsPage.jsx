import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ReceiptText, Search, Wallet } from 'lucide-react';
import UnifiedPanelPage, { UnifiedPanelSection } from '../../../shared/layout/UnifiedPanelPage';
import { usePayments } from '../contexts/PaymentsContext';
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

const PaymentsPage = () => {
  const navigate = useNavigate();
  const { rents, receipts, history } = usePayments();
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
    const dueNow = Object.values(rents || {}).filter((rent) =>
      ['Due', 'Overdue'].includes(String(rent?.status || ''))
    ).length;
    return {
      unitsCount: properties.length,
      dueNow,
      receiptsCount: receipts.length,
      historyCount: history.length
    };
  }, [properties.length, rents, receipts.length, history.length]);

  return (
    <UnifiedPanelPage
      title="Payments"
      subtitle="Manage payment-ready units, then open workspace to pay rent and bills."
      stats={[
        {
          label: 'Units',
          value: stats.unitsCount,
          meta: `${stats.unitsCount} total`,
          icon: <Wallet size={20} />,
          iconClass: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
        },
        {
          label: 'Due Now',
          value: stats.dueNow,
          meta: `${stats.dueNow} payable`,
          icon: <CreditCard size={20} />,
          iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
        },
        {
          label: 'Receipts',
          value: stats.receiptsCount,
          meta: `${stats.receiptsCount} records`,
          icon: <ReceiptText size={20} />,
          iconClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
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
                minWidth={175}
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
                      label="Make Payment"
                      onClick={() => navigate(`/dashboard/rent/payments/${property.propertyId}`)}
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

export default PaymentsPage;
