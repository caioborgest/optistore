import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const DashboardPage = () => {
  const { userProfile, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userProfile) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo, {userProfile.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Dashboard do OptiFlow - Sistema de Gestão
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tarefas</h3>
            <p className="text-gray-600">Gerencie suas tarefas diárias</p>
            <div className="mt-4">
              <span className="text-2xl font-bold text-primary">0</span>
              <span className="text-gray-500 ml-2">pendentes</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendário</h3>
            <p className="text-gray-600">Visualize seus compromissos</p>
            <div className="mt-4">
              <span className="text-2xl font-bold text-primary">0</span>
              <span className="text-gray-500 ml-2">hoje</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mensagens</h3>
            <p className="text-gray-600">Chat com sua equipe</p>
            <div className="mt-4">
              <span className="text-2xl font-bold text-purple-600">0</span>
              <span className="text-gray-500 ml-2">não lidas</span>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Usuário</h3>
          <div className="space-y-2">
            <p><strong>Nome:</strong> {userProfile.name}</p>
            <p><strong>Email:</strong> {userProfile.email}</p>
            <p><strong>Tipo:</strong> {userProfile.is_company_admin ? 'Administrador' : 'Usuário'}</p>
            {userProfile.company_id && (
              <p><strong>Empresa:</strong> Vinculado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;