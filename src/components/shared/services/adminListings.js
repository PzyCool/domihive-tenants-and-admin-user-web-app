import { readAdminStorage } from "../../../context/adminPersistence";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=1200&h=800&fit=crop";

const toSlug = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const normalizeFurnishing = (unit) => {
  const options = Array.isArray(unit?.furnishingOptions) ? unit.furnishingOptions.map((item) => String(item).toLowerCase()) : [];
  if (options.includes("full")) return "furnished";
  if (options.includes("semi")) return "semi_furnished";
  if (options.length > 0) return "unfurnished";

  const direct = String(unit?.furnishing || "").toLowerCase();
  if (direct === "full" || direct === "furnished") return "furnished";
  if (direct === "semi" || direct === "semi_furnished") return "semi_furnished";
  return "unfurnished";
};

const normalizeAmenityIds = (property, unit) => {
  const source = [
    ...(Array.isArray(property?.amenities) ? property.amenities : []),
    ...(Array.isArray(unit?.amenities) ? unit.amenities : [])
  ]
    .map((item) => String(item).toLowerCase())
    .join(" | ");

  const ids = [];
  if (/wifi/.test(source)) ids.push("wifi");
  if (/parking/.test(source)) ids.push("parking");
  if (/security/.test(source)) ids.push("security");
  if (/generator|gen\b/.test(source)) ids.push("generator");
  if (/\bac\b|air/.test(source)) ids.push("ac");
  if (/swimming/.test(source)) ids.push("swimming_pool");
  if (/cctv/.test(source)) ids.push("cctv");
  if (/inverter/.test(source)) ids.push("inverter");
  if (/solar/.test(source)) ids.push("solar_system");
  if (/external garden|garden/.test(source)) ids.push("external_garden");
  if (/jacuzzi/.test(source)) ids.push("jacuzzi");
  if (/central water heater|water heater/.test(source)) ids.push("central_water_heater_system");
  if (/pop ceiling|pop ceilings/.test(source)) ids.push("pop_ceilings");
  if (/\bgym\b/.test(source)) ids.push("gym");
  return Array.from(new Set(ids));
};

const getLocationText = (property) => {
  const locationName = property?.location || "";
  const areaName = property?.area || "";
  const address = property?.address || "";
  const stateName = property?.state ? `${property.state} State` : "";

  return [locationName, areaName, address, stateName].filter(Boolean).join(", ");
};

const getManagementType = (property) => {
  const estateTag = String(property?.estateType || property?.tag || "").toLowerCase();
  return estateTag.includes("non") ? "non_estate" : "estate_property";
};

const getPropertyAge = (property) => {
  const value = String(property?.propertyAge || "").toLowerCase();
  if (!value) return "";
  if (value.includes("new")) return "new";
  if (value.includes("modern")) return "modern";
  if (value.includes("old") || value.includes("established")) return "established";
  return "";
};

const combineSlides = (property, unit) => {
  const propertySlides = Array.isArray(property?.images) ? property.images.filter(Boolean).slice(0, 3) : [];
  const unitSlides = Array.isArray(unit?.images) ? unit.images.filter(Boolean).slice(0, 3) : [];
  const merged = [...propertySlides, ...unitSlides].filter(Boolean);
  return merged.length ? Array.from(new Set(merged)) : [FALLBACK_IMAGE];
};

const isPublishedUnit = (property, unit) => {
  const unitPublished = String(unit?.publishedStatus || "").toLowerCase() === "published";
  return unitPublished;
};

export const getPublishedUnitListings = () => {
  const data = readAdminStorage();
  const properties = Array.isArray(data?.properties) ? data.properties : [];

  const mapped = [];
  properties.forEach((property) => {
    const units = Array.isArray(property?.units) ? property.units : [];
    units.forEach((unit) => {
      if (!isPublishedUnit(property, unit)) return;

      const typeLabel = unit?.type || property?.type || "Apartment";
      const buildingTypeLabel = String(property?.type || "").trim();
      const locationText = getLocationText(property);
      const listingId = `listing-${property.id}-${unit.id}`;
      const dateAdded = unit?.updatedAt || property?.updatedAt || new Date().toISOString();

      mapped.push({
        id: listingId,
        listingId,
        propertyId: property.id,
        unitId: unit.id,
        unitCode: unit.unitNumber || unit.number || "",
        title: property.title || "Property Listing",
        description:
          unit.description ||
          unit.notes ||
          property.description ||
          "No description provided for this unit yet.",
        price: Number(unit.rent || 0),
        cautionFee: Number(unit.caution || 0),
        bedrooms: Number(unit.bedrooms || 0),
        bathrooms: Number(unit.bathrooms || 0),
        size: unit.size || "",
        state: property.state || "",
        area: property.area || "",
        locationName: property.location || "",
        location: locationText,
        address: property.address || "",
        postalCode: property.postalCode || "",
        propertyType: toSlug(typeLabel) || "apartment",
        propertyTypeLabel: typeLabel,
        buildingType: toSlug(buildingTypeLabel) || "",
        buildingTypeLabel: buildingTypeLabel || "",
        managementType: getManagementType(property),
        isEstate: getManagementType(property) === "estate_property",
        propertyAge: getPropertyAge(property),
        petsAllowed: Boolean(property.petsAllowed),
        furnishing: normalizeFurnishing(unit),
        amenityIds: normalizeAmenityIds(property, unit),
        images: combineSlides(property, unit),
        image: combineSlides(property, unit)[0],
        dateAdded,
        isVerified: true,
        isFeatured: false,
        isNegotiable: false,
        status: String(unit?.tenantStatus || unit?.status || 'vacant').toLowerCase(),
        tenantStatus: String(unit?.tenantStatus || unit?.status || 'vacant').toLowerCase(),
        canBook: ['vacant', 'available'].includes(
          String(unit?.tenantStatus || unit?.status || 'vacant').toLowerCase()
        ),
        forRent: true
      });
    });
  });

  return mapped;
};

export const buildListingFilterMeta = (items = []) => {
  const states = Array.from(new Set(items.map((item) => item.state).filter(Boolean)));
  const areasByState = {};
  states.forEach((state) => {
    areasByState[state] = Array.from(
      new Set(items.filter((item) => item.state === state).map((item) => item.area).filter(Boolean))
    );
  });

  const locationsByArea = {};
  Object.values(areasByState).flat().forEach((area) => {
    locationsByArea[area] = Array.from(
      new Set(items.filter((item) => item.area === area).map((item) => item.locationName).filter(Boolean))
    );
  });

  const propertyTypeOptions = Array.from(
    new Map(
      items
        .map((item) => [item.propertyType, item.propertyTypeLabel])
        .filter(([id, label]) => Boolean(id && label))
    ),
    ([id, label]) => ({ id, label })
  );

  return {
    states,
    areasByState,
    locationsByArea,
    propertyTypeOptions
  };
};
