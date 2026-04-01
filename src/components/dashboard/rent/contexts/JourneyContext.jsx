import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { getUserStorageKey } from '../../../shared/utils/userStorageKey';
import { useApplications } from './ApplicationsContext';
import { useProperties } from './PropertiesContext';

const JourneyContext = createContext(null);
const MAX_NOTIFICATIONS = 120;

const STAGE_ORDER = [
  'CLEAN',
  'BROWSE',
  'INSPECTION_BOOKED',
  'INSPECTION_VERIFIED',
  'APPLICATION_STARTED',
  'APPLICATION_SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'MOVE_IN_PENDING',
  'ACTIVE'
];

const STAGE_RANK = STAGE_ORDER.reduce((acc, stage, index) => {
  acc[stage] = index;
  return acc;
}, {});

const statusToStage = (status) => {
  switch (status) {
    case 'INSPECTION_SCHEDULED':
      return 'INSPECTION_BOOKED';
    case 'INSPECTION_VERIFIED':
      return 'INSPECTION_VERIFIED';
    case 'APPLICATION_STARTED':
      return 'APPLICATION_STARTED';
    case 'APPLICATION_SUBMITTED':
      return 'APPLICATION_SUBMITTED';
    case 'UNDER_REVIEW':
      return 'UNDER_REVIEW';
    case 'APPROVED':
      return 'APPROVED';
    default:
      return 'CLEAN';
  }
};

const computeJourneyStage = ({ applications = [], properties = [] }) => {
  let stage = 'CLEAN';

  applications.forEach((application) => {
    const appStage = statusToStage(application.status);
    if (STAGE_RANK[appStage] > STAGE_RANK[stage]) {
      stage = appStage;
    }
  });

  const hasMoveInPending = properties.some((property) => property.tenancyStatus === 'PENDING_MOVE_IN');
  const hasActive = properties.some((property) => property.tenancyStatus === 'ACTIVE');
  if (hasMoveInPending && STAGE_RANK.MOVE_IN_PENDING > STAGE_RANK[stage]) {
    stage = 'MOVE_IN_PENDING';
  }
  if (hasActive && STAGE_RANK.ACTIVE > STAGE_RANK[stage]) {
    stage = 'ACTIVE';
  }

  return stage;
};

const buildStatusNotification = (application) => {
  const propertyTitle = application?.property?.title || 'Property';
  const appId = application?.id;
  switch (application?.status) {
    case 'INSPECTION_SCHEDULED':
      return {
        type: 'inspection',
        title: 'Inspection Booked',
        message: `${propertyTitle} inspection has been scheduled.`,
        cta: { label: 'View Application', path: '/dashboard/rent/applications' }
      };
    case 'INSPECTION_VERIFIED':
      return {
        type: 'inspection',
        title: 'Inspection Verified',
        message: `${propertyTitle} inspection verified. You can start your application.`,
        cta: { label: 'Start Application', path: `/dashboard/rent/applications/${appId}/start` }
      };
    case 'APPLICATION_STARTED':
      return {
        type: 'application',
        title: 'Application In Progress',
        message: `You started your application for ${propertyTitle}.`,
        cta: { label: 'Continue', path: `/dashboard/rent/applications/${appId}/start` }
      };
    case 'UNDER_REVIEW':
      return {
        type: 'application',
        title: 'Application Under Review',
        message: `${propertyTitle} is now under review (72 hours SLA).`,
        cta: { label: 'Track', path: `/dashboard/rent/applications/${appId}/track` }
      };
    case 'APPROVED':
      return {
        type: 'verdict',
        title: 'Application Approved',
        message: `${propertyTitle} has been approved.`,
        cta: { label: 'Open My Properties', path: '/dashboard/rent/my-properties' }
      };
    case 'REJECTED':
      return {
        type: 'verdict',
        title: 'Application Rejected',
        message: `${propertyTitle} application was not approved.`,
        cta: { label: 'View Details', path: `/dashboard/rent/applications/${appId}/track` }
      };
    case 'CANCELLED':
      return {
        type: 'application',
        title: 'Application Cancelled',
        message: `${propertyTitle} request was cancelled.`,
        cta: { label: 'Browse Properties', path: '/dashboard/rent/browse' }
      };
    default:
      return null;
  }
};

const safeReadNotifications = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

export const JourneyProvider = ({ children }) => {
  const { user } = useAuth();
  const { applications } = useApplications();
  const { properties } = useProperties();
  const userKey = getUserStorageKey(user);
  const storageKey = `domihive_journey_notifications_${userKey}`;

  const [notifications, setNotifications] = useState([]);
  const previousAppStatusesRef = useRef(new Map());
  const previousPropertyStatusesRef = useRef(new Map());
  const initializedRef = useRef(false);

  useEffect(() => {
    setNotifications(safeReadNotifications(storageKey));
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notifications));
  }, [notifications, storageKey]);

  const pushNotification = (input) => {
    const entry = {
      id: `journey_notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      read: false,
      type: input.type || 'system',
      title: input.title || 'Update',
      message: input.message || '',
      cta: input.cta || null
    };
    setNotifications((prev) => [entry, ...prev].slice(0, MAX_NOTIFICATIONS));
  };

  useEffect(() => {
    if (!initializedRef.current) {
      previousAppStatusesRef.current = new Map(applications.map((app) => [app.id, app.status]));
      previousPropertyStatusesRef.current = new Map(properties.map((p) => [p.propertyId, p.tenancyStatus]));
      initializedRef.current = true;
      return;
    }

    const previousAppStatuses = previousAppStatusesRef.current;
    applications.forEach((application) => {
      const previousStatus = previousAppStatuses.get(application.id);
      const nextStatus = application.status;
      if (!previousStatus || previousStatus !== nextStatus) {
        const nextNotification = buildStatusNotification(application);
        if (nextNotification) pushNotification(nextNotification);
      }
    });
    previousAppStatusesRef.current = new Map(applications.map((app) => [app.id, app.status]));

    const previousPropertyStatuses = previousPropertyStatusesRef.current;
    properties.forEach((property) => {
      const previousStatus = previousPropertyStatuses.get(property.propertyId);
      if (property.tenancyStatus === 'PENDING_MOVE_IN' && previousStatus !== 'PENDING_MOVE_IN') {
        pushNotification({
          type: 'property',
          title: 'Move-in Checklist Ready',
          message: `${property.name || 'Approved property'} is ready for move-in confirmation.`,
          cta: { label: 'Open My Properties', path: '/dashboard/rent/my-properties' }
        });
      }
    });
    previousPropertyStatusesRef.current = new Map(properties.map((p) => [p.propertyId, p.tenancyStatus]));
  }, [applications, properties]);

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const currentStage = useMemo(
    () => computeJourneyStage({ applications, properties }),
    [applications, properties]
  );

  const value = useMemo(
    () => ({
      currentStage,
      notifications,
      unreadNotificationsCount,
      markNotificationRead,
      markAllNotificationsRead
    }),
    [currentStage, notifications, unreadNotificationsCount]
  );

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
};

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within JourneyProvider');
  }
  return context;
};

export const applicationStageGuards = {
  canStart: new Set(['INSPECTION_VERIFIED', 'APPLICATION_STARTED']),
  canPay: new Set(['APPLICATION_STARTED']),
  canTrack: new Set(['APPLICATION_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'])
};

export default JourneyContext;
