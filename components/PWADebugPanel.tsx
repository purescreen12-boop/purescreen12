import React from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import pwaManager from '../utils/pwaManager';

/**
 * PWA Debug/Management Component
 * Use this in development to manage service worker registration
 * Hide in production
 */
const PWADebugPanel: React.FC = () => {
  const [registrations, setRegistrations] = React.useState<ServiceWorkerRegistration[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadRegistrations = async () => {
    const regs = await pwaManager.getRegistrations();
    setRegistrations(regs);
  };

  React.useEffect(() => {
    loadRegistrations();
  }, []);

  const handleUnregister = async () => {
    if (!confirm('Are you sure? This will remove all PWA features and cached data.')) {
      return;
    }

    setIsLoading(true);
    try {
      await pwaManager.unregister();
      setMessage({ text: '✓ Service Worker unregistered and cache cleared', type: 'success' });
      setRegistrations([]);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ text: '✗ Error unregistering service worker', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      await pwaManager.clearCache();
      setMessage({ text: '✓ All caches cleared', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ text: '✗ Error clearing cache', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await pwaManager.update();
      setMessage({ text: '✓ Service Worker update check completed', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ text: '✗ Error updating service worker', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadRegistrations();
  };

  const isInstalled = pwaManager.isInstalled();

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-sm shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={18} className="text-yellow-500" />
        <h3 className="font-bold text-white">PWA Debug</h3>
      </div>

      <div className="space-y-2 text-sm text-gray-300 mb-3">
        <p>
          <span className="text-gray-400">Status:</span>{' '}
          <span className={isInstalled ? 'text-green-400 font-semibold' : 'text-gray-400'}>
            {isInstalled ? '✓ Installed' : 'Not Installed'}
          </span>
        </p>
        <p>
          <span className="text-gray-400">Registrations:</span>{' '}
          <span className="font-semibold">{registrations.length}</span>
        </p>
      </div>

      {message && (
        <div
          className={`mb-3 p-2 rounded text-xs ${
            message.type === 'success'
              ? 'bg-green-900/30 text-green-300 border border-green-700'
              : 'bg-red-900/30 text-red-300 border border-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-xs font-medium text-white transition"
        >
          <RefreshCw size={14} />
          Refresh
        </button>

        <button
          onClick={handleUpdate}
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-xs font-medium text-white transition"
        >
          <RefreshCw size={14} />
          Update
        </button>

        <button
          onClick={handleClearCache}
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded text-xs font-medium text-white transition"
        >
          <Trash2 size={14} />
          Clear Cache
        </button>

        <button
          onClick={handleUnregister}
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded text-xs font-medium text-white transition"
        >
          <Trash2 size={14} />
          Unregister
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3">Development only • Hides in production</p>
    </div>
  );
};

export default PWADebugPanel;
