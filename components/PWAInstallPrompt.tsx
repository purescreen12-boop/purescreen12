import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Custom PWA Install Prompt Banner
 * Shows when the app is installable (like the WeLib example)
 */
const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('✓ beforeinstallprompt event triggered');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('✓ App installed!');
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('✓ User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }

      setShowPrompt(false);
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during installation:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store that user dismissed it (optional - show again next session)
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Banner */}
      <div className="relative mx-auto max-w-2xl mt-20 mx-4 md:mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-6 md:p-8">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg">
              <Download size={24} className="text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Install PureScreen on your device
            </h2>
            <p className="text-white/90 text-base md:text-lg mb-6">
              Add PureScreen to your home screen for a better experience
            </p>

            {/* Buttons */}
            <div className="flex gap-3 items-center">
              <button
                onClick={handleDismiss}
                disabled={isInstalling}
                className="px-6 py-2 text-white border-2 border-white/60 rounded-lg font-semibold hover:bg-white/10 transition-all disabled:opacity-50 cursor-pointer"
              >
                Not now
              </button>
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="px-8 py-2 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isInstalling ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Installing...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Install
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Decorative accent */}
        <div className="absolute bottom-0 left-0 w-32 h-1 bg-gradient-to-r from-red-500 to-transparent rounded-bl-2xl" />
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
