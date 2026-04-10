import { normalizeMoneyAmount } from './moneyFormat';

const RECENT_PROPERTIES_KEY = 'domihive_recent_properties';
export const RECENT_PROPERTIES_EVENT = 'domihive_recent_properties_updated';
const MAX_RECENT_PROPERTIES = 4;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=1400&h=900&fit=crop';

const blockedHostPattern = /(propertypro\.ng|privateproperty\.com\.ng|privateproperty\.ng)/i;

const safeRead = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (_error) {
    return fallback;
  }
};

const safeObjectRead = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (_error) {
    return fallback;
  }
};

const sanitizeImage = (value) => {
  const image = String(value || '').trim();
  if (!image) return '';
  if (image.startsWith('blob:') || image.startsWith('data:') || image.startsWith('file:')) return '';
  if (blockedHostPattern.test(image)) return '';
  return image;
};

const normalizeCount = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const normalizeSize = (value) => {
  if (value === null || value === undefined) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  if (/sqm|sq ?m|m2/i.test(raw)) return raw.replace(/m2/i, 'sqm');
  const parsed = Number(raw.replace(/[^\d.]/g, ''));
  if (Number.isFinite(parsed) && parsed > 0) return `${parsed} sqm`;
  return raw;
};

const normalizePrice = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return normalizeMoneyAmount(value);
  const parsed = Number(String(value).replace(/[^\d.]/g, ''));
  if (!Number.isFinite(parsed)) return 0;
  return normalizeMoneyAmount(parsed);
};

const buildLocationText = (raw) => {
  const state = String(raw?.state || '').trim();
  return (
    raw?.location ||
    raw?.address ||
    [raw?.locationName, raw?.area, raw?.address, state ? `${state} State` : ''].filter(Boolean).join(', ') ||
    'Lagos, Nigeria'
  );
};

const normalizeRecentProperty = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const id = String(raw.id || raw.propertyId || raw.listingId || '').trim();
  if (!id) return null;

  const images = Array.isArray(raw.images) ? raw.images : [];
  const candidateImage = sanitizeImage(raw.image) || sanitizeImage(images[0]) || FALLBACK_IMAGE;
  const bedrooms = normalizeCount(raw.bedrooms ?? raw.beds ?? raw.bedCount);
  const bathrooms = normalizeCount(raw.bathrooms ?? raw.baths ?? raw.bathCount);
  const size = normalizeSize(raw.size ?? raw.sqm ?? raw.squareMeters ?? raw.areaSqm ?? raw.unitSize);
  const price = normalizePrice(raw.price ?? raw.rentAmount ?? raw.amount ?? raw.annualRent);
  const location = buildLocationText(raw);
  const title = raw.title || raw.name || raw.propertyTitle || 'Property';
  const description =
    raw.description ||
    raw.summary ||
    raw.notes ||
    raw.unitDescription ||
    raw.propertyDescription ||
    'Recently viewed property';

  return {
    id,
    propertyId: id,
    title,
    name: raw.name || title,
    location,
    address: raw.address || location,
    description,
    bedrooms,
    bathrooms,
    size,
    price,
    unitType: raw.unitType || raw.propertyType || '',
    image: candidateImage,
    images: [candidateImage],
    viewedAt: new Date().toISOString()
  };
};

const readCacheCandidates = () => {
  const browseV2 = safeObjectRead('domihive_browse_cache_v2', null);
  const browseV1 = safeObjectRead('domihive_browse_cache_v1', null);
  const homeV1 = safeRead('domihive_home_properties_cache_v1', []);

  return [
    ...(Array.isArray(browseV2?.items) ? browseV2.items : []),
    ...(Array.isArray(browseV1?.items) ? browseV1.items : []),
    ...(Array.isArray(homeV1) ? homeV1 : [])
  ]
    .map(normalizeRecentProperty)
    .filter(Boolean);
};

const buildCandidateMap = () => {
  const map = new Map();
  readCacheCandidates().forEach((item) => {
    const key = String(item.id || item.propertyId || '').trim();
    if (!key || map.has(key)) return;
    map.set(key, item);
  });
  return map;
};

const mergeRecentWithCandidate = (base, candidate) => {
  if (!candidate) return base;

  const baseLocationLooksInvalid = !base.location || base.location === base.title || base.location === 'Lagos, Nigeria';
  const baseDescriptionLooksInvalid =
    !base.description || String(base.description).toLowerCase() === 'recently viewed property';

  return {
    ...base,
    title: candidate.title || base.title,
    name: candidate.name || base.name,
    location: baseLocationLooksInvalid ? candidate.location || base.location : base.location,
    address: candidate.address || base.address,
    description: baseDescriptionLooksInvalid ? candidate.description || base.description : base.description,
    bedrooms: base.bedrooms > 0 ? base.bedrooms : candidate.bedrooms,
    bathrooms: base.bathrooms > 0 ? base.bathrooms : candidate.bathrooms,
    size: base.size || candidate.size,
    price: base.price > 0 ? base.price : candidate.price,
    unitType: base.unitType || candidate.unitType,
    image: sanitizeImage(base.image) || sanitizeImage(candidate.image) || FALLBACK_IMAGE,
    images: [sanitizeImage(base.image) || sanitizeImage(candidate.image) || FALLBACK_IMAGE]
  };
};

const dedupeById = (items) => {
  const seen = new Set();
  const next = [];
  items.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    const id = String(item.id || item.propertyId || '').trim();
    if (!id || seen.has(id)) return;
    seen.add(id);
    next.push(item);
  });
  return next;
};

const writeRecentProperties = (items) => {
  try {
    localStorage.setItem(RECENT_PROPERTIES_KEY, JSON.stringify(items));
  } catch (_error) {
    // no-op
  }
  try {
    window.dispatchEvent(new Event(RECENT_PROPERTIES_EVENT));
  } catch (_error) {
    // no-op
  }
};

export const pushRecentProperty = (rawProperty) => {
  const normalized = normalizeRecentProperty(rawProperty);
  if (!normalized) return safeRead(RECENT_PROPERTIES_KEY, []);

  const current = safeRead(RECENT_PROPERTIES_KEY, []);
  const next = dedupeById([normalized, ...current]).slice(0, MAX_RECENT_PROPERTIES);
  writeRecentProperties(next);
  return next;
};

export const readRecentProperties = () => safeRead(RECENT_PROPERTIES_KEY, []);

export const getOverviewRecentProperties = () => {
  const pendingBooking = safeObjectRead('domihive_pending_booking', null);
  const bookingProperty = safeObjectRead('domihive_booking_property', null);
  const recent = readRecentProperties();
  const candidateMap = buildCandidateMap();

  const combined = dedupeById([
    normalizeRecentProperty(pendingBooking),
    normalizeRecentProperty(bookingProperty),
    ...recent
      .map((item) => {
        const normalized = normalizeRecentProperty(item);
        if (!normalized) return null;
        const candidate = candidateMap.get(String(normalized.id || normalized.propertyId || '').trim()) || null;
        const merged = mergeRecentWithCandidate(normalized, candidate);
        return {
          ...merged,
          viewedAt: item.viewedAt || item.updatedAt || merged.viewedAt || new Date().toISOString()
        };
      })
      .filter((item) => item.id)
  ]);

  return combined.slice(0, MAX_RECENT_PROPERTIES);
};
