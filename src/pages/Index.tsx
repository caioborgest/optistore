
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import { RoleDashboard } from '../components/dashboard/RoleDashboard';
import TaskManager from '../components/TaskManager';
import Calendar from '../components/Calendar';
import Chat from '../components/Chat';
import Reports from '../components/Reports';
import Settings from '../components/Settings';
import { CompanySettings } from '../components/CompanySettings';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import { useIsMobile } from '../hooks/use-mobile';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const { user, userProfile, isAuthenticated, loading } = useAuth();
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
    return <Login />;
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
            <Routes>
              <Route path="/" element={<RoleDashboard userProfile={userProfile} />} />
              <Route path="/dashboard" element={<RoleDashboard userProfile={userProfile} />} />
              <Route path="/tasks" element={<TaskManager />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/company" element={<CompanySettings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
