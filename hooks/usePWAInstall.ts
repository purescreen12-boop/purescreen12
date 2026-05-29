import { useState, useEffect } from 'react';

interface usePWAInstallReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  installApp: () => Promise<void>;
}

export const usePWAInstall = (): usePWAInstallReturn => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const setupPWAInstall = async () => {
      console.log('%c🔧 PWA Install Hook: Initializing', 'color: #d4af37; font-weight: bold;');
      
      // 1. Check protocol
      const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      console.log(`%c📡 Protocol: ${window.location.protocol} (${isHTTPS ? 'OK' : 'HTTPS required for PWA'})`, 'color: #a08a60');
      
      if (!isHTTPS) {
        console.warn('%c⚠️ HTTPS required: beforeinstallprompt requires HTTPS or localhost', 'color: #e8a857; font-weight: bold;');
      }

      // 2. Check manifest
      const manifest = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      console.log(`%c📋 Manifest: ${manifest?.href || 'NOT FOUND'}`, 'color: #a08a60');
      
      // 3. Wait for service worker to be registered
      let swRegistration: ServiceWorkerRegistration | null = null;
      try {
        if ('serviceWorker' in navigator) {
          swRegistration = await navigator.serviceWorker.ready;
          console.log('%c✓ Service Worker: Active', 'color: #d4af37; font-weight: bold;');
        }
      } catch (error) {
        console.warn('%c⚠️ Service Worker: Not ready yet', 'color: #e8a857;', error);
      }

      // 4. Check beforeinstallprompt support
      if (!('beforeinstallprompt' in window)) {
        console.warn('%c⚠️ beforeinstallprompt not supported on this browser/device', 'color: #e8a857; font-weight: bold;');
        console.log('%c💡 Note: Only available on Android Chrome, Edge, and some other browsers', 'color: #a08a60; font-style: italic;');
        return;
      }

      // 5. Setup event listeners
      const handleBeforeInstallPrompt = (e: Event) => {
        console.log('%c✓ beforeinstallprompt FIRED!', 'color: #d4af37; font-weight: bold; font-size: 14px;');
        e.preventDefault();
        
        if (isMounted) {
          setDeferredPrompt(e);
          setIsInstallable(true);
          console.log('%c✓ Install button now visible', 'color: #d4af37;');
        }
      };

      const handleAppInstalled = () => {
        console.log('%c✓ App Installed Successfully!', 'color: #d4af37; font-weight: bold; font-size: 14px;');
        if (isMounted) {
          setIsInstalled(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
        }
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      console.log('%c✓ Event listeners attached', 'color: #d4af37;');

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    };

    setupPWAInstall();

    return () => {
      isMounted = false;
    };
  }, []);

  const installApp = async (): Promise<void> => {
    if (!deferredPrompt) {
      console.log('%c❌ No deferred prompt available', 'color: #d4af37;');
      return;
    }

    try {
      console.log('%c🚀 Showing install prompt...', 'color: #d4af37; font-weight: bold;');
      deferredPrompt.prompt();
      
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('%c✓ User accepted installation', 'color: #d4af37; font-weight: bold;');
        setIsInstalled(true);
      } else {
        console.log('%c✓ User dismissed prompt', 'color: #e8a857;');
      }

      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('%c❌ Installation error:', 'color: #ff6b6b; font-weight: bold;', error);
    }
  };

  return { isInstallable, isInstalled, installApp };
};
