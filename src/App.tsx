
import React, { lazy, Suspense, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';
import { CustomThemeProvider } from '@/hooks/useCustomTheme';
import { A11yProvider } from '@/hooks/useA11y';
import { PageTransition } from '@/components/ui/page-transition';
import ProtectedRoute from '@/components/ProtectedRoute';

// Import styles
import './App.css';
import './styles/theme.css';
import './styles/accessibility.css';
import './styles/fonts.css';

// Lazy loaded components for better performance
const NotFound = lazy(() => import('@/pages/NotFound'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const CompanyRegister = lazy(() => import('@/pages/auth/CompanyRegister'));
const InviteRegister = lazy(() => import('@/pages/auth/InviteRegister'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const TasksPage = lazy(() => import('@/pages/TasksPage'));
const CalendarPage = lazy(() => import('@/pages/CalendarPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const CompanyPage = lazy(() => import('@/pages/CompanyPage'));
const UsersPage = lazy(() => import('@/pages/UsersPage'));
const IntegrationsPage = lazy(() => import('@/pages/IntegrationsPage'));
const TestPage = lazy(() => import('@/pages/TestPage'));

// Loading component with accessibility
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Carregando">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="sr-only">Carregando...</span>
  </div>
);

function App() {
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
      },
    },
  }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CustomThemeProvider>
          <A11yProvider>
            <TooltipProvider>
              <AuthProvider>
                <Router>
                  <PageTransition>
                    <Suspense fallback={<Loading />}>
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
                        <Route path="/integrations" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
                        <Route path="/test" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />
                        
                        {/* 404 */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </PageTransition>
                  <Toaster />
                </Router>
              </AuthProvider>
            </TooltipProvider>
          </A11yProvider>
        </CustomThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
