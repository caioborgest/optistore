import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    setIsInstalled((window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      event.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(event);
      // Show install button if not already installed
      if (!isInstalled) {
        setShowInstallPrompt(true);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const installApp = async () => {
    if (!deferredPrompt) {
      // Fallback for Safari on iOS
      if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
        alert('Para instalar este app:\n1. Toque no botão de compartilhar\n2. Selecione "Adicionar à tela inicial"');
        return;
      }
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowInstallPrompt(false);
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
  };

  return {
    canInstall: !!deferredPrompt,
    isInstalled,
    isStandalone,
    showInstallPrompt,
    installApp,
    dismissInstallPrompt
  };
};