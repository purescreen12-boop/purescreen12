# Progressive Web App (PWA) Setup Guide - GospelScreen TV

## ✅ Step 1: Web App Manifest
**File**: `site.webmanifest`
- Defines app metadata (name, icon, colors, description)
- Enables installation prompt on mobile browsers
- Linked in `index.html` via: `<link rel="manifest" href="/site.webmanifest" />`

## ✅ Step 2: Advanced Service Worker
**File**: `sw.js` (root folder)
- **Network-First Strategy** for dynamic pages (index.html) → ensures fresh content
- **Cache-First Strategy** for static assets (images, CSS, JS) → ensures performance
- Automatic cache versioning (STATIC_CACHE v3, DYNAMIC_CACHE v3)
- Offline fallback to `offline.html`
- Registered in `index.html`: `navigator.serviceWorker.register('/sw.js')`

### Cache Invalidation:
To force all users to fetch new assets, increment the version numbers:
```javascript
const STATIC_CACHE = 'static-v4';  // was v3
const DYNAMIC_CACHE = 'dynamic-v4'; // was v3
```

## ✅ Step 3: Install Prompt (beforeinstallprompt)

### Option A: React Hook (Recommended)
**Files**: 
- `hooks/usePWAInstall.ts` - Custom React hook
- `components/PWAInstallButton.tsx` - Install button component

**Usage in any React component**:
```tsx
import { usePWAInstall } from '../hooks/usePWAInstall';

const MyComponent = () => {
  const { isInstallable, installApp } = usePWAInstall();
  
  return isInstallable ? (
    <button onClick={installApp}>Install App</button>
  ) : null;
};
```

### Option B: Vanilla JavaScript
**File**: `public/pwa-install.js`

**Add to HTML**:
```html
<script src="/public/pwa-install.js"></script>
```

**HTML element required**:
```html
<button id="install_btn" style="display:none;">Install App</button>
```

### Option C: Direct Implementation (What was provided)
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const installbtn = document.getElementById('install_btn');
  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installbtn.style.display = 'inline';
  });

  installbtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      installbtn.style.display = 'none';
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('App installed!');
  });
});
```

## 🎨 Files Created & Updated

### New Files:
- ✅ `site.webmanifest` - Web app manifest
- ✅ `sw.js` - Service Worker with split caching strategy
- ✅ `offline.html` - Offline fallback page
- ✅ `hooks/usePWAInstall.ts` - React installation hook
- ✅ `components/PWAInstallButton.tsx` - Reusable install button
- ✅ `public/pwa-install.js` - Vanilla JavaScript install handler
- ✅ `utils/pwaManager.ts` - PWA lifecycle manager
- ✅ `components/PWADebugPanel.tsx` - Development debug panel

### Updated Files:
- ✅ `index.html` - Added manifest link, service worker registration, & PWA meta tags
- ✅ `components/Navbar.tsx` - Added PWAInstallButton to desktop & mobile views

## ✅ Step 4: Register Service Worker
**Location**: `<head>` element in `index.html`
- Registers `/sw.js` on page load
- Includes cache busting with `?v=3` parameter
- Logs registration scope for debugging
- Fires after page fully loads with `window.addEventListener('load')`

## ✅ Step 5: Unregister Service Worker (Optional)
**When to use**: Remove PWA features, debug issues, or reset cache

### Option A: HTML Comment (Easiest)
In `index.html`, uncomment the provided script block:
```html
<!-- Uncomment to remove Service Worker -->
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
    
    // Clear all caches
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
      });
    });
  }
</script>
```

### Option B: PWA Manager Utility (Programmatic)
**File**: `utils/pwaManager.ts`

**In React component**:
```tsx
import pwaManager from '../utils/pwaManager';

// Unregister and clear all cache
await pwaManager.unregister();

// Just clear cache
await pwaManager.clearCache();

// Check if installed
const isInstalled = pwaManager.isInstalled();

// Update service worker
await pwaManager.update();
```

### Option C: Debug Panel Component (Development)
**File**: `components/PWADebugPanel.tsx`

Add to your App component:
```tsx
import PWADebugPanel from './components/PWADebugPanel';

<PWADebugPanel /> {/* Shows only in development */}
```

Features:
- View registration status
- Clear cache
- Update service worker
- Completely unregister PWA
- Only visible in development mode

## 🚀 What This Enables

### ✅ For Users:
- **Install Prompt**: Automatic promotion to install on home screen
- **Offline Support**: App works when connection is lost
- **Fast Loading**: Cached assets load instantly
- **Native App Feel**: Standalone mode without browser chrome
- **Push Notifications**: Ready for future implementation

### ✅ For Your App:
- **Fresh Content**: Network-first for pages ensures latest videos/data
- **Performance**: Cache-first for assets means faster loads
- **Offline Fallback**: Users see helpful offline page instead of blank screen
- **Mobile Friendly**: Installable on Android & iOS (via Safari)

## 📱 Testing

### Chrome DevTools:
1. Open DevTools → Application tab
2. Check "Service Workers" section (should show `/sw.js`)
3. Check "Cache Storage" (see cached assets)
4. Simulate offline mode to test fallback

### Test Installation:
1. Open app on mobile (Android Chrome recommended)
2. Look for install banner or 3-dot menu → "Install app"
3. App installs as standalone app on home screen

### Force Cache Clear (for testing):
- In DevTools → Application → Clear site data
- Or increment version numbers: `v3` → `v4`

## ⚙️ Configuration

### Update App Icons:
Create/upload to `/icons/`:
- `icon-192x192.png`
- `icon-512x512.png`
- `maskable-icon-192x192.png`
- `maskable-icon-512x512.png`

### Update Screenshots:
Create/upload to `/screenshots/`:
- `screenshot-1280x720.png` (wide)
- `screenshot-720x1280.png` (mobile)

### Custom Colors:
Edit `site.webmanifest`:
```json
"theme_color": "#0a0a0a",
"background_color": "#0a0a0a"
```

### Cache Assets:
Edit `sw.js` `CORE_ASSETS` array to add more cached files.

## 🔄 Future Enhancements

- [ ] Push Notifications API
- [ ] Background Sync API
- [ ] Periodic Background Sync
- [ ] Share Target API (share videos)
- [ ] File Handling API
- [ ] Payment Request API (for subscriptions)

## 📚 Resources

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev PWA Learning](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Workbox Library](https://developers.google.com/web/tools/workbox) (advanced Service Worker management)
