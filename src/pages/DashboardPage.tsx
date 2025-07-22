import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { ModernDashboard } from '@/components/dashboard/ModernDashboard';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  unreadMessages: number;
  teamMembers?: number;
}

const DashboardPage = () => {
  const { userProfile, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    unreadMessages: 0,
    teamMembers: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (userProfile) {
      loadDashboardStats();
    }
  }, [userProfile]);

  const loadDashboardStats = async () => {
    if (!userProfile) return;

    try {
      setLoadingStats(true);

      // Buscar tarefas baseado no papel do usuário
      let tasksQuery = supabase.from('tasks').select('*');

      if (userProfile.role === 'colaborador') {
        // Colaborador vê apenas suas tarefas
        tasksQuery = tasksQuery.eq('assigned_to', userProfile.id);
      } else if (userProfile.role === 'supervisor' && userProfile.sector) {
        // Supervisor vê tarefas do seu setor
        tasksQuery = tasksQuery.eq('sector', userProfile.sector);
      }
      // Gerente vê todas as tarefas (sem filtro adicional)

      const { data: tasks } = await tasksQuery;

      // Calcular estatísticas das tarefas
      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
      const pendingTasks = tasks?.filter(t => t.status === 'pending').length || 0;
      const overdueTasks = tasks?.filter(t => t.status === 'overdue').length || 0;

      // Buscar mensagens não lidas (simulado por enquanto)
      const unreadMessages = 0;

      // Buscar número de membros da equipe (apenas para gerentes)
      let teamMembers = 0;
      if (userProfile.role === 'gerente' && userProfile.company_id) {
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', userProfile.company_id)
          .eq('is_active', true);
        teamMembers = count || 0;
      }

      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        unreadMessages,
        teamMembers
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleCreateTask = () => {
    navigate('/tasks');
  };

  const handleViewTasks = () => {
    navigate('/tasks');
  };

  const handleViewChat = () => {
    navigate('/chat');
  };

  const handleViewReports = () => {
    navigate('/reports');
  };

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

  if (loadingStats) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ModernDashboard
        stats={stats}
        onCreateTask={handleCreateTask}
        onViewTasks={handleViewTasks}
        onViewChat={handleViewChat}
        onViewReports={handleViewReports}
      />
    </Layout>
  );
};

export default DashboardPage;