const BROWSE_CACHE_KEY = 'domihive_browse_cache_v1';
const HOME_CACHE_KEY = 'domihive_home_properties_cache_v1';

const safeRead = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
};

const normalizeProperty = (raw) => {
  if (!raw) return null;
  const images = Array.isArray(raw.images)
    ? raw.images.filter(Boolean)
    : [raw.image].filter(Boolean);

  return {
    ...raw,
    id: raw.id || raw.propertyId || '',
    propertyId: raw.propertyId || raw.id || '',
    title: raw.title || raw.name || 'Property',
    name: raw.name || raw.title || 'Property',
    location: raw.location || raw.address || 'Lagos, Nigeria',
    address: raw.address || raw.location || 'Lagos, Nigeria',
    image: raw.image || images[0] || '',
    images,
    amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
    reviews: Array.isArray(raw.reviews) ? raw.reviews : []
  };
};

export const resolvePropertyById = (propertyId) => {
  if (!propertyId) return null;

  const browseCache = safeRead(BROWSE_CACHE_KEY, {});
  const homeCache = safeRead(HOME_CACHE_KEY, []);
  const recentProperties = safeRead('domihive_recent_properties', []);
  const pendingBooking = safeRead('domihive_pending_booking', null);
  const bookingProperty = safeRead('domihive_booking_property', null);

  const candidates = [
    ...(Array.isArray(browseCache?.items) ? browseCache.items : []),
    ...(Array.isArray(homeCache) ? homeCache : []),
    ...(Array.isArray(recentProperties) ? recentProperties : []),
    pendingBooking,
    bookingProperty
  ]
    .filter(Boolean)
    .map(normalizeProperty);

  return (
    candidates.find(
      (item) => String(item.id) === String(propertyId) || String(item.propertyId) === String(propertyId)
    ) || null
  );
};

export default resolvePropertyById;
