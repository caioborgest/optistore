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
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    try {
      // Check if app is already installed
      setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
      setIsInstalled((window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches);

      // Check notification permission
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }

      // Listen for the beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        const event = e as BeforeInstallPromptEvent;
        event.preventDefault();
        setDeferredPrompt(event);
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

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    } catch (error) {
      console.error('PWA initialization error:', error);
    }
  }, [isInstalled]);

  const installApp = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install app error:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    } catch (error) {
      console.error('Notification permission error:', error);
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    try {
      if (notificationPermission === 'granted') {
        new Notification(title, {
          icon: '/favicon.ico',
          ...options
        });
      }
    } catch (error) {
      console.error('Show notification error:', error);
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
  };

  return {
    canInstall: !!deferredPrompt,
    isInstalled,
    isStandalone,
    showInstallPrompt,
    notificationPermission,
    installApp,
    dismissInstallPrompt,
    requestNotificationPermission,
    showNotification
  };
};