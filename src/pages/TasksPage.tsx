
import React, { useState } from 'react';
import { ModernTaskManager } from '@/components/tasks/ModernTaskManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const TasksPage: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCreateTask = () => {
    setShowCreateDialog(true);
  };

  return (
    <div className="p-6">
      <ModernTaskManager onCreateTask={handleCreateTask} />
      
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
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setShowCreateDialog(false)}>
                Criar Tarefa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksPage;
