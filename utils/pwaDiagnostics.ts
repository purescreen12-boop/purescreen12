/**
 * PWA Diagnostics Utility
 * Call this from browser console: window.pwaDiagnostics()
 * Shows detailed information about PWA readiness
 */

interface DiagnosticResult {
  protocol: { pass: boolean; message: string };
  serviceWorker: { pass: boolean; message: string };
  manifest: { pass: boolean; message: string };
  beforeinstallprompt: { pass: boolean; message: string };
  caches: { pass: boolean; message: string; details?: string[] };
  overall: boolean;
}

export const pwaDiagnostics = (): DiagnosticResult => {
  const results: DiagnosticResult = {
    protocol: { pass: false, message: '' },
    serviceWorker: { pass: false, message: '' },
    manifest: { pass: false, message: '' },
    beforeinstallprompt: { pass: false, message: '' },
    caches: { pass: false, message: '' },
    overall: false,
  };

  console.clear();
  console.log('%c🔍 PureScreen PWA Diagnostics', 'font-size: 16px; font-weight: bold; color: #ff6b35;');
  console.log('%c' + '='.repeat(50), 'color: #777;');

  // 1. Protocol Check
  const isSecure =
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  results.protocol = {
    pass: isSecure,
    message: `${window.location.protocol}//${window.location.host}${isSecure ? ' ✓' : ' ✗ HTTPS/Localhost required'}`,
  };

  console.log(
    `%c1. Protocol: ${results.protocol.message}`,
    results.protocol.pass ? 'color: #00a86b; font-weight: bold;' : 'color: #ff6b35; font-weight: bold;'
  );

  // 2. Service Worker Check
  const checkSW = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) {
          results.serviceWorker = {
            pass: true,
            message: `${registrations.length} registration(s) found - Active: ${registrations[0]?.active ? 'Yes' : 'No'}`,
          };
        } else {
          results.serviceWorker = {
            pass: false,
            message: 'No registrations found - Reload page after fixing',
          };
        }
      } catch (error) {
        results.serviceWorker = {
          pass: false,
          message: `Error checking SW: ${error}`,
        };
      }
    } else {
      results.serviceWorker = {
        pass: false,
        message: 'Service Workers not supported in this browser',
      };
    }

    console.log(
      `%c2. Service Worker: ${results.serviceWorker.message}`,
      results.serviceWorker.pass ? 'color: #00a86b; font-weight: bold;' : 'color: #ff6b35; font-weight: bold;'
    );
  };

  // 3. Manifest Check
  const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
  if (manifestLink) {
    results.manifest = {
      pass: true,
      message: `Found: ${manifestLink.href}`,
    };

    // Try to fetch and validate manifest
    fetch(manifestLink.href)
      .then((res) => res.json())
      .then((manifest) => {
        const errors: string[] = [];
        if (!manifest.name) errors.push('Missing: name');
        if (!manifest.start_url) errors.push('Missing: start_url');
        if (!manifest.icons || manifest.icons.length === 0) errors.push('Missing: icons');
        if (!manifest.display) errors.push('Missing: display');

        if (errors.length === 0) {
          console.log(`%c3. Manifest: Valid ✓`, 'color: #00a86b; font-weight: bold;');
        } else {
          console.log(
            `%c3. Manifest: Invalid - ${errors.join(', ')}`,
            'color: #ff9500; font-weight: bold;'
          );
          results.manifest.pass = false;
        }
      })
      .catch((error) => {
        console.log(`%c3. Manifest: Error loading - ${error}`, 'color: #ff6b35; font-weight: bold;');
        results.manifest.pass = false;
      });
  } else {
    results.manifest = {
      pass: false,
      message: 'Manifest link not found in HTML head',
    };
    console.log(`%c3. Manifest: ${results.manifest.message}`, 'color: #ff6b35; font-weight: bold;');
  }

  // 4. beforeinstallprompt Support
  results.beforeinstallprompt = {
    pass: 'beforeinstallprompt' in window,
    message: 'beforeinstallprompt' in window
      ? '✓ Supported (will be available when ready)'
      : '✗ Not supported (Android Chrome, Edge, or other capable browsers only)',
  };

  console.log(
    `%c4. beforeinstallprompt: ${results.beforeinstallprompt.message}`,
    results.beforeinstallprompt.pass ? 'color: #00a86b; font-weight: bold;' : 'color: #ff9500; font-weight: bold;'
  );

  // 5. Caches Check
  if ('caches' in window) {
    caches
      .keys()
      .then((cacheNames) => {
        results.caches = {
          pass: cacheNames.length > 0,
          message: `${cacheNames.length} cache(s) found`,
          details: cacheNames,
        };

        console.log(
          `%c5. Caches: ${results.caches.message}`,
          results.caches.pass ? 'color: #00a86b; font-weight: bold;' : 'color: #ff9500; font-weight: bold;'
        );

        if (cacheNames.length > 0) {
          console.table(cacheNames);
        }
      })
      .catch((error) => {
        results.caches = {
          pass: false,
          message: `Error accessing caches: ${error}`,
        };
        console.log(`%c5. Caches: ${results.caches.message}`, 'color: #ff6b35; font-weight: bold;');
      });
  } else {
    results.caches = {
      pass: false,
      message: 'Cache API not supported',
    };
    console.log(`%c5. Caches: ${results.caches.message}`, 'color: #ff6b35; font-weight: bold;');
  }

  // Final Summary - run after SW check
  checkSW().then(() => {
    results.overall =
      results.protocol.pass &&
      results.serviceWorker.pass &&
      results.manifest.pass &&
      results.beforeinstallprompt.pass;

    console.log('%c' + '='.repeat(50), 'color: #777;');
    console.log(
      `%c${results.overall ? '✓ PWA READY' : '✗ PWA NOT READY - See issues above'}`,
      `font-size: 14px; font-weight: bold; color: ${results.overall ? '#00a86b' : '#ff6b35'};`
    );

    console.log('%c', '');
    console.log('%c📋 QUICK FIXES:', 'font-weight: bold; color: #ff9500;');
    
    if (!results.protocol.pass) {
      console.log('  • Use HTTPS or localhost:3000');
    }
    if (!results.serviceWorker.pass) {
      console.log('  • Reload page and wait 2 seconds');
      console.log('  • Check Network tab in DevTools for /sw.js');
    }
    if (!results.manifest.pass) {
      console.log('  • Verify site.webmanifest exists and is linked in index.html');
    }
    if (!results.beforeinstallprompt.pass) {
      console.log('  • Use Android Chrome, Edge, or other capable browser');
      console.log('  • Check device requirements');
    }

    console.log('%c', '');
    console.log('%c💡 TESTING INSTALL PROMPT:', 'font-weight: bold; color: #4a90e2;');
    console.log('  • Install button should appear once SW is ready');
    console.log('  • Check console for "beforeinstallprompt FIRED!" message');
    console.log('  • Clear cache if you do not see the button: caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))));');
  });

  return results;
};

// Make it globally available in development
if (typeof window !== 'undefined') {
  (window as any).pwaDiagnostics = pwaDiagnostics;
  console.log('%c💡 PWA Diagnostics available: Run pwaDiagnostics() in console', 'color: #4a90e2; font-style: italic;');
}

export default pwaDiagnostics;
