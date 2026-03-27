import { getPublishedUnitListings } from '../../../shared/services/adminListings';

const BROWSE_CACHE_KEY = 'domihive_browse_cache_v2';

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
    const latencyMs = 220 + Math.floor(Math.random() * 260);

    window.setTimeout(() => {
      const shouldFail = localStorage.getItem('domihive_mock_fail_browse') === '1';
      if (shouldFail) {
        reject(new Error('Browse service unavailable. Try again.'));
        return;
      }

      const listings = getPublishedUnitListings();
      writeCache(listings);
      resolve({
        items: listings,
        syncedAt: new Date().toISOString(),
        source: 'admin-units'
      });
    }, latencyMs);
  });
