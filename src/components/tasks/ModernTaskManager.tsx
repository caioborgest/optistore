import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DraggableKanban } from './DraggableKanban';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  User,
  CheckSquare,
  AlertTriangle,
  MoreHorizontal,
  Edit,
  Trash2,
  MessageSquare,
  Paperclip,
  Target,
  Zap,
  TrendingUp,
  Users,
  BarChart3,
  ArrowRight,
  Sparkles,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  XCircle,
  Columns,
  List
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/database';
import { cn } from '@/lib/utils';

interface ModernTaskManagerProps {
  onCreateTask?: () => void;
}

export const ModernTaskManager: React.FC<ModernTaskManagerProps> = ({ onCreateTask }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      let query = supabase.from('tasks').select('*');

      // Filtrar baseado no papel do usuário
      if (user?.role === 'colaborador') {
        query = query.eq('assigned_to', user.id);
      } else if (user?.role === 'supervisor' && user.sector) {
        query = query.eq('sector', user.sector);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800 border-blue-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800 border-gray-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      in_progress: PlayCircle,
      completed: CheckCircle,
      overdue: AlertTriangle,
      cancelled: XCircle
    };
    const IconComponent = icons[status as keyof typeof icons] || Clock;
    return <IconComponent className="h-4 w-4" />;
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;
      loadTasks();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const renderTaskCard = (task: Task) => (
    <Card key={task.id} className="modern-card hover-lift animate-fade-scale group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className={cn('text-xs border', getPriorityColor(task.priority))}>
              {task.priority === 'low' ? 'Baixa' : 
               task.priority === 'medium' ? 'Média' :
               task.priority === 'high' ? 'Alta' : 'Urgente'}
            </Badge>
            <Badge variant="outline" className={cn('text-xs', getStatusColor(task.status))}>
              {getStatusIcon(task.status)}
              <span className="ml-1">
                {task.status === 'pending' ? 'Pendente' :
                 task.status === 'in_progress' ? 'Em Progresso' :
                 task.status === 'completed' ? 'Concluída' :
                 task.status === 'overdue' ? 'Atrasada' : 'Cancelada'}
              </span>
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{task.title}</h3>
        
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : 'Sem prazo'}
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {task.sector}
          </div>
        </div>

        {task.estimated_hours && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <Clock className="h-3 w-3" />
            {task.estimated_hours}h estimadas
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.status !== 'completed' && task.status !== 'cancelled' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => updateTaskStatus(task.id, task.status === 'pending' ? 'in_progress' : 'completed')}
                className="text-xs hover-lift"
              >
                {task.status === 'pending' ? (
                  <>
                    <PlayCircle className="h-3 w-3 mr-1" />
                    Iniciar
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Concluir
                  </>
                )}
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-xs hover-lift">
              <MessageSquare className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="text-xs hover-lift">
              <Paperclip className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderKanbanView = () => {
    return (
      <DraggableKanban 
        tasks={filteredTasks} 
        onTaskMove={updateTaskStatus}
      />
    );
  };

  const renderListView = () => (
    <div className="space-y-4">
      {filteredTasks.map((task, index) => (
        <Card key={task.id} className={cn("modern-card hover-lift animate-slide-up")} style={{ animationDelay: `${index * 50}ms` }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.sector}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={cn('text-xs border', getPriorityColor(task.priority))}>
                    {task.priority === 'low' ? 'Baixa' : 
                     task.priority === 'medium' ? 'Média' :
                     task.priority === 'high' ? 'Alta' : 'Urgente'}
                  </Badge>
                  <Badge variant="outline" className={cn('text-xs', getStatusColor(task.status))}>
                    {task.status === 'pending' ? 'Pendente' :
                     task.status === 'in_progress' ? 'Em Progresso' :
                     task.status === 'completed' ? 'Concluída' :
                     task.status === 'overdue' ? 'Atrasada' : 'Cancelada'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500">
                  {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : 'Sem prazo'}
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderHeader = () => (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
      <div className="animate-slide-right">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciamento de Tarefas</h1>
        <p className="text-gray-600">Organize e acompanhe suas atividades</p>
      </div>
      
      <div className="flex items-center gap-3 animate-slide-right" style={{ animationDelay: '200ms' }}>
        <Button onClick={onCreateTask} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover-lift">
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
        <Button variant="outline" className="hover-lift">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>
    </div>
  );

  const renderFilters = () => (
    <Card className="modern-card mb-6 animate-fade-scale">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 focus-ring"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="overdue">Atrasadas</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="text-xs"
              >
                Kanban
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="text-xs"
              >
                Lista
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStats = () => {
    const stats = {
      total: filteredTasks.length,
      pending: getTasksByStatus('pending').length,
      inProgress: getTasksByStatus('in_progress').length,
      completed: getTasksByStatus('completed').length,
      overdue: getTasksByStatus('overdue').length
    };

    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="modern-card hover-lift animate-slide-up">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        
        <Card className="modern-card hover-lift animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </CardContent>
        </Card>
        
        <Card className="modern-card hover-lift animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">Em Progresso</div>
          </CardContent>
        </Card>
        
        <Card className="modern-card hover-lift animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Concluídas</div>
          </CardContent>
        </Card>
        
        <Card className="modern-card hover-lift animate-slide-up" style={{ animationDelay: '400ms' }}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-gray-600">Atrasadas</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {renderHeader()}
      {renderStats()}
      {renderFilters()}
      
      <div className="animate-fade-scale" style={{ animationDelay: '300ms' }}>
        {viewMode === 'kanban' ? renderKanbanView() : renderListView()}
      </div>
      
      {filteredTasks.length === 0 && (
        <Card className="modern-card animate-fade-scale">
          <CardContent className="p-12 text-center">
            <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando sua primeira tarefa'
              }
            </p>
            <Button onClick={onCreateTask} className="hover-lift">
              <Plus className="h-4 w-4 mr-2" />
              Criar Tarefa
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};