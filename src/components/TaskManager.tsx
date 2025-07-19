
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useRecurringTasks, Task } from '@/services/recurringTaskService';
import { RecurringTaskForm } from '@/components/forms/RecurringTaskForm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  User,
  Building,
  Clock,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  MessageSquare,
  Paperclip,
  Repeat,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

const TaskManager = () => {
  const { userProfile, hasPermission } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSector, setFilterSector] = useState('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Carregar tarefas
  const loadTasks = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:users!assigned_to(id, name, avatar_url),
          created_user:users!created_by(id, name, avatar_url),
          task_comments(count),
          task_attachments(count)
        `)
        .order('created_at', { ascending: false });

      // Filtrar baseado nas permissões do usuário
      if (userProfile?.role === 'colaborador') {
        query = query.eq('assigned_to', userProfile.id);
      } else if (userProfile?.role === 'supervisor') {
        query = query.eq('sector', userProfile.sector);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: 'Erro ao carregar tarefas',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      if (data) {
        const formattedTasks: Task[] = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          sector: task.sector,
          assigned_to: task.assigned_to,
          created_by: task.created_by,
          due_date: task.due_date,
          completed_at: task.completed_at,
          is_recurring: task.is_recurring,
          recurrence_pattern: task.recurrence_pattern,
          parent_task_id: task.parent_task_id,
          created_at: task.created_at,
          updated_at: task.updated_at
        }));
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast({
        title: 'Erro inesperado',
        description: 'Não foi possível carregar as tarefas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [userProfile]);

  // Atualizar status da tarefa
  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) {
        toast({
          title: 'Erro ao atualizar tarefa',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      // Atualizar estado local
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null }
          : task
      ));

      toast({
        title: 'Tarefa atualizada',
        description: `Status alterado para ${getStatusLabel(newStatus)}`
      });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'in_progress': return 'Em Andamento';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Atrasada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <Calendar className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Tarefas</h1>
          <p className="text-gray-600 mt-1">
            Organize e acompanhe todas as atividades operacionais
          </p>
        </div>
        {hasPermission('tasks', 'create') && (
          <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedTask ? 'Editar Tarefa' : 'Nova Tarefa'}
                </DialogTitle>
              </DialogHeader>
              <RecurringTaskForm
                initialData={selectedTask ? {
                  title: selectedTask.title,
                  description: selectedTask.description,
                  sector: selectedTask.sector,
                  assignedTo: selectedTask.assigned_to,
                  priority: selectedTask.priority,
                  dueDate: new Date(selectedTask.due_date),
                  isRecurring: selectedTask.is_recurring,
                  recurrencePattern: selectedTask.recurrence_pattern
                } : undefined}
                onSuccess={() => {
                  setShowTaskForm(false);
                  setSelectedTask(null);
                  loadTasks();
                }}
                onCancel={() => {
                  setShowTaskForm(false);
                  setSelectedTask(null);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                Todas
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                size="sm"
              >
                Pendentes
              </Button>
              <Button
                variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('in_progress')}
                size="sm"
              >
                Em Andamento
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('completed')}
                size="sm"
              >
                Concluídas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                    <Badge variant="outline" className="text-xs">
                      {task.sector}
                    </Badge>
                    {task.recurring && (
                      <Badge variant="secondary" className="text-xs">
                        Recorrente
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {task.title}
                  </CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-2">
                {task.description}
              </p>

              {/* Status */}
              <div className="flex items-center gap-2">
                {getStatusIcon(task.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status === 'completed' ? 'Concluída' :
                   task.status === 'in_progress' ? 'Em Andamento' :
                   task.status === 'pending' ? 'Pendente' : 'Atrasada'}
                </span>
              </div>

              {/* Due Date */}
              {task.due_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}

              {/* Recurring indicator */}
              {task.is_recurring && (
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-purple-600">
                    Tarefa recorrente
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  {hasPermission('tasks', 'update', task.assigned_to, task.sector) && (
                    <Select
                      value={task.status}
                      onValueChange={(value: Task['status']) => updateTaskStatus(task.id, value)}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => {
                    setSelectedTask(task);
                    setShowTaskForm(true);
                  }}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma tarefa encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              Tente ajustar os filtros ou criar uma nova tarefa.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Nova Tarefa
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TaskManager;
