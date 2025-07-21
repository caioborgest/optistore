
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from '@/hooks/useAuth';
import { usePWA } from '@/hooks/usePWA';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import './App.css';

const queryClient = new QueryClient();

function AppContent() {
  const { showNotification } = usePWA();

  useEffect(() => {
    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_COMPLETE') {
          showNotification('Dados sincronizados', {
            body: 'Suas alterações foram salvas com sucesso',
            tag: 'sync-complete'
          });
        }
      });
    }
  }, [showNotification]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <PWAInstallPrompt />
      <Toaster />
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
