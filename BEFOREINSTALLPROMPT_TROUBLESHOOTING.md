# beforeinstallprompt Not Firing - Troubleshooting Guide

## Quick Diagnostics

Run this in the browser console:
```javascript
pwaDiagnostics()
```

This will check all 5 requirements and suggest fixes.

---

## ⚠️ IMPORTANT: HTTP vs HTTPS

**For LOCAL DEVELOPMENT** (testing on your machine):
- ✅ `http://localhost:3000` - Works fine for PWA testing
- ✅ `http://127.0.0.1:3000` - Also works
- ❌ Don't use the Network IP address (like 10.166.175.151) - Those don't have `beforeinstallprompt`

**For PRODUCTION** (when you deploy):
- ✅ HTTPS is required - Browsers automatically fire `beforeinstallprompt` on `https://` URLs
- ✅ Your server must have valid SSL certificates

The dev server runs on `http://localhost:3000` which is perfectly fine for local development!

---

### ❌ Issue 1: Browser Says "Not Secure" or SSL Error

**Error Message**: "This site can't provide a secure connection" or "ERR_SSL_VERSION_OR_CIPHER_MISMATCH"

**Why it happens**: Vite dev server is trying to use HTTPS but certificate generation failed

**Fix** (Simple - Use HTTP on localhost):
- ✅ Just use `http://localhost:3000` - It works perfectly for PWA testing!
- `beforeinstallprompt` fires on `localhost` even over HTTP
- This is only an issue for Network IPs or production

If you accidentally visit the Network IP address:
- ❌ Don't use: `https://10.166.175.151:3000/` 
- ✅ Always use: `http://localhost:3000/`

**Error Message**: "Service Worker: No registrations found"

**Why it happens**: SW registration fails or takes too long

**Fixes**:
1. **Hard reload** the page: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check **DevTools → Network** tab:
   - Look for `/sw.js` request
   - Should return **200 OK** (not 404 or error)
3. Check **DevTools → Application → Service Workers**:
   - Should show active registration
   - Status should be "activated and running"

**If still not working**:
```javascript
// Clear ALL caches and unregister
caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))));
navigator.serviceWorker.getRegistrations().then(regs => Promise.all(regs.map(r => r.unregister())));
// Then reload
location.reload();
```

---

### ❌ Issue 3: Manifest File Issues

**Error Message**: "Manifest: Invalid - Missing: [field]"

**Why it happens**: `site.webmanifest` is missing required fields

**Fixes**:
Check [site.webmanifest](../site.webmanifest) has these required fields:
```json
{
  "name": "GospelScreen TV",
  "short_name": "GospelScreen",
  "start_url": "/",
  "display": "standalone",
  "icons": [
    { "src": "/icons/...", "sizes": "192x192", "type": "image/png" }
  ]
}
```

**Verify it loads**:
1. Open DevTools → Network
2. Filter by "manifest"
3. Click on `site.webmanifest`
4. Status should be **200**
5. Preview should show JSON

---

### ❌ Issue 4: Browser Doesn't Support beforeinstallprompt

**Error Message**: "beforeinstallprompt not supported on this browser"

**Why it happens**: Your browser doesn't support PWA installation prompts

**Supported Browsers**:
- ✅ **Android Chrome** (v50+) - Best support
- ✅ **Android Edge** (v79+)
- ✅ **Android Firefox** (Recent)
- ✅ **Android Opera**
- ❌ **iPhone/iPad Safari** - Uses different mechanism
- ❌ **Desktop browsers** - Typically don't show prompt
- ❌ **Old browsers** - Update to latest version

**For Desktop Testing**:
Use Chrome DevTools device emulation:
1. Open DevTools (`F12`)
2. Click device toggle icon (top-left)
3. Select "Moto G4" or similar Android device
4. Reload page
5. Install prompt should appear

---

### ❌ Issue 5: beforeinstallprompt Event Fires But No Button

**Why it happens**: Event is firing but React state isn't updating

**Fixes**:
1. Check console for: `✓ beforeinstallprompt FIRED!`
2. Check console for: `✓ Install button now visible`
3. If you see the button is marked "visible" but not showing:
   - The component might be hidden by CSS
   - Check if `PWAInstallButton` component is in your Navbar
   - Look in [components/Navbar.tsx](../components/Navbar.tsx)

---

## Step-by-Step Testing Checklist

- [ ] **1. Check Protocol**
  ```javascript
  console.log(window.location.protocol); // Should be https: or localhost
  ```

- [ ] **2. Check Manifest**
  ```javascript
  fetch('/site.webmanifest').then(r => r.json()).then(console.log);
  ```

- [ ] **3. Check Service Worker**
  ```javascript
  navigator.serviceWorker.getRegistrations().then(console.log);
  ```

- [ ] **4. Check beforeinstallprompt Support**
  ```javascript
  console.log('beforeinstallprompt' in window); // Should be true
  ```

- [ ] **5. Run Full Diagnostics**
  ```javascript
  pwaDiagnostics();
  ```

- [ ] **6. Test on Real Device**
  - Visit on Android phone with Chrome
  - Should show "Install App" button after 2-3 seconds
  - Tap button → see install confirmation

---

## Where to Look in Code

| Component | File | Purpose |
|-----------|------|---------|
| Install Hook | [hooks/usePWAInstall.ts](../hooks/usePWAInstall.ts) | Listens for beforeinstallprompt |
| Install Button | [components/PWAInstallButton.tsx](../components/PWAInstallButton.tsx) | Shows install UI |
| Manifest | [site.webmanifest](../site.webmanifest) | PWA metadata |
| Service Worker | [sw.js](../sw.js) | Offline support |
| Vite Config | [vite.config.ts](../vite.config.ts) | HTTPS setup |

---

## Advanced Debugging

### Monitor beforeinstallprompt in Real-Time
```javascript
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('🎉 beforeinstallprompt fired!', e);
});

window.addEventListener('appinstalled', (e) => {
  console.log('✓ App installed!', e);
});
```

### Check All Registered Event Listeners (Chrome)
1. Open DevTools
2. Go to **Sources tab**
3. Click on **Event listeners breakpoints** (right sidebar)
4. Filter for "beforeinstallprompt"

### Check Manifest Icons Load
```javascript
fetch('/site.webmanifest')
  .then(r => r.json())
  .then(manifest => {
    manifest.icons.forEach(icon => {
      console.log('Icon:', icon.src);
      fetch(icon.src).then(r => console.log(icon.src, r.status));
    });
  });
```

---

## Common Command Reference

```bash
# Start dev server with HTTPS
npm run dev

# Build for production
npm run build

# Run diagnostics in console
pwaDiagnostics()

# Clear all caches from console
caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))

# Unregister all service workers from console
navigator.serviceWorker.getRegistrations().then(regs => Promise.all(regs.map(r => r.unregister())))

# Check service worker status
navigator.serviceWorker.getRegistrations()
```

---

## Still Not Working?

1. ✅ Run `pwaDiagnostics()` → Fix any "FAILED" results
2. ✅ Hard reload (`Ctrl+Shift+R`)
3. ✅ Clear browser cache entirely
4. ✅ Test on Android Chrome device (not desktop)
5. ✅ Check Network tab for failed requests
6. ✅ Check browser console for error messages
7. ✅ Check if app is already installed (uninstall first)

See [PWA_SETUP_GUIDE.md](../PWA_SETUP_GUIDE.md) for full PWA documentation.
