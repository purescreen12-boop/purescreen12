/**
 * PWA Service Worker Manager
 * Handle registration, unregistration, and lifecycle management
 */

export const pwaManager = {
  /**
   * Register the Service Worker
   */
  register: async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers are not supported in this browser');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✓ Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('✗ Service Worker registration failed:', error);
      return null;
    }
  },

  /**
   * Unregister all Service Workers and clear cache
   * Use this when you want to completely remove PWA features
   */
  unregister: async (): Promise<void> => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers are not supported in this browser');
      return;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (let registration of registrations) {
        const isUnregistered = await registration.unregister();
        if (isUnregistered) {
          console.log('✓ Service Worker unregistered:', registration.scope);
        }
      }

      // Clear all caches
      const cacheNames = await caches.keys();
      for (let cacheName of cacheNames) {
        const isDeleted = await caches.delete(cacheName);
        if (isDeleted) {
          console.log('✓ Cache deleted:', cacheName);
        }
      }

      console.log('✓ All Service Workers and caches cleared');
    } catch (error) {
      console.error('✗ Error unregistering Service Workers:', error);
    }
  },

  /**
   * Update the Service Worker (check for new version)
   */
  update: async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers are not supported in this browser');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const updated = await registration.update();
      console.log('✓ Service Worker update check completed');
      return updated;
    } catch (error) {
      console.error('✗ Service Worker update failed:', error);
      return null;
    }
  },

  /**
   * Get current Service Worker registrations
   */
  getRegistrations: async (): Promise<ServiceWorkerRegistration[]> => {
    if (!('serviceWorker' in navigator)) {
      return [];
    }

    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      return [...regs] as ServiceWorkerRegistration[];
    } catch (error) {
      console.error('✗ Error getting Service Worker registrations:', error);
      return [];
    }
  },

  /**
   * Clear all caches
   */
  clearCache: async (): Promise<void> => {
    try {
      const cacheNames = await caches.keys();
      for (let cacheName of cacheNames) {
        await caches.delete(cacheName);
      }
      console.log('✓ All caches cleared');
    } catch (error) {
      console.error('✗ Error clearing cache:', error);
    }
  },

  /**
   * Check if app is running in standalone mode (installed)
   */
  isInstalled: (): boolean => {
    return (
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches
    );
  },

  /**
   * Skip waiting (force new SW to activate immediately)
   */
  skipWaiting: async (): Promise<void> => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    registrations.forEach((registration) => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });
    console.log('Skip waiting message sent to Service Worker');
  },
};

export default pwaManager;
