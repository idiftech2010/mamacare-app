import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    console.log('InstallPrompt: Component mounted');
    
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('InstallPrompt: beforeinstallprompt event fired', e);
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    console.log('InstallPrompt: Added event listener');

    // Check if app is already installed
    if ('serviceWorker' in navigator && 'standalone' in window.navigator) {
      console.log('InstallPrompt: iOS Safari detected');
      // iOS Safari
      setCanInstall(true);
    } else if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('InstallPrompt: App already installed');
      // Already installed
      setCanInstall(false);
    } else {
      console.log('InstallPrompt: App is installable');
      // Check for installability
      setCanInstall(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      console.log('InstallPrompt: Removed event listener');
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
        setCanInstall(false);
      });
    } else {
      // Fallback for browsers that don't support beforeinstallprompt
      alert('To install MamaCare, please use your browser\'s install option or add to home screen.');
    }
  };

  const handleDismiss = () => {
    setCanInstall(false);
  };

  // Show prompt if we have deferred prompt or if it's generally installable and not dismissed
  if (!canInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-lg border border-mamacare-champagne p-4 z-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-mamacare-coral" />
          <h3 className="font-semibold text-mamacare-charcoal">Install MamaCare</h3>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Install MamaCare on your device for a better experience with offline access and quick launch.
        {deferredPrompt ? ' (PWA ready)' : ' (Manual install)'}
      </p>
      <Button
        onClick={handleInstallClick}
        className="w-full bg-mamacare-coral hover:bg-mamacare-coral-dark text-white"
      >
        {deferredPrompt ? 'Install App' : 'Add to Home Screen'}
      </Button>
    </div>
  );
}