import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Floating PWA Install Alert
 * Shows as a floating toast/banner with Install button
 * Dismisses when user clicks Install or Close
 */
const FloatingInstallAlert: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed in this session
    if (dismissed) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('✓ beforeinstallprompt event fired - showing install alert');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAlert(true);
    };

    const handleAppInstalled = () => {
      console.log('✓ App installed successfully');
      setShowAlert(false);
      setDismissed(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Fallback: Show alert after 2 seconds if beforeinstallprompt doesn't fire
    // This provides visual feedback even on non-installable browsers
    const timeout = setTimeout(() => {
      if (!deferredPrompt && !dismissed) {
        console.log('⚠️ beforeinstallprompt didn\'t fire - may not be on HTTPS or already installed');
      }
    }, 2000);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [dismissed, deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log('Install prompt not available');
      setShowAlert(false);
      return;
    }

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`User response: ${outcome}`);
      setShowAlert(false);
      setDismissed(true);
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleClose = () => {
    setShowAlert(false);
    setDismissed(true);
  };

  if (!showAlert) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300 md:bottom-6 md:right-6 md:left-auto">
      {/* Floating Alert Card */}
      <div className="w-full max-w-md bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-4 md:p-5 min-w-max md:min-w-96 backdrop-blur-sm border-0 md:border md:border-white/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 bg-white/20 p-2 rounded-lg">
            <Download size={20} className="text-white" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm md:text-base">
              Install PureScreen App            </h3>
            <p className="text-white/80 text-xs md:text-sm">
              Add to Purescreen to your device for better experience.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-50 transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              {isInstalling ? (
                <>
                  <span className="animate-spin text-xs">⏳</span>
                  <span>Installing</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Install</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleClose}
              disabled={isInstalling}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Accent bar */}
        <div className="absolute bottom-0 left-0 w-16 h-1 bg-gradient-to-r from-red-500 to-transparent rounded-bl-2xl" />
      </div>

      {/* Subtle background blur effect */}
      <style>{`
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: slideInFromBottom 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FloatingInstallAlert;
