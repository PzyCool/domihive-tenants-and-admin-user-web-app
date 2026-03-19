import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TopOverview from '../components/overview/TopOverview';
import UnifiedActionsPanel from '../components/overview/UnifiedActionsPanel';
import { useApplications } from '../contexts/ApplicationsContext';
import { useProperties } from '../contexts/PropertiesContext';
import { usePayments } from '../contexts/PaymentsContext';
import { useMessages } from '../contexts/MessagesContext';
import { useMaintenance } from '../contexts/MaintenanceContext';
import { fetchOverviewSnapshot } from '../services/mockOverviewService';

const RentOverview = () => {
  const { applications, notifications } = useApplications();
  const { properties, favorites } = useProperties();
  const { rents, bills } = usePayments();
  const { threads } = useMessages();
  const { tickets } = useMaintenance();

  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isStale, setIsStale] = useState(false);

  const syncPayload = useMemo(
    () => ({
      applications,
      properties,
      rents,
      bills,
      threads,
      tickets,
      notifications,
      favorites
    }),
    [applications, properties, rents, bills, threads, tickets, notifications, favorites]
  );

  const syncOverview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchOverviewSnapshot(syncPayload);
      setSnapshot(data);
      setIsStale(false);
    } catch (syncError) {
      setError(syncError?.message || 'Failed to load overview data.');
    } finally {
      setLoading(false);
    }
  }, [syncPayload]);

  useEffect(() => {
    syncOverview();
  }, [syncOverview]);

  useEffect(() => {
    if (!snapshot?.syncedAt) return undefined;
    const timer = window.setTimeout(() => setIsStale(true), 45_000);
    return () => window.clearTimeout(timer);
  }, [snapshot?.syncedAt]);

  return (
    <div className="rent-overview-container bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-md border border-[#e2e8f0] p-6">
        <div className="mb-8">
          <TopOverview
            statsOverride={snapshot?.stats}
            recentPropertyOverride={snapshot?.recentProperty}
            hasBookingIntentOverride={snapshot?.hasBookingIntent}
            timelineEventsOverride={snapshot?.timelineEvents}
            isLoading={loading}
            isError={Boolean(error)}
            errorMessage={error}
            isStale={isStale}
            syncedAt={snapshot?.syncedAt}
            onRefresh={syncOverview}
          />
        </div>

        <div>
          <UnifiedActionsPanel
            rentOnlyMode
            statusDataOverride={snapshot?.statusData}
            pendingItemsOverride={snapshot?.pendingItems}
            isLoading={loading}
            isError={Boolean(error)}
            onRetry={syncOverview}
          />
        </div>
      </div>
    </div>
  );
};

export default RentOverview;
