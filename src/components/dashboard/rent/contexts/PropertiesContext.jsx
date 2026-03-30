import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useApplications } from './ApplicationsContext';
import { applyMoveInLifecycleToUnit } from '../../../shared/utils/unitLifecycle';

const EMPTY_PROPERTIES = [];

const PropertiesContext = createContext();

export const useProperties = () => {
  const ctx = useContext(PropertiesContext);
  if (!ctx) throw new Error('useProperties must be used within PropertiesProvider');
  return ctx;
};

export const PropertiesProvider = ({ children }) => {
  const { user } = useAuth();
  const { applications } = useApplications();
  const userKey = user?.id || 'guest';
  const propertiesStorageKey = `domihive_properties_${userKey}`;
  const favoritesStorageKey = `domihive_favorites_${userKey}`;

  const [properties, setProperties] = useState(EMPTY_PROPERTIES);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(propertiesStorageKey);
      setProperties(raw ? JSON.parse(raw) : EMPTY_PROPERTIES);
    } catch (_error) {
      setProperties(EMPTY_PROPERTIES);
    }
  }, [propertiesStorageKey]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(favoritesStorageKey);
      setFavorites(raw ? JSON.parse(raw) : []);
    } catch (_error) {
      setFavorites([]);
    }
  }, [favoritesStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(favoritesStorageKey, JSON.stringify(favorites));
    } catch (err) {
      console.error('Error saving favorites', err);
    }
  }, [favorites, favoritesStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(propertiesStorageKey, JSON.stringify(properties));
    } catch (err) {
      console.error('Error saving properties', err);
    }
  }, [properties, propertiesStorageKey]);

  useEffect(() => {
    const approvedApps = applications.filter((app) => app.status === 'APPROVED' && app.property);
    if (!approvedApps.length) return;

    setProperties((prev) => {
      const existingIds = new Set(prev.map((prop) => prop.propertyId));
      const additions = approvedApps
        .map((app, index) => {
          const propertyId = String(app.property.id || app.property.propertyId || app.id);
          if (existingIds.has(propertyId)) return null;
          const today = new Date();
          const nextYear = new Date(today);
          nextYear.setFullYear(nextYear.getFullYear() + 1);
          const dueDate = new Date(nextYear);
          dueDate.setMonth(dueDate.getMonth() - 1);

          return {
            propertyId,
            name: app.property.title || 'Approved Property',
            location: app.property.location || 'Lagos, Nigeria',
            unitType: app.property.unitType || 'Unit',
            tenancyStatus: 'PENDING_MOVE_IN',
            leaseStart: today.toISOString().slice(0, 10),
            leaseEnd: nextYear.toISOString().slice(0, 10),
            rentAmount: Number(app.property.price || 0),
            paymentPlan: 'Yearly',
            cautionDepositStatus: 'Paid',
            includedBillsSummary: 'Service charge included, utilities excluded',
            houseRules: ['No smoking indoors', 'Pets on request', 'Respect quiet hours 10pm-6am'],
            inventoryChecklist: [],
            payments: [],
            nextPayment: {
              dueDate: dueDate.toISOString().slice(0, 10),
              amount: Number(app.property.price || 0),
              status: 'Upcoming'
            },
            moveInChecklist: {
              keysReceived: false,
              meterReading: '',
              inventoryConfirmed: false,
              moveInDateConfirmed: false,
              keyNumber: '',
              moveInDate: ''
            },
            moveOutNotice: null,
            moveOutInspection: null,
            refundStatus: null,
            image: app.property.image || '',
            unitCode: app.property.unitCode || '',
            isPrimaryJourneyProperty: index === 0
          };
        })
        .filter(Boolean);

      if (!additions.length) return prev;
      return [...additions, ...prev];
    });
  }, [applications]);

  const updateProperty = (propertyId, changes) => {
    setProperties((prev) =>
      prev.map((prop) => (prop.propertyId === propertyId ? { ...prop, ...changes } : prop))
    );
  };

  const completeMoveInChecklist = (propertyId, checklist) => {
    let movedInProperty = null;
    setProperties((prev) =>
      prev.map((prop) => {
        if (prop.propertyId !== propertyId) return prop;
        movedInProperty = prop;
        return {
          ...prop,
          moveInChecklist: { ...prop.moveInChecklist, ...checklist },
          tenancyStatus: 'ACTIVE'
        };
      })
    );

    if (movedInProperty) {
      applyMoveInLifecycleToUnit({ property: movedInProperty });
    }
  };

  const submitMoveOutNotice = (propertyId, notice) => {
    setProperties((prev) =>
      prev.map((prop) =>
        prop.propertyId === propertyId
          ? { ...prop, moveOutNotice: notice, tenancyStatus: 'ACTIVE' }
          : prop
      )
    );
  };

  const scheduleMoveOutInspection = (propertyId, inspection) => {
    setProperties((prev) =>
      prev.map((prop) =>
        prop.propertyId === propertyId ? { ...prop, moveOutInspection: inspection } : prop
      )
    );
  };

  const updateRefundStatus = (propertyId, status) => {
    setProperties((prev) =>
      prev.map((prop) =>
        prop.propertyId === propertyId ? { ...prop, refundStatus: status } : prop
      )
    );
  };

  const getPropertyId = (property) => property?.id || property?.propertyId;

  const toggleFavorite = (property) => {
    const pid = getPropertyId(property);
    if (!pid) return;
    setFavorites((prev) => {
      if (prev.includes(pid)) {
        return prev.filter((id) => id !== pid);
      }
      return [...prev, pid];
    });
  };

  const isFavorite = (propertyId) => {
    const pid = propertyId;
    return favorites.includes(pid);
  };

  const favoriteProperties = properties.filter((p) => favorites.includes(getPropertyId(p)));

  const value = useMemo(
    () => ({
      properties,
      favorites,
      favoriteProperties,
      updateProperty,
      completeMoveInChecklist,
      submitMoveOutNotice,
      scheduleMoveOutInspection,
      updateRefundStatus,
      toggleFavorite,
      isFavorite
    }),
    [properties, favorites]
  );

  return <PropertiesContext.Provider value={value}>{children}</PropertiesContext.Provider>;
};

export default PropertiesContext;
