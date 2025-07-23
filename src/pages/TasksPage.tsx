import React, { useState } from 'react';
import { ModernTaskManager } from '@/components/tasks/ModernTaskManager';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Filter, Download, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Estatísticas de exemplo para o ModernTaskManager
  const taskStats = {
    totalTasks: 24,
    completedTasks: 12,
    pendingTasks: 8,
    overdueTasks: 4,
    inProgressTasks: 8
  };

  const handleCreateTask = () => {
    setShowCreateDialog(true);
  };

  const handleFilterTasks = () => {
    setShowFilterDialog(true);
  };

  const handleImportTasks = () => {
    setShowImportDialog(true);
  };

  const handleExportTasks = () => {
    // Lógica para exportar tarefas
    console.log('Exportando tarefas...');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Tarefas</h1>
          <p className="text-gray-500 mt-1">Organize e acompanhe suas tarefas e projetos</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleCreateTask}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
          
          <Button variant="outline" onClick={handleFilterTasks}>
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          
          <Button variant="outline" onClick={handleExportTasks}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <Button variant="outline" onClick={handleImportTasks}>
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
        </div>
      </div>
      
      {/* Gerenciador de Tarefas Moderno */}
      <ModernTaskManager 
        stats={{
          totalTasks: taskStats.totalTasks,
          completedTasks: taskStats.completedTasks,
          pendingTasks: taskStats.pendingTasks,
          overdueTasks: taskStats.overdueTasks,
          unreadMessages: 0,
        }}
        onCreateTask={handleCreateTask}
      />
      
      {/* Diálogos */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>
              Crie uma nova tarefa para você ou sua equipe.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">
              Formulário de criação de tarefa será implementado aqui.
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrar Tarefas</DialogTitle>
            <DialogDescription>
              Defina filtros para visualizar tarefas específicas.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">
              Opções de filtro serão implementadas aqui.
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Tarefas</DialogTitle>
            <DialogDescription>
              Importe tarefas de um arquivo CSV ou Excel.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">
              Opções de importação serão implementadas aqui.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksPage;