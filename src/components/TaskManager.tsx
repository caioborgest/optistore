
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Paperclip
} from 'lucide-react';

const TaskManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data para demonstração
  const tasks = [
    {
      id: 1,
      title: 'Organizar setor de tintas e vernizes',
      description: 'Reorganizar prateleiras, conferir validade dos produtos e atualizar etiquetas de preço',
      status: 'completed',
      priority: 'medium',
      sector: 'Tintas',
      assignee: {
        name: 'João Silva',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
      },
      dueDate: '2024-01-15',
      createdAt: '2024-01-10',
      comments: 3,
      attachments: 2,
      recurring: 'weekly'
    },
    {
      id: 2,
      title: 'Conferir estoque de cimento Portland',
      description: 'Verificar quantidades, condições de armazenamento e solicitar reposição se necessário',
      status: 'in_progress',
      priority: 'high',
      sector: 'Materiais Básicos',
      assignee: {
        name: 'Maria Santos',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b608?w=40&h=40&fit=crop&crop=face'
      },
      dueDate: '2024-01-16',
      createdAt: '2024-01-12',
      comments: 1,
      attachments: 0,
      recurring: null
    },
    {
      id: 3,
      title: 'Limpeza completa da área externa',
      description: 'Varrer, lavar área de carga/descarga e organizar materiais expostos',
      status: 'overdue',
      priority: 'low',
      sector: 'Limpeza',
      assignee: {
        name: 'Pedro Costa',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
      },
      dueDate: '2024-01-14',
      createdAt: '2024-01-08',
      comments: 0,
      attachments: 1,
      recurring: 'daily'
    },
    {
      id: 4,
      title: 'Atualizar tabela de preços - Ferramentas',
      description: 'Revisar preços de ferramentas manuais e elétricas conforme nova lista de fornecedores',
      status: 'pending',
      priority: 'medium',
      sector: 'Vendas',
      assignee: {
        name: 'Ana Lima',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
      },
      dueDate: '2024-01-18',
      createdAt: '2024-01-13',
      comments: 2,
      attachments: 1,
      recurring: 'monthly'
    }
  ];

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
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
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

              {/* Assignee */}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignee.avatar} />
                  <AvatarFallback className="text-xs">
                    {task.assignee.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{task.assignee.name}</span>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {task.comments > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{task.comments}</span>
                    </div>
                  )}
                  {task.attachments > 0 && (
                    <div className="flex items-center gap-1">
                      <Paperclip className="h-4 w-4" />
                      <span>{task.attachments}</span>
                    </div>
                  )}
                </div>
                <Button size="sm" variant="outline">
                  Ver Detalhes
                </Button>
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
