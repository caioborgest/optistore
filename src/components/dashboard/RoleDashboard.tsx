import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  BarChart3,
  Calendar,
  Settings,
  Plus
} from 'lucide-react';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  unreadMessages: number;
  teamMembers?: number;
}

interface RoleDashboardProps {
  stats: DashboardStats;
  onCreateTask?: () => void;
  onViewTasks?: () => void;
  onViewChat?: () => void;
  onViewReports?: () => void;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({
  stats,
  onCreateTask,
  onViewTasks,
  onViewChat,
  onViewReports
}) => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getRoleTitle = (role?: string) => {
    if (!role) return 'Usuário';
    
    const titles = {
      gerente: 'Gerente',
      supervisor: 'Supervisor',
      colaborador: 'Colaborador'
    };
    return titles[role as keyof typeof titles] || 'Usuário';
  };

  const getCompletionRate = () => {
    if (stats.totalTasks === 0) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
  };

  const renderManagerDashboard = () => (
    <div className="space-y-6">
      {/* Métricas Gerenciais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {getCompletionRate()}% concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipe</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers || 0}</div>
            <p className="text-xs text-muted-foreground">
              membros ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              requerem atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              não lidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso rápido às principais funcionalidades gerenciais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={onCreateTask} className="h-20 flex-col">
              <Plus className="h-6 w-6 mb-2" />
              Nova Tarefa
            </Button>
            <Button variant="outline" onClick={onViewReports} className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              Relatórios
            </Button>
            <Button variant="outline" onClick={onViewTasks} className="h-20 flex-col">
              <CheckSquare className="h-6 w-6 mb-2" />
              Todas as Tarefas
            </Button>
            <Button variant="outline" onClick={onViewChat} className="h-20 flex-col">
              <MessageSquare className="h-6 w-6 mb-2" />
              Comunicação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSupervisorDashboard = () => (
    <div className="space-y-6">
      {/* Métricas Setoriais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas do Setor</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">{stats.completedTasks} concluídas</Badge>
              <Badge variant="outline">{stats.pendingTasks} pendentes</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              precisam de atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCompletionRate()}%</div>
            <p className="text-xs text-muted-foreground">
              taxa de conclusão
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações do Supervisor */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão do Setor</CardTitle>
          <CardDescription>
            Ferramentas para gerenciar sua equipe e tarefas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button onClick={onCreateTask} className="h-16 flex-col">
              <Plus className="h-5 w-5 mb-1" />
              Atribuir Tarefa
            </Button>
            <Button variant="outline" onClick={onViewTasks} className="h-16 flex-col">
              <CheckSquare className="h-5 w-5 mb-1" />
              Ver Tarefas
            </Button>
            <Button variant="outline" onClick={onViewChat} className="h-16 flex-col">
              <MessageSquare className="h-5 w-5 mb-1" />
              Chat do Setor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCollaboratorDashboard = () => (
    <div className="space-y-6">
      {/* Minhas Tarefas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minhas Tarefas</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingTasks} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {getCompletionRate()}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              requerem atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações do Colaborador */}
      <Card>
        <CardHeader>
          <CardTitle>Minhas Atividades</CardTitle>
          <CardDescription>
            Acesso rápido às suas tarefas e comunicação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={onViewTasks} className="h-16 flex-col">
              <CheckSquare className="h-5 w-5 mb-1" />
              Ver Tarefas
            </Button>
            <Button variant="outline" onClick={onViewChat} className="h-16 flex-col">
              <MessageSquare className="h-5 w-5 mb-1" />
              Chat da Equipe
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header de Boas-vindas */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()}, {user?.name}!
          </h1>
          <p className="text-muted-foreground">
            {getRoleTitle(user?.role || '')} {user?.sector && `• ${user.sector}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date().toLocaleDateString('pt-BR')}
          </Badge>
        </div>
      </div>

      {/* Dashboard específico por papel */}
      {(user?.role === 'gerente' || user?.is_company_admin) && renderManagerDashboard()}
      {user?.role === 'supervisor' && renderSupervisorDashboard()}
      {(user?.role === 'colaborador' || (!user?.role && !user?.is_company_admin)) && renderCollaboratorDashboard()}
    </div>
  );
};