import { readAdminStorage, writeAdminStorage } from '../../../context/adminPersistence';

const normalize = (value) => String(value || '').trim().toLowerCase();

const getUnitCandidates = (unit) => [
  unit?.unitCode,
  unit?.unitNumber,
  unit?.number,
  unit?.id
];

const findMatchingUnit = (units = [], unitHint) => {
  if (!Array.isArray(units) || !units.length) return null;
  const target = normalize(unitHint);
  if (!target) return null;

  return (
    units.find((unit) =>
      getUnitCandidates(unit).some((candidate) => normalize(candidate) === target)
    ) || null
  );
};

export const updateAdminUnitLifecycleStatus = ({
  propertyId,
  unitCode,
  nextStatus,
  tenantStatus = nextStatus
}) => {
  if (!propertyId || !unitCode || !nextStatus) return false;
  const state = readAdminStorage();
  if (!state || !Array.isArray(state.properties)) return false;

  let changed = false;
  const nextProperties = state.properties.map((property) => {
    if (String(property?.id) !== String(propertyId)) return property;
    const matched = findMatchingUnit(property?.units || [], unitCode);
    if (!matched) return property;

    const nextUnits = (property.units || []).map((unit) => {
      if (unit !== matched) return unit;
      changed = true;
      return {
        ...unit,
        status: nextStatus,
        tenantStatus,
        updatedAt: new Date().toISOString()
      };
    });

    return { ...property, units: nextUnits };
  });

  if (!changed) return false;
  writeAdminStorage({
    ...state,
    properties: nextProperties
  });
  return true;
};

export const applyInspectionLifecycleToUnit = ({ booking, inspectionStatus }) => {
  const propertyId = booking?.propertyId;
  const unitCode = booking?.unitCode || booking?.unitNumber;
  if (!propertyId || !unitCode || !inspectionStatus) return false;

  if (inspectionStatus === 'Inspection Completed') {
    return updateAdminUnitLifecycleStatus({
      propertyId,
      unitCode,
      nextStatus: 'reserved',
      tenantStatus: 'reserved'
    });
  }

  if (inspectionStatus === 'No-show') {
    return updateAdminUnitLifecycleStatus({
      propertyId,
      unitCode,
      nextStatus: 'vacant',
      tenantStatus: 'vacant'
    });
  }

  return false;
};

export const applyApplicationLifecycleToUnit = ({ application, applicationStatus }) => {
  const propertyId = application?.property?.id || application?.propertyId;
  const unitCode = application?.property?.unitCode || application?.unitCode;
  if (!propertyId || !unitCode || !applicationStatus) return false;

  if (
    applicationStatus === 'INSPECTION_SCHEDULED' ||
    applicationStatus === 'INSPECTION_VERIFIED'
  ) {
    return updateAdminUnitLifecycleStatus({
      propertyId,
      unitCode,
      nextStatus: 'vacant',
      tenantStatus: 'vacant'
    });
  }

  if (
    applicationStatus === 'APPLICATION_STARTED' ||
    applicationStatus === 'APPLICATION_SUBMITTED' ||
    applicationStatus === 'UNDER_REVIEW'
  ) {
    return updateAdminUnitLifecycleStatus({
      propertyId,
      unitCode,
      nextStatus: 'reserved',
      tenantStatus: 'reserved'
    });
  }

  if (applicationStatus === 'APPROVED') {
    return updateAdminUnitLifecycleStatus({
      propertyId,
      unitCode,
      nextStatus: 'occupied',
      tenantStatus: 'occupied'
    });
  }

  if (applicationStatus === 'REJECTED' || applicationStatus === 'CANCELLED') {
    return updateAdminUnitLifecycleStatus({
      propertyId,
      unitCode,
      nextStatus: 'vacant',
      tenantStatus: 'vacant'
    });
  }

  return false;
};

export const applyMoveInLifecycleToUnit = ({ property }) => {
  const propertyId = property?.propertyId || property?.id;
  const unitCode = property?.unitCode;
  if (!propertyId || !unitCode) return false;

  return updateAdminUnitLifecycleStatus({
    propertyId,
    unitCode,
    nextStatus: 'occupied',
    tenantStatus: 'occupied'
  });
};
