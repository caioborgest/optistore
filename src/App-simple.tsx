import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from '@/hooks/useAuth';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import CompanyRegister from '@/pages/auth/CompanyRegister';
import InviteRegister from '@/pages/auth/InviteRegister';
import DashboardPage from '@/pages/DashboardPage';
import './App.css';

const queryClient = new QueryClient();

function SimpleApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Auth Routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/company-register" element={<CompanyRegister />} />
              <Route path="/auth/invite" element={<InviteRegister />} />
              
              {/* Simple Dashboard */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Fallback */}
              <Route path="*" element={<div className="p-8 text-center"><h1>Página não encontrada</h1></div>} />
            </Routes>
            <Toaster />
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default SimpleApp;