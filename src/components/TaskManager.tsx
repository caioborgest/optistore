
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Plus, Search, Filter, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { TaskService } from '@/services/taskService';
import { Task } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    sector: '',
    assigned_to: '',
    due_date: '',
    estimated_hours: 0
  });

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await TaskService.getTasks();
      
      if (error) {
        toast({
          title: 'Erro ao carregar tarefas',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      setTasks(data || []);
    } catch (error) {
      toast({
        title: 'Erro ao carregar tarefas',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async () => {
    try {
      const { data, error } = await TaskService.createTask(newTask);
      
      if (error) {
        toast({
          title: 'Erro ao criar tarefa',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      setTasks([data, ...tasks]);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        sector: '',
        assigned_to: '',
        due_date: '',
        estimated_hours: 0
      });
      setIsCreateDialogOpen(false);
      
      toast({
        title: 'Tarefa criada',
        description: 'Tarefa criada com sucesso'
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar tarefa',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await TaskService.updateTask(id, updates);
      
      if (error) {
        toast({
          title: 'Erro ao atualizar tarefa',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      setTasks(tasks.map(task => task.id === id ? data : task));
      
      toast({
        title: 'Tarefa atualizada',
        description: 'Tarefa atualizada com sucesso'
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar tarefa',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      });
    }
  };

  const handleCompleteTask = async (id: string) => {
    try {
      const { data, error } = await TaskService.completeTask(id);
      
      if (error) {
        toast({
          title: 'Erro ao completar tarefa',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      setTasks(tasks.map(task => task.id === id ? data : task));
      
      toast({
        title: 'Tarefa concluída',
        description: 'Tarefa marcada como concluída'
      });
    } catch (error) {
      toast({
        title: 'Erro ao completar tarefa',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta tarefa?')) {
      return;
    }

    try {
      const { error } = await TaskService.deleteTask(id);
      
      if (error) {
        toast({
          title: 'Erro ao deletar tarefa',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      setTasks(tasks.filter(task => task.id !== id));
      
      toast({
        title: 'Tarefa deletada',
        description: 'Tarefa removida com sucesso'
      });
    } catch (error) {
      toast({
        title: 'Erro ao deletar tarefa',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.sector.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tasksByStatus = {
    pending: filteredTasks.filter(task => task.status === 'pending'),
    in_progress: filteredTasks.filter(task => task.status === 'in_progress'),
    completed: filteredTasks.filter(task => task.status === 'completed')
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciamento de Tarefas</h1>
        
        {userProfile?.role !== 'employee' && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Digite o título da tarefa"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Descreva a tarefa"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sector">Setor</Label>
                    <Input
                      id="sector"
                      value={newTask.sector}
                      onChange={(e) => setNewTask({...newTask, sector: e.target.value})}
                      placeholder="Setor responsável"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({...newTask, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="due_date">Data de Vencimento</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="estimated_hours">Horas Estimadas</Label>
                  <Input
                    id="estimated_hours"
                    type="number"
                    value={newTask.estimated_hours}
                    onChange={(e) => setNewTask({...newTask, estimated_hours: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleCreateTask} className="flex-1">
                    Criar Tarefa
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Prioridades</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tasks Display */}
      <Tabs defaultValue="kanban" className="w-full">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>
        
        <TabsContent value="kanban" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Pendentes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Circle className="h-5 w-5 text-gray-500" />
                Pendentes ({tasksByStatus.pending.length})
              </h3>
              <div className="space-y-3">
                {tasksByStatus.pending.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleUpdateTask}
                    onComplete={handleCompleteTask}
                    onDelete={handleDeleteTask}
                    userRole={userProfile?.role}
                  />
                ))}
              </div>
            </div>
            
            {/* Em Andamento */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Em Andamento ({tasksByStatus.in_progress.length})
              </h3>
              <div className="space-y-3">
                {tasksByStatus.in_progress.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleUpdateTask}
                    onComplete={handleCompleteTask}
                    onDelete={handleDeleteTask}
                    userRole={userProfile?.role}
                  />
                ))}
              </div>
            </div>
            
            {/* Concluídas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Concluídas ({tasksByStatus.completed.length})
              </h3>
              <div className="space-y-3">
                {tasksByStatus.completed.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleUpdateTask}
                    onComplete={handleCompleteTask}
                    onDelete={handleDeleteTask}
                    userRole={userProfile?.role}
                  />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4">
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleUpdateTask}
                onComplete={handleCompleteTask}
                onDelete={handleDeleteTask}
                userRole={userProfile?.role}
                isListView={true}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente TaskCard
const TaskCard = ({ task, onStatusChange, onComplete, onDelete, userRole, isListView = false }: {
  task: Task;
  onStatusChange: (id: string, updates: Partial<Task>) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  userRole?: string;
  isListView?: boolean;
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`${isListView ? 'w-full' : ''} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium line-clamp-2">
            {task.title}
          </CardTitle>
          <div className="flex items-center gap-1">
            {getStatusIcon(task.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(task.status)}>
              {task.status === 'pending' ? 'Pendente' : 
               task.status === 'in_progress' ? 'Em Andamento' : 
               'Concluída'}
            </Badge>
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority === 'urgent' ? 'Urgente' : 
               task.priority === 'high' ? 'Alta' : 
               task.priority === 'medium' ? 'Média' : 
               'Baixa'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {task.sector}
            </div>
            {task.due_date && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(task.due_date).toLocaleDateString()}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {task.status !== 'completed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onComplete(task.id)}
              >
                Concluir
              </Button>
            )}
            
            {task.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(task.id, { status: 'in_progress' })}
              >
                Iniciar
              </Button>
            )}
            
            {userRole !== 'employee' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(task.id)}
              >
                Excluir
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskManager;
