import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { TaskService } from '@/services/taskService';
import { NotificationService } from '@/services/notificationService';
import { Task, Notification } from '@/types/database';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { userProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionRate: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, [userProfile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar tarefas
      const { data: tasksData } = await TaskService.getTasks();
      const userTasks = tasksData || [];
      setTasks(userTasks);
      
      // Carregar notificações
      const { data: notificationsData } = await NotificationService.getNotifications();
      setNotifications(notificationsData || []);
      
      // Calcular estatísticas
      const totalTasks = userTasks.length;
      const completedTasks = userTasks.filter(task => task.status === 'completed').length;
      const pendingTasks = userTasks.filter(task => task.status === 'pending').length;
      const overdueTasks = userTasks.filter(task => {
        if (!task.due_date) return false;
        return new Date(task.due_date) < new Date() && task.status !== 'completed';
      }).length;
      
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate
      });
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dados para gráficos

  // Dados para gráficos
  const tasksByStatus = [
    { name: 'Pendentes', value: stats.pendingTasks, color: '#8B5CF6' },
    { name: 'Em Andamento', value: tasks.filter(t => t.status === 'in_progress').length, color: '#F59E0B' },
    { name: 'Concluídas', value: stats.completedTasks, color: '#10B981' },
  ];

  const tasksByPriority = [
    { name: 'Baixa', value: tasks.filter(t => t.priority === 'low').length },
    { name: 'Média', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'Alta', value: tasks.filter(t => t.priority === 'high').length },
    { name: 'Urgente', value: tasks.filter(t => t.priority === 'urgent').length },
  ];

  const tasksBySector = tasks.reduce((acc, task) => {
    const sector = task.sector || 'Não definido';
    acc[sector] = (acc[sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sectorData = Object.entries(tasksBySector).map(([sector, count]) => ({
    name: sector,
    value: count
  }));

  const COLORS = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6'];

  const recentTasks = tasks
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const unreadNotifications = notifications.filter(n => !n.is_read);

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
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">
            Bem-vindo(a), {userProfile?.name}! Aqui está um resumo das suas atividades.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {userProfile?.is_company_admin ? 'Administrador' : 'Funcionário'}
          </Badge>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTasks > 0 ? 'Tarefas no sistema' : 'Nenhuma tarefa'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completionRate.toFixed(1)}% de conclusão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando execução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdueTasks > 0 ? 'Precisam de atenção' : 'Nenhuma atrasada'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progresso Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progresso Geral
          </CardTitle>
          <CardDescription>
            Taxa de conclusão das tarefas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Concluídas</span>
              <span>{stats.completedTasks} de {stats.totalTasks}</span>
            </div>
            <Progress value={stats.completionRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {stats.completionRate.toFixed(1)}% das tarefas foram concluídas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos e Tabelas */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gráfico de Status das Tarefas */}
        <Card>
          <CardHeader>
            <CardTitle>Status das Tarefas</CardTitle>
            <CardDescription>
              Distribuição por status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tasksByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tasksByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Prioridades */}
        <Card>
          <CardHeader>
            <CardTitle>Tarefas por Prioridade</CardTitle>
            <CardDescription>
              Distribuição por nível de prioridade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tasksByPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Atividades Recentes */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tarefas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tarefas Recentes
            </CardTitle>
            <CardDescription>
              Últimas tarefas criadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Nenhuma tarefa encontrada
                </p>
              ) : (
                recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.sector}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={task.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {task.status === 'pending' ? 'Pendente' : 
                         task.status === 'in_progress' ? 'Em Andamento' : 
                         'Concluída'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notificações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Notificações
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadNotifications.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Notificações recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Nenhuma notificação
                </p>
              ) : (
                notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className={`flex items-start gap-3 p-3 rounded-lg ${
                    notification.is_read ? 'bg-gray-50' : 'bg-blue-50'
                  }`}>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      {notification.content && (
                        <p className="text-xs text-gray-600 mt-1">{notification.content}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Setores (apenas para admins e gerentes) */}
      {(userProfile?.is_company_admin) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tarefas por Setor
            </CardTitle>
            <CardDescription>
              Distribuição de tarefas pelos setores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
