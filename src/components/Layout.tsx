import React from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';
import PWAInstallPrompt from './PWAInstallPrompt';
import { useIsMobile } from '../hooks/use-mobile';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userProfile) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={cn(
        "flex h-screen",
        isMobile ? "flex-col" : "flex-row"
      )}>
        <Sidebar userProfile={userProfile} />
        
        <main className={cn(
          "flex-1 overflow-auto",
          isMobile ? "pt-16" : ""
        )}>
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
      <PWAInstallPrompt />
    </div>
  );
};

export default Layout;