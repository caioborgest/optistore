
import React from 'react';
import { Navigate } from 'react-router-dom';
import { ModernSidebar } from './ModernSidebar';
import { useAuth } from '@/hooks/useAuth';
import PWAInstallPrompt from './PWAInstallPrompt';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { userProfile, isAuthenticated, loading } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userProfile) {
    return <Navigate to="/auth/login" replace />;
  }

  // Garantir que userProfile tenha valores válidos
  console.log('Layout rendering with userProfile:', userProfile);

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <ModernSidebar userProfile={userProfile} />
        
        {/* Conteúdo principal */}
        <main className={cn(
          "flex-1 overflow-auto",
          isMobile ? "pt-16" : "ml-64"
        )}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      <PWAInstallPrompt />
    </div>
  );
};

export default Layout;
