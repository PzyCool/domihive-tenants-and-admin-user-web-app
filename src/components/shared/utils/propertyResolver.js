const BROWSE_CACHE_KEY = 'domihive_browse_cache_v2';
const LEGACY_BROWSE_CACHE_KEY = 'domihive_browse_cache_v1';
const HOME_CACHE_KEY = 'domihive_home_properties_cache_v1';
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=1400&h=900&fit=crop',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1400&h=900&fit=crop',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1400&h=900&fit=crop'
];

const blockedHostPattern = /(propertypro\.ng|privateproperty\.com\.ng|privateproperty\.ng)/i;

const safeImageUrl = (url, fallbackIndex = 0) => {
  if (!url || typeof url !== 'string') return FALLBACK_IMAGES[fallbackIndex % FALLBACK_IMAGES.length];
  const lowered = url.toLowerCase();
  if (lowered.startsWith('blob:') || lowered.startsWith('file:')) {
    return FALLBACK_IMAGES[fallbackIndex % FALLBACK_IMAGES.length];
  }
  if (blockedHostPattern.test(url)) return FALLBACK_IMAGES[fallbackIndex % FALLBACK_IMAGES.length];
  return url;
};

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
  const sourceImages = [
    ...(Array.isArray(raw.images) ? raw.images : []),
    ...(Array.isArray(raw.photos) ? raw.photos : []),
    raw.image,
    raw.imageUrl,
    raw.thumbnail
  ].filter(Boolean);
  const images = sourceImages.length
    ? sourceImages.map((item, index) => safeImageUrl(item, index))
    : [...FALLBACK_IMAGES];
  const primaryImage = safeImageUrl(raw.image || raw.imageUrl || images[0], 0);
  const videos = Array.isArray(raw.videos) ? raw.videos : [];
  const normalizedVideos = videos.map((video, index) => ({
    ...video,
    thumbnail: safeImageUrl(video?.thumbnail || images[index] || primaryImage, index)
  }));

  return {
    ...raw,
    id: raw.id || raw.propertyId || '',
    propertyId: raw.propertyId || raw.id || '',
    title: raw.title || raw.name || 'Property',
    name: raw.name || raw.title || 'Property',
    location: raw.location || raw.address || 'Lagos, Nigeria',
    address: raw.address || raw.location || 'Lagos, Nigeria',
    image: primaryImage,
    images,
    videos: normalizedVideos,
    amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
    reviews: Array.isArray(raw.reviews) ? raw.reviews : []
  };
};

export const resolvePropertyById = (propertyId) => {
  if (!propertyId) return null;

  const browseCache = safeRead(BROWSE_CACHE_KEY, {}) || safeRead(LEGACY_BROWSE_CACHE_KEY, {});
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
