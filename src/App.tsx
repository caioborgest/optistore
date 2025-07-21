
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from '@/hooks/useAuth';
import { usePWA } from '@/hooks/usePWA';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import CompanyRegister from '@/pages/auth/CompanyRegister';
import InviteRegister from '@/pages/auth/InviteRegister';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardPage from '@/pages/DashboardPage';
import TasksPage from '@/pages/TasksPage';
import CalendarPage from '@/pages/CalendarPage';
import ChatPage from '@/pages/ChatPage';
import ReportsPage from '@/pages/ReportsPage';
import SettingsPage from '@/pages/SettingsPage';
import CompanyPage from '@/pages/CompanyPage';
import UsersPage from '@/pages/UsersPage';
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
        {/* Auth Routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/company-register" element={<CompanyRegister />} />
        <Route path="/auth/invite" element={<InviteRegister />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/company" element={<ProtectedRoute><CompanyPage /></ProtectedRoute>} />
        
        {/* 404 */}
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
