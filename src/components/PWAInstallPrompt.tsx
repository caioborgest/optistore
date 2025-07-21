
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor, Bell } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { useToast } from '@/hooks/use-toast';

const PWAInstallPrompt = () => {
  const { 
    showInstallPrompt, 
    installApp, 
    dismissInstallPrompt, 
    isStandalone,
    requestNotificationPermission,
    notificationPermission
  } = usePWA();
  const { toast } = useToast();

  useEffect(() => {
    // Solicitar permissão de notificação após instalação
    if (isStandalone && notificationPermission === 'default') {
      setTimeout(() => {
        requestNotificationPermission();
      }, 2000);
    }
  }, [isStandalone, notificationPermission, requestNotificationPermission]);

  const handleInstallClick = async () => {
    try {
      await installApp();
      toast({
        title: 'App instalado!',
        description: 'OptiFlow foi instalado com sucesso'
      });
    } catch (error) {
      toast({
        title: 'Erro na instalação',
        description: 'Não foi possível instalar o app',
        variant: 'destructive'
      });
    }
  };

  // Don't show if already installed or in standalone mode
  if (!showInstallPrompt || isStandalone) {
    return null;
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 shadow-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <img 
                src="/lovable-uploads/d1b1dde5-6ded-4c8e-9c7a-d0128ee74001.png" 
                alt="OptiFlow" 
                className="h-5 w-5"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Instalar OptiFlow
              </h3>
              <p className="text-xs text-gray-600">
                Acesso rápido e offline
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={dismissInstallPrompt}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Monitor className="h-3 w-3" />
            <span>Funciona offline</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Bell className="h-3 w-3" />
            <span>Notificações push</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Download className="h-3 w-3" />
            <span>Atualizações automáticas</span>
          </div>
        </div>

        {isIOS && isSafari ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 mb-2">
              Para instalar:
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <div>1. Toque em <span className="font-medium">⬆️ Compartilhar</span></div>
              <div>2. Selecione <span className="font-medium">"Adicionar à Tela Inicial"</span></div>
            </div>
          </div>
        ) : (
          <Button 
            onClick={handleInstallClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
          >
            <Download className="h-4 w-4 mr-2" />
            Instalar Agora
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;
