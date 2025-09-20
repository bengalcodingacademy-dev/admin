// Cache clearing utilities

/**
 * Clear all browser caches
 */
export const clearAllCaches = async () => {
  try {
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }

    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear IndexedDB (if used)
    if ('indexedDB' in window) {
      // You can add specific IndexedDB clearing logic here if needed
    }

    console.log('All caches cleared successfully');
  } catch (error) {
    console.error('Error clearing caches:', error);
  }
};

/**
 * Force reload the page with cache clearing
 */
export const forceReload = () => {
  // Clear caches first
  clearAllCaches();
  
  // Force reload without cache
  window.location.reload(true);
};

/**
 * Add cache-busting to URLs
 */
export const addCacheBuster = (url) => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_cb=${Date.now()}`;
};

/**
 * Clear specific cache by URL pattern
 */
export const clearCacheByPattern = async (pattern) => {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          if (request.url.includes(pattern)) {
            await cache.delete(request);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error clearing cache by pattern:', error);
  }
};
