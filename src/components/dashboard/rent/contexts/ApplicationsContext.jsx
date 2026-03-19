import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';

const MAX_NOTIFICATIONS = 120;

const ApplicationsContext = createContext();

const formatDateTimeLabel = (isoDate) =>
  new Date(isoDate).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

const formatRelativeTime = (iso) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const safeReadJson = (storageKey, fallback = []) => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (_error) {
    return fallback;
  }
};

export const useApplications = () => {
  const context = useContext(ApplicationsContext);
  if (!context) {
    throw new Error('useApplications must be used within ApplicationsProvider');
  }
  return context;
};

export const ApplicationsProvider = ({ children }) => {
  const { user } = useAuth();
  const userKey = user?.id || 'guest';
  const applicationsStorageKey = `domihive_applications_state_${userKey}`;
  const notificationsStorageKey = `domihive_dashboard_notifications_${userKey}`;
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setApplications(safeReadJson(applicationsStorageKey, []));
  }, [applicationsStorageKey]);

  useEffect(() => {
    setNotifications(safeReadJson(notificationsStorageKey, []));
  }, [notificationsStorageKey]);

  useEffect(() => {
    localStorage.setItem(applicationsStorageKey, JSON.stringify(applications));
  }, [applications, applicationsStorageKey]);

  useEffect(() => {
    localStorage.setItem(notificationsStorageKey, JSON.stringify(notifications));
  }, [notifications, notificationsStorageKey]);

  const addNotification = useCallback((notification) => {
    const nowISO = new Date().toISOString();
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: nowISO,
        read: false,
        type: notification.type || 'info',
        title: notification.title || 'Update',
        message: notification.message || '',
        cta: notification.cta || null,
        ...notification
      },
      ...prev
    ].slice(0, MAX_NOTIFICATIONS));
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const updateApplication = useCallback((id, changes) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              ...changes,
              updatedAtISO: new Date().toISOString(),
              updatedAt: 'Just now'
            }
          : app
      )
    );
  }, []);

  const createApplicationFromBooking = useCallback(({ booking, property, applicantName }) => {
    const inspectionDateISO =
      booking?.inspectionDate && booking?.inspectionTime
        ? new Date(`${booking.inspectionDate}T${booking.inspectionTime}:00`).toISOString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const nowISO = new Date().toISOString();
    const inspectionUnlockAtISO = new Date(Date.now() + 10_000).toISOString();
    const inspectionDateLabel = formatDateTimeLabel(inspectionDateISO);
    const propertyId = property?.id || property?.propertyId || booking?.propertyId || 'PROP-UNKNOWN';

    let createdOrUpdated;
    setApplications((prev) => {
      const existingIndex = prev.findIndex(
        (app) =>
          (app.property?.id || app.property?.propertyId) === propertyId &&
          !['CANCELLED', 'REJECTED'].includes(app.status)
      );

      if (existingIndex >= 0) {
        const updated = {
          ...prev[existingIndex],
          status: 'INSPECTION_SCHEDULED',
          inspectionDate: inspectionDateLabel,
          inspectionDateISO,
          inspectionUnlockAtISO,
          attendees: Number(booking?.numberOfPeople || 1),
          bookingId: booking?.bookingId || prev[existingIndex].bookingId,
          bookingDateISO: booking?.bookingDate || nowISO,
          updatedAtISO: nowISO,
          updatedAt: 'Just now'
        };
        const clone = [...prev];
        clone.splice(existingIndex, 1);
        createdOrUpdated = updated;
        return [updated, ...clone];
      }

      const newApp = {
        id: `APP-${Date.now().toString().slice(-6)}`,
        status: 'INSPECTION_SCHEDULED',
        applicantName: applicantName || 'Tenant',
        inspectionDate: inspectionDateLabel,
        inspectionDateISO,
        inspectionUnlockAtISO,
        attendees: Number(booking?.numberOfPeople || 1),
        bookingId: booking?.bookingId || `DOMI-INSP-${Date.now()}`,
        bookingDateISO: booking?.bookingDate || nowISO,
        createdAtISO: nowISO,
        updatedAtISO: nowISO,
        updatedAt: 'Just now',
        property: {
          id: propertyId,
          title: property?.title || 'Selected Property',
          location: property?.location || 'Lagos, Nigeria',
          price: Number(property?.price || 0),
          image: property?.image || 'https://images.unsplash.com/photo-1549187774-b4e9b0445b58?w=640'
        }
      };
      createdOrUpdated = newApp;
      return [newApp, ...prev];
    });

    const propertyTitle = property?.title || 'Selected Property';
    addNotification({
      type: 'inspection',
      title: 'Inspection Booked',
      message: `${propertyTitle} scheduled for ${inspectionDateLabel}.`,
      cta: { label: 'View Application', path: '/dashboard/rent/applications' }
    });

    addNotification({
      type: 'reminder',
      title: 'Inspection Reminder Enabled',
      message: 'We will send reminders before your inspection date.',
      cta: { label: 'Open Notifications', path: '/dashboard/rent/applications' }
    });

    return createdOrUpdated;
  }, [addNotification]);

  const refreshRelativeTimestamps = useCallback(() => {
    setApplications((prev) =>
      prev.map((app) => ({
        ...app,
        updatedAt: app.updatedAtISO ? formatRelativeTime(app.updatedAtISO) : app.updatedAt
      }))
    );
  }, []);

  useEffect(() => {
    const timer = setInterval(refreshRelativeTimestamps, 60 * 1000);
    return () => clearInterval(timer);
  }, [refreshRelativeTimestamps]);

  // TEST MODE: auto-approve applications after 10 seconds in UNDER_REVIEW.
  // Keep "72 hours" copy in UI until admin wiring is connected.
  useEffect(() => {
    const now = Date.now();
    const dueApplications = applications.filter((application) => {
      if (application.status !== 'UNDER_REVIEW') return false;
      if (!application.submittedAtISO) return false;
      const elapsedMs = now - new Date(application.submittedAtISO).getTime();
      return elapsedMs >= 10_000;
    });

    if (!dueApplications.length) return;

    const approvedAtISO = new Date().toISOString();
    const dueIds = new Set(dueApplications.map((app) => app.id));

    setApplications((prev) =>
      prev.map((application) =>
        dueIds.has(application.id)
          ? {
              ...application,
              status: 'APPROVED',
              updatedAtISO: approvedAtISO,
              updatedAt: 'Just now',
              autoVerdictAtISO: approvedAtISO
            }
          : application
      )
    );

    setNotifications((prev) => {
      const verdictNotifications = dueApplications.map((application) => ({
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: approvedAtISO,
        read: false,
        type: 'verdict',
        title: 'Application Approved',
        message: `${application.property?.title || 'Your application'} has been approved.`,
        cta: { label: 'View My Properties', path: '/dashboard/rent/my-properties' }
      }));

      return [...verdictNotifications, ...prev].slice(0, MAX_NOTIFICATIONS);
    });
  }, [applications]);

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      applications,
      updateApplication,
      notifications,
      unreadNotificationsCount,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      createApplicationFromBooking
    }),
    [
      applications,
      updateApplication,
      notifications,
      unreadNotificationsCount,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      createApplicationFromBooking
    ]
  );

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
};

export default ApplicationsContext;
