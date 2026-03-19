import { generateNigerianProperties } from '../../../home/properties/components/utils/propertyData';

const BROWSE_CACHE_KEY = 'domihive_browse_cache_v1';

const amenityMap = [
  { id: 'wifi', match: /wifi/i },
  { id: 'parking', match: /parking/i },
  { id: 'security', match: /security/i },
  { id: 'generator', match: /generator/i },
  { id: 'water', match: /water/i },
  { id: 'ac', match: /air conditioning|ac/i }
];

const deterministicIndex = (seed, mod) => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash % mod;
};

const enrichProperty = (property) => {
  const seed = String(property.id || property.propertyId || property.title || '');
  const furnishingOptions = ['furnished', 'semi_furnished', 'unfurnished'];
  const propertyAgeOptions = ['new', 'modern', 'established'];
  const furnishing = furnishingOptions[deterministicIndex(`furn-${seed}`, furnishingOptions.length)];
  const propertyAge = propertyAgeOptions[deterministicIndex(`age-${seed}`, propertyAgeOptions.length)];
  const petsAllowed = deterministicIndex(`pet-${seed}`, 2) === 1;
  const amenityIds = amenityMap
    .filter((entry) => (property.amenities || []).some((amenity) => entry.match.test(amenity)))
    .map((entry) => entry.id);

  return {
    ...property,
    furnishing,
    propertyAge,
    petsAllowed,
    amenityIds
  };
};

const readCache = () => {
  try {
    const raw = localStorage.getItem(BROWSE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.items)) return null;
    return parsed;
  } catch (_error) {
    return null;
  }
};

const writeCache = (items) => {
  try {
    localStorage.setItem(
      BROWSE_CACHE_KEY,
      JSON.stringify({
        items,
        syncedAt: new Date().toISOString()
      })
    );
  } catch (_error) {
    // no-op
  }
};

export const fetchBrowseSnapshot = ({ forceRefresh = false } = {}) =>
  new Promise((resolve, reject) => {
    const latencyMs = 450 + Math.floor(Math.random() * 900);

    window.setTimeout(() => {
      const shouldFail = localStorage.getItem('domihive_mock_fail_browse') === '1';
      if (shouldFail) {
        reject(new Error('Browse service unavailable. Try again.'));
        return;
      }

      const cached = !forceRefresh ? readCache() : null;
      if (cached?.items?.length) {
        resolve({
          items: cached.items,
          syncedAt: cached.syncedAt || new Date().toISOString(),
          source: 'cache'
        });
        return;
      }

      const generated = generateNigerianProperties(80).map(enrichProperty);
      writeCache(generated);
      resolve({
        items: generated,
        syncedAt: new Date().toISOString(),
        source: 'mock-db'
      });
    }, latencyMs);
  });
