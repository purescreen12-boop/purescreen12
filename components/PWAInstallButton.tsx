import React from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  showText?: boolean;
}

const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '', 
  showText = true 
}) => {
  const { isInstallable, installApp } = usePWAInstall();

  if (!isInstallable) {
    return null;
  }

  return (
    <button
      id="install_btn"
      onClick={installApp}
      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${className}`}
      title="Install PureScreen TV as an app"
      aria-label="Install PureScreen TV app"
    >
      <Download size={20} />
      {showText && <span>Install App</span>}
    </button>
  );
};

export default PWAInstallButton;
