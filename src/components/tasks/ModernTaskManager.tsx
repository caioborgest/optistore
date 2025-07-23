
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DraggableKanban } from './DraggableKanban';
import { TaskFilters } from './TaskFilters';
import { TaskStats } from './TaskStats';
import { Task } from '@/types/database';
import { Plus, Grid3x3, List, Download, Upload } from 'lucide-react';
import { PageHeader } from '../layout/PageHeader';

interface ModernTaskManagerProps {
  onCreateTask?: () => void;
}

export const ModernTaskManager: React.FC<ModernTaskManagerProps> = ({ onCreateTask }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Mock data - será substituído pela integração real
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Revisar relatório mensal',
        description: 'Análise dos dados de vendas',
        status: 'pending',
        priority: 'high',
        due_date: '2024-02-15',
        created_at: '2024-02-10',
        updated_at: '2024-02-10',
        created_by: 'user1',
        assigned_to: 'user2',
        company_id: 'comp1',
        estimated_hours: 4,
        sector: 'Vendas',
        tags: ['vendas', 'relatório']
      },
      {
        id: '2',
        title: 'Implementar nova funcionalidade',
        description: 'Sistema de notificações',
        status: 'in_progress',
        priority: 'medium',
        due_date: '2024-02-20',
        created_at: '2024-02-08',
        updated_at: '2024-02-12',
        created_by: 'user1',
        assigned_to: 'user3',
        company_id: 'comp1',
        estimated_hours: 8,
        sector: 'TI',
        tags: ['desenvolvimento', 'notificações']
      }
    ];
    
    setTasks(mockTasks);
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusCount = (status: Task['status']) => {
    return tasks.filter(task => task.status === status).length;
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const headerActions = (
    <>
      <Button onClick={onCreateTask}>
        <Plus className="h-4 w-4 mr-2" />
        Nova Tarefa
      </Button>
      <Button variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
      <Button variant="outline">
        <Upload className="h-4 w-4 mr-2" />
        Importar
      </Button>
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerenciamento de Tarefas"
        description="Organize e acompanhe suas tarefas e projetos"
        actions={headerActions}
      />

      <TaskStats
        pending={getStatusCount('pending')}
        inProgress={getStatusCount('in_progress')}
        completed={getStatusCount('completed')}
        overdue={getStatusCount('overdue')}
      />

      <TaskFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        onClearFilters={handleClearFilters}
      />

      <Tabs value={viewMode} onValueChange={(value: 'kanban' | 'list') => setViewMode(value)}>
        <TabsList>
          <TabsTrigger value="kanban">
            <Grid3x3 className="h-4 w-4 mr-2" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <DraggableKanban tasks={filteredTasks} onTaskUpdate={handleUpdateTask} />
        </TabsContent>

        <TabsContent value="list">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Visualização em lista será implementada em breve</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
