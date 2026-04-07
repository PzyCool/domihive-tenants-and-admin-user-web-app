import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { getUserStorageKey } from '../../../shared/utils/userStorageKey';
import { useApplications } from './ApplicationsContext';
import { applyMoveInLifecycleToUnit } from '../../../shared/utils/unitLifecycle';
import { readAdminStorage, writeAdminStorage } from '../../../../context/adminPersistence';

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
  const userKey = getUserStorageKey(user);
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
            sourceApplicationId: app.id,
            name: app.property.title || 'Approved Property',
            location: app.property.location || 'Lagos, Nigeria',
            unitType: app.property.unitType || 'Unit',
            bedrooms: Number(app.property.bedrooms || 0),
            bathrooms: Number(app.property.bathrooms || 0),
            size: app.property.size || '',
            description: app.property.description || '',
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

  useEffect(() => {
    if (!applications.length) return;
    setProperties((prev) => {
      let changed = false;
      const next = prev.map((prop) => {
        const sourceApp = applications.find(
          (app) => String(app?.id || '') === String(prop?.sourceApplicationId || '') && app?.property
        );
        if (!sourceApp?.property) return prop;
        const source = sourceApp.property;
        const updates = {};

        if ((prop.rentAmount == null || Number(prop.rentAmount) === 0) && Number(source.price || 0) > 0) {
          updates.rentAmount = Number(source.price || 0);
        }
        if ((prop.bedrooms == null || Number.isNaN(Number(prop.bedrooms))) && source.bedrooms != null) {
          updates.bedrooms = Number(source.bedrooms || 0);
        }
        if ((prop.bathrooms == null || Number.isNaN(Number(prop.bathrooms))) && source.bathrooms != null) {
          updates.bathrooms = Number(source.bathrooms || 0);
        }
        if ((!prop.size || !String(prop.size).trim()) && source.size) {
          updates.size = source.size;
        }
        if ((!prop.description || !String(prop.description).trim()) && source.description) {
          updates.description = source.description;
        }
        if ((!prop.unitType || !String(prop.unitType).trim()) && source.unitType) {
          updates.unitType = source.unitType;
        }
        if ((!prop.image || !String(prop.image).trim()) && source.image) {
          updates.image = source.image;
        }

        if (Object.keys(updates).length === 0) return prop;
        changed = true;
        return { ...prop, ...updates };
      });
      return changed ? next : prev;
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
      try {
        const adminData = readAdminStorage() || {};
        const tenantList = Array.isArray(adminData.tenants) ? adminData.tenants : [];
        const nextTenants = tenantList.map((tenant) => {
          const sameApplication =
            String(tenant?.applicationId || '') === String(movedInProperty?.sourceApplicationId || '');
          const sameProperty = String(tenant?.propertyId || '') === String(movedInProperty?.propertyId || '');
          const sameUnit =
            String(tenant?.unitCode || tenant?.unitNumber || '') ===
            String(movedInProperty?.unitCode || '');
          if (!sameApplication && !sameProperty && !sameUnit) return tenant;
          return {
            ...tenant,
            status: 'Active',
            moveInConfirmedAt: new Date().toISOString(),
            moveInDate: checklist?.moveInDate || tenant?.moveInDate || '',
            keyNumber: checklist?.keyNumber || tenant?.keyNumber || ''
          };
        });
        writeAdminStorage({
          ...adminData,
          tenants: nextTenants
        });
        window.dispatchEvent(new CustomEvent('domihive:admin-data-updated'));
      } catch (_error) {
        // keep tenant-side flow resilient
      }
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
