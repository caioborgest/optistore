import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ModernDashboard } from '@/components/dashboard/ModernDashboard';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  unreadMessages: number;
  teamMembers?: number;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 24,
    completedTasks: 12,
    pendingTasks: 8,
    overdueTasks: 4,
    unreadMessages: 3,
    teamMembers: user?.role === 'gerente' ? 8 : 0
  });

  // Handlers para ações do dashboard
  const handleCreateTask = () => {
    setShowCreateTaskDialog(true);
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

  return (
    <>
      {/* ModernDashboard com estatísticas e callbacks */}
      <ModernDashboard 
        stats={stats}
        onCreateTask={handleCreateTask}
        onViewTasks={handleViewTasks}
        onViewChat={handleViewChat}
        onViewReports={handleViewReports}
      />

      {/* Modal de criação de tarefa */}
      <Dialog open={showCreateTaskDialog} onOpenChange={setShowCreateTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>
              Crie uma nova tarefa para você ou sua equipe.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-muted-foreground">
              Formulário de criação de tarefa será implementado aqui.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateTaskDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                // Simulação de criação de tarefa
                setShowCreateTaskDialog(false);
                // Atualizar estatísticas
                setStats(prev => ({
                  ...prev,
                  totalTasks: prev.totalTasks + 1,
                  pendingTasks: prev.pendingTasks + 1
                }));
              }}>
                Criar Tarefa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardPage;