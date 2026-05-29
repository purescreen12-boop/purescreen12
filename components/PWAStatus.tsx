import React, { useState, useEffect } from 'react';

interface PWAStatusProps {
  showDebug?: boolean;
}

/**
 * PWA Status Checker - Shows diagnostic info and fallback install button
 */
const PWAStatus: React.FC<PWAStatusProps> = ({ showDebug = false }) => {
  const [swRegistered, setSwRegistered] = useState(false);
  const [manifestLoaded, setManifestLoaded] = useState(false);
  const [supportedOnDevice, setSupportedOnDevice] = useState(false);

  useEffect(() => {
    // Check Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        setSwRegistered(registrations.length > 0);
        console.log(`✓ Service Workers registered: ${registrations.length}`);
      });
    }

    // Check Manifest
    const links = document.querySelectorAll('link[rel="manifest"]');
    setManifestLoaded(links.length > 0);
    console.log(`✓ Manifest link found: ${links.length > 0}`);

    // Check if on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    setSupportedOnDevice(isMobile);
    console.log(`✓ Device type: ${isMobile ? 'Mobile' : 'Desktop'}`);

    // Log all diagnostics
    console.log('=== PWA Diagnostics ===');
    console.log('Service Worker:', swRegistered ? '✓' : '✗');
    console.log('Manifest:', manifestLoaded ? '✓' : '✗');
    console.log('Mobile Device:', isMobile);
    console.log('beforeinstallprompt:', 'beforeinstallprompt' in window ? '✓' : '✗');
  }, []);

  if (!showDebug) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 bg-gray-900 border border-gray-700 rounded-lg p-3 max-w-xs shadow-lg text-xs">
      <h4 className="font-bold text-yellow-400 mb-2">PWA Status</h4>
      <div className="space-y-1 text-gray-300">
        <p>
          Service Worker:{' '}
          <span className={swRegistered ? 'text-green-400' : 'text-red-400'}>
            {swRegistered ? '✓' : '✗'}
          </span>
        </p>
        <p>
          Manifest:{' '}
          <span className={manifestLoaded ? 'text-green-400' : 'text-red-400'}>
            {manifestLoaded ? '✓' : '✗'}
          </span>
        </p>
        <p>
          Mobile Device:{' '}
          <span className={supportedOnDevice ? 'text-green-400' : 'text-orange-400'}>
            {supportedOnDevice ? '✓' : '(Desktop)'}
          </span>
        </p>
        <p className="text-gray-500 mt-2">
          💡 Open DevTools (F12) → Console to see full logs
        </p>
      </div>
    </div>
  );
};

export default PWAStatus;
