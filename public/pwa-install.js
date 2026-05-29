/**
 * PWA Install Prompt Handler
 * 
 * This script handles the beforeinstallprompt event and allows users to install
 * GospelScreen TV as a native-like application on their devices.
 * 
 * Usage: Include this script in your HTML or import it in your React app
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPWAInstall);
  } else {
    initPWAInstall();
  }

  function initPWAInstall() {
    const installBtn = document.getElementById('install_btn');
    let deferredPrompt;

    /**
     * Handle beforeinstallprompt event
     * This event fires when the browser detects the app can be installed
     */
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Store the deferredPrompt for later use
      deferredPrompt = e;
      
      // Show the install button if it exists
      if (installBtn) {
        installBtn.style.display = 'inline';
        console.log('PWA install prompt is available');
      }
    });

    /**
     * Handle install button click
     */
    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) {
          console.log('Installation prompt not available');
          return;
        }

        try {
          // Show the install prompt
          deferredPrompt.prompt();
          
          // Wait for user to respond to the prompt
          const { outcome } = await deferredPrompt.userChoice;
          
          if (outcome === 'accepted') {
            console.log('✓ PureScreen app installed successfully!');
            installBtn.style.display = 'none';
          } else {
            console.log('User dismissed the install prompt');
          }

          // Clear the deferredPrompt
          deferredPrompt = null;
        } catch (error) {
          console.error('Error during PWA installation:', error);
        }
      });
    }

    /**
     * Handle app installed event
     * This event fires after the app has been successfully installed
     */
    window.addEventListener('appinstalled', () => {
      console.log('✓ PureScreen is now installed!');
      
      // Hide the install button
      if (installBtn) {
        installBtn.style.display = 'none';
      }
      
      // Clear the deferredPrompt
      deferredPrompt = null;
      
      // You can add custom logic here after installation
      // For example: track analytics, show a confirmation message, etc.
    });

    /**
     * Check if PWA is already installed
     * Modern browsers set this on app loaded context
     */
    if (window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is running in standalone mode (already installed)');
      if (installBtn) {
        installBtn.style.display = 'none';
      }
    }
  }
})();
