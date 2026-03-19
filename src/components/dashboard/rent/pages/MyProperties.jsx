import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../contexts/PropertiesContext';
import PropertyCard from '../components/properties/PropertyCard';

const MyProperties = () => {
  const navigate = useNavigate();
  const { properties } = useProperties();

  const visibleProperties = React.useMemo(() => {
    const nonEnded = properties.filter((p) => p.tenancyStatus !== 'ENDED');
    const primaryJourneyProperty =
      nonEnded.find((p) => p.isPrimaryJourneyProperty) ||
      nonEnded.find((p) => p.propertyId === 'PROP-001');

    if (primaryJourneyProperty) {
      return [primaryJourneyProperty];
    }

    return nonEnded;
  }, [properties]);

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
      case 'refund':
        navigate(base, { state: { focus: 'refund' } });
        break;
      default:
        navigate(base);
    }
  };

  return (
    <div className="rent-overview-container bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-md border border-[#e2e8f0] p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0e1f42]">My Properties</h1>
            <p className="text-sm text-[#64748b]">Manage active tenancies, payments, and move-in/out steps.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white rounded-2xl shadow-sm border p-4" style={{ borderColor: 'var(--accent-color, #9F7539)' }}>
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--accent-color, #9F7539)' }}>Active Properties</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--primary-color, #0E1F42)' }}>{stats.active}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border p-4" style={{ borderColor: 'var(--accent-color, #9F7539)' }}>
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--accent-color, #9F7539)' }}>Pending Move-in</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--primary-color, #0E1F42)' }}>{stats.pending}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border p-4" style={{ borderColor: 'var(--accent-color, #9F7539)' }}>
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--accent-color, #9F7539)' }}>Upcoming Payments</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--primary-color, #0E1F42)' }}>{stats.upcomingPayments}</p>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default MyProperties;
