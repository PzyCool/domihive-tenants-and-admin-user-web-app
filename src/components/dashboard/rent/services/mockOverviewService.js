const statusLabels = {
  INSPECTION_SCHEDULED: 'Inspection scheduled',
  INSPECTION_VERIFIED: 'Inspection verified',
  APPLICATION_STARTED: 'Application started',
  APPLICATION_SUBMITTED: 'Application submitted',
  UNDER_REVIEW: 'Under review',
  APPROVED: 'Application approved',
  REJECTED: 'Application rejected',
  CANCELLED: 'Application cancelled'
};

const daysUntil = (dateString) => {
  if (!dateString) return null;
  const due = new Date(dateString);
  if (Number.isNaN(due.getTime())) return null;
  const diff = due.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const readRecentProperty = () => {
  const normalize = (raw) => ({
    id: raw?.id || raw?.propertyId || '',
    title: raw?.title || raw?.name || '',
    location: raw?.location || raw?.address || '',
    price: raw?.price || raw?.rent || '',
    bedrooms: raw?.bedrooms || raw?.beds || '',
    bathrooms: raw?.bathrooms || raw?.baths || '',
    size: raw?.size || raw?.area || '',
    image: raw?.image || raw?.images?.[0] || '',
    viewedAt: raw?.viewedAt || raw?.updatedAt || ''
  });

  try {
    const pending = localStorage.getItem('domihive_pending_booking');
    if (pending) return { property: normalize(JSON.parse(pending)), hasBookingIntent: true };

    const bookingProperty = localStorage.getItem('domihive_booking_property');
    if (bookingProperty) return { property: normalize(JSON.parse(bookingProperty)), hasBookingIntent: true };

    const recent = localStorage.getItem('domihive_recent_properties');
    if (recent) {
      const parsedRecent = JSON.parse(recent);
      if (Array.isArray(parsedRecent) && parsedRecent.length > 0) {
        return { property: normalize(parsedRecent[0]), hasBookingIntent: false };
      }
    }
  } catch (_error) {
    return { property: null, hasBookingIntent: false };
  }

  return { property: null, hasBookingIntent: false };
};

const readBrowseCount = () => {
  try {
    const raw = localStorage.getItem('domihive_browse_cache_v1');
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.items) ? parsed.items.length : 0;
  } catch (_error) {
    return 0;
  }
};

export const fetchOverviewSnapshot = ({
  applications = [],
  properties = [],
  rents = {},
  bills = {},
  threads = [],
  tickets = [],
  notifications = [],
  favorites = []
}) =>
  new Promise((resolve) => {
    const latencyMs = 400 + Math.floor(Math.random() * 800);

    window.setTimeout(() => {
      const managedProperties = properties.filter((property) => property.tenancyStatus !== 'ENDED');
      const activeProperties = managedProperties.filter((property) =>
        ['ACTIVE', 'PENDING_MOVE_IN'].includes(property.tenancyStatus)
      );

      const occupancyRate = managedProperties.length
        ? `${Math.round((activeProperties.length / managedProperties.length) * 100)}%`
        : '0%';

      const nextPropertyPayment = managedProperties
        .filter((property) => property.nextPayment?.dueDate)
        .sort((a, b) => new Date(a.nextPayment.dueDate).getTime() - new Date(b.nextPayment.dueDate).getTime())[0];

      const nextRentPayment = Object.entries(rents)
        .filter(([, rent]) => rent?.nextDue)
        .sort((a, b) => new Date(a[1].nextDue).getTime() - new Date(b[1].nextDue).getTime())[0];

      const nextDueDate = nextPropertyPayment?.nextPayment?.dueDate || nextRentPayment?.[1]?.nextDue || null;
      const nextAmount =
        nextPropertyPayment?.nextPayment?.amount || nextRentPayment?.[1]?.amount || 0;

      const { property: recentProperty, hasBookingIntent } = readRecentProperty();

      const timelineEvents = applications.slice(0, 8).map((application) => ({
        date: application.updatedAtISO || application.createdAtISO || new Date().toISOString(),
        type: application.status,
        title: `${statusLabels[application.status] || 'Application update'} • ${application.property?.title || 'Property'}`,
        color:
          application.status === 'APPROVED'
            ? '#22c55e'
            : application.status === 'REJECTED' || application.status === 'CANCELLED'
            ? '#ef4444'
            : application.status === 'UNDER_REVIEW'
            ? '#f59e0b'
            : '#3b82f6'
      }));

      const unreadMessages = threads.reduce((sum, thread) => sum + (thread.unreadCount || 0), 0);
      const openTickets = tickets.filter((ticket) => ticket.status !== 'COMPLETED').length;
      const actionableApplications = applications.filter((application) =>
        ['INSPECTION_VERIFIED', 'APPLICATION_STARTED', 'UNDER_REVIEW'].includes(application.status)
      ).length;
      const unreadNotifications = notifications.filter((notification) => !notification.read).length;

      const overdueBills = Object.values(bills).flat().filter((bill) => bill.status === 'Overdue').length;

      const pendingItems = [
        { id: 'pending_applications', label: 'Applications needing action', value: actionableApplications, path: '/dashboard/rent/applications' },
        { id: 'pending_messages', label: 'Unread messages', value: unreadMessages, path: '/dashboard/rent/messages' },
        { id: 'pending_maintenance', label: 'Open maintenance tickets', value: openTickets, path: '/dashboard/rent/maintenance' },
        { id: 'pending_bills', label: 'Overdue bills', value: overdueBills, path: '/dashboard/rent/payments' },
        { id: 'pending_notifications', label: 'Unread notifications', value: unreadNotifications, path: '/dashboard/rent/overview' }
      ];

      const favoriteCount = Array.isArray(favorites) ? favorites.length : 0;
      const browseCount = readBrowseCount();
      resolve({
        stats: {
          activeProperties: activeProperties.length,
          daysUntilPayment: daysUntil(nextDueDate) ?? 0,
          occupancyRate,
          nextPaymentAmount: Number(nextAmount || 0).toLocaleString()
        },
        recentProperty,
        hasBookingIntent,
        timelineEvents,
        statusData: {
          browse: `${browseCount} available properties`,
          applications: `${applications.length} active applications`,
          applicationsBadge: applications.filter((application) =>
            ['INSPECTION_VERIFIED', 'APPLICATION_STARTED'].includes(application.status)
          ).length,
          inspections: `${applications.filter((application) => application.status === 'INSPECTION_SCHEDULED').length} upcoming inspections`,
          inspectionsBadge: applications.filter((application) => application.status === 'INSPECTION_SCHEDULED').length,
          favorites: `${favoriteCount} saved properties`,
          favoritesBadge: favoriteCount,
          messages: `${unreadMessages} unread messages`,
          messagesBadge: unreadMessages
        },
        pendingItems,
        syncedAt: new Date().toISOString()
      });
    }, latencyMs);
  });
